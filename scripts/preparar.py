"""Prepara a gravação bruta da Valeria para a edição.

Uso: python scripts/preparar.py <gravacao> <nome-do-projeto> [--silencio 0.6]

O que faz (a gravação é final: nunca pedimos para regravar):
  1. Converte o HDR do iPhone para cores normais (SDR) e padroniza em 30 fps.
  2. Corta os silêncios longos (mais de --silencio segundos), deixando um respiro curto.
  3. Nivela o volume da voz (padrão das redes: -14 LUFS).
  4. Transcreve a fala já cortada, com o tempo de cada palavra, e aplica scripts/correcoes.json.

Saída em public/projetos/<nome>/:
  fala.mp4 (ou fala.wav se a gravação for só áudio), palavras.json, info.json
"""
import argparse, json, re, subprocess, sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from transcrever import transcrever  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TAXA = 48000
FPS = 30
RESPIRO = 0.18  # segundos mantidos antes e depois de cada trecho de fala


def rodar(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"Erro no ffmpeg:\n{r.stderr[-3000:]}")
    return r.stderr


def sondar(arquivo):
    """Descobre se tem vídeo, se é HDR, tamanho e rotação (ffprobe embutido no ffmpeg)."""
    info = rodar([FFMPEG, "-hide_banner", "-i", str(arquivo), "-f", "null", "-t", "0", "-"])
    video = re.search(r"Stream #.*Video: .*", info)
    hdr = bool(video and re.search(r"smpte2084|arib-std-b67|bt2020", video.group(0)))
    return {"tem_video": bool(video), "hdr": hdr}


def trechos_de_fala(wav, limite):
    """Acha os silêncios com o silencedetect e devolve os trechos que ficam."""
    log = rodar([FFMPEG, "-hide_banner", "-i", str(wav), "-af",
                 f"silencedetect=noise=-38dB:d={limite}", "-f", "null", "-"])
    inicios = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    fins = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = duracao_audio(wav)
    trechos, cursor = [], 0.0
    for ini, fim in zip(inicios, fins + [total] * (len(inicios) - len(fins))):
        if ini > cursor:
            trechos.append((max(0.0, cursor - RESPIRO if cursor else 0.0), min(total, ini + RESPIRO)))
        cursor = fim
    if cursor < total:
        trechos.append((max(0.0, cursor - RESPIRO), total))
    # junta trechos que se encostaram por causa do respiro
    juntos = []
    for a, b in trechos:
        if juntos and a <= juntos[-1][1]:
            juntos[-1] = (juntos[-1][0], max(juntos[-1][1], b))
        elif b - a > 0.05:
            juntos.append((a, b))
    return juntos, total


def duracao_audio(wav):
    import soundfile as sf
    return sf.info(str(wav)).duration


def medir_volume(arquivo):
    log = rodar([FFMPEG, "-hide_banner", "-i", str(arquivo), "-af",
                 "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"])
    return json.loads(log[log.rindex("{"):log.rindex("}") + 1])


def aplicar_correcoes(resultado):
    arq = RAIZ / "scripts" / "correcoes.json"
    trocas = json.loads(arq.read_text(encoding="utf-8")) if arq.exists() else {}
    for p in resultado["palavras"]:
        nucleo = re.sub(r"[^\wÀ-ú]", "", p["palavra"]).lower()
        if nucleo in trocas:
            p["palavra"] = p["palavra"].replace(re.sub(r"[^\wÀ-ú]", "", p["palavra"]), trocas[nucleo])
    resultado["texto"] = " ".join(p["palavra"] for p in resultado["palavras"])
    return resultado


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("gravacao")
    ap.add_argument("nome")
    ap.add_argument("--silencio", type=float, default=0.6, help="pausas maiores que isso são cortadas")
    a = ap.parse_args()

    destino = RAIZ / "public" / "projetos" / a.nome
    destino.mkdir(parents=True, exist_ok=True)
    tmp = destino / "_tmp"
    tmp.mkdir(exist_ok=True)
    info = sondar(a.gravacao)

    # 1. áudio bruto para medir os silêncios
    bruto = tmp / "bruto.wav"
    rodar([FFMPEG, "-y", "-hide_banner", "-i", a.gravacao, "-vn", "-ac", "1", "-ar", str(TAXA), str(bruto)])
    trechos, total = trechos_de_fala(bruto, a.silencio)
    print(f"Duração original: {total:.1f}s; trechos de fala: {len(trechos)}")

    # 2. monta o filtro que recorta e emenda os trechos (com micro-fade para não estalar)
    partes, rotulos = [], ""
    for i, (ini, fim) in enumerate(trechos):
        d = fim - ini
        partes.append(f"[0:a]atrim={ini:.3f}:{fim:.3f},asetpts=PTS-STARTPTS,"
                      f"afade=t=in:d=0.01,afade=t=out:st={max(0, d - 0.012):.3f}:d=0.012[a{i}]")
        if info["tem_video"]:
            partes.append(f"[0:v]trim={ini:.3f}:{fim:.3f},setpts=PTS-STARTPTS[v{i}]")
            rotulos += f"[v{i}][a{i}]"
        else:
            rotulos += f"[a{i}]"
    n = len(trechos)
    if info["tem_video"]:
        cores = ("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,"
                 "zscale=t=bt709:m=bt709:r=tv,format=yuv420p" if info["hdr"] else "format=yuv420p")
        partes.append(f"{rotulos}concat=n={n}:v=1:a=1[vc][ac]")
        partes.append(f"[vc]fps={FPS},{cores}[vout]")
    else:
        partes.append(f"{rotulos}concat=n={n}:v=0:a=1[ac]")

    cortado = tmp / ("cortado.mkv" if info["tem_video"] else "cortado.wav")
    mapa = ["-map", "[vout]", "-map", "[ac]", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
            "-c:a", "pcm_s16le"] if info["tem_video"] else ["-map", "[ac]"]
    rodar([FFMPEG, "-y", "-hide_banner", "-i", a.gravacao, "-filter_complex", ";".join(partes),
           *mapa, "-ar", str(TAXA), "-ac", "1", str(cortado)])

    # 3. nivela o volume em duas passadas
    m = medir_volume(cortado)
    nivel = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
             f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    if info["tem_video"]:
        saida = destino / "fala.mp4"
        rodar([FFMPEG, "-y", "-hide_banner", "-i", str(cortado), "-c:v", "copy", "-af", nivel,
               "-ar", str(TAXA), "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", str(saida)])
    else:
        saida = destino / "fala.wav"
        rodar([FFMPEG, "-y", "-hide_banner", "-i", str(cortado), "-af", nivel, "-ar", str(TAXA), str(saida)])

    # 4. transcreve o resultado final (os tempos já batem com o vídeo cortado)
    voz = tmp / "voz16k.wav"
    rodar([FFMPEG, "-y", "-hide_banner", "-i", str(saida), "-vn", "-ac", "1", "-ar", "16000", str(voz)])
    resultado = transcrever(str(voz))
    resultado = aplicar_correcoes(resultado)
    (destino / "palavras.json").write_text(json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8")

    duracao = duracao_audio(voz)
    (destino / "info.json").write_text(json.dumps({
        "arquivo": f"projetos/{a.nome}/{saida.name}", "tem_video": info["tem_video"], "hdr_convertido": info["hdr"],
        "duracao_original": round(total, 2), "duracao": round(duracao, 2), "fps": FPS,
        "trechos_mantidos": [[round(x, 2), round(y, 2)] for x, y in trechos],
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()
    print(f"Pronto: {saida.relative_to(RAIZ)} ({total:.1f}s → {duracao:.1f}s)")
    print(resultado["texto"])


if __name__ == "__main__":
    main()
