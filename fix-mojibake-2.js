const fs = require('fs');
const path = require('path');

const publicI18nDir = path.join(__dirname, 'public', 'i18n');
const files = ['es.json', 'en.json', 'pt.json'];

files.forEach(file => {
    const filePath = path.join(publicI18nDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Mojibake
    content = content.replace(/â€œ/g, '"');
    content = content.replace(/â€\x9D/g, '"');
    content = content.replace(/ðŸ“„/g, '📄');
    content = content.replace(/ðŸ“§/g, '📧');
    content = content.replace(/ðŸ“ž/g, '📞');
    
    // Fix bad "días" replacements
    content = content.replace(/pérdidías/g, 'pérdidas');
    content = content.replace(/derivadías/g, 'derivadas');
    content = content.replace(/publicadías/g, 'publicadas');
    content = content.replace(/medidías/g, 'medidas');
    
    // Parse it to ensure it's valid JSON before writing!
    try {
        JSON.parse(content);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Successfully fixed and validated ${file}`);
    } catch (e) {
        console.error(`ERROR: Failed to parse ${file} after replacement. Did not save.`, e.message);
    }
});
