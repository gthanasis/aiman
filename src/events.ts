import chalk from "chalk";
import { runCommand } from "./commands.ts";
import readline from "readline";
import {getShortHelpForFailedCommand, getHelpForFailedCommand} from './llm.ts'
import ora from "ora";
import {createProgressIndicator} from './utils.ts'

// Simple logging wrapper
function logDebug(message: string) {
	// console.log(chalk.magenta(`[DEBUG ${new Date().toISOString()}] ${message}`));
}

// Handle user input
export async function handleUserInput(input: string, rl: readline.Interface, isLlmAssisted: boolean = true) {
	const command = input.trim();

	if (!command) {
		rl.prompt();
		return;
	}

	if (command.toLowerCase() === "exit") {
		console.log(chalk.cyan("\nGoodbye!"));
		rl.close();
		return;
	}

	const [executable, ...args] = command.split(" ");
	logDebug(`Executing: ${command}, LLM assistance: ${isLlmAssisted}`);

	try {
		// Execute the command and capture output
		const { stdout, stderr, code } = await runCommand(executable, args);
		logDebug(`Command execution complete. Exit code: ${code}, stdout length: ${stdout.length}, stderr length: ${stderr.length}`);

		// Always display output first
		if (stderr) {
			logDebug(`Displaying stderr in handleUserInput`);
			console[code !== 0 ? 'error': 'log'](`\n${chalk.red(stderr)}`);
		}
		if (stdout) {
			logDebug(`Displaying stdout in handleUserInput`);
			console.log(chalk.white(stdout));
		}

		// Provide LLM assistance for failed commands if enabled
		if (isLlmAssisted && code !== 0) {
			logDebug(`Command failed with LLM assistance enabled, requesting help`);
			await processCommandOutput(command, stderr, code);
		}

		return { command, stdout, stderr, code };
	} catch (error: any) {
		console.log(chalk.red(`❌ Command execution failed: ${error.message}\n`));
		rl.prompt();
	}
}

// Handle CLI exit
export function handleExit() {
	console.log(chalk.cyan("CLI closed."));
	process.exit(0);
}

// Process command output (async) - only for LLM assistance
async function processCommandOutput(command: string, stderr: string, code: number | null) {
	logDebug(`Inside processCommandOutput - command: ${command}, code: ${code}`);
	const progress = createProgressIndicator(
		"Fetching help from LLM for the failed command"
	);
	
	if (code !== 0) {
		logDebug(`Starting LLM help request`);
		progress.start();
		try {
			const {cost, help} = await getShortHelpForFailedCommand({ command, errorOutput: stderr });
			progress.stop(`Help fetched successfully! ($${cost.toFixed(4)})`, true);
			console.log(help)
		} catch (error: any) {
			progress.stop("Failed to fetch help from LLM", false);
			console.error(chalk.red(`Error: ${error.message}`));
		}
	}
}
