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
    emoji?: string;
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
        ? `${chalk.white('!DANGER')} ${chalk.red(dangerWarning)}\n\n${content}`
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

// Color palette for consistent styling
export const colors = {
    primary: '#4169E1',    // Royal Blue
    secondary: '#1E90FF',  // Dodger Blue
    success: '#32CD32',    // Lime Green
    danger: '#FF4500',     // Orange Red
    warning: '#FF8C00',    // Dark Orange
    info: '#20B2AA',       // Light Sea Green
    purple: '#9370DB',     // Medium Purple
    cyan: '#00CED1',       // Turquoise
    headerText: '#FFFFFF', // White
    lightBg: '#F0F8FF',     // Alice Blue
    white: '#FFFFFF'
};

// Define a standard box width to be used across all components
export const STANDARD_WIDTH = Math.min(100, getTerminalWidth() - 10);

// New functions for consistent UI components

/**
 * Creates a main title banner with consistent styling
 */
export function createTitleBanner(title: string, color = colors.primary) {
    return boxen(
        chalk.bold(title), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'double',
        borderColor: color,
        textAlignment: 'center',
        width: STANDARD_WIDTH
    });
}

/**
 * Creates a section header with consistent styling
 */
export function createSectionHeader(title: string, emoji?: string, color = colors.info) {
    const displayTitle = emoji ? `${emoji}  ${title}  ${emoji}` : title;
    return chalk.hex(color).bold(`\n━━━ ${displayTitle} ━━━\n`);
}

/**
 * Creates an info box with proper styling
 */
export function createInfoBox(content: string | Section[], title?: string, color = colors.secondary) {
    let boxContent;
    
    if (typeof content === 'string') {
        boxContent = content;
    } else {
        // Format section content directly instead of using nested boxes
        boxContent = content.map(section => {
            const color = section.label.startsWith('Error') ? 'redBright' : 
                        section.label.startsWith('Command') ? 'greenBright' :
                        section.label.startsWith('Arguments') ? 'yellowBright' : 'blueBright';
            
            const label = chalk[color](`${section.emoji ?? ''} ${section.label}${!section.label.endsWith(':') ? ':' : ''}`);
            return `${label}\n${section.content}`;
        }).join('\n\n');
    }
    
    return boxen(
        boxContent, {
        padding: 1,
        margin: { top: 0, bottom: 1 },
        borderStyle: 'round',
        borderColor: color,
        width: STANDARD_WIDTH
    });
}

/**
 * Creates a warning/notification box
 */
export function createNotificationBox(content: string, color = colors.warning) {
    return boxen(
        chalk.bold(content), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: color,
        textAlignment: 'center',
        width: STANDARD_WIDTH
    });
}

/**
 * Creates a danger/warning box
 */
export function createDangerBox(content: string | Section[], title = 'WARNING', color = colors.danger) {
    let boxContent;
    
    if (typeof content === 'string') {
        boxContent = content;
    } else {
        // Format section content directly without a danger header
        boxContent = content.map(section => {
            return `${chalk.hex(color).bold(`${section.emoji ?? ''} ${section.label}:`)} ${section.content}`;
        }).join('\n\n');
    }
    
    return boxen(
        boxContent, {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: color,
        width: STANDARD_WIDTH
    });
}

/**
 * Creates a success box
 */
export function createSuccessBox(content: string, color = colors.success) {
    return boxen(
        chalk.bold(content), {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: color,
        textAlignment: 'center',
        width: STANDARD_WIDTH
    });
}

/**
 * Styled prompt message for consistency
 */
export function styledPrompt(message: string, color = colors.primary) {
    return chalk.hex(color).bold(message);
}

/**
 * Creates a task challenge box specifically for the test suite
 */
export function createTaskChallengeBox(description: string, command: string, category?: string) {
    let combined = `📝 Task Description:\n${description}\n\n🔄 Command To Fix:\n${chalk.hex(colors.warning)(command)}\n\n${chalk.bold('Type your corrected command below or "exit" to continue')}`;
    
    // Add category if provided
    if (category) {
        combined += `\n${chalk.italic.hex(colors.info)(`Category: ${category}`)}`;
    }
    
    return {
        header: boxen(
            chalk.bold('COMMAND CHALLENGE'), {
            padding: 1,
            margin: { top: 1, bottom: 0 },
            borderStyle: 'round',
            borderColor: '#6A5ACD', // SlateBlue
            textAlignment: 'center',
            width: STANDARD_WIDTH
        }),
        content: boxen(
            combined, {
            padding: 1,
            margin: { top: 0, bottom: 1 },
            borderStyle: 'round',
            borderColor: colors.secondary,
            width: STANDARD_WIDTH
        })
    };
} 