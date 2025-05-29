import readline from "readline";
import chalk from "chalk";
import { handleUserInput, handleExit } from "./events.ts";
import { getCommandsFromPath, createCompleter } from "./utils/completer.ts";
import { setupCtrlCHandler } from "./utils.ts";

// Cache the commands for better performance
const availableCommands = getCommandsFromPath();

// Create a readline interface for input/output
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: chalk.greenBright("> "),
	completer: createCompleter(availableCommands)
});

// Parse command line arguments for LLM assistance
const args = process.argv.slice(2);
const noLlmAssistance = args.includes('--no-llm') || args.includes('-n');

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
	console.log(chalk.bold('\nTypeScript CLI Tool - Command Line Options:'));
	console.log(chalk.cyan('  --no-llm, -n') + ': Disable LLM assistance');
	console.log(chalk.cyan('  --help, -h') + ': Show this help text\n');
	process.exit(0);
}

// Set up graceful Ctrl+C handling
setupCtrlCHandler('⚠️  Press Ctrl+C again within 2 seconds to exit.');

// Banner message
console.log(chalk.blueBright("Welcome to the TypeScript CLI Tool!"));
console.log(chalk.yellow("Type commands to execute them in the OS shell."));
console.log(chalk.magentaBright("Type 'exit' to quit.\n"));

// Start the prompt
rl.prompt();

// Register event listeners
rl.on("line", async (line) => {
	await handleUserInput(line, rl, !noLlmAssistance)
	rl.prompt();
});
rl.on("close", handleExit);

