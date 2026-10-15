"""Gera efeitos sonoros sutis e provisórios (até chegarem os do Artlist).

Uso: python scripts/gerar_sons.py  -> public/sons/{transicao,toque,sopro}.wav
"""
from pathlib import Path
import numpy as np
import soundfile as sf

TAXA = 48000
DESTINO = Path(__file__).resolve().parent.parent / "public" / "sons"
rng = np.random.default_rng(7)


def passa_baixa(x, corte):
    """Filtro simples de um polo, com corte variando ao longo do tempo."""
    a = np.exp(-2 * np.pi * np.asarray(corte) / TAXA)
    y = np.zeros_like(x)
    acc = 0.0
    a = np.broadcast_to(a, x.shape)
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def envelope(n, ataque, queda):
    t = np.linspace(0, 1, n)
    return np.minimum(1, t / ataque) * np.exp(-np.maximum(0, t - ataque) / queda)


def normalizar(x, pico=0.5):
    return x / np.abs(x).max() * pico


def transicao():  # "whoosh" macio: ruído filtrado que abre e fecha
    n = int(TAXA * 0.7)
    t = np.linspace(0, 1, n)
    corte = 300 + 2800 * np.sin(np.pi * t) ** 2
    som = passa_baixa(rng.standard_normal(n), corte)
    som = passa_baixa(som, 4000) * np.sin(np.pi * t) ** 1.5
    estereo = np.stack([som * (1 - 0.4 * t), som * (0.6 + 0.4 * t)], axis=1)
    return normalizar(estereo, 0.45)


def toque():  # toque suave, tipo sino abafado, para animações que surgem
    n = int(TAXA * 0.9)
    t = np.arange(n) / TAXA
    som = sum(amp * np.sin(2 * np.pi * f * t) for f, amp in [(660, 1), (1320, 0.25), (1980, 0.08)])
    som *= envelope(n, 0.01, 0.18)
    return normalizar(np.stack([som, som], axis=1), 0.35)


def sopro():  # respiro de ar curtinho, para textos que entram
    n = int(TAXA * 0.35)
    t = np.linspace(0, 1, n)
    som = passa_baixa(rng.standard_normal(n), 1800) * np.sin(np.pi * t) ** 2
    return normalizar(np.stack([som, som], axis=1), 0.3)


if __name__ == "__main__":
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nome, f in [("transicao", transicao), ("toque", toque), ("sopro", sopro)]:
        sf.write(DESTINO / f"{nome}.wav", f(), TAXA)
        print("gerado", nome)
