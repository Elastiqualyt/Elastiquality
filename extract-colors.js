const fs = require('fs');
const path = require('path');

// Script simples para analisar o logo
// Como não temos biblioteca de análise de imagem, vamos pedir ao usuário para informar as cores

console.log('\n🎨 EXTRAÇÃO DE CORES DO LOGO\n');
console.log('Por favor, abra o arquivo: assets/images/logo.png');
console.log('E identifique as cores principais usando uma ferramenta como:');
console.log('- https://imagecolorpicker.com/');
console.log('- https://www.canva.com/colors/color-palette-generator/');
console.log('- Photoshop/GIMP com a ferramenta conta-gotas');
console.log('\nDepois, atualize o arquivo src/theme/colors.ts com as cores corretas.\n');

// Verificar se o logo existe
const logoPath = path.join(__dirname, 'assets', 'images', 'logo.png');
if (fs.existsSync(logoPath)) {
  const stats = fs.statSync(logoPath);
  console.log('✅ Logo encontrado!');
  console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Caminho: ${logoPath}\n`);
} else {
  console.log('❌ Logo não encontrado em:', logoPath);
}

