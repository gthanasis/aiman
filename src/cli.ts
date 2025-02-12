import readline from "readline";
import chalk from "chalk";
import { handleUserInput, handleExit } from "./events.ts";

// Create a readline interface for input/output
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: chalk.greenBright("> "),
});

// Banner message
console.log(chalk.blueBright("Welcome to the TypeScript CLI Tool!"));
console.log(chalk.yellow("Type commands to execute them in the OS shell."));
console.log(chalk.magentaBright("Type 'exit' to quit.\n"));

// Start the prompt
rl.prompt();

// Register event listeners
rl.on("line", async (line) => {
	await handleUserInput(line, rl)
	rl.prompt();
});
rl.on("close", handleExit);

