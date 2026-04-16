const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/assets/icons');
const outputFile = path.join(__dirname, '../src/app/generated/icon-list.ts');
const outputDir = path.dirname(outputFile);

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const iconFiles = fs.readdirSync(iconsDir).filter((file) => file.endsWith('.svg'));
const iconNames = iconFiles.map((file) => path.basename(file, '.svg'));

const content = `// ATENÇÃO: Este arquivo é gerado automaticamente. Não o edite manualmente.\n// Rode 'npm run icons:generate' para atualizá-lo.\n\nexport const ICON_NAMES = ${JSON.stringify(iconNames, null, '\t')};\n`;

fs.writeFileSync(outputFile, content);
console.log(`✅ Lista de ícones gerada com sucesso em ${outputFile}`);
