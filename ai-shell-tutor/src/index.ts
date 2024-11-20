import readline from "readline";
import { spawn } from "child_process";
import chalk from "chalk";

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

// Event listener for user input
rl.on("line", (line) => {
	const command = line.trim();

	if (command.toLowerCase() === "exit") {
		console.log(chalk.cyan("\nGoodbye!"));
		rl.close();
		return;
	}

	if (!command) {
		rl.prompt();
		return;
	}

	const [executable, ...args] = command.split(" ");

	// Attempt to spawn the command
	const child = spawn(executable, args, {
		stdio: "inherit", // Connect child's stdio to parent process
	});

	child.on("error", (err) => {
		if (err.message.includes("spawn")) {
			console.log(
				chalk.yellow(
					`⚠️ Command "${command}" appears to require a full terminal and is not currently supported.\n`
				)
			);
		} else {
			console.log(chalk.red(`❌ Command execution failed: ${err.message}\n`));
		}
		rl.prompt();
	});

	child.on("exit", (code) => {
		if (code === 0) {
			console.log(chalk.green("✅ Command executed successfully.\n"));
		} else {
			console.log(chalk.red(`❌ Command failed with exit code: ${code}\n`));
		}
		rl.prompt();
	});
});

// Event listener for closing the CLI
rl.on("close", () => {
	console.log(chalk.cyan("CLI closed."));
	process.exit(0);
});
