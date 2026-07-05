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
    const originalContent = content;

    // Pattern 1: className="...material-symbols-outlined..."
    content = content.replace(/<span\s+className=(["'])([^"']*?material-symbols-outlined[^"']*?)\1([^>]*)>([\s\S]*?)<\/span>/g, (match, quote, classes, extraProps, inner) => {
        const iconName = inner.trim();
        let cleanedClasses = classes.replace('material-symbols-outlined', '').replace(/\s+/g, ' ').trim();
        let classNameProp = cleanedClasses ? ` className="${cleanedClasses}"` : '';
        if (iconName.startsWith('{') && iconName.endsWith('}')) {
             return `<IconRenderer name=${iconName}${classNameProp}${extraProps} />`;
        }
        return `<IconRenderer name="${iconName}"${classNameProp}${extraProps} />`;
    });
    
    // Pattern 2: className={`...material-symbols-outlined...`}
    content = content.replace(/<span\s+className=\{([^}]*?material-symbols-outlined[^}]*?)\}([^>]*)>([\s\S]*?)<\/span>/g, (match, classesExpr, extraProps, inner) => {
        const iconName = inner.trim();
        // Just remove 'material-symbols-outlined' from the template literal expression
        let cleanedClassesExpr = classesExpr.replace('material-symbols-outlined', '').trim();
        // remove extra spaces inside template literal
        cleanedClassesExpr = cleanedClassesExpr.replace(/\s{2,}/g, ' '); 
        
        let classNameProp = ` className={${cleanedClassesExpr}}`;
        if (iconName.startsWith('{') && iconName.endsWith('}')) {
             return `<IconRenderer name=${iconName}${classNameProp}${extraProps} />`;
        }
        return `<IconRenderer name="${iconName}"${classNameProp}${extraProps} />`;
    });

    if (content !== originalContent) {
        if (!content.includes('IconRenderer')) {
            const importStmt = `import { IconRenderer } from '@/utils/icon-mapper';\n`;
            
            // find the last import to append after
            let lastImportMatch = null;
            let importRegex = /^import\s+.*?;?\s*$/gm;
            let m;
            while ((m = importRegex.exec(content)) !== null) {
                lastImportMatch = m;
            }

            if (lastImportMatch) {
                const endOfLine = lastImportMatch.index + lastImportMatch[0].length;
                content = content.slice(0, endOfLine) + '\n' + importStmt + content.slice(endOfLine);
            } else {
                content = importStmt + content;
            }
        }
        fs.writeFileSync(filePath, content);
        console.log('Updated ' + filePath);
    }
}

walkDir('./resources/js', processFile);
