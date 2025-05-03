import {Store} from './store.ts'
import chalk from 'chalk'
import readline from 'readline'
import {handleUserInput} from '../events.ts'
import {compareCommandAndResults} from '../llm.ts'
import {createProgressIndicator} from '../utils.ts'
import {
	createTaskChallengeBox,
	createSuccessBox,
	colors,
	styledPrompt
} from '../utils/formatting.ts'
import boxen from 'boxen'

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
			prompt: chalk.hex(colors.cyan).bold("❯ "), // Use colors from central palette
		});
		return new Promise<void>((resolve) => {
			this.print();
			this.promptReadline();
			this.startTypingTime = Date.now();
			this.store.startTest(this.command, this.description);

			this.rl?.on("line", async (line) => {
				const out = await handleUserInput(line, this.rl!);
				if (!out || out?.code !== 0) {
					this.store.addAttempt(
						line,
						out?.stdout,
						out?.stderr,
						'execution_error'
					);
					this.rl?.prompt();
					return;
				}
				
				const { command, code, stderr, stdout } = out;
				const pass = await this.assessCommand(command, stdout, stderr, code, this.correctCommands);
				
				if (pass) {
					const timeMs = Date.now() - this.startTypingTime!;
					this.store.addAttempt(
						line,
						stdout,
						stderr,
						undefined,
						timeMs,
						true
					);
					setTimeout(() => this.closeReadline(), 3500);
				} else {
					this.store.addAttempt(
						line,
						stdout,
						stderr,
						'incorrect_command'
					);
					this.promptReadline();
				}
			});

			this.rl?.on("close", () => {
				this.store.endTest();
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

	private print() {
		// Use the centralized formatting function
		const challengeBox = createTaskChallengeBox(this.description, this.command);
		
		console.log(challengeBox.header);
		console.log(challengeBox.content);
	}

	private async assessCommand(
		command: string,
		stdout: string,
		stderr: string,
		code: number | null,
		correctCommands: string[]) {
		if (correctCommands.includes(command)) {
			// Use the centralized success box formatting
			console.log(createSuccessBox('✅ CORRECT SOLUTION! Great job!'));
			return true;
		}
		
		const progress = createProgressIndicator("Assessing command output");
		
		if (stderr) {
			console.log(boxen(
				chalk.hex(colors.danger)(stderr),
				{
					padding: 1,
					margin: { top: 1, bottom: 0 },
					borderStyle: 'round',
					borderColor: '#B22222', // Fire Brick
					float: 'center'
				}
			));
		}
		
		if (stdout) {
			console.log(boxen(
				chalk.white(stdout),
				{
					padding: 1,
					margin: { top: 0, bottom: 1 },
					borderStyle: 'round',
					borderColor: '#708090', // Slate Gray
					float: 'center'
				}
			));
		}
		
		progress.start();
		try {
			const { equivalent, explanation } = await compareCommandAndResults({
				correctCommands: correctCommands,
				userCommand: command,
				userCommandOutput: stdout
			});
			
			if (equivalent) {
				progress.stop(`Test passed`, true);
				return true;
			} else {
				progress.stop(`Try again: ${explanation}`, false);
				return false;
			}
		} catch (error: any) {
			progress.stop("Failed to assess command", false);
			console.error(chalk.red(`Error: ${error.message}`));
			return false;
		}
	}
}
