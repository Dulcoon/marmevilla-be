const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (dirPath.endsWith('.jsx') || dirPath.endsWith('.js')) {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('<IconRenderer') && !content.includes('IconRenderer } from')) {
        const importStmt = `import { IconRenderer } from '@/utils/icon-mapper';\n`;
        
        // Let's just insert it after the first import or at the very top
        const firstImportMatch = content.match(/^import /m);
        if (firstImportMatch) {
            const endOfLine = content.indexOf('\n', firstImportMatch.index);
            content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
        } else {
            content = importStmt + content;
        }
        
        fs.writeFileSync(filePath, content);
        console.log('Fixed imports in ' + filePath);
    }
}

walkDir('./resources/js', processFile);
