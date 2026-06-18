const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./src/app');

let count = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace i18nService.getValue(something) with (something | localizedName)
    // We use a non-greedy regex to match the inner content
    const newContent = content.replace(/i18nService\.getValue\((.*?)\)/g, '($1 | localizedName)');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        count++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Updated ${count} files.`);
