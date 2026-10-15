import * as Icones from "lucide-react";
import React from "react";
import { AbsoluteFill, Easing, interpolate, useVideoConfig } from "remotion";
import { cores, fontes, rgba, formatoDe, paleta, SUAVE, zonaSegura, type Clima, type Tema } from "../marca";
import type { Sobreposicao } from "../tipos";
import { useTempo } from "./Orador";

const suave = Easing.bezier(...SUAVE);
const entradaSaida = (t: number, inicio: number, fim: number, dur = 0.45) =>
  suave(Math.min(1, Math.max(0, (t - inicio) / dur))) * (1 - suave(Math.min(1, Math.max(0, (t - fim) / dur))));

// Palavra gigante que atravessa o quadro POR TRÁS da Valeria (a silhueta recortada é desenhada por cima).
export const PalavraAtras: React.FC<{
  item: Extract<Sobreposicao, { tipo: "palavraAtras" }>;
  tema: Tema;
  clima: Clima;
  inicioSeq: number;
}> = ({ item, inicioSeq }) => {
  const { width, height } = useVideoConfig();
  const t = useTempo() + inicioSeq;
  const vis = entradaSaida(t, item.inicio, item.fim, 0.5);
  if (vis <= 0) return null;
  const p = interpolate(t, [item.inicio, item.fim + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // cabe inteira na largura em algum momento do deslize
  const tamanho = Math.min(Math.min(width, height) * 0.27, (width * 1.75) / Math.max(4, item.texto.length));
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: height * (formatoDe(width, height) === "horizontal" ? 0.24 : 0.16),
          whiteSpace: "nowrap",
          fontFamily: fontes.destaque,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: tamanho,
          letterSpacing: "-0.01em",
          color: cores.offWhite,
          opacity: vis * 0.94,
          transform: `translateX(${(0.5 - p) * width * 0.22}px)`,
          textShadow: "0 10px 50px rgba(0,0,0,0.35)",
        }}
      >
        {item.texto}
      </div>
    </AbsoluteFill>
  );
};

// Cartão discreto com ícone, flutuando ao lado da Valeria.
const Destaque: React.FC<{ item: Extract<Sobreposicao, { tipo: "destaque" }>; tema: Tema; clima: Clima }> = ({ item }) => {
  const { width, height } = useVideoConfig();
  const t = useTempo();
  const vis = entradaSaida(t, item.inicio, item.fim);
  if (vis <= 0) return null;
  const z = zonaSegura(formatoDe(width, height));
  const Icone = (item.icone && (Icones as unknown as Record<string, React.FC<{ size: number; color: string; strokeWidth: number }>>)[item.icone]) || null;
  const flutua = Math.sin((t - item.inicio) * 1.6) * 8;
  const base = Math.min(width, height);
  const esquerda = item.lado !== "direita";
  // vertical/feed: o rosto ocupa o centro e as laterais são estreitas -> cartão centralizado no peito
  const lateral = formatoDe(width, height) === "horizontal";
  return (
    <div
      style={{
        position: "absolute",
        top: height * (lateral ? 0.24 : 0.47) + flutua,
        ...(lateral
          ? esquerda
            ? { left: z.esquerda + base * 0.02 }
            : { right: z.direita + base * 0.02 }
          : { left: "50%", marginLeft: 0, translate: "-50% 0" }),
        display: "flex",
        alignItems: "center",
        gap: base * 0.026,
        padding: `${base * 0.028}px ${base * 0.04}px`,
        borderRadius: base * 0.03,
        background: "rgba(40, 42, 41, 0.42)",
        border: "1px solid rgba(245, 242, 235, 0.22)",
        backdropFilter: "blur(14px)",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 24}px) scale(${0.96 + 0.04 * vis})`,
        boxShadow: "0 18px 50px rgba(0,0,0,0.25)",
        whiteSpace: "nowrap",
      }}
    >
      {Icone && <Icone size={base * 0.058} color={cores.bege} strokeWidth={1.5} />}
      <span style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.042, color: cores.offWhite, letterSpacing: "-0.01em" }}>
        {item.texto}
      </span>
    </div>
  );
};

// Palavra-chave flutuante: serifada, com ponto e filete em terracota. Surge como se fosse escrita.
// acima da cabeça ou na altura do peito: nunca na altura do rosto
const ALTURAS = [0.15, 0.53, 0.17, 0.55];
const Flutuante: React.FC<{ item: Extract<Sobreposicao, { tipo: "flutuante" }>; indice: number }> = ({ item, indice }) => {
  const { width, height } = useVideoConfig();
  const t = useTempo();
  const dt = t - item.inicio;
  const vis = entradaSaida(t, item.inicio, item.fim, 0.35);
  if (vis <= 0) return null;
  const formato = formatoDe(width, height);
  const z = zonaSegura(formato);
  const base = Math.min(width, height);
  const esquerda = (item.lado ?? (indice % 2 ? "direita" : "esquerda")) === "esquerda";
  const y = item.y ?? ALTURAS[indice % ALTURAS.length];
  const revela = suave(Math.min(1, Math.max(0, dt / 0.55)));
  const deriva = Math.sin(dt * 1.3 + indice) * 6;
  const saiu = 1 - vis;
  return (
    <div
      style={{
        position: "absolute",
        top: height * y + deriva - saiu * 14,
        ...(esquerda ? { left: z.esquerda + base * 0.01 } : { right: z.direita - base * 0.03 }),
        display: "flex",
        flexDirection: esquerda ? "row" : "row-reverse",
        alignItems: "center",
        gap: base * 0.016,
        opacity: vis,
        filter: saiu > 0.01 ? `blur(${saiu * 5}px)` : undefined,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: base * 0.012, height: base * 0.012, borderRadius: "50%", background: cores.terracota, boxShadow: `0 0 10px ${rgba.terracota(0.5)}` }} />
      <div style={{ width: base * 0.05 * revela, height: 1.5, background: cores.terracota, opacity: 0.85 }} />
      <span
        style={{
          fontFamily: fontes.destaque,
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: base * 0.1,
          color: cores.offWhite,
          textShadow: "0 4px 26px rgba(0,0,0,0.7), 0 0 3px rgba(0,0,0,0.45)",
          clipPath: esquerda ? `inset(-20% ${100 - revela * 100}% -20% -5%)` : `inset(-20% -5% -20% ${100 - revela * 100}%)`,
        }}
      >
        {item.texto}
      </span>
    </div>
  );
};

// "Nota do editor": a palavra errada balança como quem diz "não", leva um risco, e a certa entra.
const Correcao: React.FC<{ item: Extract<Sobreposicao, { tipo: "correcao" }> }> = ({ item }) => {
  const { width, height } = useVideoConfig();
  const t = useTempo();
  const vis = entradaSaida(t, item.inicio, item.fim, 0.4);
  if (vis <= 0) return null;
  const base = Math.min(width, height);
  const dt = t - item.inicio;
  const balanca = dt > 0.45 && dt < 1.0 ? Math.sin((dt - 0.45) * Math.PI * 7) * (1 - (dt - 0.45) / 0.55) * 7 : 0;
  const risco = suave(Math.min(1, Math.max(0, (dt - 1.0) / 0.35)));
  const certo = suave(Math.min(1, Math.max(0, (dt - 1.35) / 0.45)));
  const check = suave(Math.min(1, Math.max(0, (dt - 1.75) / 0.3)));
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: height * 0.435,
        translate: "-50% 0",
        padding: `${base * 0.035}px ${base * 0.06}px`,
        borderRadius: base * 0.035,
        background: "rgba(40, 42, 41, 0.5)",
        border: "1px solid rgba(245, 242, 235, 0.22)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
        textAlign: "center",
        whiteSpace: "nowrap",
        opacity: vis,
        transform: `translateY(${(1 - vis) * 20}px)`,
      }}
    >
      <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.022, letterSpacing: "0.3em", color: cores.terracota, marginBottom: base * 0.018 }}>
        {(item.nota ?? "nota do editor").toUpperCase()}
      </div>
      <div style={{ position: "relative", display: "inline-block", fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.048, color: cores.bege, opacity: 1 - 0.45 * risco, transform: `rotate(${balanca}deg)` }}>
        {item.errado}
        <div style={{ position: "absolute", left: "-4%", top: "50%", width: `${108 * risco}%`, height: 5, background: cores.terracota, transform: "rotate(-4deg)", borderRadius: 3, boxShadow: "0 0 8px rgba(199, 217, 78,0.6)" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: base * 0.02, marginTop: base * 0.012, opacity: certo, transform: `translateY(${(1 - certo) * 14}px)` }}>
        <span style={{ fontFamily: fontes.destaque, fontStyle: "italic", fontWeight: 600, fontSize: base * 0.085, color: cores.offWhite }}>{item.certo}</span>
        <Icones.Check size={base * 0.05} color={cores.terracota} strokeWidth={2.2} style={{ opacity: check, transform: `scale(${0.6 + 0.4 * check})` }} />
      </div>
    </div>
  );
};

// Número que conta até o valor. SÓ com números ditos ou enviados pela Valeria.
const Numero: React.FC<{ item: Extract<Sobreposicao, { tipo: "numero" }>; tema: Tema; clima: Clima }> = ({ item, tema, clima }) => {
  const { width, height } = useVideoConfig();
  const t = useTempo();
  const vis = entradaSaida(t, item.inicio, item.fim);
  if (vis <= 0) return null;
  const c = paleta(tema, clima);
  const conta = suave(Math.min(1, Math.max(0, (t - item.inicio) / 1.1)));
  const valor = Math.round(item.valor * conta).toLocaleString("pt-BR");
  const base = Math.min(width, height);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: height * 0.26, textAlign: "center", opacity: vis, transform: `translateY(${(1 - vis) * 20}px)` }}>
        <div style={{ fontFamily: fontes.destaque, fontWeight: 600, fontSize: base * 0.2, color: cores.offWhite, lineHeight: 1, textShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
          {item.prefixo}
          {valor}
          {item.sufixo}
        </div>
        {item.rotulo && (
          <div style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: base * 0.028, letterSpacing: "0.3em", textTransform: "uppercase", color: c.detalhe === cores.terracota ? cores.bege : c.detalhe, marginTop: base * 0.02 }}>
            {item.rotulo}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// Sobreposições que ficam por cima de tudo (as "palavraAtras" são desenhadas dentro da cena de rosto).
export const Sobreposicoes: React.FC<{ itens: Sobreposicao[]; tema: Tema; clima: Clima }> = ({ itens, tema, clima }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {itens.map((item, i) =>
      item.tipo === "destaque" ? (
        <Destaque key={i} item={item} tema={tema} clima={clima} />
      ) : item.tipo === "flutuante" ? (
        <Flutuante key={i} item={item} indice={itens.slice(0, i).filter((x) => x.tipo === "flutuante").length} />
      ) : item.tipo === "correcao" ? (
        <Correcao key={i} item={item} />
      ) : item.tipo === "numero" ? (
        <Numero key={i} item={item} tema={tema} clima={clima} />
      ) : null,
    )}
  </AbsoluteFill>
);
