import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { ANIMACOES } from "../animacoes";
import { AreaAnimacao } from "../animacoes/area";
import { cores, fontes, formatoDe, paleta, SUAVE, type Clima, type Tema } from "../marca";
import type { Cena, Orador as OradorT, Sobreposicao } from "../tipos";
import { escalaNoTempo, Orador, useTempo } from "./Orador";
import { PalavraAtras } from "./Sobreposicoes";

const suave = Easing.bezier(...SUAVE);
const ehVideo = (arq: string) => /\.(mp4|mov|webm|m4v)$/i.test(arq);

type Comum = { tema: Tema; clima: Clima; inicioSeq: number; oradorPadrao: OradorT };

// Imagem ou vídeo de apoio, com movimento lento de câmera (estilo documentário).
export const Midia: React.FC<{ arquivo: string; inicio: number; fim: number; inicioSeq: number }> = ({
  arquivo,
  inicio,
  fim,
  inicioSeq,
}) => {
  const t = useTempo() + inicioSeq;
  const p = interpolate(t, [inicio, fim], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const estilo: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `scale(${1.04 + 0.08 * p}) translateX(${(p - 0.5) * -2}%)`,
  };
  return ehVideo(arquivo) ? (
    <OffthreadVideo src={staticFile(arquivo)} muted style={estilo} />
  ) : (
    <Img src={staticFile(arquivo)} style={estilo} />
  );
};

const Ilustracao: React.FC<{
  cena: { midia?: string; animacao?: string; palavras?: string[]; tempos?: number[]; inicio: number; fim: number };
  tema: Tema;
  clima: Clima;
  inicioSeq: number;
}> = ({ cena, tema, clima, inicioSeq }) => {
  if (cena.animacao && ANIMACOES[cena.animacao]) {
    const Anim = ANIMACOES[cena.animacao];
    return <Anim tema={tema} clima={clima} duracao={cena.fim - cena.inicio} palavras={cena.palavras} tempos={cena.tempos} t0={inicioSeq} />;
  }
  if (cena.midia) return <Midia arquivo={cena.midia} inicio={cena.inicio} fim={cena.fim} inicioSeq={inicioSeq} />;
  return <AbsoluteFill style={{ background: paleta(tema, clima).fundo }} />;
};

export const CenaRosto: React.FC<
  Comum & { cena: Extract<Cena, { tipo: "rosto" }>; atras: Extract<Sobreposicao, { tipo: "palavraAtras" }>[] }
> = ({ cena, atras, inicioSeq, oradorPadrao, tema, clima }) => {
  const t = useTempo() + inicioSeq;
  const orador = { ...oradorPadrao, ...cena.orador };
  const escala = escalaNoTempo(t, cena.inicio, cena.fim, cena.zooms);
  const algoAtras = atras.some((a) => t >= a.inicio - 0.1 && t <= a.fim + 0.6);
  return (
    <AbsoluteFill style={{ background: paleta(tema, clima).fundo }}>
      <Orador orador={orador} camada="fundo" inicioCena={inicioSeq} escala={escala} />
      {atras.map((a, i) => (
        <PalavraAtras key={i} item={a} tema={tema} clima={clima} inicioSeq={inicioSeq} />
      ))}
      {algoAtras && <Orador orador={orador} camada="frente" inicioCena={inicioSeq} escala={escala} />}
      {/* leve vinheta para a legenda respirar */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 25%, transparent 50%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

export const CenaDividida: React.FC<Comum & { cena: Extract<Cena, { tipo: "dividida" }> }> = ({
  cena,
  inicioSeq,
  oradorPadrao,
  tema,
  clima,
}) => {
  const { width, height } = useVideoConfig();
  const horizontal = formatoDe(width, height) === "horizontal";
  const t = useTempo() + inicioSeq;
  const orador = { ...oradorPadrao, ...cena.orador };
  const abre = suave(Math.min(1, Math.max(0, (t - cena.inicio) / 0.5)));
  // ilustração 40% / pessoa 60%
  const ILUS = 0.4;
  const parte = (frac: number): React.CSSProperties =>
    horizontal
      ? { width: `${frac * 100}%`, height: "100%", position: "absolute", top: 0 }
      : { width: "100%", height: `${frac * 100}%`, position: "absolute", left: 0 };
  return (
    <AbsoluteFill style={{ background: paleta(tema, clima).fundo }}>
      <div style={{ ...parte(ILUS), ...(horizontal ? { left: 0 } : { top: 0 }), overflow: "hidden" }}>
        <AreaAnimacao width={horizontal ? width * ILUS : width} height={horizontal ? height : height * ILUS}>
          <Ilustracao cena={cena} tema={tema} clima={clima} inicioSeq={inicioSeq} />
        </AreaAnimacao>
      </div>
      <div style={{ ...parte(1 - ILUS), ...(horizontal ? { right: 0 } : { bottom: 0 }), overflow: "hidden" }}>
        <Orador orador={orador} camada="fundo" inicioCena={inicioSeq} escala={1.02 + 0.03 * abre} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 30%)" }} />
      </div>
      {/* fio fino de madeira separando as metades */}
      <div
        style={{
          position: "absolute",
          background: cores.terracota,
          opacity: 0.85,
          ...(horizontal
            ? { left: `${ILUS * 100}%`, top: 0, width: 2, height: `${abre * 100}%` }
            : { top: `${ILUS * 100}%`, left: `${50 - abre * 50}%`, height: 2, width: `${abre * 100}%` }),
        }}
      />
    </AbsoluteFill>
  );
};

export const CenaTelaCheia: React.FC<Comum & { cena: Extract<Cena, { tipo: "telaCheia" }> }> = ({
  cena,
  inicioSeq,
  tema,
  clima,
}) => {
  const { height } = useVideoConfig();
  const t = useTempo() + inicioSeq;
  const c = paleta(tema, clima);
  const surge = suave(Math.min(1, Math.max(0, (t - cena.inicio - 0.3) / 0.6)));
  return (
    <AbsoluteFill style={{ background: c.fundo }}>
      <Ilustracao cena={cena} tema={tema} clima={clima} inicioSeq={inicioSeq} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
      {cena.titulo && (
        <div
          style={{
            position: "absolute",
            top: height * 0.17,
            width: "100%",
            textAlign: "center",
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: height * 0.017,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: cores.offWhite,
            opacity: surge * 0.9,
          }}
        >
          {cena.titulo}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const CenaTextoGrande: React.FC<Comum & { cena: Extract<Cena, { tipo: "textoGrande" }> }> = ({
  cena,
  inicioSeq,
  tema,
  clima,
}) => {
  const { width, height } = useVideoConfig();
  const t = useTempo() + inicioSeq;
  const c = paleta(tema, clima);
  const linhas = cena.texto.split("\n");
  const base = Math.min(width, height);
  return (
    <AbsoluteFill style={{ background: c.fundo, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${c.cartao} 0%, transparent 70%)` }} />
      <div style={{ width: "80%", textAlign: "center" }}>
        {cena.rotulo && (
          <div
            style={{
              fontFamily: fontes.texto,
              fontWeight: 600,
              fontSize: base * 0.026,
              letterSpacing: "0.34em",
              textTransform: "uppercase",
              color: c.detalhe,
              marginBottom: base * 0.05,
              opacity: suave(Math.min(1, Math.max(0, (t - cena.inicio) / 0.5))),
            }}
          >
            {cena.rotulo}
          </div>
        )}
        {linhas.map((linha, i) => {
          const surge = suave(Math.min(1, Math.max(0, (t - cena.inicio - 0.15 - i * 0.35) / 0.55)));
          return (
            <div
              key={i}
              style={{
                fontFamily: fontes.destaque,
                fontWeight: 600,
                fontStyle: i % 2 ? "italic" : "normal",
                fontSize: base * 0.105,
                lineHeight: 1.08,
                color: c.texto,
                opacity: surge,
                transform: `translateY(${(1 - surge) * 26}px)`,
                filter: `blur(${(1 - surge) * 6}px)`,
              }}
            >
              {linha}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
