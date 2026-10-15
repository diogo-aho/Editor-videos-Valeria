// Identidade visual da Valéria Carinhato (@valeriacarinhato).
// Empresária, headhunter e mentora de líderes. Elegância serena: confiança, acolhimento e autoridade.

// Paleta oficial (2026-10-15). Os azuis e os neutros dominam; a TERRACOTA só marca:
// filetes, ícones, palavras-chave, numeração, pontos de conexão. O cacau é o apoio quente.
// Evitar: fundos grandes em terracota, muitos destaques ao mesmo tempo.
export const cores = {
  azulPrincipal: "#2C3B4D", // fundos escuros, blocos, autoridade
  azulProfundo: "#1B2632", // textos e títulos, capas, contraste máximo
  offWhite: "#EEE9DF", // base clara: respiro, luz, texto sobre azul
  bege: "#C9C1B1", // Bege Oatmeal — neutro secundário: fundos de apoio, divisórias, texto suave
  terracota: "#C47C67", // Terracota Rosado — destaque: só para marcar
  cacau: "#995748", // Marrom Cacau — apoio quente: detalhes, blocos de apoio, textura
} as const;

// rgba das cores, para brilhos e transparências
export const rgba = {
  azulPrincipal: (a: number) => `rgba(44, 59, 77, ${a})`,
  azulProfundo: (a: number) => `rgba(27, 38, 50, ${a})`,
  offWhite: (a: number) => `rgba(238, 233, 223, ${a})`,
  bege: (a: number) => `rgba(201, 193, 177, ${a})`,
  terracota: (a: number) => `rgba(196, 124, 103, ${a})`,
  cacau: (a: number) => `rgba(153, 87, 72, ${a})`,
};

export type Tema = "escuro" | "claro";
// quente = cacau/bege como apoio; neutro = azuis e off white puros
export type Clima = "quente" | "neutro";

// Combinações de fundo e texto:
//  escuro: fundo azul principal + texto off white + detalhes terracota
//  claro neutro: fundo off white + texto azul profundo + detalhe terracota
//  claro quente: fundo bege oatmeal + texto azul profundo + cacau de apoio
export const paleta = (tema: Tema, clima: Clima) => {
  if (tema === "escuro") {
    return {
      fundo: cores.azulPrincipal,
      brilho: clima === "quente" ? rgba.cacau(0.3) : rgba.bege(0.12),
      texto: cores.offWhite,
      textoSuave: cores.bege,
      apoio: cores.cacau,
      detalhe: cores.terracota,
      cartao: rgba.offWhite(0.08),
    };
  }
  return {
    fundo: clima === "quente" ? cores.bege : cores.offWhite,
    brilho: clima === "quente" ? rgba.offWhite(0.5) : rgba.bege(0.6),
    texto: cores.azulProfundo,
    textoSuave: cores.cacau,
    apoio: cores.cacau,
    detalhe: cores.terracota,
    cartao: rgba.azulProfundo(0.06),
  };
};

export const fontes = {
  texto: "Manrope",
  destaque: "Cormorant Garamond",
};

// Movimento: suave e elegante. Nunca tremido, nunca elástico.
export const SUAVE = [0.33, 0, 0.15, 1] as const; // Easing.bezier

export type Formato = "vertical" | "horizontal" | "feed";

export const formatoDe = (largura: number, altura: number): Formato =>
  largura > altura ? "horizontal" : altura / largura > 1.5 ? "vertical" : "feed";

// Áreas onde as redes colocam botões, nome e legenda do post.
// Nada importante pode ficar aí. Valores em pixels do quadro final.
export const zonaSegura = (formato: Formato) => {
  switch (formato) {
    case "vertical": // Reels / TikTok / Shorts / Stories (1080x1920)
      return { topo: 230, base: 420, esquerda: 70, direita: 150 };
    case "feed": // 1080x1350
      return { topo: 70, base: 110, esquerda: 70, direita: 70 };
    case "horizontal": // YouTube (1920x1080): barra de progresso e botões embaixo
      return { topo: 60, base: 140, esquerda: 90, direita: 90 };
  }
};

export const ARROBA = "@valeriacarinhato";
export const NOME = "Valéria Carinhato";
