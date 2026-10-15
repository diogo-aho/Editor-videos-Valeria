import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import "./fontes";
import { ARROBA, cores, fontes, NOME, paleta, zonaSegura, formatoDe } from "./marca";
import type { Roteiro } from "./tipos";

// Capa: a foto que a Valeria escolher + os textos por cima.
export const Capa: React.FC<Roteiro> = ({ capa, clima }) => {
  const { width, height } = useVideoConfig();
  const z = zonaSegura(formatoDe(width, height));
  const base = Math.min(width, height);
  if (!capa) return <AbsoluteFill style={{ background: paleta("escuro", clima).fundo }} />;
  return (
    <AbsoluteFill style={{ background: cores.azulProfundo }}>
      <Img src={staticFile(capa.foto)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: capa.foco ?? "50% 30%" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 35%, rgba(30, 32, 31,0.82) 78%, rgba(30, 32, 31,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: z.esquerda + 20, right: z.direita + 20, bottom: z.base + 10 }}>
        <div style={{ fontFamily: fontes.destaque, fontWeight: 600, fontSize: base * 0.11, lineHeight: 1.02, color: cores.offWhite, whiteSpace: "pre-line" }}>
          {capa.titulo}
        </div>
        {capa.subtitulo && (
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: base * 0.036, color: cores.bege, marginTop: base * 0.03, lineHeight: 1.35 }}>
            {capa.subtitulo}
          </div>
        )}
        <div style={{ width: base * 0.12, height: 2, background: cores.terracota, marginTop: base * 0.045 }} />
      </div>
    </AbsoluteFill>
  );
};

// Carrossel 4:5 com os pontos principais do vídeo. Uma página por imagem (prop "pagina").
export const Carrossel: React.FC<Roteiro & { pagina: number }> = ({ carrossel = [], tema, clima, pagina }) => {
  const { width, height } = useVideoConfig();
  const c = paleta(tema, clima);
  const item = carrossel[pagina] ?? { titulo: "" };
  const base = Math.min(width, height);
  return (
    <AbsoluteFill style={{ background: c.fundo, padding: base * 0.1, justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: base * 0.07, height: 2, background: c.detalhe }} />
        <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.024, letterSpacing: "0.25em", color: c.textoSuave }}>
          {String(pagina + 1).padStart(2, "0")} / {String(carrossel.length).padStart(2, "0")}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: fontes.destaque, fontWeight: 600, fontSize: base * 0.095, lineHeight: 1.05, color: c.texto, whiteSpace: "pre-line" }}>
          {item.titulo}
        </div>
        {item.texto && (
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: base * 0.036, lineHeight: 1.5, color: c.textoSuave, marginTop: base * 0.045, whiteSpace: "pre-line" }}>
            {item.texto}
          </div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: fontes.destaque, fontWeight: 600, fontSize: base * 0.04, color: c.texto }}>{NOME}</div>
          <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: base * 0.022, letterSpacing: "0.22em", color: c.detalhe, marginTop: 6 }}>
            {ARROBA.toUpperCase()}
          </div>
        </div>
        <div style={{ width: base * 0.12, height: 2, background: c.detalhe }} />
      </div>
    </AbsoluteFill>
  );
};
