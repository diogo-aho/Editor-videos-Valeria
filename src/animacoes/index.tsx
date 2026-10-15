import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { useArea } from "./area";
import { fontes, paleta, SUAVE, type Clima, type Tema } from "../marca";
import { Aroma, Escrita, Filme, Grafirmaliza, PortasSensoriais, Vinil } from "./eixoz";
import { Chama, Eixos, Infinito, Perguntas, Problemas } from "./valeria";
import { Camadas, Escada, Escolha, ExternoInterno, Fases, Montanha, MuitoMais, Obstaculos, Ranking } from "./proposito";

// Animações feitas sob medida. Cada vídeo pode ganhar novas: crie aqui e registre em ANIMACOES.
// Regra: nada de número ou dado inventado. Só o que a Valeria disse ou enviou.

// t0 = segundo (linha do tempo global) do primeiro quadro da animação; tempos = momentos globais da fala.
export type PropsAnimacao = { tema: Tema; clima: Clima; duracao: number; palavras?: string[]; tempos?: number[]; t0?: number };

const suave = Easing.bezier(...SUAVE);

// Onda sonora elegante que vira texto: ilustra "gravação → transcrição".
const Transcricao: React.FC<PropsAnimacao> = ({ tema, clima, palavras = [] }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useArea();
  const t = frame / fps;
  const c = paleta(tema, clima);
  const barras = 46;
  const transforma = suave(Math.min(1, Math.max(0, (t - 1.4) / 0.9)));
  const larguraBarra = (width * 0.62) / barras;

  return (
    <AbsoluteFill style={{ background: c.fundo, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 55%, ${c.cartao} 0%, transparent 65%)`,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: larguraBarra * 0.45, height: height * 0.3 }}>
        {Array.from({ length: barras }).map((_, i) => {
          const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37 + t * 5.2) * Math.cos(i * 0.11 - t * 2.1));
          const ruido = 0.3 + 0.7 * random(`b${i}-${Math.floor(t * 12)}`);
          const altura = (base * 0.7 + ruido * 0.3) * height * 0.22 * (1 - transforma * 0.92);
          const centro = 1 - Math.abs(i - barras / 2) / (barras / 2);
          return (
            <div
              key={i}
              style={{
                width: larguraBarra * 0.55,
                height: Math.max(3, altura * (0.35 + 0.65 * centro)),
                borderRadius: 99,
                background: i % 7 === 3 ? c.detalhe : c.textoSuave,
                opacity: 0.85,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "10%",
          right: "10%",
          transform: "translateY(-50%)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 22px",
        }}
      >
        {palavras.map((p, i) => {
          const surge = suave(Math.min(1, Math.max(0, (t - 1.7 - i * 0.22) / 0.4)));
          return (
            <span
              key={i}
              style={{
                fontFamily: i % 2 ? fontes.animacao : fontes.animacao,
                fontStyle: i % 2 ? "italic" : "normal",
                fontWeight: 600,
                fontSize: (i % 2 ? 1.25 : 1) * height * 0.06,
                color: c.texto,
                opacity: surge,
                transform: `translateY(${(1 - surge) * 18}px)`,
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: height * 0.3,
          width: interpolate(t, [0.2, 1.4], [0, width * 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: suave }),
          height: 2,
          background: c.detalhe,
          opacity: 0.7,
        }}
      />
    </AbsoluteFill>
  );
};

export const ANIMACOES: Record<string, React.FC<PropsAnimacao>> = {
  transcricao: Transcricao,
  grafirmaliza: Grafirmaliza,
  filme: Filme,
  portasSensoriais: PortasSensoriais,
  vinil: Vinil,
  escrita: Escrita,
  aroma: Aroma,
  eixos: Eixos,
  infinito: Infinito,
  problemas: Problemas,
  chama: Chama,
  perguntas: Perguntas,
  ranking: Ranking,
  montanha: Montanha,
  fases: Fases,
  escada: Escada,
  externoInterno: ExternoInterno,
  camadas: Camadas,
  muitoMais: MuitoMais,
  escolha: Escolha,
  obstaculos: Obstaculos,
};
