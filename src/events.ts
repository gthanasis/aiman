import chalk from "chalk";
import { runCommand } from "./commands.ts";
import readline from "readline";
import {getHelpForFailedCommand} from './llm.ts'
import ora from "ora";
import {createProgressIndicator} from './utils.ts'

// Handle user input
export async function handleUserInput(input: string, rl: readline.Interface) {
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

	try {
		// Execute the command and capture output
		const { stdout, stderr } = await runCommand(executable, args);

		// // Intercept output and perform async operations
		await processCommandOutput(command, stdout, stderr);

		rl.prompt();
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

// Process command output (async)
async function processCommandOutput(command: string, stdout: string, stderr: string) {
	const progress = createProgressIndicator(
		"Fetching help from LLM for the failed command"
	);
	if (stderr) {
		console.error(`\n${chalk.red(stderr)}`);
		progress.start();
		try {
			const {cost, help} = await getHelpForFailedCommand({ command, errorOutput: stderr });
			progress.stop(`Help fetched successfully! ($${cost.toFixed(4)})`, true);
			console.log(help)
		} catch (error: any) {
			progress.stop("Failed to fetch help from LLM", false);
			console.error(chalk.red(`Error: ${error.message}`));
		}
	}
	if (stdout) {
		console.log(chalk.white(stdout));
	}
}
