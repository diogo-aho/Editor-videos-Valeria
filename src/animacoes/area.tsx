import React from "react";
import { useVideoConfig } from "remotion";

// Tamanho real do espaço da animação (na tela dividida é só a metade do quadro).
const Area = React.createContext<{ width: number; height: number } | null>(null);

export const AreaAnimacao: React.FC<{ width: number; height: number; children: React.ReactNode }> = ({ width, height, children }) => (
  <Area.Provider value={{ width, height }}>{children}</Area.Provider>
);

export const useArea = () => {
  const video = useVideoConfig();
  const area = React.useContext(Area);
  return { fps: video.fps, width: area?.width ?? video.width, height: area?.height ?? video.height };
};
