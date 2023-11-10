"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const [nodePath, scriptPath, manifestType] = process.argv;
if (!manifestType) {
    console.log('No manifest type specified');
    process.exit();
}
const manifestPath = path_1.default.join(path_1.default.parse(scriptPath).dir, '..', `manifest_${manifestType}.json`);
if (!fs_1.default.existsSync(manifestPath)) {
    console.log('Manifest does not exist:', manifestPath);
    process.exit();
}
fs_1.default.writeFileSync(path_1.default.join('..', 'manifest.json'), fs_1.default.readFileSync(manifestPath, { encoding: 'utf8' }), { encoding: 'utf8' });
console.log(`Manifest type ${manifestType} set`);
