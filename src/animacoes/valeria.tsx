import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { cores, fontes, paleta, rgba, SUAVE } from "../marca";
import { useArea } from "./area";
import type { PropsAnimacao } from "./index";

// Animações do vídeo "5 eixos" (Valéria · Eixoz).
// Todos os textos são palavras ditas pela Valéria. Terracota só para marcar (filetes, pontos, ícones).

const suave = Easing.bezier(...SUAVE);
const prog = (t: number, ini: number, dur: number) => suave(Math.min(1, Math.max(0, (t - ini) / dur)));

const useT = (t0 = 0) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useArea();
  return { t: frame / fps + t0, width, height, base: Math.min(width, height) };
};

const Fundo: React.FC<{ cor: string; brilho: string; y?: string }> = ({ cor, brilho, y = "42%" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${y}, ${brilho} 0%, ${cor} 72%)` }} />
);

// ── Eixos: trilha vertical com os 5 eixos, na ordem ──────────────────────────────
// palavras: os 5 nomes. tempos[i]: quando o eixo i acende (negativo = já aceso; omitido = apagado).
// O último aceso é o "ativo" (maior, com ponto terracota). tempos[5] (opcional): junção —
// os cinco pontos se juntam num círculo ligado ao centro.
// A trilha ocupa os 76% de cima da área: embaixo fica a legenda.
export const Eixos: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const n = palavras.length || 5;
  const acende = (i: number) => (tempos[i] === undefined ? 0 : tempos[i] < 0 ? 1 : prog(t, tempos[i], 0.55));
  let ativo = -1;
  for (let i = 0; i < n; i++) if (tempos[i] !== undefined && t >= (tempos[i] < 0 ? -Infinity : tempos[i])) ativo = i;
  const tJuncao = tempos[5];
  const junta = tJuncao === undefined ? 0 : prog(t, tJuncao, 1.3);
  const surge = prog(t, t0, 0.6);

  // posições: trilha (x fixo, y em degraus) → círculo (junção)
  const topo = height * 0.1;
  const passo = (height * 0.62) / (n - 1);
  const xTrilha = width * 0.24;
  const cx = width / 2;
  const cy = height * 0.4;
  const raio = base * 0.25;
  const pos = (i: number) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      x: interpolate(junta, [0, 1], [xTrilha, cx + Math.cos(ang) * raio]),
      y: interpolate(junta, [0, 1], [topo + i * passo, cy + Math.sin(ang) * raio]),
    };
  };
  // quanto da trilha já foi desenhada (até o eixo ativo)
  const ate = ativo < 0 ? 0 : ativo - 1 + acende(ativo);

  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="38%" />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: surge }}>
        {/* trilha de fundo (apagada) e trilha acesa até o ativo */}
        {junta < 1 &&
          Array.from({ length: n - 1 }).map((_, i) => {
            const a = pos(i);
            const b = pos(i + 1);
            const feito = Math.min(1, Math.max(0, ate - i));
            return (
              <g key={i} opacity={1 - junta}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={c.texto} strokeOpacity={0.14} strokeWidth={1.5} strokeDasharray="3 7" />
                <line x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * feito} y2={a.y + (b.y - a.y) * feito} stroke={cores.terracota} strokeWidth={2} />
              </g>
            );
          })}
        {/* junção: o círculo se fecha e cada eixo se liga ao centro */}
        {junta > 0 &&
          Array.from({ length: n }).map((_, i) => {
            const a = pos(i);
            const b = pos((i + 1) % n);
            const liga = prog(t, (tJuncao ?? 0) + 0.9 + i * 0.12, 0.6);
            return (
              <g key={`j${i}`}>
                <line x1={a.x} y1={a.y} x2={a.x + (b.x - a.x) * liga} y2={a.y + (b.y - a.y) * liga} stroke={cores.terracota} strokeOpacity={0.8} strokeWidth={1.8} />
                <line x1={a.x} y1={a.y} x2={a.x + (cx - a.x) * liga} y2={a.y + (cy - a.y) * liga} stroke={c.texto} strokeOpacity={0.25} strokeWidth={1.2} />
              </g>
            );
          })}
      </svg>
      {junta > 0 && (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: cy,
            transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * prog(t, (tJuncao ?? 0) + 1.4, 0.7)})`,
            width: base * 0.05,
            height: base * 0.05,
            borderRadius: "50%",
            background: cores.terracota,
            opacity: prog(t, (tJuncao ?? 0) + 1.4, 0.7),
            boxShadow: `0 0 ${base * 0.06}px ${rgba.terracota(0.6)}`,
          }}
        />
      )}
      {palavras.slice(0, n).map((nome, i) => {
        const p = pos(i);
        const a = acende(i);
        const eAtivo = i === ativo && junta === 0;
        const ativoP = eAtivo ? a : 0;
        const tam = base * (0.022 + 0.012 * ativoP);
        const corNome = a > 0.5 ? c.texto : c.textoSuave;
        const opNome = interpolate(a, [0, 1], [0.22, eAtivo ? 1 : 0.55]);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: tam,
                height: tam,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: a > 0.5 ? cores.terracota : "transparent",
                border: `1.5px solid ${a > 0.5 ? cores.terracota : rgba.bege(0.5)}`,
                boxShadow: eAtivo ? `0 0 ${base * 0.04 * ativoP}px ${rgba.terracota(0.55)}` : undefined,
                opacity: surge,
              }}
            />
            {/* número + nome ao lado do ponto (na junção, o nome vai para fora do círculo) */}
            <div
              style={{
                position: "absolute",
                left: junta > 0 ? p.x : p.x + base * 0.06,
                top: p.y,
                transform: junta > 0 ? `translate(-50%, ${p.y < cy - 1 ? "-150%" : "50%"})` : "translateY(-55%)",
                display: "flex",
                alignItems: "baseline",
                gap: base * 0.025,
                opacity: surge * (junta > 0 ? 1 : opNome),
                whiteSpace: "nowrap",
              }}
            >
              {junta === 0 && (
                <span style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.034, letterSpacing: "0.2em", color: cores.terracota }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              <span
                style={{
                  fontFamily: fontes.destaque,
                  fontStyle: eAtivo ? "italic" : "normal",
                  fontWeight: 600,
                  fontSize: junta > 0 ? base * 0.062 : base * (0.08 + 0.035 * ativoP),
                  color: junta > 0 ? c.texto : corNome,
                  transform: `translateX(${(1 - a) * -10}px)`,
                }}
              >
                {nome}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Infinito: o símbolo se desenha e as palavras surgem ao longo dele ────────────
// palavras: o que ela disse (ex.: Deus, espiritualidade, inteligência infinita, Vida). tempos: quando cada uma surge.
export const Infinito: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const cx = width / 2;
  const cy = height * 0.36;
  const A = width * 0.36;
  const ponto = (s: number) => {
    // lemniscata de Bernoulli
    const d = 1 + Math.sin(s) ** 2;
    return { x: cx + (A * Math.cos(s)) / d, y: cy + (A * Math.sin(s) * Math.cos(s)) / d };
  };
  const desenho = prog(t, t0 + 0.1, 2.2);
  const N = 160;
  const pts = Array.from({ length: N + 1 }, (_, i) => ponto((i / N) * Math.PI * 2));
  const caminho = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const comp = 2 * Math.PI * A * 0.83;
  const luz = ponto(((t - t0) * 0.9) % (Math.PI * 2));
  // posições das palavras: acima/abaixo das alças e no cruzamento
  const lugares = [
    { x: cx - A * 0.62, y: cy - base * 0.2 },
    { x: cx + A * 0.62, y: cy - base * 0.2 },
    { x: cx, y: cy + base * 0.2 },
    { x: cx, y: cy + base * 0.31 },
  ];
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="36%" />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={caminho} fill="none" stroke={c.texto} strokeOpacity={0.12} strokeWidth={10} />
        <path d={caminho} fill="none" stroke={cores.terracota} strokeWidth={2.2} strokeDasharray={comp} strokeDashoffset={comp * (1 - desenho)} />
        <circle cx={luz.x} cy={luz.y} r={5} fill={cores.offWhite} opacity={desenho} />
        <circle cx={luz.x} cy={luz.y} r={16} fill={rgba.offWhite(0.15)} opacity={desenho} />
      </svg>
      {palavras.slice(0, lugares.length).map((p, i) => {
        const s = prog(t, tempos[i] ?? t0 + 0.6 + i * 0.6, 0.6);
        const ultimo = i === palavras.length - 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: lugares[i].x,
              top: lugares[i].y,
              transform: `translate(-50%, -50%) translateY(${(1 - s) * 18}px)`,
              opacity: s,
              filter: s < 1 ? `blur(${(1 - s) * 6}px)` : undefined,
              fontFamily: fontes.destaque,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: base * (ultimo ? 0.1 : 0.066),
              color: ultimo ? c.texto : c.textoSuave,
              whiteSpace: "nowrap",
            }}
          >
            {p}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Problemas: com saúde, vários probleminhas leves; sem saúde, um problema só ──
// tempos: [vários problemas, sem saúde, um problema]
export const Problemas: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0, 3, 6], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const [tVarios, tSem, tUm] = tempos;
  const cx = width / 2;
  const cy = height * 0.36;
  const R = base * 0.26;
  const anel = prog(t, t0 + 0.1, 1.0) * (1 - 0.85 * prog(t, tSem, 1.0));
  const varios = prog(t, tVarios, 0.8);
  const junta = prog(t, tUm, 0.75);
  const um = prog(t, tUm + 0.4, 0.55);
  const M = 14;
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="36%" />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {/* o anel da saúde: inteiro, depois se desfaz */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={c.texto} strokeOpacity={0.55 * anel} strokeWidth={2} strokeDasharray={`${2 * Math.PI * R * (0.4 + 0.6 * anel)} ${2 * Math.PI * R}`} transform={`rotate(-90 ${cx} ${cy})`} />
        {Array.from({ length: M }).map((_, i) => {
          const ang = (i / M) * Math.PI * 2 + (t - t0) * 0.35 + random(`a${i}`) * 0.4;
          const d = R * (0.55 + 0.75 * random(`d${i}`));
          const x0 = cx + Math.cos(ang) * d;
          const y0 = cy + Math.sin(ang) * d * 0.9;
          const x = interpolate(junta, [0, 1], [x0, cx]);
          const y = interpolate(junta, [0, 1], [y0, cy]);
          const r = base * 0.009 * (0.7 + random(`r${i}`) * 0.6);
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 5 === 0 ? cores.terracota : c.textoSuave} opacity={varios * (1 - um)} />;
        })}
        {/* um problema: pesado, cacau com borda terracota */}
        <circle cx={cx} cy={cy} r={base * 0.11 * um * (1 + 0.02 * Math.sin((t - tUm) * 4))} fill={cores.cacau} stroke={cores.terracota} strokeWidth={2} opacity={um} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Chama: o traço desenha a chama; "aquecido" esquenta, "chama acesa" acende ────
// tempos: [aquecido, chama acesa]
export const Chama: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [1, 3], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const [tAquece, tAcende] = tempos;
  const cx = width / 2;
  const by = height * 0.66;
  const H = height * 0.5;
  const L = H * 0.42;
  const desenho = prog(t, t0 + 0.1, 1.4);
  const aquece = prog(t, tAquece, 1.2);
  const acende = prog(t, tAcende, 0.8);
  const bal = Math.sin((t - t0) * 3.2) * 0.04 + Math.sin((t - t0) * 5.1) * 0.02;
  // contorno da chama (gota alongada com ponta que balança)
  const ponta = { x: cx + L * bal * 2, y: by - H };
  const chama = `M${cx},${by} C${cx - L * 1.05},${by} ${cx - L * 1.0},${by - H * 0.4} ${cx - L * 0.55},${by - H * 0.6} C${cx - L * 0.25},${by - H * 0.74} ${cx - L * 0.45},${by - H * 0.88} ${ponta.x - L * 0.15},${ponta.y} C${ponta.x + L * 0.35},${ponta.y + H * 0.12} ${cx + L * 0.05},${by - H * 0.7} ${cx + L * 0.35},${by - H * 0.62} C${cx + L * 0.45},${by - H * 0.7} ${cx + L * 0.5},${by - H * 0.74} ${cx + L * 0.48},${by - H * 0.8} C${cx + L * 0.9},${by - H * 0.55} ${cx + L * 1.05},${by - H * 0.2} ${cx + L * 0.7},${by - H * 0.05} C${cx + L * 0.5},${by} ${cx + L * 0.25},${by} ${cx},${by} Z`;
  const interna = `M${cx},${by - H * 0.04} C${cx - L * 0.45},${by - H * 0.04} ${cx - L * 0.4},${by - H * 0.3} ${cx - L * 0.1},${by - H * 0.45} C${cx},${by - H * 0.5} ${cx + L * bal * 3},${by - H * 0.55} ${cx + L * bal * 3},${by - H * 0.62} C${cx + L * 0.25},${by - H * 0.42} ${cx + L * 0.45},${by - H * 0.2} ${cx},${by - H * 0.04} Z`;
  const comp = H * 3.2;
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="55%" />
      {/* calor: brilho que cresce */}
      <div style={{ position: "absolute", left: cx - base * 0.45, top: by - H * 0.75 - base * 0.25, width: base * 0.9, height: base * 0.9, borderRadius: "50%", background: `radial-gradient(circle, ${rgba.terracota(0.35 * aquece + 0.25 * acende)} 0%, transparent 65%)` }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="fogo" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cores.cacau} />
            <stop offset="70%" stopColor={cores.terracota} />
            <stop offset="100%" stopColor={cores.offWhite} />
          </linearGradient>
        </defs>
        <path d={chama} fill="url(#fogo)" fillOpacity={0.85 * aquece} stroke={cores.offWhite} strokeWidth={2} strokeDasharray={comp} strokeDashoffset={comp * (1 - desenho)} strokeOpacity={1 - 0.6 * aquece} />
        <path d={interna} fill={cores.offWhite} fillOpacity={0.75 * acende} />
        {/* faíscas subindo depois de acesa */}
        {Array.from({ length: 12 }).map((_, i) => {
          const ciclo = ((t - tAcende) * 0.45 + random(`f${i}`)) % 1;
          const x = cx + (random(`x${i}`) - 0.5) * L * 1.2 + Math.sin(ciclo * 6 + i) * 10;
          const y = by - H * 0.6 - ciclo * H * 0.55;
          return <circle key={i} cx={x} cy={y} r={2.2} fill={i % 3 ? cores.offWhite : cores.terracota} opacity={acende * Math.sin(ciclo * Math.PI) * 0.85} />;
        })}
        {/* base: filete */}
        <line x1={cx - L * 0.9 * desenho} y1={by + base * 0.04} x2={cx + L * 0.9 * desenho} y2={by + base * 0.04} stroke={cores.terracota} strokeWidth={2} />
      </svg>
    </AbsoluteFill>
  );
};

// ── Perguntas: as perguntas dela se escrevem uma embaixo da outra ────────────────
// palavras: perguntas (palavras exatas). tempos: quando cada uma começa.
export const Perguntas: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], palavras = [], t0 = 0 }) => {
  const { t, width, height, base } = useT(t0);
  const c = paleta(tema, clima);
  const n = palavras.length;
  const passo = height * 0.17;
  const topo = height * 0.5 - (passo * (n - 1)) / 2;
  let atual = -1;
  palavras.forEach((_, i) => {
    if (t >= (tempos[i] ?? Infinity)) atual = i;
  });
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="50%" />
      {/* filete vertical que acompanha as perguntas */}
      <div style={{ position: "absolute", left: width * 0.08, top: topo - passo * 0.3, width: 2, height: (passo * Math.max(0, atual + 0.6)) * prog(t, t0, 0.5), background: cores.terracota, opacity: 0.8 }} />
      {palavras.map((p, i) => {
        const ini = tempos[i] ?? t0 + i;
        const dur = Math.max(0.5, Math.min(1.1, ((tempos[i + 1] ?? ini + 1.2) - ini) * 0.8));
        const escreve = Math.min(1, Math.max(0, (t - ini) / dur));
        const eAtual = i === atual;
        const corpo = p.replace(/\?$/, "");
        const tamanho = base * 0.08;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * 0.12,
              top: topo + i * passo,
              transform: "translateY(-50%)",
              fontFamily: fontes.destaque,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: tamanho,
              color: eAtual ? c.texto : c.textoSuave,
              opacity: escreve > 0 ? (eAtual ? 1 : 0.55) : 0,
              whiteSpace: "nowrap",
              clipPath: `inset(-30% ${100 - escreve * 100}% -30% -5%)`,
            }}
          >
            {corpo}
            {p.endsWith("?") && <span style={{ color: cores.terracota }}>?</span>}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
