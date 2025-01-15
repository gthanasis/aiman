import {Store} from './store.ts'
import chalk from 'chalk'
import readline from 'readline'
import {handleUserInput} from '../events.ts'

interface TestProps {
	store: Store;
	description: string;
	command: string;
}

export class Test {
	private description: string;
	private command: string;
	private store: Store;
	private rl: readline.Interface | null = null;
	private startTypingTime: number | null = null;

	constructor({ store, description, command }: TestProps) {
		this.store = store;
		this.description = description;
		this.command = command;
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
			this.rl?.on("line", (line) => {
				if (!this.startTypingTime) {
					this.startTypingTime = Date.now(); // Record the time when the user starts typing
				}
				return handleUserInput(line, this.rl!);
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
	private print () {
		console.log(chalk.white("\n========================================================"));
		console.log(chalk.blueBright(this.description));
		console.log(chalk.white(this.command));
		console.log(chalk.white(`=====================${chalk.yellow(`[To continue/skip, type 'exit']`)}====\n`));
	}
}
