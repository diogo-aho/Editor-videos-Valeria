import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// No Claude Code na web o download do Chrome (remotion.media) é bloqueado
// pela rede; usa o Chrome Headless Shell que já vem instalado no ambiente.
const headlessShell =
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (fs.existsSync(headlessShell)) {
  Config.setBrowserExecutable(headlessShell);
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
