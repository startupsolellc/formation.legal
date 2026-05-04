import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

// Renk kodları (Terminal için)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// HTML dosyalarını bulmak için yardımcı fonksiyon
function getAllHtmlFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.html')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Dosyanın veya klasörün var olup olmadığını kontrol eden fonksiyon
function checkPathExists(linkPath) {
  // Hash/Anchor linkleri için base path'i al
  const cleanPath = linkPath.split('#')[0].split('?')[0];
  
  if (!cleanPath) return true; // Sadece anchor olan linkler (ör: href="#top")
  
  // dist/ klasörü içindeki tam dosya yolu
  const fullPath = path.join(DIST_DIR, cleanPath);
  
  // 1. Doğrudan dosya mı? (örn: /about.html veya /image.png)
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    return true;
  }
  
  // 2. Klasör mü ve içinde index.html var mı? (örn: /about/ -> /about/index.html)
  const indexPath = path.join(fullPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return true;
  }
  
  // 3. Klasör slash olmadan mı verilmiş? (örn: /about -> /about/index.html)
  // (Astro standart davranışı)
  if (!cleanPath.endsWith('/')) {
    const indexPathWithSlash = path.join(DIST_DIR, cleanPath, 'index.html');
    if (fs.existsSync(indexPathWithSlash)) {
      return true;
    }
  }

  return false;
}

async function runLinkChecker() {
  console.log(`${colors.cyan}==========================================${colors.reset}`);
  console.log(`${colors.cyan}🔍 Internal Broken Link Checker Başlıyor...${colors.reset}`);
  console.log(`${colors.cyan}==========================================${colors.reset}\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.log(`${colors.red}❌ HATA: 'dist' klasörü bulunamadı.${colors.reset}`);
    console.log(`${colors.yellow}Lütfen önce 'npm run build' komutunu çalıştırın.${colors.reset}`);
    process.exit(1);
  }

  const htmlFiles = getAllHtmlFiles(DIST_DIR);
  console.log(`${colors.gray}Taranan dosya sayısı: ${htmlFiles.length}${colors.reset}\n`);

  const brokenLinks = [];
  let totalLinksChecked = 0;

  // Regex açıklaması:
  // href="...", src="...", veya data-href="..."
  const linkRegex = /(?:href|src)=["']([^"']+)["']/gi;

  htmlFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativeFilePath = filePath.replace(DIST_DIR, '');
    
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const link = match[1];
      
      // Harici (dış) linkleri, email ve tel linklerini atla
      if (link.startsWith('http://') || 
          link.startsWith('https://') || 
          link.startsWith('mailto:') || 
          link.startsWith('tel:') ||
          link.startsWith('//')) {
        continue;
      }
      
      totalLinksChecked++;
      
      // Internal (iç) link doğrulama
      // Sadece / ile başlayan absolute path'leri veya mevcut dizindeki relative'leri destekler
      let resolvedLinkPath = link;
      if (!link.startsWith('/')) {
        // Relative path (örn: ../image.png)
        const fileDir = path.dirname(relativeFilePath);
        resolvedLinkPath = path.resolve(fileDir, link);
      }
      
      const isValid = checkPathExists(resolvedLinkPath);
      
      if (!isValid) {
        brokenLinks.push({
          sourcePage: relativeFilePath,
          brokenLink: link,
          resolvedPath: resolvedLinkPath
        });
      }
    }
  });

  // Sonuçları Raporla
  console.log(`Toplam ${totalLinksChecked} iç bağlantı kontrol edildi.\n`);

  if (brokenLinks.length === 0) {
    console.log(`${colors.green}✅ HARİKA! Sistemde hiç kırık iç bağlantı (404) bulunamadı.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ DİKKAT: ${brokenLinks.length} adet kırık bağlantı tespit edildi!${colors.reset}\n`);
    
    // Sayfaya göre grupla
    const groupedErrors = brokenLinks.reduce((acc, error) => {
      if (!acc[error.sourcePage]) acc[error.sourcePage] = [];
      acc[error.sourcePage].push(error);
      return acc;
    }, {});

    for (const [sourcePage, errors] of Object.entries(groupedErrors)) {
      console.log(`${colors.yellow}📄 Sayfa: ${sourcePage}${colors.reset}`);
      errors.forEach((err) => {
        console.log(`   ${colors.red}↳ Kırık Link:${colors.reset} "${err.brokenLink}"`);
      });
      console.log(''); // Boş satır
    }
  }
}

runLinkChecker();
