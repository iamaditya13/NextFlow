const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't have <img
  if (!content.match(/<img\b/)) return;

  // Do not add the import if it already exists
  if (!content.includes('IconRenderer')) {
    content = 'import { IconRenderer } from "@/components/ui/IconRenderer";\n' + content;
  }

  // Replace <img with <IconRenderer
  content = content.replace(/<img\b/g, '<IconRenderer');

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('IconRenderer.tsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, '../src/sections'));
console.log('Finished refactoring <img> tags!');
