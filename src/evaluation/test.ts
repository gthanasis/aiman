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
import { execSync } from 'child_process'

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
	private preCommand: string | null = null;

	constructor({ store, config }: TestProps) {
		this.store = store;
		this.name = config.name;
		this.description = config.description;
		this.command = config.command;
		this.correctCommands = config.correctCommands;
		this.isLlmAssisted = config.isLlmAssisted;
		this.category = config.category;
		this.availableCommands = getCommandsFromPath();
		this.preCommand = config.preCommand || null;
	}

	runPreCommand() {
		if (this.preCommand) {
			execSync(this.preCommand);
		}
	}

	run() {
		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: chalk.hex(colors.cyan).bold(wordingConfig.test.promptSymbol + " "), 
			completer: createCompleter(this.availableCommands)
		});

		// Handle Ctrl+C directly on the readline interface
		this.rl.on('SIGINT', () => {
			// disable ctrl+c
			// this.promptReadline();
		});

		return new Promise<void>((resolve) => {
			this.print();
			this.promptReadlineWithPrefill();
			this.startTypingTime = Date.now();
			this.store.startTest(this.name, this.description, this.isLlmAssisted, this.category);

			this.rl?.on("line", async (line) => {
				// Check if user wants to skip before processing
				if (line.trim().toLowerCase() === "skip") {
					// Record this as a skipped attempt
					this.store.addAttempt(
						line,
						'',
						'',
						'skipped'
					);
					// Close the test
					setTimeout(() => this.closeReadline(), 500);
					return;
				}

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
				if (!this.isSimilarCommand(command, this.correctCommands)) {
					this.promptReadline();
					return;
				}
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

	private promptReadlineWithPrefill() {
		this.rl?.prompt();
		// Prefill with the example command from the test configuration
		if (this.command) {
			this.rl?.write(this.command);
		}
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

		/**
	 * Calculates similarity between two strings (0-1)
	 * Uses Levenshtein distance normalized to string length
	 */
	private calculateSimilarity(str1: string, str2: string): number {
		// Convert both strings to lowercase for case-insensitive comparison
		const s1 = str1.toLowerCase();
		const s2 = str2.toLowerCase();
		
		// Calculate Levenshtein distance
		const track = Array(s2.length + 1).fill(null).map(() => 
			Array(s1.length + 1).fill(null));
		
		for (let i = 0; i <= s1.length; i += 1) {
			track[0][i] = i;
		}
		
		for (let j = 0; j <= s2.length; j += 1) {
			track[j][0] = j;
		}
		
		for (let j = 1; j <= s2.length; j += 1) {
			for (let i = 1; i <= s1.length; i += 1) {
				const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
				track[j][i] = Math.min(
					track[j][i - 1] + 1, // deletion
					track[j - 1][i] + 1, // insertion
					track[j - 1][i - 1] + indicator, // substitution
				);
			}
		}
		
		const distance = track[s2.length][s1.length];
		const maxLength = Math.max(s1.length, s2.length);
		
		// Return similarity as 1 - normalized distance
		return maxLength === 0 ? 1 : 1 - distance / maxLength;
	}

	private isSimilarCommand(command: string, correctCommands: string[]): boolean {
		return correctCommands.some(correctCommand => this.calculateSimilarity(command, correctCommand) > 0.8);
	}
}
