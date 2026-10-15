import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SUAVE } from "../marca";
import type { Orador as OradorT, Zoom } from "../tipos";

const suave = Easing.bezier(...SUAVE);

// Escala da câmera num instante: deriva lenta + aproximações nas frases fortes.
export const escalaNoTempo = (t: number, inicio: number, fim: number, zooms: Zoom[] = []) => {
  const deriva = interpolate(t, [inicio, fim], [1.0, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let extra = 0;
  for (const z of zooms) {
    const ate = z.ate ?? z.em + 2.5;
    const entra = suave(Math.min(1, Math.max(0, (t - z.em) / 0.45)));
    const sai = suave(Math.min(1, Math.max(0, (t - ate) / 0.6)));
    extra = Math.max(extra, (z.escala - 1) * entra * (1 - sai));
  }
  return deriva + extra;
};

// Desenha a Valeria (vídeo gravado ou foto). "camada" = "fundo" (quadro inteiro) ou "frente"
// (só a silhueta recortada, desenhada por cima das animações que passam atrás dela).
export const Orador: React.FC<{
  orador: OradorT;
  camada: "fundo" | "frente";
  inicioCena: number; // segundos (linha do tempo global) em que a cena começou
  escala: number;
  enquadramento?: React.CSSProperties;
}> = ({ orador, camada, inicioCena, escala, enquadramento }) => {
  const { fps } = useVideoConfig();
  const foco = orador.foco ?? "50% 30%";
  const estilo: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: foco,
    transform: `scale(${escala * (orador.escalaBase ?? 1)})`,
    transformOrigin: foco,
  };
  const video = camada === "fundo" ? orador.video : orador.frente;
  const foto = camada === "fundo" ? orador.foto : orador.fotoFrente;

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...enquadramento }}>
      {video ? (
        <OffthreadVideo
          src={staticFile(video)}
          muted
          transparent={camada === "frente"}
          trimBefore={Math.round(inicioCena * fps)}
          style={estilo}
        />
      ) : foto ? (
        <Img src={staticFile(foto)} style={estilo} />
      ) : null}
    </AbsoluteFill>
  );
};

export const useTempo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
