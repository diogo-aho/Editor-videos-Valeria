import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { cores, fontes, paleta, rgba, SUAVE } from "../marca";
import { useArea } from "./area";
import type { PropsAnimacao } from "./index";

// Animações do vídeo "Propósito" (Valéria).
// Todos os textos são palavras ditas pela Valéria, na fonte das animações (Josefin Sans).
// Grafismos que conectam: linhas que se desenham, pontos de conexão, quadros ligados.

const suave = Easing.bezier(...SUAVE);
const prog = (t: number, ini: number, dur: number) => suave(Math.min(1, Math.max(0, (t - ini) / dur)));

const useT = (t0 = 0) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useArea();
  // caixa útil: na tela dividida (área larga) quase tudo; na tela cheia (área alta) fica acima da legenda
  const alta = height > width;
  const caixa = alta ? { topo: height * 0.12, base: height * 0.62 } : { topo: height * 0.07, base: height * 0.76 };
  return { t: frame / fps + t0, width, height, base: Math.min(width, height), caixa };
};

const Fundo: React.FC<{ cor: string; brilho: string; y?: string }> = ({ cor, brilho, y = "40%" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${y}, ${brilho} 0%, ${cor} 72%)` }} />
);

const Rotulo: React.FC<{ x: number; y: number; tam: number; cor: string; op?: number; peso?: number; espaco?: string; children: React.ReactNode; alinha?: "centro" | "esquerda" }> = ({
  x,
  y,
  tam,
  cor,
  op = 1,
  peso = 400,
  espaco = "0.02em",
  children,
  alinha = "centro",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: alinha === "centro" ? "translate(-50%, -50%)" : "translateY(-50%)",
      fontFamily: fontes.animacao,
      fontWeight: peso,
      fontSize: tam * 1.6, // textos das animações bem legíveis no celular
      letterSpacing: espaco,
      color: cor,
      opacity: op,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

// ── Ranking: posições 1º a 5º; o 2º acende com "Brasil" ────────────────────────
// palavras: [Brasil, legenda do ranking]. tempos: [2º acende, legenda]
export const Ranking: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.5, 1.5], palavras = [], t0 = 0 }) => {
  const { t, width, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tSeg, tLeg] = tempos;
  const N = 5;
  const passo = (caixa.base - caixa.topo) / (N + 0.6);
  const x0 = width * 0.14;
  const x1 = width * 0.86;
  const acende = prog(t, tSeg, 0.6);
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      {Array.from({ length: N }).map((_, i) => {
        const y = caixa.topo + passo * (i + 0.5);
        const d = prog(t, t0 + 0.1 + i * 0.12, 0.6);
        const e2 = i === 1;
        return (
          <React.Fragment key={i}>
            <Rotulo x={x0} y={y} tam={base * 0.06} cor={e2 ? cores.terracota : c.textoSuave} op={d * (e2 ? 0.5 + 0.5 * acende : 0.45)} peso={e2 ? 600 : 300} alinha="esquerda">
              {i + 1}º
            </Rotulo>
            <div style={{ position: "absolute", left: x0 + base * 0.13, top: y, height: e2 ? 3 : 1.5, width: (x1 - x0 - base * 0.13) * d * (e2 ? 0.55 + 0.45 * acende : 0.55), background: e2 ? cores.terracota : rgba.offWhite(0.18), transform: "translateY(-50%)" }} />
            {e2 && (
              <>
                <div style={{ position: "absolute", left: x0 + base * 0.13 + (x1 - x0 - base * 0.13) * (0.55 + 0.45 * acende), top: y, width: base * 0.03, height: base * 0.03, borderRadius: "50%", background: cores.terracota, transform: "translate(-50%, -50%)", boxShadow: `0 0 ${base * 0.05 * acende}px ${rgba.terracota(0.7)}`, opacity: d }} />
                <Rotulo x={x0 + base * 0.2} y={y - base * 0.07} tam={base * 0.085} cor={c.texto} op={acende} peso={600} alinha="esquerda">
                  {palavras[0]}
                </Rotulo>
              </>
            )}
          </React.Fragment>
        );
      })}
      <Rotulo x={width / 2} y={caixa.topo + passo * (N + 0.2)} tam={width * 0.021} cor={c.textoSuave} op={prog(t, tLeg, 0.6)} espaco="0.12em" peso={500}>
        {(palavras[1] ?? "").toUpperCase()}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Montanha: o propósito como algo grandioso e inalcançável ────────────────────
// palavras: [grandiosa, inalcançável]. tempos: [pro resto da vida, grandiosa, inalcançável]
export const Montanha: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [1, 2, 3], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tVida, tGrande, tInalc] = tempos;
  const chao = caixa.base;
  const desenho = prog(t, t0 + 0.1, 1.4);
  const cresce = 1 + 0.18 * prog(t, tGrande, 1.2);
  const pico = { x: width * 0.62, y: chao - (chao - caixa.topo) * 0.5 * cresce };
  const montanha = `M${width * 0.04},${chao} L${width * 0.3},${chao - (chao - pico.y) * 0.45} L${width * 0.4},${chao - (chao - pico.y) * 0.32} L${pico.x},${pico.y} L${width * 0.72},${chao - (chao - pico.y) * 0.5} L${width * 0.82},${chao - (chao - pico.y) * 0.38} L${width * 0.96},${chao}`;
  const comp = width * 2.4;
  const foge = prog(t, tInalc, 1.6);
  const estrela = { x: pico.x + width * 0.12 * foge, y: caixa.topo + base * 0.04 - base * 0.06 * foge };
  const pessoa = { x: width * 0.1, y: chao };
  const vida = prog(t, tVida, 1.4);
  const trilha = Math.max(0, 1 - 0.55 * foge);
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} y="25%" />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={montanha} fill={rgba.offWhite(0.04)} stroke={c.texto} strokeOpacity={0.7} strokeWidth={2} strokeDasharray={comp} strokeDashoffset={comp * (1 - desenho)} strokeLinejoin="round" />
        {/* linha do horizonte: "pro resto da vida" */}
        <line x1={pessoa.x} y1={chao + 2} x2={pessoa.x + (width * 0.96 - pessoa.x) * vida} y2={chao + 2} stroke={cores.terracota} strokeWidth={2} />
        {/* trilha tracejada da pessoa até a estrela: some quando ela foge */}
        <path d={`M${pessoa.x},${pessoa.y} Q${width * 0.3},${caixa.topo} ${estrela.x},${estrela.y}`} fill="none" stroke={c.textoSuave} strokeOpacity={0.5 * trilha * prog(t, tGrande, 0.8)} strokeWidth={1.5} strokeDasharray="4 9" />
        <circle cx={pessoa.x} cy={pessoa.y} r={base * 0.014} fill={cores.terracota} />
        {/* estrela no alto */}
        <g opacity={prog(t, t0 + 0.6, 0.8)} transform={`translate(${estrela.x} ${estrela.y})`}>
          <circle r={base * 0.05} fill={rgba.offWhite(0.08)} />
          <path d={`M0,${-base * 0.03} L${base * 0.007},${-base * 0.007} L${base * 0.03},0 L${base * 0.007},${base * 0.007} L0,${base * 0.03} L${-base * 0.007},${base * 0.007} L${-base * 0.03},0 L${-base * 0.007},${-base * 0.007} Z`} fill={cores.offWhite} />
        </g>
      </svg>
      <Rotulo x={width * 0.26} y={chao - (chao - caixa.topo) * 0.5} tam={base * 0.06} cor={c.texto} op={prog(t, tGrande, 0.6)} peso={300}>
        {palavras[0]}
      </Rotulo>
      <Rotulo x={estrela.x - width * 0.3} y={estrela.y + base * 0.02} tam={base * 0.055} cor={cores.terracota} op={prog(t, tInalc, 0.6)} peso={500} espaco="0.04em">
        {palavras[1]}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Fases: a linha da vida com fases; o propósito pula de fase em fase ────────────
// palavras: [rótulo do ponto (propósito), legenda (fases da vida)]. tempos: [propósito, várias fases, atualiza]
export const Fases: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.5, 1.5, 3], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tProp, tFases, tAtual] = tempos;
  const yM = (caixa.topo + caixa.base) / 2 + base * 0.04;
  const amp = (caixa.base - caixa.topo) * 0.16;
  const N = 4;
  const ponto = (u: number) => ({ x: width * (0.08 + 0.84 * u), y: yM - Math.sin(u * Math.PI * 1.6) * amp });
  const linha = Array.from({ length: 81 }, (_, i) => ponto(i / 80));
  const d = linha.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const comp = width * 1.2;
  const desenho = prog(t, t0 + 0.05, 1.0);
  const nos = Array.from({ length: N }, (_, i) => ponto((i + 0.5) / N));
  // o marcador avança uma fase a cada 0,7 s depois de "atualiza"
  const passos = Math.max(0, (t - tAtual) / 0.7);
  const k = Math.min(N - 1, Math.floor(passos));
  const f = Math.min(1, passos - k);
  const de = nos[Math.min(k, N - 1)];
  const para = nos[Math.min(k + 1, N - 1)];
  const mov = t < tAtual ? 0 : suave(f);
  const mx = de.x + (para.x - de.x) * mov;
  const my = de.y + (para.y - de.y) * mov - Math.sin(mov * Math.PI) * base * 0.12;
  const vis = prog(t, tProp, 0.5);
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={c.texto} strokeOpacity={0.35} strokeWidth={2} strokeDasharray={comp} strokeDashoffset={comp * (1 - desenho)} />
        {nos.map((p, i) => {
          const a = prog(t, tFases + i * 0.18, 0.4);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={base * 0.022} fill={c.fundo} stroke={cores.terracota} strokeOpacity={a} strokeWidth={2} />
              <circle cx={p.x} cy={p.y} r={base * 0.008} fill={cores.terracota} opacity={a} />
            </g>
          );
        })}
        {/* rastro do pulo */}
        {t > tAtual && <path d={`M${de.x},${de.y} Q${(de.x + para.x) / 2},${Math.min(de.y, para.y) - base * 0.24} ${para.x},${para.y}`} fill="none" stroke={cores.terracota} strokeOpacity={0.5 * (1 - f)} strokeWidth={1.5} strokeDasharray="3 6" />}
        <circle cx={mx} cy={my} r={base * 0.03} fill={cores.terracota} opacity={vis} />
        <circle cx={mx} cy={my} r={base * 0.055} fill="none" stroke={cores.terracota} strokeOpacity={0.4 * vis} strokeWidth={1.5} />
      </svg>
      <Rotulo x={mx} y={my - base * 0.1} tam={base * 0.055} cor={c.texto} op={vis} peso={600}>
        {palavras[0]}
      </Rotulo>
      <Rotulo x={width / 2} y={caixa.base} tam={base * 0.036} cor={c.textoSuave} op={prog(t, tFases, 0.6)} espaco="0.22em" peso={500}>
        {(palavras[1] ?? "").toUpperCase()}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Escada: quadros ligados, um degrau por palavra (crescer, estudar, trabalhar, se aposentar) ──
// palavras: os degraus. tempos: quando cada um acende.
export const Escada: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const n = palavras.length || 1;
  const larg = width * 0.44;
  const alt = base * 0.15;
  const pos = (i: number) => ({
    x: width * 0.08 + ((width * 0.84 - larg) * i) / Math.max(1, n - 1),
    y: caixa.base - alt - ((caixa.base - caixa.topo - alt) * i) / Math.max(1, n - 1),
  });
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {palavras.slice(0, -1).map((_, i) => {
          const a = pos(i);
          const b = pos(i + 1);
          const liga = prog(t, (tempos[i + 1] ?? 0) - 0.45, 0.45);
          const x1 = a.x + larg * 0.5;
          const y1 = a.y;
          const x2 = b.x + larg * 0.5;
          const y2 = b.y + alt;
          return <path key={i} d={`M${x1},${y1} L${x1},${y1 + (y2 - y1) * 0.5 * liga} ${liga > 0.5 ? `L${x1 + (x2 - x1) * Math.min(1, (liga - 0.5) * 2)},${(y1 + y2) / 2}` : ""}`} fill="none" stroke={cores.terracota} strokeWidth={2} />;
        })}
      </svg>
      {palavras.map((p, i) => {
        const q = pos(i);
        const a = prog(t, tempos[i] ?? t0 + i, 0.45);
        const atual = i === palavras.findLastIndex((_, j) => t >= (tempos[j] ?? Infinity));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: q.x,
              top: q.y,
              width: larg,
              height: alt,
              borderRadius: base * 0.02,
              border: `1.5px solid ${atual ? cores.terracota : rgba.offWhite(0.35)}`,
              background: atual ? rgba.terracota(0.14) : rgba.offWhite(0.04),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: a,
              transform: `translateY(${(1 - a) * 20}px)`,
              fontFamily: fontes.animacao,
              fontWeight: atual ? 600 : 400,
              fontSize: base * 0.08,
              color: atual ? c.texto : c.textoSuave,
              letterSpacing: "0.03em",
            }}
          >
            {p}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Externo × interno: o de fora pressiona; o de dentro acende ──────────────────
// palavras: [o que o externo quer, o que a gente quer]. tempos: [externo, a gente]
export const ExternoInterno: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.5, 2], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tExt, tInt] = tempos;
  const cx = width / 2;
  const cy = (caixa.topo + caixa.base) / 2;
  const R = (caixa.base - caixa.topo) * 0.33;
  const ext = prog(t, tExt, 0.8);
  const int = prog(t, tInt, 0.7);
  const M = 16;
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={c.texto} strokeOpacity={0.25 + 0.3 * ext * (1 - int)} strokeWidth={1.5} strokeDasharray="2 8" />
        {Array.from({ length: M }).map((_, i) => {
          const ang = (i / M) * Math.PI * 2 + (t - t0) * 0.15;
          const empurra = ext * (0.5 + 0.5 * Math.sin((t - tExt) * 3 + i)) * (1 - 0.6 * int);
          const r0 = R + base * 0.06;
          const r1 = R - base * 0.03 - empurra * base * 0.06;
          return (
            <line key={i} x1={cx + Math.cos(ang) * r0} y1={cy + Math.sin(ang) * r0} x2={cx + Math.cos(ang) * r1} y2={cy + Math.sin(ang) * r1} stroke={c.textoSuave} strokeOpacity={0.7 * ext * (1 - 0.5 * int)} strokeWidth={2} strokeLinecap="round" />
          );
        })}
        <circle cx={cx} cy={cy} r={base * (0.05 + 0.03 * int)} fill={int > 0 ? cores.terracota : "none"} fillOpacity={int} stroke={cores.terracota} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={base * 0.12 * int} fill="none" stroke={cores.terracota} strokeOpacity={0.35 * int} strokeWidth={1.5} />
      </svg>
      <Rotulo x={cx} y={cy - R - base * 0.07} tam={base * 0.05} cor={c.textoSuave} op={ext * (1 - 0.4 * int)} espaco="0.06em">
        {palavras[0]}
      </Rotulo>
      <Rotulo x={cx} y={cy + base * 0.17} tam={base * 0.06} cor={c.texto} op={int} peso={600}>
        {palavras[1]}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Camadas: papéis, cargos e responsabilidades se empilham por cima de quem a gente é ──
// palavras: as camadas. tempos: quando cada uma cai.
export const Camadas: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [], palavras = [], t0 = 0 }) => {
  const { t, width, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const cx = width / 2;
  const cy = (caixa.topo + caixa.base) / 2;
  const cobre = prog(t, tempos[tempos.length - 1] ?? t0 + 2, 0.8);
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      {/* quem a gente é: um ponto que vai ficando escondido */}
      <div style={{ position: "absolute", left: cx, top: cy, width: base * 0.06, height: base * 0.06, borderRadius: "50%", background: cores.terracota, transform: "translate(-50%, -50%)", boxShadow: `0 0 ${base * 0.06}px ${rgba.terracota(0.6)}`, opacity: 1 - 0.75 * cobre }} />
      {palavras.map((p, i) => {
        const a = prog(t, tempos[i] ?? t0 + i, 0.55);
        const rot = [-6, 4, -2][i % 3];
        const dx = [-0.06, 0.05, 0][i % 3] * width;
        const dy = (i - (palavras.length - 1) / 2) * base * 0.035;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + dx,
              top: cy + dy - (1 - a) * base * 0.5,
              width: width * 0.72,
              height: base * 0.22,
              transform: `translate(-50%, -50%) rotate(${rot * a}deg)`,
              opacity: a,
              borderRadius: base * 0.02,
              background: `linear-gradient(160deg, ${cores.offWhite} 0%, ${cores.bege} 100%)`,
              boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: base * 0.03,
              fontFamily: fontes.animacao,
              fontWeight: 500,
              fontSize: base * 0.095,
              color: cores.azulProfundo,
              letterSpacing: "0.02em",
            }}
          >
            <div style={{ width: base * 0.016, height: base * 0.016, borderRadius: "50%", background: cores.terracota }} />
            {p}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ── Muito mais: o círculo do "que fazem" cabe dentro de um muito maior ──────────
// palavras: [pequeno, grande]. tempos: [pequeno, grande]
export const MuitoMais: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.3, 1], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tP, tG] = tempos;
  const cx = width / 2;
  const cy = (caixa.topo + caixa.base) / 2;
  const p = prog(t, tP, 0.5);
  const g = prog(t, tG, 1.1);
  const rP = base * 0.1;
  const rG = (caixa.base - caixa.topo) * 0.48 * g;
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={rG} fill={rgba.terracota(0.08)} stroke={cores.terracota} strokeWidth={2} opacity={g} />
        {Array.from({ length: 18 }).map((_, i) => {
          const ang = (i / 18) * Math.PI * 2 + (t - t0) * 0.2;
          const r = rG * (0.62 + 0.3 * random(`m${i}`));
          return <circle key={i} cx={cx + Math.cos(ang) * r} cy={cy + Math.sin(ang) * r} r={3} fill={i % 3 ? c.textoSuave : cores.terracota} opacity={g * 0.8} />;
        })}
        <circle cx={cx} cy={cy + rG * 0.2} r={rP} fill={c.fundo} stroke={c.texto} strokeOpacity={0.6} strokeWidth={1.5} opacity={p} />
      </svg>
      <Rotulo x={cx} y={cy + rG * 0.2} tam={base * 0.034} cor={c.textoSuave} op={p} espaco="0.04em">
        {palavras[0]}
      </Rotulo>
      <Rotulo x={cx} y={cy - rG * 0.55} tam={base * 0.075} cor={c.texto} op={g} peso={600}>
        {palavras[1]}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Escolha: "amar" fica de lado; "satisfeito" e "pleno" se ligam ──────────────
// palavras: [amar, satisfeito, pleno]. tempos: [amar, satisfeito, pleno]
export const Escolha: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.3, 1.5, 2.5], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tA, tS, tP] = tempos;
  const yA = caixa.topo + (caixa.base - caixa.topo) * 0.22;
  const yB = caixa.topo + (caixa.base - caixa.topo) * 0.72;
  const A = { x: width * 0.5, y: yA };
  const S = { x: width * 0.27, y: yB };
  const P = { x: width * 0.73, y: yB };
  const a = prog(t, tA, 0.5);
  const s = prog(t, tS, 0.5);
  const p = prog(t, tP, 0.5);
  const lado = 1 - 0.55 * s; // "amar" perde força quando "satisfeito" entra
  const lig = prog(t, tP - 0.1, 0.6);
  const no = (q: { x: number; y: number }, v: number, forte: boolean) => (
    <>
      <circle cx={q.x} cy={q.y} r={base * 0.028} fill={forte ? cores.terracota : "none"} stroke={forte ? cores.terracota : c.textoSuave} strokeWidth={2} opacity={v} />
      {forte && <circle cx={q.x} cy={q.y} r={base * 0.05} fill="none" stroke={cores.terracota} strokeOpacity={0.35 * v} strokeWidth={1.5} />}
    </>
  );
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={A.x} y1={A.y} x2={A.x + (S.x - A.x) * s} y2={A.y + (S.y - A.y) * s} stroke={c.textoSuave} strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="4 8" />
        <line x1={S.x} y1={S.y} x2={S.x + (P.x - S.x) * lig} y2={S.y} stroke={cores.terracota} strokeWidth={2.5} />
        {no(A, a * lado, false)}
        {no(S, s, true)}
        {no(P, p, true)}
      </svg>
      <Rotulo x={A.x} y={A.y - base * 0.08} tam={base * 0.06} cor={c.textoSuave} op={a * lado} peso={300}>
        {palavras[0]}
      </Rotulo>
      <Rotulo x={S.x} y={S.y - base * 0.09} tam={base * 0.068} cor={c.texto} op={s} peso={600}>
        {palavras[1]}
      </Rotulo>
      <Rotulo x={P.x} y={P.y - base * 0.09} tam={base * 0.068} cor={c.texto} op={p} peso={600}>
        {palavras[2]}
      </Rotulo>
    </AbsoluteFill>
  );
};

// ── Obstáculos: um caminho com barreiras; o ponto segue pulando ─────────────────
// palavras: [rótulo]. tempos: [barreiras aparecem]
export const Obstaculos: React.FC<PropsAnimacao> = ({ tema, clima, tempos = [0.5], palavras = [], t0 = 0 }) => {
  const { t, width, height, base, caixa } = useT(t0);
  const c = paleta(tema, clima);
  const [tObs] = tempos;
  const chao = caixa.base - base * 0.08;
  const N = 4;
  const xs = Array.from({ length: N }, (_, i) => width * (0.24 + i * 0.18));
  const alts = [0.2, 0.34, 0.26, 0.4].map((h) => h * base);
  const caminho = prog(t, t0 + 0.05, 0.8);
  const u = ((t - t0) * 0.32) % 1; // posição do ponto ao longo do caminho
  const x = width * (0.08 + 0.84 * u);
  let y = chao;
  xs.forEach((bx, i) => {
    const d = Math.abs(x - bx) / (width * 0.08);
    if (d < 1) y = Math.min(y, chao - (alts[i] + base * 0.05) * Math.cos((d * Math.PI) / 2) * prog(t, tObs + i * 0.2, 0.4));
  });
  return (
    <AbsoluteFill>
      <Fundo cor={c.fundo} brilho={c.brilho} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={width * 0.06} y1={chao} x2={width * (0.06 + 0.88 * caminho)} y2={chao} stroke={c.texto} strokeOpacity={0.4} strokeWidth={2} />
        {xs.map((bx, i) => {
          const a = prog(t, tObs + i * 0.2, 0.4);
          return <rect key={i} x={bx - base * 0.018} y={chao - alts[i] * a} width={base * 0.036} height={alts[i] * a} rx={3} fill={i % 2 ? cores.cacau : cores.terracota} opacity={0.9} />;
        })}
        <circle cx={x} cy={y - base * 0.03} r={base * 0.03} fill={cores.offWhite} opacity={caminho} />
      </svg>
      <Rotulo x={width / 2} y={caixa.topo + base * 0.06} tam={base * 0.07} cor={c.texto} op={prog(t, tObs, 0.6)} peso={300} espaco="0.04em">
        {palavras[0]}
      </Rotulo>
    </AbsoluteFill>
  );
};
