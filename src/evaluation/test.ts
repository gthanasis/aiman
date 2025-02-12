import {Store} from './store.ts'
import chalk from 'chalk'
import readline from 'readline'
import {handleUserInput} from '../events.ts'
import {compareCommandAndResults} from '../llm.ts'
import {createProgressIndicator} from '../utils.ts'

interface TestProps {
	store: Store;
	description: string;
	command: string;
	correctCommands: string[];
}

export class Test {
	private description: string;
	private command: string;
	private correctCommands: string[];
	private store: Store;
	private rl: readline.Interface | null = null;
	private startTypingTime: number | null = null;

	constructor({ store, description, command, correctCommands }: TestProps) {
		this.store = store;
		this.description = description;
		this.command = command;
		this.correctCommands = correctCommands;
	}

	run() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: chalk.greenBright("> "),
		});
		return new Promise<void>((resolve) => {
			this.print();
			this.promptReadline();
			this.rl?.on("line", async (line) => {
				if (!this.startTypingTime) {
					this.startTypingTime = Date.now(); // Record the time when the user starts typing
				}
				const out = await handleUserInput(line, this.rl!);
				if (!out || out?.code !== 0) {
					this.rl?.prompt();
					return;
				}
				const { command, code, stderr, stdout } = out;
				const pass = await this.assessCommand(command, stdout, stderr, code, this.correctCommands);
				pass ? setTimeout(() => this.closeReadline(), 3500) : this.promptReadline();
			});
			this.rl?.on("close", () => {
				if (this.startTypingTime) {
					const timeTaken = `${Date.now() - this.startTypingTime}ms`;
					const sanitizedDescription = this.description.replace(/\n/g, ' ');
					this.store.addMetricForTest(sanitizedDescription, 'timeTaken', timeTaken);
				}
				return resolve();
			});
		})
	}

	private promptReadline() {
		this.rl?.prompt();
	}
	private closeReadline() {
		this.rl?.close();
	}
	private print () {
		console.log(chalk.white("\n========================================================"));
		console.log(chalk.blueBright(this.description));
		console.log(chalk.white(this.command));
		console.log(chalk.white(`=====================${chalk.yellow(`[To continue/skip, type 'exit']`)}====\n`));
	}
	private async assessCommand(
		command: string,
		stdout: string,
		stderr: string,
		code: number | null,
		correctCommands: string[]) {
		if (correctCommands.includes(command)) {
			return true
		}
		const progress = createProgressIndicator(
			"Assessing command output"
		);
		if (stderr) {
			console[code !== 0 ? 'error': 'log'](`\n${chalk.red(stderr)}`);
		}
		if (stdout) {
			console.log(chalk.white(stdout));
		}
		progress.start();
		try {
			const { equivalent, explanation } = await compareCommandAndResults({
				correctCommands: correctCommands,
				userCommand: command,
				userCommandOutput: stdout
			});
			equivalent
				? progress.stop(`Test passed`, true)
				: progress.stop(`Try again: ${explanation}`, true);
			return equivalent
		} catch (error: any) {
			progress.stop("Failed to assess command", false);
			console.error(chalk.red(`Error: ${error.message}`));
			return false
		}
	}

}
