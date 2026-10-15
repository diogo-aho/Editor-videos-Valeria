"""Corta gaguejos, repetições e tropeços da fala já preparada (como o preparar.py corta os silêncios).

Uso: python scripts/cortar.py <nome-do-projeto> 12.40-12.95 33.10-33.62 ...

  - Os tempos são da fala ATUAL (public/projetos/<nome>/fala.mp4 ou fala.wav), em segundos.
  - Na primeira vez guarda a fala sem cortes em fala-inteira.* e corta sempre a partir dela;
    então rode de novo com a lista COMPLETA de cortes (nos tempos da fala-inteira) para refazer.
  - Ajusta palavras.json (tira as palavras de dentro dos cortes e puxa as de depois) e info.json.
  - Cada emenda ganha 30 ms de crossfade no áudio para não estalar.

Antes de cortar, confira que o tropeço existe mesmo: o Whisper às vezes inventa repetições na emenda
dos pedaços. Transcreva só o trecho (transcrever.py) e veja a energia do áudio.
"""
import json, shutil, subprocess, sys
from pathlib import Path

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
RAIZ = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    pasta = RAIZ / "public" / "projetos" / sys.argv[1]
    info = json.loads((pasta / "info.json").read_text(encoding="utf-8"))
    fala = RAIZ / "public" / info["arquivo"]
    inteira = fala.with_name("fala-inteira" + fala.suffix)
    palavras_inteiras = pasta / "palavras-inteiras.json"
    if not inteira.exists():
        shutil.copy(fala, inteira)
        shutil.copy(pasta / "palavras.json", palavras_inteiras)
        info["duracao_sem_cortes"] = info["duracao"]

    cortes = sorted(tuple(float(x) for x in c.split("-")) for c in sys.argv[2:])
    total = info.get("duracao_sem_cortes", info["duracao"])
    mantidos, ini = [], 0.0
    for a, b in cortes:
        if a > ini:
            mantidos.append((ini, a))
        ini = max(ini, b)
    mantidos.append((ini, total))

    tem_video = info.get("tem_video", False)
    partes, rot = [], ""
    for i, (a, b) in enumerate(mantidos):
        if tem_video:
            partes.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
        partes.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.03,afade=t=out:st={max(0, b - a - 0.03)}:d=0.03[a{i}]")
        rot += (f"[v{i}]" if tem_video else "") + f"[a{i}]"
    n = len(mantidos)
    partes.append(f"{rot}concat=n={n}:v={1 if tem_video else 0}:a=1" + ("[vc][ac]" if tem_video else "[ac]"))
    cmd = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-i", str(inteira), "-filter_complex", ";".join(partes)]
    if tem_video:
        cmd += ["-map", "[vc]", "-map", "[ac]", "-c:v", "libx264", "-crf", "16", "-preset", "medium",
                "-pix_fmt", "yuv420p", "-r", str(info.get("fps", 30)), "-c:a", "aac", "-b:a", "192k"]
    else:
        cmd += ["-map", "[ac]"]
    subprocess.run(cmd + [str(fala)], check=True)

    # palavras: tira as de dentro dos cortes e puxa as de depois
    def novo_tempo(t):
        desloc = 0.0
        for a, b in mantidos:
            if t < a:
                return None
            if t <= b:
                return round(t - a + desloc, 2)
            desloc += b - a
        return None

    dados = json.loads(palavras_inteiras.read_text(encoding="utf-8"))
    saida = []
    for p in dados["palavras"]:
        meio = (p["inicio"] + p["fim"]) / 2
        if any(a <= meio <= b for a, b in cortes):
            continue
        i0, f0 = novo_tempo(p["inicio"]), novo_tempo(p["fim"])
        if i0 is None and f0 is None:
            continue
        i0 = f0 - 0.15 if i0 is None else i0
        f0 = i0 + 0.15 if f0 is None else f0
        saida.append({**p, "inicio": i0, "fim": f0})
    dados["palavras"] = saida
    dados["texto"] = " ".join(p["palavra"] for p in saida)
    (pasta / "palavras.json").write_text(json.dumps(dados, ensure_ascii=False, indent=2), encoding="utf-8")

    info["duracao"] = round(sum(b - a for a, b in mantidos), 2)
    info["cortes_gagueira"] = [list(c) for c in cortes]
    (pasta / "info.json").write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Pronto: {len(cortes)} cortes; {total:.1f}s → {info['duracao']:.1f}s")


if __name__ == "__main__":
    main()
