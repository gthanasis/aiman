import chalk from "chalk";
import {ChatCompletionResponse} from './llm.ts'

// Utility for logging
export function logInfo(message: string) {
	console.log(chalk.blue(message));
}

export function logError(message: string) {
	console.error(chalk.red(message));
}

export function logWarning(message: string) {
	console.warn(chalk.yellow(message));
}

export function calculateCost(response: ChatCompletionResponse): number {
	const promptTokens = response.usage.prompt_tokens;
	const completionTokens = response.usage.completion_tokens;

	// Pricing details for GPT-4 (adjust if needed)
	const promptRatePerThousand = 0.003; // $0.003 per 1k prompt tokens
	const completionRatePerThousand = 0.009; // $0.009 per 1k completion tokens

	const promptCost = (promptTokens / 1000) * promptRatePerThousand;
	const completionCost = (completionTokens / 1000) * completionRatePerThousand;
	const totalCost = promptCost + completionCost;

	return totalCost;
}

export function validateJSONResponse<ReturnType = any>(response: any, responseFormat: any): ReturnType {
	let res = ''
	try {
		res = JSON.parse(response);
	} catch (error: any) {
		throw new Error(`Response is not a valid JSON: ${error.message}. Response: ${response}`);
	}
	// Check if the response has the expected structure
	if (JSON.stringify(Object.keys(res).sort()) !== JSON.stringify(Object.keys(responseFormat).sort())) {
		throw new Error(`Response does not match the expected format: ${JSON.stringify(responseFormat)}`);
	}
	return res as ReturnType;
}

// Text-based progress indicator

export function createProgressIndicator(text: string, intervalMs: number = 500) {
	let dots = "";
	let animationIndex = 0;
	const animations = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
	let interval: NodeJS.Timeout;

	// Start the progress indicator
	const start = () => {
		process.stdout.write(chalk.blue(`${animations[animationIndex]} ${text}${dots}`));
		interval = setInterval(() => {
			dots = dots.length < 3 ? dots + "." : "";
			animationIndex = (animationIndex + 1) % animations.length;
			process.stdout.clearLine(0); // Clear the current line
			process.stdout.cursorTo(0); // Move to the start of the line
			process.stdout.write(chalk.blue(`${animations[animationIndex]} ${text}${dots}`));
		}, intervalMs);
	};

	// Stop the progress indicator
	const stop = (successText?: string, isSuccess: boolean = true) => {
		if (interval) clearInterval(interval);
		process.stdout.clearLine(0); // Clear the current line
		process.stdout.cursorTo(0); // Move to the start of the line
		if (successText) {
			const icon = isSuccess ? "✨" : "❌";
			console.log(isSuccess ? chalk.green(`${icon} ${successText}`) : chalk.red(`${icon} ${successText}`));
		}
	};

	return { start, stop };
}

/**
 * Sets up graceful Ctrl+C handling to prevent accidental exits
 * Requires two Ctrl+C presses within 2 seconds to actually exit
 * @param customMessage Optional custom message to show on first interrupt
 * @param onExit Optional callback to run before exiting
 */
export function setupCtrlCHandler(customMessage?: string, onExit?: () => void): () => void {
	let firstInterrupt = true;
	
	const handler = () => {
		if (firstInterrupt) {
			const message = customMessage || '⚠️  Press Ctrl+C again within 2 seconds to exit.';
			console.log(chalk.yellow(`\n${message}`));
			firstInterrupt = false;
			setTimeout(() => {
				firstInterrupt = true;
			}, 2000);
		} else {
			console.log(chalk.cyan('\n👋 Exiting...'));
			if (onExit) {
				try {
					onExit();
				} catch (error) {
					console.error(chalk.red('Error during cleanup:'), error);
				}
			}
			process.exit(0);
		}
	};
	
	// Remove any existing SIGINT listeners to avoid conflicts
	process.removeAllListeners('SIGINT');
	process.on('SIGINT', handler);
	
	// Return cleanup function
	return () => {
		process.removeListener('SIGINT', handler);
	};
}



