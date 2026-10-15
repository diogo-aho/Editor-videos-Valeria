import React from "react";
import { Composition, Still, type CalculateMetadataFunction } from "remotion";
import roteiroDemo from "../public/projetos/demo/roteiro.json";
import { Capa, Carrossel } from "./Estaticos";
import type { Roteiro } from "./tipos";
import { duracaoTotal, Stories, Video } from "./Video";

// Cada vídeo tem um roteiro em public/projetos/<nome>/roteiro.json.
// Renderizar: npx remotion render src/index.ts Reels out/<nome>-reels.mp4 --props=public/projetos/<nome>/roteiro.json
const padrao = roteiroDemo as unknown as Roteiro;
const FPS = 30;

const metadados: CalculateMetadataFunction<Roteiro> = ({ props }) => ({
  durationInFrames: Math.ceil(duracaoTotal(props) * FPS),
});
const metadadosStories: CalculateMetadataFunction<Roteiro> = ({ props }) => {
  const s = props.stories ?? { inicio: 0, fim: Math.min(props.duracao, 15) };
  return { durationInFrames: Math.ceil((s.fim - s.inicio) * FPS) };
};

export const RemotionRoot: React.FC = () => (
  <>
    {/* Principal: Reels / TikTok / Shorts */}
    <Composition id="Reels" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={1} defaultProps={padrao} calculateMetadata={metadados} />
    <Composition id="YouTube" component={Video} width={1920} height={1080} fps={FPS} durationInFrames={1} defaultProps={padrao} calculateMetadata={metadados} />
    <Composition id="Feed" component={Video} width={1080} height={1350} fps={FPS} durationInFrames={1} defaultProps={padrao} calculateMetadata={metadados} />
    <Composition id="Stories" component={Stories} width={1080} height={1920} fps={FPS} durationInFrames={1} defaultProps={padrao} calculateMetadata={metadadosStories} />
    <Still id="Capa" component={Capa} width={1080} height={1920} defaultProps={padrao} />
    <Still id="CapaYouTube" component={Capa} width={1920} height={1080} defaultProps={padrao} />
    <Still id="Carrossel" component={Carrossel} width={1080} height={1350} defaultProps={{ ...padrao, pagina: 0 }} />
  </>
);
