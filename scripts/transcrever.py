"""Transcreve um áudio ou vídeo em português, com o tempo de cada palavra.

Uso: python scripts/transcrever.py <arquivo> [saida.json]

Como funciona:
  - Whisper turbo, forçado em português (o Parakeet trocava o idioma para inglês).
  - A fala é dividida nas pausas naturais em frases de até ~10 s; cada frase é
    transcrita separada. Este modelo não devolve o tempo de cada palavra, então as
    palavras são distribuídas dentro da frase pelo número de sílabas, só nos
    momentos em que há voz. A legenda mostra 2-3 palavras por linha, então essa
    precisão (~0,1-0,2 s) é suficiente.
"""
import json, re, subprocess, sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import sherpa_onnx

MODELO = Path(__file__).resolve().parent.parent / "modelos" / "sherpa-onnx-whisper-turbo"
TAXA = 16000
FRASE_MAX = 10.0  # segundos por pedaço enviado ao Whisper (limite dele: 30 s)


def ler_audio(arquivo):
    """Converte qualquer áudio/vídeo (ogg do WhatsApp, mov do iPhone...) para mono 16 kHz."""
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-loglevel", "error", "-i", str(arquivo),
           "-vn", "-ac", "1", "-ar", str(TAXA), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def trechos_com_voz(audio, pausa_min=0.12):
    """Intervalos (em segundos) onde há voz, pela energia em janelas de 20 ms."""
    jan = int(TAXA * 0.02)
    n = len(audio) // jan
    energia = np.sqrt((audio[: n * jan].reshape(n, jan) ** 2).mean(axis=1))
    limiar = max(np.percentile(energia, 95) * 0.06, 1e-4)
    voz = energia > limiar
    trechos, ini, silencio = [], None, 0
    for i, v in enumerate(voz):
        if v:
            if ini is None:
                ini = i
            silencio = 0
        elif ini is not None:
            silencio += 1
            if silencio * 0.02 >= pausa_min:
                trechos.append([ini * 0.02, (i - silencio + 1) * 0.02])
                ini, silencio = None, 0
    if ini is not None:
        trechos.append([ini * 0.02, n * 0.02])
    return [t for t in trechos if t[1] - t[0] >= 0.06]


def agrupar_em_frases(trechos):
    """Divide a fala em frases de até FRASE_MAX segundos, sempre cortando na maior
    pausa disponível (cortar no meio de uma frase faz o Whisper errar as palavras)."""
    def dividir(grupo):
        if grupo[-1][1] - grupo[0][0] <= FRASE_MAX or len(grupo) == 1:
            return [grupo]
        pausas = [grupo[i + 1][0] - grupo[i][1] for i in range(len(grupo) - 1)]
        corte = int(np.argmax(pausas)) + 1
        return dividir(grupo[:corte]) + dividir(grupo[corte:])

    return [{"inicio": g[0][0], "fim": g[-1][1], "voz": g} for g in dividir(trechos)]


def silabas(palavra):
    return max(1, len(re.findall(r"[aeiouáéíóúâêôãõàü]+", palavra.lower())))


def distribuir(palavras, voz):
    """Espalha as palavras pelos momentos de voz, proporcional às sílabas."""
    total_voz = sum(b - a for a, b in voz)
    pesos = np.array([silabas(p) for p in palavras], dtype=float)
    limites = np.concatenate([[0], np.cumsum(pesos)]) / pesos.sum() * total_voz

    def no_tempo(x):  # posição x (segundos de voz acumulada) -> tempo real
        for a, b in voz:
            if x <= b - a + 1e-9:
                return a + x
            x -= b - a
        return voz[-1][1]

    return [{"palavra": p, "inicio": round(no_tempo(limites[i] + 1e-6), 2), "fim": round(no_tempo(limites[i + 1]), 2)}
            for i, p in enumerate(palavras)]


def carregar_modelo():
    return sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(MODELO / "turbo-encoder.int8.onnx"), decoder=str(MODELO / "turbo-decoder.int8.onnx"),
        tokens=str(MODELO / "turbo-tokens.txt"), language="pt", task="transcribe", num_threads=4, tail_paddings=500)


def transcrever(arquivo):
    rec = carregar_modelo()
    audio = ler_audio(arquivo)
    resultado = []
    for f in agrupar_em_frases(trechos_com_voz(audio)):
        if f["fim"] - f["inicio"] < 0.3:
            continue
        a, b = int(max(0, f["inicio"] - 0.1) * TAXA), int((f["fim"] + 0.1) * TAXA)
        st = rec.create_stream()
        st.accept_waveform(TAXA, audio[a:b])
        rec.decode_stream(st)
        palavras = st.result.text.split()
        if palavras:
            resultado += distribuir(palavras, f["voz"])
    # ponto deixado pelo corte entre frases ("transcrição. de quando") é removido
    for atual, prox in zip(resultado, resultado[1:]):
        if atual["palavra"].endswith(".") and prox["palavra"][:1].islower():
            atual["palavra"] = atual["palavra"][:-1]
    return {"texto": " ".join(p["palavra"] for p in resultado), "palavras": resultado}


if __name__ == "__main__":
    r = transcrever(sys.argv[1])
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(json.dumps(r, ensure_ascii=False, indent=2), encoding="utf-8")
    print(r["texto"])
    for p in r["palavras"]:
        print(f'{p["inicio"]:7.2f}–{p["fim"]:6.2f}  {p["palavra"]}')
