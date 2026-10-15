import { measureText } from "@remotion/layout-utils";
import { BookOpen, Check, Ear, Flower2, Mic, Music, Play, Volume2 } from "lucide-react";
import React from "react";
import { AbsoluteFill, continueRender, delayRender, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { cores, fontes, paleta, rgba, SUAVE } from "../marca";
import { useArea } from "./area";
import type { PropsAnimacao } from "./index";

// Animações do vídeo "Grafirmaliza / portas sensoriais" (Eixoz).
// Todos os textos são palavras ditas pela Valeria. Terracota só para marcar (filetes, pontos, ícones).

const suave = Easing.bezier(...SUAVE);
const prog = (t: number, ini: number, dur: number) => suave(Math.min(1, Math.max(0, (t - ini) / dur)));

const useT = (t0 = 0) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useArea();
  return { t: frame / fps + t0, width, height, base: Math.min(width, height) };
};

// Medir texto só depois que as letras carregaram (senão a medida sai com a letra errada).
const useFontesProntas = () => {
  const [prontas, setProntas] = React.useState(false);
  const [espera] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => {
    document.fonts.ready.then(() => {
      setProntas(true);
      continueRender(espera);
    });
  }, [espera]);
  return prontas;
};

const Fundo: React.FC<{ cor: string; brilho: string; y?: string }> = ({ cor, brilho, y = "42%" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${y}, ${brilho} 0%, ${cor} 72%)` }} />
);

// ── Grafirmaliza: as sílabas saem das palavras e voam para montar o nome ─────────
// tempos: [nome, gratidão, afirmação, visualização]
const PARTES = [
  { antes: "", silaba: "Gra", depois: "tidão" },
  { antes: "A", silaba: "firma", depois: "ção" },
  { antes: "Visua", silaba: "liza", depois: "ção" },
];

export const Grafirmaliza: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0, 1, 2, 3], t0 }) => {
  const { t, width, height, base } = useT(t0);
  const prontas = useFontesProntas();
  const c = paleta(tema, clima);
  const [tNome, ...tPartes] = tempos;

  const N = base * 0.15; // nome
  const S = base * 0.068; // palavra
  const S2 = base * 0.084; // sílaba dentro da palavra
  const yNome = height * 0.27;
  const yPalavra = (i: number) => height * (0.5 + i * 0.105);

  const medidas = React.useMemo(() => {
    const w = (text: string, fontFamily: string, fontSize: number, fontWeight: string) =>
      text ? measureText({ text, fontFamily, fontSize, fontWeight }).width : 0;
    const slots = PARTES.map((p) => w(p.silaba, fontes.animacao, N, "600"));
    const total = slots.reduce((a, b) => a + b, 0);
    let x = width / 2 - total / 2;
    const xSlot = slots.map((s) => {
      const atual = x;
      x += s;
      return atual;
    });
    const palavras = PARTES.map((p) => {
      const a = w(p.antes, fontes.animacao, S, "500");
      const s = w(p.silaba, fontes.animacao, S2, "700");
      const d = w(p.depois, fontes.animacao, S, "500");
      const inicio = width / 2 - (a + s + d) / 2;
      return { inicio, xSilaba: inicio + a, a, s };
    });
    return { xSlot, palavras, total };
    // prontas: refaz a medida quando as letras carregam
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prontas, width, N, S, S2]);

  const aparece = prog(t, tNome - 0.2, 0.8);
  const completo = prog(t, tPartes[2] + 1.15, 0.8);
  const luz = interpolate(t, [tPartes[2] + 1.3, tPartes[2] + 2.4], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="35%" />
      {/* rótulo */}
      <div style={{ position: "absolute", top: yNome - N * 0.95, width: "100%", textAlign: "center", fontFamily: fontes.animacao, fontWeight: 600, fontSize: base * 0.028, letterSpacing: "0.45em", color: c.textoSuave, opacity: aparece }}>
        RITUAL DIÁRIO
      </div>
      {/* contorno fantasma do nome, esperando as sílabas */}
      {PARTES.map((p, i) => (
        <div key={`g${i}`} style={{ position: "absolute", left: medidas.xSlot[i], top: yNome - N * 0.6, fontFamily: fontes.animacao, fontWeight: 600, fontSize: N, lineHeight: 1.2, color: "transparent", WebkitTextStroke: `1px ${rgba.offWhite(0.28 * aparece)}` }}>
          {p.silaba}
        </div>
      ))}
      {/* palavras */}
      {PARTES.map((p, i) => {
        const v = prog(t, tPartes[i] - 0.1, 0.45);
        const m = medidas.palavras[i];
        const saiu = prog(t, tPartes[i] + 0.35, 0.3);
        return (
          <div key={`p${i}`} style={{ position: "absolute", left: m.inicio, top: yPalavra(i) - S2 * 0.6, opacity: v, transform: `translateY(${(1 - v) * 24}px)`, whiteSpace: "nowrap", lineHeight: 1.2 }}>
            <span style={{ fontFamily: fontes.animacao, fontWeight: 500, fontSize: S, color: c.textoSuave }}>{p.antes}</span>
            <span style={{ fontFamily: fontes.animacao, fontStyle: "italic", fontWeight: 700, fontSize: S2, color: cores.terracota, opacity: 1 - 0.7 * saiu }}>{p.silaba}</span>
            <span style={{ fontFamily: fontes.animacao, fontWeight: 500, fontSize: S, color: c.textoSuave }}>{p.depois}</span>
          </div>
        );
      })}
      {/* sílabas voando em arco até o nome */}
      {PARTES.map((p, i) => {
        const voo = prog(t, tPartes[i] + 0.3, 0.75);
        if (voo <= 0) return null;
        const m = medidas.palavras[i];
        const x = interpolate(voo, [0, 1], [m.xSilaba, medidas.xSlot[i]]);
        const yBase = interpolate(voo, [0, 1], [yPalavra(i) - S2 * 0.6, yNome - N * 0.6]);
        const arco = Math.sin(voo * Math.PI) * base * 0.08 * (i % 2 ? 1 : -1);
        const tam = interpolate(voo, [0, 1], [S2, N]);
        const chegou = prog(t, tPartes[i] + 1.05, 0.5);
        return (
          <div
            key={`v${i}`}
            style={{
              position: "absolute",
              left: x + arco,
              top: yBase,
              fontFamily: fontes.animacao,
              fontStyle: voo < 0.6 ? "italic" : "normal",
              fontWeight: 600,
              fontSize: tam,
              lineHeight: 1.2,
              color: interpolate(chegou, [0, 1], [0, 1]) > 0.5 ? c.texto : cores.terracota,
              textShadow: `0 0 ${24 * (1 - chegou)}px ${rgba.terracota(0.45 * (1 - chegou))}`,
              whiteSpace: "nowrap",
            }}
          >
            {p.silaba}
          </div>
        );
      })}
      {/* filete terracota que sublinha o nome completo + reflexo de luz */}
      <div style={{ position: "absolute", top: yNome + N * 0.52, left: width / 2 - (medidas.total * completo) / 2, width: medidas.total * completo, height: 2, background: cores.terracota }} />
      <div style={{ position: "absolute", top: yNome + N * 0.52 - 4, left: width / 2 + (medidas.total * completo) / 2 - 5, width: 10, height: 10, borderRadius: "50%", background: cores.terracota, opacity: completo > 0 && completo < 1 ? 1 : 0 }} />
      <div style={{ position: "absolute", top: yNome - N * 0.7, left: width / 2 - medidas.total / 2, width: medidas.total, height: N * 1.3, background: `linear-gradient(100deg, transparent ${luz * 100 - 12}%, ${rgba.offWhite(0.22)} ${luz * 100}%, transparent ${luz * 100 + 12}%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

// ── Caderno: escrever, revisar e ler em voz alta ─────────────────────────────────
// tempos: [escrever, revisar, voz alta]; palavras: linhas escritas
export const Escrita: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.5, 3, 5], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const [tEscreve, tRevisa, tVoz] = tempos;
  const folha = prog(t, t0 + 0.05, 0.7);
  const larg = width * 0.7;
  const alt = height * 0.74;
  const linhaY = (i: number) => alt * (0.24 + i * 0.22);
  const voz = prog(t, tVoz, 0.5);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      {/* ondas da voz alta */}
      {voz > 0 &&
        [0, 1, 2].map((k) => {
          const ciclo = ((t - tVoz + k * 0.5) % 1.5) / 1.5;
          return (
            <div key={k} style={{ position: "absolute", width: larg * (0.9 + ciclo * 0.7), height: alt * (0.9 + ciclo * 0.7), borderRadius: base * 0.06, border: `1.5px solid ${rgba.terracota(0.5 * (1 - ciclo) * voz)}` }} />
          );
        })}
      <div
        style={{
          width: larg,
          height: alt,
          borderRadius: base * 0.018,
          background: `linear-gradient(170deg, ${cores.offWhite} 0%, ${cores.bege} 100%)`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
          transform: `rotate(${-2.5 + 1.5 * folha}deg) translateY(${(1 - folha) * 60}px) scale(${1 + 0.025 * voz * Math.sin((t - tVoz) * 9)})`,
          opacity: folha,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* pautas */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: "8%", right: "8%", top: linhaY(i) + base * 0.045, height: 1, background: rgba.cacau(0.3) }} />
        ))}
        <div style={{ position: "absolute", left: "13%", top: 0, bottom: 0, width: 1, background: rgba.cacau(0.25) }} />
        {palavras.map((p, i) => {
          const escreve = Math.min(1, Math.max(0, (t - tEscreve - i * 0.65) / 0.85));
          const check = prog(t, tRevisa + i * 0.35, 0.35);
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: "17%", top: linhaY(i) - base * 0.045, fontFamily: fontes.animacao, fontStyle: "italic", fontWeight: 600, fontSize: base * 0.085, color: cores.azulProfundo, clipPath: `inset(-30% ${100 - escreve * 100}% -30% -5%)`, whiteSpace: "nowrap" }}>
                {p}
              </div>
              {/* caneta que acompanha a escrita */}
              {escreve > 0 && escreve < 1 && (
                <div style={{ position: "absolute", left: `calc(17% + ${escreve * larg * 0.55}px)`, top: linhaY(i) - base * 0.06, width: 4, height: base * 0.11, background: cores.azulProfundo, borderRadius: 3, transform: "rotate(28deg)", transformOrigin: "bottom" }} />
              )}
              <div style={{ position: "absolute", right: "10%", top: linhaY(i) - base * 0.02, opacity: check, transform: `scale(${0.5 + 0.5 * check})` }}>
                <Check size={base * 0.06} color={cores.azulProfundo} strokeWidth={2.4} />
              </div>
              <div style={{ position: "absolute", right: "10%", top: linhaY(i) + base * 0.05, width: base * 0.06 * check, height: 2, background: cores.terracota }} />
            </React.Fragment>
          );
        })}
        <div style={{ position: "absolute", right: "7%", bottom: "6%", opacity: voz }}>
          <Volume2 size={base * 0.07} color={cores.cacau} strokeWidth={1.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── O filme da visualização: projetor, tela em perspectiva, música e palavras ────
// tempos: [filme, música, palavras]; palavras: o que aparece na tela
export const Filme: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0, 2, 4], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const [tFilme, tMusica, tPalavras] = tempos;
  const tela = prog(t, t0 + 0.1, 0.9);
  const play = prog(t, tFilme, 0.5) * (1 - prog(t, tMusica - 0.4, 0.4));
  const musica = prog(t, tMusica, 0.6);
  const larg = width * 0.84;
  const alt = larg * 0.5625;
  const cy = height * 0.4;
  const cada = 1.15;
  const feixe = prog(t, tFilme - 0.3, 0.8);

  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="40%" />
      {/* feixe do projetor vindo de cima, com poeira */}
      <div style={{ position: "absolute", left: width / 2 - larg / 2, top: 0, width: larg, height: cy, background: `linear-gradient(180deg, transparent 0%, ${rgba.offWhite(0.07 * feixe)} 100%)`, clipPath: "polygon(46% 0%, 54% 0%, 100% 100%, 0% 100%)" }} />
      {Array.from({ length: 22 }).map((_, i) => {
        const x = width / 2 + (random(`px${i}`) - 0.5) * larg * 0.8;
        const y = ((random(`py${i}`) + (t - t0) * 0.05 * (0.5 + random(`pv${i}`))) % 1) * cy;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 3, height: 3, borderRadius: "50%", background: rgba.offWhite(0.4 * feixe * random(`pa${i}`)) }} />;
      })}
      <div style={{ position: "absolute", left: width / 2 - larg / 2, top: cy - alt / 2, width: larg, height: alt, perspective: 1200 }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: base * 0.02,
            border: `1.5px solid ${rgba.bege(0.5 * tela)}`,
            background: "linear-gradient(160deg, #3b3d3c 0%, #232524 100%)",
            boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 ${60 * feixe}px ${rgba.offWhite(0.08)}`,
            transform: `rotateX(${(1 - tela) * 18 + 4}deg) scale(${0.9 + 0.1 * tela})`,
            opacity: tela,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", opacity: play, transform: `scale(${0.8 + 0.2 * play})` }}>
            <div style={{ width: base * 0.16, height: base * 0.16, borderRadius: "50%", border: `2px solid ${cores.bege}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={base * 0.07} color={cores.terracota} strokeWidth={1.6} style={{ marginLeft: base * 0.01 }} />
            </div>
          </div>
          {palavras.map((p, i) => {
            const v = prog(t, tPalavras + i * cada, 0.35) * (i === palavras.length - 1 ? 1 : 1 - prog(t, tPalavras + (i + 1) * cada - 0.2, 0.3));
            if (v <= 0) return null;
            return (
              <div key={i} style={{ position: "absolute", fontFamily: fontes.animacao, fontStyle: "italic", fontWeight: 600, fontSize: base * 0.1, color: cores.offWhite, opacity: v, transform: `scale(${1.08 - 0.08 * v})`, filter: `blur(${(1 - v) * 6}px)`, letterSpacing: `${(1 - v) * 0.1}em` }}>
                {p}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: "6%", right: "6%", bottom: "8%", height: 2, background: rgba.offWhite(0.15) }}>
            <div style={{ width: `${interpolate(t, [tFilme, tFilme + 10], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`, height: "100%", background: cores.terracota }} />
          </div>
        </div>
      </div>
      {/* música: equalizador e notas subindo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: cy + alt / 2 + base * 0.05, display: "flex", justifyContent: "center", gap: base * 0.012, alignItems: "flex-end", height: base * 0.08, opacity: musica }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{ width: base * 0.008, borderRadius: 9, background: i % 6 === 2 ? cores.terracota : cores.bege, height: base * 0.08 * (0.25 + 0.75 * Math.abs(Math.sin(t * 3.1 + i * 0.6) * Math.cos(t * 1.3 + i * 0.25))) }} />
        ))}
      </div>
      {t >= tMusica &&
        [0, 1, 2, 3].map((i) => {
          const ciclo = ((t - tMusica + i * 0.7) % 2.8) / 2.8;
          return (
            <Music key={i} size={base * 0.05} color={cores.bege} strokeWidth={1.4} style={{ position: "absolute", left: width * (0.14 + i * 0.22) + Math.sin(ciclo * 6 + i) * 12, top: cy - alt / 2 - base * 0.04 - ciclo * base * 0.2, opacity: musica * Math.sin(ciclo * Math.PI) * 0.8 }} />
          );
        })}
    </AbsoluteFill>
  );
};

// ── Portas sensoriais: cada sentido acende; partículas correm até o subconsciente ─
// tempos: [ler, falar, ouvir, música, cheiro, brilho forte do centro] (1e9 = ainda não)
const PORTAS = [
  { nome: "Ler", Icone: BookOpen },
  { nome: "Falar", Icone: Mic },
  { nome: "Ouvir", Icone: Ear },
  { nome: "Música", Icone: Music },
  { nome: "Cheiro", Icone: Flower2 },
];

export const PortasSensoriais: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const cx = width / 2;
  const cy = height * 0.45;
  const raio = Math.min(width, height) * 0.31;
  const ativas = PORTAS.map((_, i) => prog(t, tempos[i] ?? 1e9, 0.5));
  const brilhoCentro = Math.max(prog(t, tempos[5] ?? 1e9, 0.8), ativas.reduce((a, b) => a + b, 0) / 5);
  const pulso = 1 + 0.03 * Math.sin(t * 2.4) * brilhoCentro;
  const pos = (i: number) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / PORTAS.length;
    return { x: cx + Math.cos(ang) * raio, y: cy + Math.sin(ang) * raio };
  };
  // ondas que saem do centro a cada porta que acende
  const ondas = [...PORTAS.map((_, i) => tempos[i] ?? 1e9), tempos[5] ?? 1e9].filter((x) => t >= x + 0.35 && t < x + 1.6);

  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="45%" />
      <svg width={width} height={height} style={{ position: "absolute" }}>
        {PORTAS.map((_, i) => {
          const { x, y } = pos(i);
          const surge = prog(t, t0 + 0.1 + i * 0.12, 0.6);
          const comp = ativas[i];
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={cores.bege} strokeOpacity={0.14 * surge} strokeWidth={1.5} strokeDasharray="4 8" />
              <line x1={x} y1={y} x2={x + (cx - x) * comp} y2={y + (cy - y) * comp} stroke={cores.terracota} strokeOpacity={0.85} strokeWidth={2} />
              {/* partículas correndo até o centro */}
              {comp >= 1 &&
                [0, 1, 2].map((k) => {
                  const f = ((t - (tempos[i] ?? 0) + k * 0.4) % 1.2) / 1.2;
                  return <circle key={k} cx={x + (cx - x) * f} cy={y + (cy - y) * f} r={4 - 2 * f} fill={cores.terracota} fillOpacity={0.9 * (1 - f * 0.6)} />;
                })}
            </g>
          );
        })}
        {ondas.map((x, k) => {
          const f = (t - x - 0.35) / 1.25;
          return <circle key={k} cx={cx} cy={cy} r={raio * (0.48 + f * 0.7)} fill="none" stroke={cores.terracota} strokeOpacity={0.5 * (1 - f)} strokeWidth={1.5} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) scale(${pulso})`, width: raio * 0.95, height: raio * 0.95, borderRadius: "50%", border: `1.5px solid ${rgba.bege(0.3 + 0.5 * brilhoCentro)}`, background: `radial-gradient(circle, ${rgba.cacau(0.25 + 0.4 * brilhoCentro)} 0%, ${rgba.azulProfundo(0.95)} 75%)`, boxShadow: `0 0 ${50 * brilhoCentro}px ${rgba.terracota(0.25 * brilhoCentro)}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: prog(t, t0, 0.6) }}>
        <div style={{ fontFamily: fontes.animacao, fontStyle: "italic", fontWeight: 600, fontSize: base * 0.06, color: cores.offWhite }}>Subconsciente</div>
      </div>
      {PORTAS.map(({ nome, Icone }, i) => {
        const { x, y } = pos(i);
        const surge = prog(t, t0 + 0.1 + i * 0.12, 0.6);
        const a = ativas[i];
        const tam = base * 0.15;
        return (
          <div key={nome} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${(0.85 + 0.15 * surge) * (1 + 0.08 * a)})`, opacity: surge * (0.45 + 0.55 * a), display: "flex", flexDirection: "column", alignItems: "center", gap: base * 0.012 }}>
            <div style={{ width: tam, height: tam, borderRadius: "50%", border: `1.5px solid ${a > 0.5 ? cores.terracota : rgba.bege(0.5)}`, background: rgba.cacau(0.35 * a), display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${30 * a}px ${rgba.terracota(0.3 * a)}` }}>
              <Icone size={tam * 0.42} color={a > 0.5 ? cores.terracota : cores.bege} strokeWidth={1.4} />
            </div>
            <div style={{ fontFamily: fontes.animacao, fontWeight: 600, fontSize: base * 0.03, letterSpacing: "0.12em", textTransform: "uppercase", color: a > 0.5 ? cores.offWhite : cores.bege }}>{nome}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Disco de vinil: a música que gravou um momento ───────────────────────────────
// tempos: [texto aparece]; palavras[0]: texto (frase dita pela Valeria)
export const Vinil: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [1], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const surge = prog(t, t0 + 0.1, 0.8);
  const giro = (t - t0) * 50;
  const d = Math.min(width, height) * 0.62;
  const texto = prog(t, tempos[0], 0.6);
  const braco = interpolate(surge, [0, 1], [-28, -6]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      {/* notas saindo do disco */}
      {[0, 1, 2, 3, 4].map((i) => {
        const ciclo = ((t - t0 + i * 0.55) % 2.75) / 2.75;
        const ang = -Math.PI / 2 + (i - 2) * 0.45;
        return (
          <Music key={i} size={base * 0.045} color={i === 2 ? cores.terracota : cores.bege} strokeWidth={1.4} style={{ position: "absolute", left: width / 2 + Math.cos(ang) * d * (0.45 + ciclo * 0.35), top: height / 2 + height * 0.04 + Math.sin(ang) * d * (0.45 + ciclo * 0.35), opacity: surge * Math.sin(ciclo * Math.PI) * 0.75 }} />
        );
      })}
      <div style={{ position: "relative", width: d, height: d, opacity: surge, transform: `translateY(${height * 0.04}px) scale(${0.82 + 0.08 * surge})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", transform: `rotate(${giro}deg)`, background: "repeating-radial-gradient(circle, #1d1e1e 0px, #1d1e1e 3px, #2c2e2d 4px, #1d1e1e 6px)", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `conic-gradient(from 0deg, transparent 0deg, ${rgba.offWhite(0.1)} 30deg, transparent 60deg, transparent 180deg, ${rgba.offWhite(0.08)} 210deg, transparent 240deg)` }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: d * 0.34, height: d * 0.34, transform: "translate(-50%,-50%)", borderRadius: "50%", background: `radial-gradient(circle, ${cores.bege} 0%, ${cores.cacau} 85%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: "18%", borderRadius: "50%", border: `1.5px solid ${cores.terracota}`, opacity: 0.8 }} />
            <div style={{ width: d * 0.03, height: d * 0.03, borderRadius: "50%", background: "#1d1e1e" }} />
          </div>
        </div>
        <div style={{ position: "absolute", right: -d * 0.06, top: -d * 0.04, width: d * 0.05, height: d * 0.62, transformOrigin: "50% 4%", transform: `rotate(${braco}deg)` }}>
          <div style={{ width: d * 0.05, height: d * 0.05, borderRadius: "50%", background: cores.bege }} />
          <div style={{ width: 4, height: d * 0.52, margin: "0 auto", background: cores.bege }} />
          <div style={{ width: d * 0.045, height: d * 0.07, margin: "0 auto", background: cores.cacau, borderRadius: 4 }} />
        </div>
      </div>
      {palavras[0] && (
        <div style={{ position: "absolute", top: height * 0.08, left: "8%", right: "8%", textAlign: "center", fontFamily: fontes.animacao, fontStyle: "italic", fontWeight: 600, fontSize: base * 0.06, color: c.texto, opacity: texto, transform: `translateY(${(1 - texto) * 16}px)` }}>
          {palavras[0]}
        </div>
      )}
    </AbsoluteFill>
  );
};

// ── Aroma: frasco de perfume desenhado em traço e o perfume subindo em espirais ──
// tempos: [perfume]
export const Aroma: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [1], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const desenho = prog(t, t0 + 0.1, 1.2);
  const aroma = prog(t, tempos[0] - 0.3, 0.8);
  const bx = width / 2;
  const by = height * 0.72;
  const L = base * 0.24; // largura do frasco
  const A = base * 0.26; // altura do corpo
  const contorno = 2 * (L + A) + 200;
  const frasco = `M ${bx - L / 2} ${by} L ${bx + L / 2} ${by} L ${bx + L / 2} ${by - A} Q ${bx + L / 2} ${by - A - 20} ${bx + L / 4} ${by - A - 24} L ${bx - L / 4} ${by - A - 24} Q ${bx - L / 2} ${by - A - 20} ${bx - L / 2} ${by - A} Z`;
  const tampa = `M ${bx - L * 0.12} ${by - A - 24} L ${bx - L * 0.12} ${by - A - 64} L ${bx + L * 0.12} ${by - A - 64} L ${bx + L * 0.12} ${by - A - 24}`;
  const topo = by - A - 70;

  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="70%" />
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="aroma" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cores.offWhite} stopOpacity="0.95" />
            <stop offset="100%" stopColor={cores.bege} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={frasco} fill={rgba.offWhite(0.05 * desenho)} stroke={cores.offWhite} strokeWidth={2} strokeDasharray={contorno} strokeDashoffset={contorno * (1 - desenho)} />
        <path d={tampa} fill="none" stroke={cores.offWhite} strokeWidth={2} strokeDasharray={300} strokeDashoffset={300 * (1 - prog(t, t0 + 0.8, 0.6))} />
        {/* líquido */}
        <rect x={bx - L / 2 + 6} y={by - A * 0.55 * desenho} width={L - 12} height={A * 0.55 * desenho - 4} fill={rgba.cacau(0.45)} rx={4} />
        <line x1={bx - L / 2 + 14} y1={by - A + 16} x2={bx - L / 2 + 14} y2={by - 16} stroke={rgba.offWhite(0.35 * desenho)} strokeWidth={3} strokeLinecap="round" />
        {/* espirais do perfume */}
        {aroma > 0 &&
          [0, 1, 2, 3].map((k) => {
            const fase = t * 1.2 + k * 1.7;
            const alto = height * (0.45 + 0.08 * k) * aroma;
            const pontos = Array.from({ length: 7 }).map((_, j) => {
              const f = j / 6;
              return [bx + Math.sin(fase + f * 5 + k) * base * (0.04 + f * 0.2) * (k % 2 ? 1 : -1), topo - f * alto];
            });
            const d = pontos.reduce((acc, [x, y], j) => (j === 0 ? `M ${x} ${y}` : `${acc} S ${x + (pontos[j - 1][0] - x) * 0.4} ${(pontos[j - 1][1] + y) / 2} ${x} ${y}`), "");
            return <path key={k} d={d} fill="none" stroke="url(#aroma)" strokeWidth={4 - k * 0.6} strokeLinecap="round" opacity={0.95 - k * 0.15} style={{ filter: "blur(0.6px)" }} />;
          })}
        {aroma > 0 &&
          Array.from({ length: 10 }).map((_, i) => {
            const ciclo = ((t * 0.35 + random(`a${i}`)) % 1);
            const x = bx + Math.sin(t * 1.5 + i * 2) * base * 0.12 * ciclo;
            return <circle key={i} cx={x} cy={topo - ciclo * height * 0.5} r={2.5} fill={i % 4 === 0 ? cores.terracota : cores.bege} fillOpacity={aroma * Math.sin(ciclo * Math.PI) * 0.8} />;
          })}
      </svg>
    </AbsoluteFill>
  );
};
