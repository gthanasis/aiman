import {getEnvironmentInfo} from './environments.ts'
import {calculateCost, validateJSONResponse} from './utils.ts'
import chalk from 'chalk'

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
		2. Provide a corrected version of the command.
		3. Offer a detailed explanation of the command's arguments and options.
		4. Suggest best practices or tips to avoid similar errors in the future.
		
		System Specifications:
		${JSON.stringify(getEnvironmentInfo(), null, 2)}
	`;

	const responseFormat = {
		error_explanation: "",
		corrected_command: "",
		arguments_explanation: "",
		best_practices: ""
	}

	const results = await askOpenAI({ systemPrompt, query: `The command was: ${command}\nThe command error output is:\n${errorOutput}`, responseFormat });
	const res = validateJSONResponse<typeof responseFormat>(results.res, responseFormat);
	return {
		cost: results.cost,
		help: `
Here are some suggestions to help you with the failed command

${chalk.greenBright('Corrected Command:')}
${res.corrected_command}

${chalk.redBright('Error Explanation:')}
${res.error_explanation}

${chalk.yellowBright('Arguments Explanation:')}
${res.arguments_explanation}

${chalk.blueBright('Best Practices:')}
${res.best_practices}
`
	}
}
export async function getShortHelpForFailedCommand({ command, errorOutput }: { command: string, errorOutput: string }) {
	const systemPrompt = `
		You are an experienced tutor specializing in command-line tools. 
		Your task is to help the user understand why their command failed and guide them toward a correct solution.
		For the provided command and its error output, please:
		1. Explain the issue in the fewest words possible that makes sense.
		2. Provide the corrected command.
		3. Summarize why it works in the fewest words possible that makes sense.
		4. Share one tip to avoid this in the future in the fewest words possible that makes sense.
		
		System Specifications:
		${JSON.stringify(getEnvironmentInfo(), null, 2)}
	`;

	const responseFormat = {
		error_explanation: "",
		corrected_command: "",
		explanation: "",
		tips: ""
	}

	const results = await askOpenAI({ systemPrompt, query: `The command was: ${command}\nThe command error output is:\n${errorOutput}`, responseFormat });
	const res = validateJSONResponse<typeof responseFormat>(results.res, responseFormat);
	return {
		cost: results.cost,
		help: `${chalk.greenBright('✅ Corrected Command:')} ${chalk.bold(res.corrected_command)}
${chalk.redBright('❌ Error:')} ${res.error_explanation}
${chalk.yellowBright('💡 Why It Works:')} ${res.explanation}
${chalk.blueBright('🔧 Tip:')} ${res.tips}
`
	}
}
