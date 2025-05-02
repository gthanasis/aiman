import chalk from 'chalk';
import boxen from 'boxen';

// Get terminal width with a fallback value
export function getTerminalWidth() {
    return process.stdout.columns || 80;
}

// Format text to fit within terminal width with proper indentation
export function formatText(text: string, indent: number, maxWidth: number) {
    const width = Math.min(maxWidth, getTerminalWidth() - indent - 4); // -4 for border and minimal padding
    return text.split('\n').map(line => 
        line.match(new RegExp(`.{1,${width}}`, 'g'))?.join(`\n${' '.repeat(indent)}`) || line
    ).join(`\n${' '.repeat(indent)}`);
}

// Create a box border of appropriate width
export function createBoxBorder(char: '┌' | '└' | '│') {
    const width = Math.min(120, getTerminalWidth() - 2); // Max width of 120 or terminal width - 2
    return chalk.white(char === '│' ? char : char + '─'.repeat(width - 2) + (char === '┌' ? '┐' : '┘'));
}

export type Section = {
    emoji: string;
    label: string;
    content: string;
}

// Create a formatted help box with sections
export function createHelpBox(sections: Section[], isDangerous: boolean = false, dangerWarning: string = '') {
    const content = sections.map(section => {
        const color = section.label.startsWith('Error') ? 'redBright' : 
                     section.label.startsWith('Command') ? 'greenBright' :
                     section.label.startsWith('Arguments') ? 'yellowBright' : 'blueBright';
        
        const label = chalk[color](`${section.emoji} ${section.label}${!section.label.endsWith(':') ? ':' : ''}`);
        const content = section.label.startsWith('Command') ? chalk.bold(section.content) : section.content;
        
        return `${label}\n${content}`;
    }).join('\n\n');

    const boxContent = isDangerous 
        ? `${chalk.bgRed.white(' ⚠️  DANGER ')} ${chalk.red(dangerWarning)}\n\n${content}`
        : content;

    return boxen(boxContent, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'blue',
        title: chalk.blue('Command Help'),
        titleAlignment: 'center'
    });
} 