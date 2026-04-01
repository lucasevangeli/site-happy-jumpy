import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function optimizeImages() {
  const files = fs.readdirSync(PUBLIC_DIR);
  let totalSaved = 0;

  console.log('🚀 Iniciando compressão física de imagens em /public...\n');

  for (const file of files) {
    const filePath = path.join(PUBLIC_DIR, file);
    
    // Pular se for diretório
    if (fs.statSync(filePath).isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();

    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const stats = fs.statSync(filePath);
      const originalSize = stats.size;
      
      try {
        const buffer = fs.readFileSync(filePath);
        let sharpInstance = sharp(buffer);

        if (ext === '.jpg' || ext === '.jpeg') {
          sharpInstance = sharpInstance.jpeg({ quality: 80, progressive: true });
        } else if (ext === '.png') {
          sharpInstance = sharpInstance.png({ compressionLevel: 9, adaptiveFiltering: true });
        }

        const outputBuffer = await sharpInstance.toBuffer();
        const newSize = outputBuffer.length;

        if (newSize < originalSize) {
          fs.writeFileSync(filePath, outputBuffer);
          const saved = originalSize - newSize;
          totalSaved += saved;
          console.log(`✅ ${file}: ${(originalSize / 1024).toFixed(2)}KB -> ${(newSize / 1024).toFixed(2)}KB (Economia: ${(saved / 1024).toFixed(2)}KB)`);
        } else {
          console.log(`ℹ️ ${file}: Já está otimizado (tamanho final seria maior).`);
        }
      } catch (err) {
        console.warn(`⚠️ Erro ao processar ${file}:`, err.message);
      }
    }
  }

  console.log(`\n🎉 Fim do processo!`);
  console.log(`📈 Economia de Espaço Total: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages().catch(err => {
  console.error('❌ Erro crítico no script:', err);
  process.exit(1);
});
