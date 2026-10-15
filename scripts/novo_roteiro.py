"""Cria o roteiro inicial de um vídeo a partir do que o preparar.py gerou.

Uso: python scripts/novo_roteiro.py <nome> [--foto valeria/fotos/foto-1.jpg]

Gera public/projetos/<nome>/roteiro.json com uma única cena de rosto e a legenda
completa. Depois o Claude divide em cenas, marca destaques e escolhe as animações
(passo a passo em .claude/skills/editar-video/SKILL.md).
"""
import argparse, json
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("nome")
ap.add_argument("--foto", help="foto da Valeria, se a gravação for só áudio")
a = ap.parse_args()

pasta = RAIZ / "public" / "projetos" / a.nome
info = json.loads((pasta / "info.json").read_text(encoding="utf-8"))
palavras = json.loads((pasta / "palavras.json").read_text(encoding="utf-8"))["palavras"]

orador = {"foco": "50% 28%"}
if info["tem_video"]:
    orador["video"] = info["arquivo"]
    if (pasta / "frente.webm").exists():
        orador["frente"] = f"projetos/{a.nome}/frente.webm"
elif a.foto:
    orador["foto"] = a.foto
    recorte = Path(a.foto).with_name(Path(a.foto).stem + "-recorte.png")
    if (RAIZ / "public" / recorte).exists():
        orador["fotoFrente"] = str(recorte)

roteiro = {
    "titulo": a.nome,
    "tema": "escuro",
    "clima": "quente",
    "fala": info["arquivo"],
    "duracao": info["duracao"],
    "orador": orador,
    "palavras": palavras,
    "cenas": [{"tipo": "rosto", "inicio": 0, "fim": info["duracao"]}],
    "sobreposicoes": [],
    "musicas": [],
    "efeitos": [],
    "encerramento": True,
}
destino = pasta / "roteiro.json"
if destino.exists():
    raise SystemExit(f"{destino} já existe; apague antes se quiser recomeçar.")
destino.write_text(json.dumps(roteiro, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Roteiro inicial: {destino.relative_to(RAIZ)}")
