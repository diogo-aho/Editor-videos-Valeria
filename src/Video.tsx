import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CenaDividida, CenaRosto, CenaTelaCheia, CenaTextoGrande } from "./componentes/Cenas";
import { Legenda } from "./componentes/Legenda";
import { Sobreposicoes } from "./componentes/Sobreposicoes";
import "./fontes";
import { ARROBA, cores, fontes, formatoDe, NOME, paleta, SUAVE, zonaSegura } from "./marca";
import type { Cena, Roteiro, Sobreposicao } from "./tipos";

const suave = Easing.bezier(...SUAVE);
export const TRANSICAO = 0.4; // segundos de passagem suave entre cenas
export const ENCERRAMENTO = 2.6; // segundos da assinatura final

// Onde fica a legenda em cada tipo de cena (fração da altura). null = escondida.
const posicaoLegenda = (cena: Cena | undefined, formato: ReturnType<typeof formatoDe>, altura: number): number | null => {
  const z = zonaSegura(formato);
  const limiteBase = (altura - z.base) / altura - 0.06;
  if (!cena) return null;
  if (cena.legenda === "esconder") return null;
  if (typeof cena.legenda === "number") return cena.legenda;
  switch (cena.tipo) {
    case "rosto": // altura do peito
      return Math.min(formato === "horizontal" ? 0.78 : 0.64, limiteBase);
    case "dividida": // na parte de baixo da ilustração, logo acima do fio (o rosto fica livre)
      return formato === "horizontal" ? Math.min(0.82, limiteBase) : 0.42;
    case "telaCheia":
      return Math.min(formato === "horizontal" ? 0.84 : 0.7, limiteBase);
    case "textoGrande": // a frase já está na tela
      return null;
  }
};

const ComponenteCena: React.FC<{ cena: Cena; roteiro: Roteiro; inicioSeq: number }> = ({ cena, roteiro, inicioSeq }) => {
  const comum = { tema: roteiro.tema, clima: roteiro.clima, inicioSeq, oradorPadrao: roteiro.orador };
  switch (cena.tipo) {
    case "rosto": {
      const atras = roteiro.sobreposicoes.filter(
        (s): s is Extract<Sobreposicao, { tipo: "palavraAtras" }> =>
          s.tipo === "palavraAtras" && s.inicio < cena.fim && s.fim > cena.inicio,
      );
      return <CenaRosto {...comum} cena={cena} atras={atras} />;
    }
    case "dividida":
      return <CenaDividida {...comum} cena={cena} />;
    case "telaCheia":
      return <CenaTelaCheia {...comum} cena={cena} />;
    case "textoGrande":
      return <CenaTextoGrande {...comum} cena={cena} />;
  }
};

// Passagem elegante: a cena nova surge por cima com fade, leve desfoque e aproximação.
const Entrada: React.FC<{ children: React.ReactNode; primeira: boolean }> = ({ children, primeira }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (primeira) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = suave(Math.min(1, frame / (TRANSICAO * fps)));
  return (
    <AbsoluteFill style={{ opacity: p, transform: `scale(${1.035 - 0.035 * p})`, filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

const Assinatura: React.FC<{ roteiro: Roteiro }> = ({ roteiro }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const c = paleta("escuro", roteiro.clima);
  const base = Math.min(width, height);
  const surge = (atraso: number) => suave(Math.min(1, Math.max(0, (t - atraso) / 0.7)));
  return (
    <AbsoluteFill style={{ background: c.fundo, alignItems: "center", justifyContent: "center", opacity: surge(0) }}>
      <div style={{ width: base * 0.12 * surge(0.25), height: 2, background: cores.terracota }} />
      <div style={{ fontFamily: fontes.destaque, fontWeight: 600, fontSize: base * 0.075, color: cores.offWhite, marginTop: base * 0.05, opacity: surge(0.6) }}>
        {NOME}
      </div>
      <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: base * 0.03, letterSpacing: "0.28em", color: cores.bege, marginTop: base * 0.018, opacity: surge(0.9) }}>
        {ARROBA.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC<Roteiro> = (roteiro) => {
  const { fps, width, height } = useVideoConfig();
  const formato = formatoDe(width, height);
  const f = (s: number) => Math.round(s * fps);
  const cenaEm = (t: number) => [...roteiro.cenas].reverse().find((c) => c.inicio <= t + 1e-3) ?? roteiro.cenas[0];

  // efeitos automáticos: passagem entre cenas e entrada de animações (bem baixinhos)
  const automaticos = [
    ...roteiro.cenas.slice(1).map((c) => ({ arquivo: "sons/transicao.wav", em: c.inicio - TRANSICAO * 0.6, volume: 0.22 })),
    ...roteiro.sobreposicoes.map((s) => ({ arquivo: s.tipo === "palavraAtras" ? "sons/sopro.wav" : "sons/toque.wav", em: s.inicio, volume: 0.16 })),
  ];

  return (
    <AbsoluteFill style={{ background: paleta(roteiro.tema, roteiro.clima).fundo }}>
      {roteiro.cenas.map((cena, i) => {
        const inicio = i === 0 ? cena.inicio : cena.inicio - TRANSICAO;
        return (
          <Sequence key={i} name={`${cena.tipo} ${cena.inicio}s`} from={f(inicio)} durationInFrames={f(cena.fim - inicio) + 1} premountFor={fps}>
            <Entrada primeira={i === 0}>
              <ComponenteCena cena={cena} roteiro={roteiro} inicioSeq={inicio} />
            </Entrada>
          </Sequence>
        );
      })}

      <Sobreposicoes itens={roteiro.sobreposicoes} tema={roteiro.tema} clima={roteiro.clima} />
      <Legenda palavras={roteiro.palavras} posicaoY={(t) => (t > roteiro.duracao + 0.3 ? null : posicaoLegenda(cenaEm(t), formato, height))} />

      {roteiro.encerramento && (
        <Sequence name="assinatura" from={f(roteiro.duracao)} premountFor={fps}>
          <Assinatura roteiro={roteiro} />
        </Sequence>
      )}

      <Audio name="fala" src={staticFile(roteiro.fala)} />
      {roteiro.musicas.map((m, i) => (
        <Sequence key={`m${i}`} name={`música ${i + 1}`} from={f(m.inicio)} durationInFrames={f(m.fim - m.inicio)} premountFor={fps}>
          <Audio
            src={staticFile(m.arquivo)}
            volume={(fr) =>
              (m.volume ?? 0.12) *
              interpolate(fr / fps, [0, 1.2, m.fim - m.inicio - 1.8, m.fim - m.inicio], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ))}
      {[...automaticos, ...roteiro.efeitos].map((e, i) => (
        <Sequence key={`e${i}`} name="efeito" from={Math.max(0, f(e.em))} durationInFrames={f(1.2)} premountFor={fps}>
          <Audio src={staticFile(e.arquivo)} volume={e.volume ?? 0.2} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Versão curta para os Stories: o mesmo vídeo, só o trecho escolhido.
export const Stories: React.FC<Roteiro> = (roteiro) => {
  const { fps } = useVideoConfig();
  const trecho = roteiro.stories ?? { inicio: 0, fim: Math.min(roteiro.duracao, 15) };
  return (
    <Sequence from={-Math.round(trecho.inicio * fps)}>
      <Video {...roteiro} encerramento={false} />
    </Sequence>
  );
};

export const duracaoTotal = (r: Roteiro) => r.duracao + (r.encerramento ? ENCERRAMENTO : 0);
