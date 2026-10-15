# Editor de vídeos da Valeria Carinhato (@valeriacarinhato)

Editor de vídeos com IA em Remotion (React que vira vídeo). A Valeria grava; o Claude edita
seguindo o formato abaixo. **Fale sempre em português, de forma simples.**
O Diogo Carvalho (marido dela, @diogo.aho) também pode mandar material e pedidos em nome dela.
Este editor foi criado a partir do editor do Diogo (`Editor-de-v-deos_modelo-01`): mesmo formato,
**paleta e identidade da Valeria**.

Para editar um vídeo, siga a skill **`editar-video`** (`.claude/skills/editar-video/SKILL.md`).

## Regras que valem sempre

1. **A gravação é final.** Nunca peça para regravar. Corte os silêncios longos e nivele o volume (`scripts/preparar.py`).
2. **Nada importante onde a rede coloca os botões.** Respeite `zonaSegura()` em `src/marca.ts`.
3. **Nada de número ou dado inventado na tela.** Só o que a Valeria disse ou enviou. Na dúvida, pergunte.
4. **Toda opinião da Valeria sobre um vídeo vira uma regra escrita** na seção "Regras aprendidas" abaixo, com a data.
5. Legenda = exatamente o que ela falou. Se a transcrição tiver trecho duvidoso, pergunte antes de publicar.
6. Antes de entregar, renderize quadros soltos (`npx remotion still`) e confira: rosto livre, legenda legível, zona segura.

## Quem é

- **Nome nos vídeos:** Valeria Carinhato · **@valeriacarinhato** · assinatura pessoal (nome + @, sem logo).
- **Fotos:** `public/valeria/fotos/` (recortes de silhueta: `foto-N-recorte.png`). Hoje só há uma foto
  provisória (`exemplo.jpg`, uma silhueta desenhada) para o projeto de teste; trocar pelas fotos dela.
- **Quem é:** empresária, headhunter, mentora de líderes executivos e empresários.
- **Temas:** autoconhecimento e autodesenvolvimento; liderança e carreira; comunidade **Eixoz**
  (5 eixos: Consciência, Saúde, Família, Propósito e Prosperidade). A identidade da Eixoz ainda está
  sendo criada: não inventar.
- **Público:** líderes executivos e empresários (a confirmar com a Valeria).
- **Tom:** elegante e sereno — confiança, acolhimento e autoridade. Nada chamativo. **Nunca memes.**
  (a confirmar com a Valeria)

## Formatos

| Composição | Tamanho | Uso | Duração |
|---|---|---|---|
| `Reels` (**principal — entrega padrão**) | 1080x1920 | Reels, TikTok, Shorts | até 90 s |
| `Capa` / `CapaYouTube` | still | capa: foto enviada pela Valeria + textos | — |
| `YouTube` | 1920x1080 | YouTube — só quando pedir | ~10 min |
| `Feed` | 1080x1350 | feed Instagram/LinkedIn — só quando pedir | igual ao Reels |
| `Stories` | 1080x1920 | versão curta — só quando pedir | 10–15 s |
| `Carrossel` | still 1080x1350 | pontos principais — só quando pedir (`entregar.py --carrossel`) | — |

## Como ela grava

A confirmar com a Valeria (aparelho, microfone, onde grava). Se for iPhone em HDR, `preparar.py` converte para SDR.

## Estrutura da tela

- Começa com o rosto; no meio alterna **tela dividida** (ilustra o que ela diz) e **imagens de apoio
  em tela cheia**; termina com o rosto + assinatura (nome e @).
- Ela **some** da tela quando o que vai ser mostrado é muito importante.
- **Animações ao redor dela:** flutuam, passam e **atravessam por trás** (`palavraAtras`, usa o
  recorte da silhueta) em números, dados e destaques que não pedem uma imagem.
- **Edição:** animações sob medida e **criativas** (objetos que se desenham, sílabas que voam, partículas,
  cadernos que se escrevem…), cortes e zoom (frases fortes), imagens de apoio, textos grandes, prints.
  **Muitas palavras-chave flutuando** (`flutuante`): acima da cabeça ou na altura do peito, nunca no rosto.
  **Ritmo médio**, com respiro quando a fala pedir.

## Legenda

- Clássica e simples: **uma linha só**, de 2–3 palavras; quando a próxima surge, a anterior sai (sem segunda linha).
  Tamanho 74 px no vertical.
- **Letra branca** (Manrope). Palavras de **destaque**: serifada (Cormorant Garamond itálico), um pouco mais brilhante, sem acender demais.
- **Posição muda com a cena:** rosto = altura do peito; tela dividida = na parte de baixo da ilustração, logo acima do fio (rosto livre); tela cheia = terço de baixo (acima da zona dos botões); texto grande = sem legenda.

## Som

- **Música sempre**, do **Artlist** (assinatura do Diogo; as faixas chegam por uma pasta do Google Drive).
  Estilo elegante e jovial, um pouco dançante, emocional quando necessário. A música pode
  **trocar no meio do vídeo** acompanhando a cena. Volume baixo por baixo da voz (~0,12).
- **Efeitos sutis** nas transições e nas animações. Provisórios gerados por `scripts/gerar_sons.py`
  (`public/sons/`) até chegarem os do Artlist.

## Visual

### Paleta oficial (`src/marca.ts`)

| Cor | Código | Nome no código | Função |
|---|---|---|---|
| Azul Principal | `#2C3B4D` | `azulPrincipal` | fundos escuros, blocos, autoridade |
| Azul Profundo | `#1B2632` | `azulProfundo` | textos e títulos, capas, contraste máximo |
| Off White | `#EEE9DF` | `offWhite` | base clara: respiro, luz; texto sobre azul |
| Bege Oatmeal | `#C9C1B1` | `bege` | neutro secundário: fundos de apoio, divisórias, texto suave |
| Terracota Rosado | `#C47C67` | `terracota` | destaque: filetes, ícones, palavras-chave, numeração, pontos de conexão |
| Marrom Cacau | `#995748` | `cacau` | apoio quente: detalhes, blocos de apoio, texto suave no tema claro |

- **Os azuis e os neutros dominam; a terracota só marca.** Evitar fundos grandes em terracota e muitos destaques ao mesmo tempo.
- **Combinações:** escuro = fundo azul principal + texto off white + detalhes terracota ·
  claro neutro = fundo off white + texto azul profundo + detalhe terracota ·
  claro quente = fundo bege oatmeal + texto azul profundo + cacau de apoio · capa = fundo azul profundo.
- **Tema** varia por vídeo: escuro (azul) ou claro (off white / bege), conforme o assunto e as imagens.
- **Letras:** Manrope (texto) + Cormorant Garamond (destaques). Legíveis, nada enfeitado.
- Sem mascote. Movimentos suaves (`SUAVE` em `marca.ts`), nunca tremidos ou elásticos.

## Referências

- **Enes Yilmazer** (YouTube): transições com efeito visual e sonoro, movimentos de câmera pelas paisagens, as letras e a música.
- **Ali Abdaal**: tudo — animações ao redor da pessoa, textos, ritmo.
- **Johnny Harris**: pausas e trocas de música no meio do vídeo acompanhando a cena.
- Valem para o vertical e o horizontal.

## Entregas de cada vídeo

- **Só o Reels** (entrega padrão). Stories, feed, YouTube e carrossel apenas quando ela pedir.
- **Capa:** a Valeria manda a foto/imagem; o Claude cria os textos por cima (`Capa`).
- **Legenda do post** e **mensagem da DM:** dependem do vídeo — **pergunte à Valeria** a cada vídeo.

## Ambiente técnico

- Transcrição: Whisper turbo forçado em português (`scripts/transcrever.py`). O Parakeet foi
  descartado: trocava o idioma para inglês.
- Modelos ficam em `modelos/` (fora do Git); o gancho `.claude/hooks/session-start.sh` baixa tudo.
- Rede: YouTube bloqueado no ambiente (liberar `youtube.com`, `googlevideo.com`, `ytimg.com` em
  "Acesso à rede" para baixar referências). Instagram, Google Drive e GitHub liberados.
- Navegador de render: Chrome Headless Shell do ambiente (`remotion.config.ts`).

## Regras aprendidas (opiniões da Valeria)

Formato: `AAAA-MM-DD — regra — (vídeo de origem)`

- 2026-10-15 — Editor criado a partir do editor do Diogo: mesmo formato, paleta da Valeria. — (criação)
- 2026-10-15 — Assinatura pessoal (nome + @), sem logo. — (criação)

### Herdadas do editor do Diogo (valem até a Valeria dizer o contrário)

- Toda mensagem é em português, sem exceção.
- Quando ela falar um nome errado, a legenda mantém o que ela disse e entra uma "nota do editor" (sobreposição `correcao`) corrigindo com leveza e um toque de humor.
- Entregar só o Reels: sem carrossel e sem versão para Stories, a não ser que ela peça.
- Legenda com uma linha só (sem a linha anterior esmaecida), 74 px.
- Muitas palavras-chave flutuando ao redor dela, grandes e legíveis, fora do rosto.
- Animações criativas: objetos e textos que se constroem, viajam e se conectam.
- Vídeo pode passar de 90 s quando ela fala sem pausas: manter inteiro, não cortar conteúdo sem ela pedir.
