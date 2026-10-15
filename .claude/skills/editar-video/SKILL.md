---
name: editar-video
description: Passo a passo para editar um vídeo da Valéria Carinhato (@valeriacarinhato) no padrão dela — da gravação bruta ao Reels, YouTube, feed, Stories, capa e carrossel. Use sempre que o Diogo mandar (por ela) uma gravação, áudio, fotos ou vídeos para virar conteúdo, ou pedir para editar/refazer um vídeo.
---

# Editar um vídeo da Valéria

Leia o `CLAUDE.md` antes (formato, regras e "Regras aprendidas"). Fale em português simples.
Para detalhes de Remotion, use a skill `remotion-best-practices`.

## 0. Receber o material

- Gravação (vídeo do iPhone ou áudio), fotos, vídeos de apoio, prints, slides, imagens de eventos e mentorias.
  Podem vir anexados ou por link do Google Drive (`gdown`). Referências do Instagram: `yt-dlp`.
- Guarde os brutos em `brutos/<nome>/` (fora do Git) e as mídias de apoio em `public/projetos/<nome>/midia/`.
- Pergunte só o que faltar: **formato(s)**, **legenda do post** e **mensagem da DM** (sempre perguntar),
  **foto da capa**, e se é um assunto energético ou calmo.
- **Nunca peça para regravar.**

## 1. Preparar a gravação

```bash
python scripts/preparar.py brutos/<nome>/<arquivo> <nome>
```

Converte HDR→SDR, corta silêncios longos (>0,6 s; ajuste com `--silencio`), nivela o volume
(-14 LUFS) e transcreve com o tempo de cada palavra. Saída: `public/projetos/<nome>/`
(`fala.mp4` ou `fala.wav`, `palavras.json`, `info.json`).

**Revise a transcrição** lendo o texto inteiro: corrija nomes de pessoas, empresas e cargos,
termos de RH e liderança, Eixoz. Erros que se repetem vão para `scripts/correcoes.json`.
Trecho que não dá para entender: **pergunte ao Diogo** — a legenda tem que ser o que ela disse.

**Corte os gaguejos** (repetições de sílaba/palavra, frases recomeçadas, "é... é..."): ache o trecho na
transcrição e na energia do áudio, confirme transcrevendo só aquele pedaço, e corte:
```bash
python scripts/cortar.py <nome> 12.40-12.95 33.10-33.62   # tempos da fala sem cortes (fala-inteira)
```
Depois disso a linha do tempo muda: monte o roteiro só depois dos cortes. O recorte da silhueta
(`recortar.py`) também tem de ser feito DEPOIS dos cortes.

## 2. Recortar a silhueta (para animações que passam atrás dela)

Se a gravação for vídeo e houver `palavraAtras`:
```bash
python scripts/recortar.py public/projetos/<nome>/fala.mp4     # -> frente.webm
```
Para fotos: `python scripts/recortar.py public/valeria/fotos/foto-N.jpg`.

## 3. Montar o roteiro

```bash
python scripts/novo_roteiro.py <nome>            # vídeo
python scripts/novo_roteiro.py <nome> --foto valeria/fotos/foto-1.jpg   # só áudio
```

Edite `public/projetos/<nome>/roteiro.json` (tipos em `src/tipos.ts`). Tempos em segundos,
na linha do tempo já cortada. Monte assim:

- **Cenas** (`cenas`, em sequência, sem buracos; cada uma tem `inicio`/`fim`):
  - `rosto` — abre e fecha o vídeo. `zooms` nas frases fortes (escala 1.1–1.2).
  - `dividida` — 40% de cima ilustra o que ela diz (`midia` ou `animacao`), 60% de baixo é ela.
  - `telaCheia` — imagem de apoio em tela cheia (ela some) quando o que aparece é muito importante.
  - `textoGrande` — frase-chave dita por ela, em serifada (use as palavras exatas).
  - Ritmo médio: troque de cena a cada ~3–6 s; deixe respiro em momentos emocionais.
  - `"transicao"`: `luz`, `cortina`, `circulo` ou `linha` em pontos estratégicos (troca de assunto,
    frase forte); o resto fica na suave. `"tema"`/`"clima"` por cena para revezar claro e escuro.
- **Destaques na legenda:** marque `"destaque": true` em 1 palavra-chave a cada ~5–8 s.
- **Sobreposições** (`sobreposicoes`): `destaque` (cartão com ícone lucide), `palavraAtras`
  (palavra gigante atrás dela), `flutuante` (palavra-chave flutuando — use várias, ~1 a cada 4–6 s
  nas cenas de rosto; `y` 0.15 = acima da cabeça, 0.53 = peito), `numero` (**só números que ela disse**), `correcao`
  ("nota do editor" quando ela fala um nome errado; a legenda continua com o que ela disse).
  `ligacao` (linha curva entre dois pontos — ligue palavras flutuantes que conversam entre si; ponta de
  uma flutuante à esquerda ≈ `[0.075, y]`, à direita ≈ `[0.89, y]`). **A linha nunca cruza o rosto**: de cima
  (0.15) para o peito (0.55) use `"controle": [1.0, 0.1]` para ela contornar pela borda.
- **Legenda por cena:** `"legenda": 0.72` muda a altura; `"legenda": "esconder"` quando a animação
  já mostra as palavras. Gravação aberta (corpo inteiro): use `orador.escalaBase` (~1.3–1.6) e
  varie entre cenas seguidas para dar ritmo.
- **Legenda do post e DM:** escreva em `public/projetos/<nome>/post.md` e mostre ao Diogo.
- **Animações sob medida:** crie em `src/animacoes/` (ex.: `valeria.tsx`) e registre em `ANIMACOES`.
  Textos dentro delas sempre em `fontes.animacao` (Josefin Sans). Use grafismos que conectam: linhas,
  pontos, quadros que se ligam, gráficos que se desenham. Na tela dividida a área é 1080x768.
  Mapas, gráficos, linhas do tempo… Elegantes, nunca chamativas. Nada de dado inventado.
- **Música** (`musicas`): faixas do Artlist em `public/musicas/`. Troque a faixa quando a cena
  muda de clima. Volume ~0,18 (a voz manda). Leve batida, sofisticada, sem ser dançante.
- **Efeitos sonoros:** a Valéria prefere sem. Os automáticos estão desligados; só use `efeitos` se pedirem.
- `capa`: foto escolhida pela Valéria + título curto (palavras dela). `stories` e `carrossel`
  só quando ela pedir.
- `tema`/`clima`: escolha conforme o assunto (escuro/claro, quente/neutro). Pode revezar entre cenas ou mesclar.

## 4. Conferir antes de renderizar

Renderize quadros soltos nos momentos de troca de cena e sobreposições:
```bash
npx remotion still src/index.ts Reels out/q.png --frame=<n> --props=public/projetos/<nome>/roteiro.json
```
Confira: rosto livre, cartões fora do rosto, legenda legível e fora da zona dos botões,
nada importante no topo/base/lateral direita, nenhuma palavra cortada.

## 5. Renderizar e entregar

```bash
python scripts/entregar.py <nome>                                      # padrão: só o Reels (+ capa)
python scripts/entregar.py <nome> --formatos reels,feed,youtube,stories --carrossel   # só se ela pedir
```
Gera em `out/<nome>/`: os vídeos, `capa.png` (e `capa-youtube.png`) e `carrossel-N.png`.
Vídeos acima de 30 MB ganham uma cópia `*-para-postar.mp4` (<30 MB): é ela que se envia na conversa (limite de 30 MB).
Para um só formato: `npx remotion render src/index.ts Reels out/x.mp4 --props=public/projetos/<nome>/roteiro.json`.

Mande os arquivos ao Diogo com um resumo curto em português e **a legenda do post e a DM**
que ela pediu. Faça commit do roteiro e do código (mídias grandes ficam fora do Git).

## 6. Depois da opinião da Valéria (ou do Diogo)

Toda opinião vira regra em `CLAUDE.md` → "Regras aprendidas", com a data:
`2026-10-20 — legenda um pouco maior nos vídeos de palestra — (vídeo "lideranca-01")`.
Se a regra muda o padrão do código (cores, tamanhos, posições), ajuste o código também.
