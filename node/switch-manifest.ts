/**
 * @examples
 *   node switch-manifest chrome
 *   node switch-manifest firefox
 */

import fs from 'fs';
import path from 'path';

const [nodePath, scriptPath, manifestType] = process.argv;

if (!manifestType) {
  console.log('No manifest type specified');
  process.exit();
}

const manifestPath: string = path.join(path.parse(scriptPath).dir, '..', `manifest_${manifestType}.json`);

if (!fs.existsSync(manifestPath)) {
  console.log('Manifest does not exist:', manifestPath);
  process.exit();
}

fs.writeFileSync(
  path.join('..', 'manifest.json'),
  fs.readFileSync(manifestPath, {encoding: 'utf8'}),
  {encoding: 'utf8'},
);
console.log(`Manifest type ${manifestType} set`);