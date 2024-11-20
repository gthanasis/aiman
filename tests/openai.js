const os = require('os');

const openai = () => {};

openai.fetch = async (command, errorOutput) => {
    try {
        // Load the OpenAI API key from environment variables
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OpenAI API key is missing. Set it in your environment variables.");
        }

        // Capture terminal and OS information
        const osType = os.type(); // e.g., 'Linux', 'Darwin', 'Windows_NT'
        const osVersion = os.release();
        const terminal = process.env.TERM || "unknown"; // Use TERM env variable if available

        // Define the system prompt to guide the LLM in analyzing command errors
        const systemPrompt = `
            You are an experienced tutor specializing in command-line tools, particularly 'awk'. Your task is to help the user understand why their 'awk' command failed and guide them toward a correct solution.

            System Specifications:
            - OS: ${osType} ${osVersion}
            - Terminal: ${terminal}

            For the provided command and its error output, please:
            1. Identify and explain the error in the command.
            2. Provide a corrected version of the command.
            3. Offer a detailed explanation of the command's arguments and options.
            4. Suggest best practices or tips to avoid similar errors in the future.

            Format your response in JSON with the following keys: "error_explanation", "corrected_command", "arguments_explanation", "best_practices".
        `;

        // Define the body of the request
        const body = {
            model: "gpt-4",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `The command was: ${command}\nThe command error output is:\n${errorOutput}` }
            ],
            max_tokens: 500,  // Adjust based on desired response length
            temperature: 0.5   // Adjust for creativity (0.5 is moderate)
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

        // Parse the response data
        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return [
            { title: 'Error Explanation', content: result.error_explanation },
            { title: 'Corrected Command', content: result.corrected_command },
            { title: 'Arguments Explanation', content: result.arguments_explanation },
            { title: 'Best Practices', content: result.best_practices }
        ]
    } catch (error) {
        console.error("Error:", error);
        return `Error fetching explanation: ${error.message}`;
    }
};

module.exports = openai;
