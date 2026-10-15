import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fontes, formatoDe, SUAVE } from "../marca";
import type { Palavra } from "../tipos";

// Legenda clássica da Valeria:
// - uma linha só, de 2-3 palavras; quando a próxima surge, a anterior sai (sem segunda linha);
// - letra branca; palavras de destaque em serifada, um pouco mais brilhantes (sem acender demais).

type Linha = { palavras: Palavra[]; inicio: number; fim: number };

const PONTUACAO_FINAL = /[.,!?;:…]$/;

export const montarLinhas = (palavras: Palavra[]): Linha[] => {
  const linhas: Linha[] = [];
  let atual: Palavra[] = [];
  const fechar = () => {
    if (atual.length) {
      linhas.push({ palavras: atual, inicio: atual[0].inicio, fim: atual[atual.length - 1].fim });
    }
    atual = [];
  };
  palavras.forEach((p, i) => {
    const anterior = palavras[i - 1];
    if (anterior && p.inicio - anterior.fim > 0.5) fechar();
    atual.push(p);
    const letras = atual.map((x) => x.palavra).join(" ").length;
    const proxima = palavras[i + 1];
    const proximaCabe = proxima && letras + proxima.palavra.length + 1 <= 20;
    if (atual.length >= 3 || PONTUACAO_FINAL.test(p.palavra) || (atual.length >= 2 && !proximaCabe) || letras > 20) {
      fechar();
    }
  });
  fechar();
  return linhas;
};

const PALAVRA_SOLTA = /^([«"“(]*)(.*?)([.,!?;:…»"”)]*)$/;

const TextoLinha: React.FC<{ linha: Linha; tamanho: number }> = ({ linha, tamanho }) => (
  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: tamanho * 0.28 }}>
    {linha.palavras.map((p, i) => {
      const [, abre, nucleo, fecha] = p.palavra.match(PALAVRA_SOLTA) ?? ["", "", p.palavra, ""];
      // vírgula e ponto no fim da linha não aparecem: a quebra de linha já faz a pausa
      const fim = i === linha.palavras.length - 1 ? fecha.replace(/[.,;:]+/g, "") : fecha;
      return p.destaque ? (
        <span
          key={i}
          style={{
            fontFamily: fontes.destaque,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: tamanho * 1.32,
            color: "#FFFFFF",
            letterSpacing: "0.005em",
            textShadow: "0 0 18px rgba(255,255,255,0.38), 0 2px 14px rgba(0,0,0,0.45)",
          }}
        >
          {abre}
          {nucleo}
          {fim}
        </span>
      ) : (
        <span
          key={i}
          style={{
            fontFamily: fontes.texto,
            fontWeight: 600,
            fontSize: tamanho,
            color: "rgba(255,255,255,0.93)",
            letterSpacing: "-0.01em",
            textShadow: "0 2px 14px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.25)",
          }}
        >
          {abre}
          {nucleo}
          {fim}
        </span>
      );
    })}
  </div>
);

export const Legenda: React.FC<{
  palavras: Palavra[];
  posicaoY: (segundos: number) => number | null; // centro da legenda (fração da altura) ou null = escondida
}> = ({ palavras, posicaoY }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const formato = formatoDe(width, height);
  const tamanho = formato === "horizontal" ? 58 : formato === "feed" ? 64 : 74;
  const alturaLinha = tamanho * 1.75;
  const linhas = React.useMemo(() => montarLinhas(palavras), [palavras]);
  const y = posicaoY(t);
  if (y === null) return null;
  const ENTRA = 0.22; // segundos da animação de entrada
  const SEGURA = 0.9; // quanto tempo a linha fica após a última palavra, se nada vier depois

  const atual = linhas.findLastIndex((l) => l.inicio <= t + 0.02);
  if (atual < 0) return null;
  // uma linha só: a anterior sai rápido (sobe um pouco e some) enquanto a nova entra
  const visiveis = [atual - 1, atual].filter((i) => i >= 0);
  const progresso = (desde: number | undefined) =>
    desde === undefined ? 0 : Easing.bezier(...SUAVE)(Math.min(1, Math.max(0, (t - desde) / ENTRA)));

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {visiveis.map((i) => {
        const linha = linhas[i];
        const proxima = linhas[i + 1];
        const entrada = progresso(linha.inicio);
        const sai = proxima ? Easing.bezier(...SUAVE)(Math.min(1, Math.max(0, (t - proxima.inicio) / 0.14))) : 0;
        // se a fala pausa (nada vem logo depois), a linha se apaga sozinha
        const pausaLonga = !proxima || proxima.inicio - linha.fim > SEGURA;
        const apaga = pausaLonga
          ? interpolate(t, [linha.fim + SEGURA, linha.fim + SEGURA + 0.25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 1;
        const opacidade = entrada * apaga * (1 - sai);
        const deslocamento = (1 - entrada) * 18 - sai * 26;
        if (opacidade <= 0.001) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * 0.08,
              right: width * 0.08,
              top: y * height - alturaLinha / 2,
              height: alturaLinha,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: opacidade,
              transform: `translateY(${deslocamento}px)`,
            }}
          >
            <TextoLinha linha={linha} tamanho={tamanho} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
