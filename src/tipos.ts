import type { Clima, Tema } from "./marca";

// Todos os tempos em segundos, na linha do tempo JÁ CORTADA (saída de scripts/preparar.py).

export type Palavra = {
  palavra: string;
  inicio: number;
  fim: number;
  destaque?: boolean; // aparece em letra serifada, um pouco mais brilhante
};

// Como a Valeria aparece: vídeo gravado ou, sem vídeo, uma foto com movimento lento.
export type Orador = {
  video?: string; // projetos/<nome>/fala.mp4
  frente?: string; // projetos/<nome>/frente.webm (recorte, para animações passarem atrás)
  foto?: string; // valeria/fotos/foto-1.jpg
  fotoFrente?: string; // valeria/fotos/foto-1-recorte.png
  foco?: string; // CSS object-position do rosto, ex. "50% 30%"
  escalaBase?: number; // enquadramento: >1 aproxima (gravação aberta, corpo inteiro: ~1.3–1.6)
};

// Aproxima no rosto em "em" e volta em "ate" (padrão: 2,5 s depois). Escala típica: 1.12 a 1.2.
export type Zoom = { em: number; escala: number; ate?: number };

// legenda: posição da legenda nesta cena (fração da altura) ou "esconder" (quando a animação já mostra a fala)
// tema/clima: troca o tema só nesta cena (para revezar claro e escuro no mesmo vídeo)
// transicao: como esta cena entra (padrão "suave"; artísticas em pontos estratégicos)
export type Transicao = "suave" | "luz" | "cortina" | "circulo" | "linha";
type Legendavel = { legenda?: number | "esconder"; tema?: Tema; clima?: Clima; transicao?: Transicao };

export type Cena = Legendavel &
  (
  | { tipo: "rosto"; inicio: number; fim: number; orador?: Orador; zooms?: Zoom[] }
  | {
      tipo: "dividida";
      inicio: number;
      fim: number;
      midia?: string; // imagem ou vídeo de apoio
      animacao?: string; // nome em src/animacoes
      palavras?: string[]; // textos usados pela animação (só o que a Valeria disse)
      tempos?: number[]; // momentos (s, linha do tempo global) que a animação acompanha
      orador?: Orador;
    }
  | { tipo: "telaCheia"; inicio: number; fim: number; midia?: string; animacao?: string; palavras?: string[]; tempos?: number[]; titulo?: string }
  | { tipo: "textoGrande"; inicio: number; fim: number; texto: string; rotulo?: string }
  );

export type Sobreposicao =
  | { tipo: "palavraAtras"; inicio: number; fim: number; texto: string }
  | { tipo: "destaque"; inicio: number; fim: number; texto: string; icone?: string; lado?: "esquerda" | "direita" }
  // Palavra-chave flutuando ao lado da Valeria (y = fração da altura; padrão alterna lados e alturas)
  | { tipo: "flutuante"; inicio: number; fim: number; texto: string; lado?: "esquerda" | "direita"; y?: number }
  // Corrige com leveza algo que a Valeria falou errado (a legenda mantém o que ela disse).
  | { tipo: "correcao"; inicio: number; fim: number; errado: string; certo: string; nota?: string }
  // Só com números que a Valeria disse ou enviou. Nunca inventar.
  | { tipo: "numero"; inicio: number; fim: number; valor: number; prefixo?: string; sufixo?: string; rotulo?: string }
  // Linha curva que liga dois pontos (ex.: duas palavras flutuantes). de/para = [x, y] em fração do quadro.
  // Ponta de uma flutuante: esquerda ≈ [0.075, y]; direita ≈ [0.89, y]. curva > 0 arqueia para cima.
  | { tipo: "ligacao"; inicio: number; fim: number; de: [number, number]; para: [number, number]; curva?: number; controle?: [number, number] };
  // NUNCA deixe a linha cruzar o rosto: de cima (0.15) para o peito (0.55) use controle ≈ [1.0, 0.1] (contorna pela direita)

export type Musica = { arquivo: string; inicio: number; fim: number; volume?: number };
export type Efeito = { arquivo: string; em: number; volume?: number };

export type Roteiro = {
  titulo: string;
  tema: Tema;
  clima: Clima;
  fala: string; // áudio da fala já tratado (fala.wav ou fala.mp4)
  duracao: number; // da fala cortada
  orador: Orador;
  palavras: Palavra[];
  cenas: Cena[];
  sobreposicoes: Sobreposicao[];
  musicas: Musica[];
  efeitos: Efeito[];
  encerramento: boolean;
  efeitosAutomaticos?: boolean; // sons nas transições e palavras (padrão: sem)
  stories?: { inicio: number; fim: number }; // trecho da versão curta
  capa?: { foto: string; titulo: string; subtitulo?: string; foco?: string };
  carrossel?: { titulo: string; texto?: string }[];
};
