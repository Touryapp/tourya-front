const fs = require('fs');

function fixMojibake(file) {
    let c = fs.readFileSync(file, 'utf8');

    // We must escape the double quotes because this is inside a JSON string value!
    c = c.replace(/â€œ/g, '\\"');
    c = c.replace(/â€\x9D/g, '\\"');
    
    // Also, looking at the previous output, we had 'â€' with nothing else, probably meaning the right quote was something else.
    // Wait, the previous output was 'â€\x9D'. Let's just catch any remaining â€... but wait, maybe it's safer to just replace them exactly.
    // If there is any raw â€ left, we should escape it.
    // Actually, â€ is \xE2\x80. It's safe to just catch â€ followed by anything, but we only have 2 types in the regex output.
    
    // Let's replace the emojis
    c = c.replace(/ðŸ“„/g, '📄');
    // The \udce7 is literal in the JSON text as `\\udce7` because it was escaped unicode.
    c = c.replace(/ðŸ“§ \\udce7/g, '📧');
    c = c.replace(/ðŸ“§/g, '📧'); // just in case
    c = c.replace(/ðŸ“ž \\udcde/g, '📞');
    c = c.replace(/ðŸ“ž/g, '📞');

    // Fix bad "días" replacements
    c = c.replace(/pérdidías/g, 'pérdidas');
    c = c.replace(/derivadías/g, 'derivadas');
    c = c.replace(/publicadías/g, 'publicadas');
    c = c.replace(/medidías/g, 'medidas');

    try {
        JSON.parse(c);
        fs.writeFileSync(file, c, 'utf8');
        console.log(`Fixed ${file}`);
    } catch(e) {
        console.error(`ERROR in ${file}:`, e.message);
    }
}

fixMojibake('public/i18n/es.json');
fixMojibake('public/i18n/en.json');
