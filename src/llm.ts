import {getEnvironmentInfo} from './environments.ts'
import {calculateCost, validateJSONResponse} from './utils.ts'
import {createHelpBox} from './utils/formatting.ts'

type OpenAIMessage = { role: 'system' | 'user'; content: string };
type OpenAIQuestion = {
	model?: 'gpt-4';
	systemPrompt: string;
	query: string;
	max_tokens?: number;
	temperature?: number;
	responseFormat: any
}
export type ChatCompletionResponse = {
	id: string;
	object: string;
	created: number;
	model: string;
	choices: {
		index: number;
		message: {
			role: string;
			content: string | null;
			refusal: string | null;
		};
		logprobs: null;
		finish_reason: string;
	}[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
		prompt_tokens_details: {
			cached_tokens: number;
			audio_tokens: number;
		};
		completion_tokens_details: {
			reasoning_tokens: number;
			audio_tokens: number;
			accepted_prediction_tokens: number;
			rejected_prediction_tokens: number;
		};
	};
	system_fingerprint: string | null;
}

export async function askOpenAI({ model, systemPrompt, query, max_tokens, temperature, responseFormat }: OpenAIQuestion): Promise<{ cost: number, res: string | null }> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OpenAI API key is missing. Set it in your environment variables.");
	}
	const messages: OpenAIMessage[] = [
		{ role: 'system', content: `${systemPrompt}. Format your response exactly like this structure ${JSON.stringify(responseFormat)}` },
		{ role: 'user', content: query }
	]
	// Define the body of the request
	const body = {
		model: model || "gpt-4",
		messages: messages,
		max_tokens: max_tokens || 500,  // Adjust based on desired response length
		temperature: temperature || 0.5   // Adjust for creativity (0.5 is moderate)
	};

	// Perform the fetch request to OpenAI API
	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${apiKey}`
		},
		body: JSON.stringify(body)
	});

	// Check for successful response
	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.statusText}`);
	}

	const data = await response.json() as ChatCompletionResponse;
	return {
		res: data.choices[0].message.content,
		cost: calculateCost(data)
	};
}

export async function getHelpForFailedCommand({ command, errorOutput }: { command: string, errorOutput: string }) {
	const systemPrompt = `
		You are an experienced tutor specializing in command-line tools. Your task is to help the user understand why their command failed and guide them toward a correct solution.
		For the provided command and its error output, please:
		1. Identify and explain the error in the command.
		2. Provide a corrected version of the command. If the command is consider dangerous to the system, make sure to warn the user.
		3. Offer a detailed explanation of the command's arguments and options.
		4. Suggest best practices or tips to avoid similar errors in the future.
		
		When evaluating commands, be especially vigilant for dangerous operations such as:
		- Commands that could delete system files or entire directories (rm -rf /, rm -rf *)
		- Commands that could overwrite important files
		- Commands that could expose sensitive information
		- Commands that could cause system instability
		- Commands that could be used to attack the system, or in general security threats
		
		If you detect a dangerous command:
		- Set is_dangerous to true
		- Provide a clear warning in danger_warning explaining why it's dangerous
		- Suggest safer alternatives
		
		System Specifications:
		${JSON.stringify(getEnvironmentInfo(), null, 2)}
	`;

	const responseFormat = {
		error_explanation: "",
		corrected_command: "",
		arguments_explanation: "",
		best_practices: "",
		is_dangerous: false,
		danger_warning: ""
	}

	const results = await askOpenAI({ systemPrompt, query: `The command was: ${command}\nThe command error output is:\n${errorOutput}`, responseFormat });
	const res = validateJSONResponse<typeof responseFormat>(results.res, responseFormat);
	return {
		cost: results.cost,
		help: createHelpBox([
			{ emoji: '✅', label: 'Command', content: res.corrected_command },
			{ emoji: '❌', label: 'Error Details', content: res.error_explanation },
			{ emoji: '💡', label: 'Arguments', content: res.arguments_explanation },
			{ emoji: '🔧', label: 'Best Practices', content: res.best_practices }
		], res.is_dangerous, res.danger_warning)
	}
}

export async function getShortHelpForFailedCommand({ command, errorOutput }: { command: string, errorOutput: string }) {
	const systemPrompt = `
		You are an experienced tutor specializing in command-line tools. 
		Your task is to help the user understand why their command failed and guide them toward a correct solution.
		For the provided command and its error output, please:
		1. Explain the issue in the fewest words possible that makes sense.
		2. Provide the corrected command. If the command is consider dangerous to the system, make sure to warn the user.
		3. Summarize why it works in the fewest words possible that makes sense.
		4. Share one tip to avoid this in the future in the fewest words possible that makes sense.
		
		When evaluating commands, be especially vigilant for dangerous operations such as:
		- Commands that could delete system files or entire directories (rm -rf /, rm -rf *)
		- Commands that could overwrite important files
		- Commands that could expose sensitive information
		- Commands that could cause system instability
		- Commands that could be used to attack the system, or in general security threats
		
		If you detect a dangerous command:
		- Set is_dangerous to true
		- Provide a clear warning in danger_warning explaining why it's dangerous
		- Suggest safer alternatives
		
		System Specifications:
		${JSON.stringify(getEnvironmentInfo(), null, 2)}
	`;

	const responseFormat = {
		error_explanation: "",
		corrected_command: "",
		explanation: "",
		tips: "",
		is_dangerous: false,
		danger_warning: ""
	}

	const results = await askOpenAI({ systemPrompt, query: `The command was: ${command}\nThe command error output is:\n${errorOutput}`, responseFormat });
	const res = validateJSONResponse<typeof responseFormat>(results.res, responseFormat);
	return {
		cost: results.cost,
		help: createHelpBox([
			{ emoji: '✅', label: 'Command:', content: res.corrected_command },
			{ emoji: '❌', label: 'Issue:', content: res.error_explanation },
			{ emoji: '💡', label: 'Details:', content: res.explanation },
			{ emoji: '🔧', label: 'Tip:', content: res.tips }
		], res.is_dangerous, res.danger_warning)
	}
}

export async function compareCommandAndResults(
	{ correctCommands, userCommand, userCommandOutput }:
		{ correctCommands: string[], userCommand: string, userCommandOutput: string }): Promise<{equivalent: boolean; explanation: string}> {

	const systemPrompt = `
		You are an expert in Linux command-line tools. 
		Your task is to analyze a user-submitted command and compare it to the expected correct command.
		Don't be to strict, we need to make sure it fixed a broken command or ended up going around the problem
		vs being in the process of building it. 
		
		When evaluating commands, be especially vigilant for dangerous operations such as:
		- Commands that could delete system files or entire directories (rm -rf /, rm -rf *)
		- Commands that could overwrite important files
		- Commands that could expose sensitive information
		- Commands that could cause system instability
		
		For the given commands:
		1. Determine if the user's command is functionally equivalent to the original command.
		2. If equivalent, return "equivalent": true, explanation: ''.
		3. If incorrect, return "equivalent": false, explanation: 'short explanation on why it's not'.
	`;

	const responseFormat = { 
		equivalent: false, 
		explanation: "",
		is_dangerous: false,
		danger_warning: ""
	};

	const query = `
		Possible commands that would work: ${correctCommands.join()}
		User command: ${userCommand}
		User command output:\n${userCommandOutput}
	`;

	try {
		const results = await askOpenAI({ systemPrompt, query, responseFormat });
		return validateJSONResponse<typeof responseFormat>(results.res, responseFormat);
	} catch (error: any) {
		console.error(error);
		return { equivalent: false, explanation: "An error occurred while comparing the commands." };
	}
}

