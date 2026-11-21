import { cpSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outputDir, { recursive: true });

cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

const outputScreenshotsDir = join(outputDir, 'screenshots');
mkdirSync(outputScreenshotsDir, { recursive: true });

const localScreenshotsDir = join(repoDir, 'screenshots');
if (existsSync(localScreenshotsDir)) {
  cpSync(localScreenshotsDir, outputScreenshotsDir, { recursive: true });
}

const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});

writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
