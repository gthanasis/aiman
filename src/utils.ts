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



