const https = require('https');
const fs = require('fs');
const path = require('path');

const ASSETS = {
  'skinTexture.webp': 'https://images.unsplash.com/photo-1506434304575-b873322aa6a4?q=80&w=1600&auto=format&fit=crop',
  'krea1-example.webp': 'https://images.unsplash.com/photo-1616161560417-66d4da581177?q=80&w=1600&auto=format&fit=crop',
  'eye-macro.webp': 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?q=80&w=1600&auto=format&fit=crop',
  'light-streak.webp': 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1600&auto=format&fit=crop',
  'minimalistBase.webp': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  'asset-manager.webp': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1600&auto=format&fit=crop',
  'isometricPromptStyles.webp': 'https://images.unsplash.com/photo-1614729939124-032d0b56c9ce?q=80&w=1600&auto=format&fit=crop',
  'image-editor.webp': 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1600&auto=format&fit=crop',
  'realtimeBase.webp': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop',
  'realtimeOverlay.png': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop',
  'hf0.webp': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
  'landingPhotorealExamplePortrait.webp': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1600&auto=format&fit=crop',
  'landingEnhancerExampleSwirlBloomCentered.webp': 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=1600&auto=format&fit=crop',
  'master_4k_first_frame.webp': 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop'
};

const VIDEOS = {
  'imageToolDemo_lowBitrate.mp4': 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'landingPageHeroFallback.mp4': 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
};

function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, filename).then(resolve).catch(reject);
      }
      
      const fileStream = fs.createWriteStream(filename);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  const dir = path.join(__dirname, '../public/assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log('Downloading alternative assets via Unsplash...');
  for (const [name, url] of Object.entries({...ASSETS, ...VIDEOS})) {
    await download(url, path.join(dir, name));
  }
  console.log('Done!');
}

main().catch(console.error);
