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
import { TestConfig } from './config/tests.config.ts'
import { wordingConfig } from './config/wording.config.ts'
import { getCommandsFromPath, createCompleter } from '../utils/completer.ts'

interface TestProps {
	store: Store;
	config: TestConfig;
}

export class Test {
	private description: string;
	private command: string;
	private correctCommands: string[];
	private store: Store;
	private rl: readline.Interface | null = null;
	private startTypingTime: number | null = null;
	public isLlmAssisted: boolean;
	public category: string;
	public name: string;
	private availableCommands: string[] = [];

	constructor({ store, config }: TestProps) {
		this.store = store;
		this.name = config.name;
		this.description = config.description;
		this.command = config.command;
		this.correctCommands = config.correctCommands;
		this.isLlmAssisted = config.isLlmAssisted;
		this.category = config.category;
		this.availableCommands = getCommandsFromPath();
	}

	run() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: chalk.hex(colors.cyan).bold(wordingConfig.test.promptSymbol + " "), 
			completer: createCompleter(this.availableCommands)
		});
		return new Promise<void>((resolve) => {
			this.print();
			this.promptReadline();
			this.startTypingTime = Date.now();
			this.store.startTest(this.name, this.description, this.isLlmAssisted, this.category);

			this.rl?.on("line", async (line) => {
				const out = await handleUserInput(line, this.rl!, this.isLlmAssisted);
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
		const challengeBox = createTaskChallengeBox(
			this.description, 
			this.command,
			this.category
		);
		
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
			console.log(createSuccessBox(wordingConfig.test.correctSolutionMessage));
			return true;
		}
		
		const progress = createProgressIndicator(wordingConfig.test.assessingMessage);
		progress.start();
		
		try {
			const { equivalent, explanation } = await compareCommandAndResults({
				correctCommands: correctCommands,
				userCommand: command,
				userCommandOutput: stdout
			});
			
			if (equivalent) {
				progress.stop(wordingConfig.test.passedMessage, true);
				return true;
			} else {
				// Use a generic message that doesn't give hints
				progress.stop(wordingConfig.test.tryAgain, false);
				return false;
			}
		} catch (error: any) {
			progress.stop(wordingConfig.test.failedAssessmentMessage, false);
			console.error(chalk.red(`Error: ${error.message}`));
			return false;
		}
	}
}
