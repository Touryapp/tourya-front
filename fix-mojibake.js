const fs = require('fs');
const path = require('path');

const i18nDir = path.join(__dirname, 'src', 'assets', 'i18n');
// Wait, the files are in public/i18n based on the user's open documents!
const publicI18nDir = path.join(__dirname, 'public', 'i18n');

const files = ['es.json', 'en.json', 'pt.json'];

files.forEach(file => {
    const filePath = path.join(publicI18nDir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix Mojibake
    content = content.replace(/â€œ/g, '"');
    content = content.replace(/â€/g, '"');
    content = content.replace(/ðŸ“„/g, '📄');
    content = content.replace(/ðŸ“§ \\udce7/g, '📧');
    content = content.replace(/ðŸ“§/g, '📧');
    content = content.replace(/ðŸ“ž \\udcde/g, '📞');
    content = content.replace(/ðŸ“ž/g, '📞');
    
    // Fix bad "días" replacements
    content = content.replace(/pérdidías/g, 'pérdidas');
    content = content.replace(/derivadías/g, 'derivadas');
    content = content.replace(/publicadías/g, 'publicadas');
    content = content.replace(/medidías/g, 'medidas');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
});
