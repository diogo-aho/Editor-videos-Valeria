"""Renderiza todas as entregas de um vídeo.

Uso: python scripts/entregar.py <nome> [--formatos reels,feed,youtube,stories] [--sem-capa] [--carrossel]

Padrão: só o Reels (+ capa, se o roteiro tiver). Stories, feed, YouTube e carrossel só quando a Valeria pedir.

Saída em out/<nome>/: reels.mp4, feed.mp4, youtube.mp4, stories.mp4, capa.png, carrossel-1.png...
"""
import argparse, json, re, subprocess, sys, tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
COMPOSICOES = {"reels": "Reels", "feed": "Feed", "youtube": "YouTube", "stories": "Stories"}


def remotion(*args):
    r = subprocess.run(["npx", "remotion", *args, "--log=error"], cwd=RAIZ)
    if r.returncode != 0:
        sys.exit(f"Falhou: remotion {' '.join(args)}")


ap = argparse.ArgumentParser()
ap.add_argument("nome")
ap.add_argument("--formatos", default="reels")
ap.add_argument("--sem-capa", action="store_true")
ap.add_argument("--carrossel", action="store_true", help="gera o carrossel (só quando a Valeria pedir)")
a = ap.parse_args()

roteiro_arq = RAIZ / "public" / "projetos" / a.nome / "roteiro.json"
roteiro = json.loads(roteiro_arq.read_text(encoding="utf-8"))
saida = RAIZ / "out" / a.nome
saida.mkdir(parents=True, exist_ok=True)
props = f"--props={roteiro_arq}"

for f in a.formatos.split(","):
    print(f"Renderizando {f}...")
    remotion("render", "src/index.ts", COMPOSICOES[f.strip()], str(saida / f"{f.strip()}.mp4"), props)

if roteiro.get("capa") and not a.sem_capa:
    remotion("still", "src/index.ts", "Capa", str(saida / "capa.png"), props)
    if "youtube" in a.formatos:
        remotion("still", "src/index.ts", "CapaYouTube", str(saida / "capa-youtube.png"), props)

if roteiro.get("carrossel") and a.carrossel:
    for i in range(len(roteiro["carrossel"])):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tmp:
            json.dump({**roteiro, "pagina": i}, tmp, ensure_ascii=False)
        remotion("still", "src/index.ts", "Carrossel", str(saida / f"carrossel-{i + 1}.png"), f"--props={tmp.name}")
        Path(tmp.name).unlink()

# Cópia leve (<30 MB) para enviar pela conversa; o Instagram recomprime de qualquer jeito.
import imageio_ffmpeg
ff = imageio_ffmpeg.get_ffmpeg_exe()
for video in list(saida.glob("*.mp4")):
    if video.stem.endswith("-para-postar") or video.stat().st_size < 30 * 1024 * 1024:
        continue
    h, m, seg = re.search(r"Duration: (\d+):(\d+):([\d.]+)", subprocess.run([ff, "-i", str(video)], capture_output=True, text=True).stderr).groups()
    dur = int(h) * 3600 + int(m) * 60 + float(seg)
    kbps = int(28 * 8 * 1024 / dur - 140)
    leve = video.with_name(video.stem + "-para-postar.mp4")
    log = str(saida / "_passe")
    subprocess.run([ff, "-loglevel", "error", "-y", "-i", str(video), "-c:v", "libx264", "-preset", "slow", "-b:v", f"{kbps}k",
                    "-pass", "1", "-passlogfile", log, "-an", "-f", "null", "-"], check=True)
    subprocess.run([ff, "-loglevel", "error", "-y", "-i", str(video), "-c:v", "libx264", "-preset", "slow", "-b:v", f"{kbps}k",
                    "-pass", "2", "-passlogfile", log, "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(leve)], check=True)
    for f in saida.glob("_passe*"):
        f.unlink()

print(f"Pronto: {saida.relative_to(RAIZ)}/")
for arq in sorted(saida.iterdir()):
    print("  ", arq.name)
