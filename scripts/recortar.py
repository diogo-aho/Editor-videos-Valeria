"""Recorta a silhueta da Valeria do fundo (para animações que passam atrás dela).

Uso:
  python scripts/recortar.py public/projetos/<nome>/fala.mp4    -> frente.webm (vídeo com fundo transparente)
  python scripts/recortar.py public/valeria/fotos/foto-1.jpg [saida.png] -> PNG com fundo transparente

Modelo: Robust Video Matting (modelos/rvm_mobilenetv3_fp32.onnx), que usa os quadros
anteriores para manter o contorno estável no vídeo.
"""
import subprocess, sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import onnxruntime as ort
from PIL import Image

MODELO = Path(__file__).resolve().parent.parent / "modelos" / "rvm_mobilenetv3_fp32.onnx"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


class Recortador:
    def __init__(self, altura):
        self.sessao = ort.InferenceSession(str(MODELO), providers=["CPUExecutionProvider"])
        self.estado = [np.zeros([1, 1, 1, 1], dtype=np.float32)] * 4
        # o modelo trabalha melhor com a pessoa ocupando ~512 px de altura
        self.reducao = np.array([min(1.0, 512 / altura)], dtype=np.float32)

    def alfa(self, rgb):
        src = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
        fgr, pha, *self.estado = self.sessao.run(None, {
            "src": src, "r1i": self.estado[0], "r2i": self.estado[1], "r3i": self.estado[2],
            "r4i": self.estado[3], "downsample_ratio": self.reducao})
        return (pha[0, 0] * 255).clip(0, 255).astype(np.uint8)


def recortar_imagem(entrada, saida):
    img = Image.open(entrada).convert("RGB")
    rgb = np.array(img)
    r = Recortador(rgb.shape[0])
    for _ in range(4):  # repete para o estado interno estabilizar
        a = r.alfa(rgb)
    Image.fromarray(np.dstack([rgb, a])).save(saida)
    print(f"Pronto: {saida}")


def recortar_video(entrada, saida):
    info = subprocess.run([FFMPEG, "-hide_banner", "-i", str(entrada)], capture_output=True, text=True).stderr
    import re
    l, a = map(int, re.search(r"Video: .*?(\d{3,5})x(\d{3,5})", info).groups())
    fps = re.search(r"([\d.]+) fps", info).group(1)
    ler = subprocess.Popen([FFMPEG, "-loglevel", "error", "-i", str(entrada), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                           stdout=subprocess.PIPE)
    escrever = subprocess.Popen([FFMPEG, "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
                                 "-s", f"{l}x{a}", "-r", fps, "-i", "-", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
                                 "-b:v", "0", "-crf", "28", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4",
                                 "-auto-alt-ref", "0", str(saida)], stdin=subprocess.PIPE)
    r = Recortador(a)
    n = 0
    while True:
        bruto = ler.stdout.read(l * a * 3)
        if len(bruto) < l * a * 3:
            break
        rgb = np.frombuffer(bruto, np.uint8).reshape(a, l, 3)
        escrever.stdin.write(np.dstack([rgb, r.alfa(rgb)]).tobytes())
        n += 1
        if n % 150 == 0:
            print(f"  {n} quadros...")
    escrever.stdin.close()
    escrever.wait()
    print(f"Pronto: {saida} ({n} quadros)")


if __name__ == "__main__":
    entrada = Path(sys.argv[1])
    if entrada.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".heic"}:
        recortar_imagem(entrada, sys.argv[2] if len(sys.argv) > 2 else entrada.with_name(entrada.stem + "-recorte.png"))
    else:
        recortar_video(entrada, sys.argv[2] if len(sys.argv) > 2 else entrada.with_name("frente.webm"))
