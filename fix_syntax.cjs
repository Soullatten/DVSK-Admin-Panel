const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

let fixedCount = 0;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix broken imports where the script accidentally injected inside a destructured import block
  const badImport = "import {\nimport { useMainWebsite } from '../hooks/useMainWebsite';";
  
  if (content.includes(badImport)) {
    content = content.replace(
      badImport,
      "import { useMainWebsite } from '../hooks/useMainWebsite';\nimport {"
    );
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✅ Fixed broken import syntax in ${file}`);
  }
});

if (fixedCount === 0) {
  console.log("No broken imports found!");
} else {
  console.log(`\n🎉 Fixed syntax errors in ${fixedCount} pages.`);
}