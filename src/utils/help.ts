import chalk from "chalk";

/**
 * Process help command (early exit)
 * @param args 
 */
export function checkForHelpCommand (args: string[]) {
    if (args.includes('--help') || args.includes('-h')) {
        console.log(chalk.bold('\nCLI Usability Study - Command Line Options:'));
        console.log(chalk.cyan('  --skip-questionnaires, -s') + ': Skip pre and post questionnaires');
        console.log(chalk.cyan('  --test-count=N, -t=N') + ':   Specify the number of tests to run (1-10)');
        console.log(chalk.cyan('  --no-llm, -n') + ':           Run tests without LLM assistance by default');
        console.log(chalk.cyan('  --condition-order=ORDER') + ': Force condition order (traditional-first or ai-first)');
        console.log(chalk.cyan('  --help, -h') + ':             Show this help text\n');
        process.exit(0);
    }
}