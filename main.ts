import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(rootDir, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });

if (existsSync(join(rootDir, 'screenshots'))) {
  cpSync(join(rootDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

buildDossier(outputDir, {
  text_max_bytes: 163840,
  image_max_count: 4,
  image_max_bytes: 262144,
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
