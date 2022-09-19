/**
 * @examples
 *   node switch-manifest chrome
 *   node switch-manifest firefox
 */

((): void => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const [nodePath, scriptPath, manifestType] = process.argv;
    if (!manifestType)
      return console.log('No manifest type specified');
    
    const manifestPath: string = path.join('..', `manifest_${manifestType}.json`);
    
    if (!fs.existsSync(manifestPath))
      return console.log('Manifest does not exist:', manifestPath);
    
    fs.writeFileSync(path.join('..', 'manifest.json'), fs.readFileSync(manifestPath, {encoding: 'utf8'}), {encoding: 'utf8'});
    console.log(`Manifest type ${manifestType} set`);
    
  } catch (e) {
    console.log('e:', e);
  }
})();