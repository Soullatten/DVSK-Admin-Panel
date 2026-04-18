import fs from 'fs';
import path from 'path';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Remove old import if any just to be clean, but shouldn't be needed
    // Add import if not exists
    if (!content.includes("import toast") && content.includes("<button")) {
        const importStatement = "import toast from 'react-hot-toast';\n";
        const importMatch = content.lastIndexOf("import ");
        if (importMatch !== -1) {
            const endOfLine = content.indexOf('\n', importMatch);
            content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
        } else {
            content = importStatement + content;
        }
        changed = true;
    }

    // Find <button ...> where it does not have onClick
    // Since <button> might span newlines, we should be careful.
    // [^>] matching works across newlines.
    const buttonRegex = /<button(?![^>]*onClick=)([^>]*)>/g;
    const newContent = content.replace(buttonRegex, (match, p1) => {
        // extract text between <button> and </button> if possible, or just standard message
        return `<button onClick={() => toast.success('Action clicked!')} ${p1}>`;
    });

    if (newContent !== content) {
        content = newContent;
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

const dirs = ['src/pages', 'src/components'];
for (const dir of dirs) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
            processFile(path.join(dir, file));
        }
    }
}
