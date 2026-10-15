import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { fontes } from "./marca";

// Manrope: texto limpo. Cormorant Garamond: destaques serifados, legíveis. Josefin Sans: animações.
loadFont({ family: fontes.texto, url: staticFile("fontes/manrope.woff2"), weight: "200 800" });
for (const peso of ["500", "600", "700"]) {
  for (const estilo of ["normal", "italic"] as const) {
    loadFont({
      family: fontes.destaque,
      url: staticFile(`fontes/cormorant-${peso}-${estilo}.woff2`),
      weight: peso,
      style: estilo,
    });
  }
}
for (const estilo of ["normal", "italic"] as const) {
  loadFont({ family: fontes.animacao, url: staticFile(`fontes/josefin-${estilo}.woff2`), weight: "100 700", style: estilo });
}
