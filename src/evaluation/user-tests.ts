import chalk from "chalk";
import { Store } from "./store.ts";
import { input } from '@inquirer/prompts';
import { Test } from './test.ts';
import { QuestionnaireManager } from './questionnaire.ts';
import { 
    createTitleBanner, 
    createInfoBox, 
    createDangerBox, 
    createNotificationBox, 
    styledPrompt,
    Section 
} from '../utils/formatting.ts';

// Parse command line arguments
const args = process.argv.slice(2);
const skipQuestionnaires = args.includes('--skip-questionnaires') || args.includes('-s');
const testCountArg = args.find(arg => arg.startsWith('--test-count=') || arg.startsWith('-t='));
const noLlmAssistance = args.includes('--no-llm') || args.includes('-n');
const forceConditionOrder = args.find(arg => arg.startsWith('--condition-order='));
let testCount = 10; // Default number of tests

const store = new Store('./output/results.json');
const questionnaireManager = new QuestionnaireManager(store);

// Determine condition order - implement counterbalancing by default
let conditionOrder: 'traditional-first' | 'ai-first';

if (forceConditionOrder) {
    // If explicitly specified, use that order
    const orderValue = forceConditionOrder.split('=')[1].toLowerCase();
    conditionOrder = orderValue === 'traditional-first' ? 'traditional-first' : 'ai-first';
} else {
    // Implement counterbalancing - get opposite of the last user's condition
    const lastOrder = store.getLastUserConditionOrder();
    
    if (lastOrder === 'traditional-first') {
        conditionOrder = 'ai-first';
    } else if (lastOrder === 'ai-first') {
        conditionOrder = 'traditional-first';
    } else {
        // If no previous order or undefined, randomly select
        conditionOrder = Math.random() < 0.5 ? 'traditional-first' : 'ai-first';
    }
}

// Save the chosen order for this user
store.setConditionOrder(conditionOrder);

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
    console.log(chalk.bold('\nCLI Usability Study - Command Line Options:'));
    console.log(chalk.cyan('  --skip-questionnaires, -s') + ': Skip pre and post questionnaires');
    console.log(chalk.cyan('  --test-count=N, -t=N') + ':   Specify the number of tests to run (1-10)');
    console.log(chalk.cyan('  --no-llm, -n') + ':           Run tests without LLM assistance by default');
    console.log(chalk.cyan('  --condition-order=ORDER') + ': Force condition order (traditional-first or ai-first)');
    console.log(chalk.cyan('  --help, -h') + ':             Show this help text\n');
    process.exit(0);
}

if (testCountArg) {
    const countValue = testCountArg.split('=')[1];
    const parsedCount = parseInt(countValue, 10);
    if (!isNaN(parsedCount) && parsedCount > 0) {
        testCount = parsedCount;
    } else {
        console.log(chalk.yellow(`Invalid test count: ${countValue}. Using default of 10.`));
    }
}

console.clear();

// Use the centralized title banner function
console.log(createTitleBanner('CLI USABILITY STUDY'));

// Combined study information and data collection in one box
const combinedInfoSections: Section[] = [
    {
        emoji: "🔍",
        label: "About This Study",
        content: "This test evaluates how users interact with different CLI interfaces. You'll complete a series of command-line tasks in a structured environment."
    },
    {
        emoji: "📋",
        label: "Task Instructions",
        content: "• You will fix broken commands as they appear\n• The experimental CLI provides AI assistance for failed commands\n• Type 'exit' to complete a task and continue"
    },
    {
        emoji: "📊",
        label: "Data Collection Notice",
        content: "For research purposes, we'll record:\n• Commands and errors\n• Task completion times\n• Survey responses\n• Success rates and patterns"
    }
];

// Use the centralized info box function with combined sections
console.log(createInfoBox(combinedInfoSections, 'STUDY INFORMATION'));

// Skip questionnaires and consent if flag is provided
let proceed = 'yes';

if (!skipQuestionnaires) {
    // Consent prompt with centralized notification box
    console.log(createNotificationBox('Do you consent to participate and allow data collection?'));

    proceed = await input({ 
      message: styledPrompt('Enter "yes" to continue or "no" to exit:', '#FFFFFF') 
    });
}

if (proceed.toLowerCase() !== 'yes' && !skipQuestionnaires) {
    console.log(createDangerBox('You have declined to participate. The study has been terminated.'));
    process.exit(0);
}

// Run pre-questionnaire unless skipped
if (!skipQuestionnaires) {
    await questionnaireManager.runPreQuestionnaire();
}

// Test definitions
const tests = [
	new Test({
		store,
		description: 'We need to download https://example.com to output.html!\nCorrect the following command',
		command: 'curl -o',
		correctCommands: [
			'curl -o output.html https://example.com',
			'curl -o output.html http://example.com',
			'curl -o filename.html http://example.com',
			'curl -o filename.txt https://example.com'
		],
		isLlmAssisted: true
	}),
	new Test({
		store,
		description: 'We need to list and sort the files!\nCorrect the following command:',
		command: 'ls sort',
		correctCommands: ['ls | sort'],
		isLlmAssisted: true // No LLM assistance for this test
	}),
	new Test({
		store,
		description: 'We need to find all files that end in .txt!\nCorrect the following command:',
		command: 'find . --name*.txt',
		correctCommands: ['find . -name "*.txt"'],
		isLlmAssisted: true // Always use LLM for this test
	}),
	new Test({
		store,
		description: 'We need to list the first 5 lines of a file.txt!\nCorrect the following command:',
		command: 'head -line=5 file.txt',
		correctCommands: ['head -n 5 file.txt'],
		isLlmAssisted: true
	}),
	new Test({
		store,
		description: 'We need to count the number of lines in file.txt!\nCorrect the following command:',
		command: 'wc -k file.txt',
		correctCommands: [
			'wc -l file.txt',
			'cat file.txt | wc -l'
		],
		isLlmAssisted: true
	}),
	new Test({
		store,
		description: 'We need to check disk usage of the current directory!\nCorrect the following command:',
		command: 'du h .',
		correctCommands: [
			'du -h .',
			'du -sh .'
		],
		isLlmAssisted: false
	}),
	new Test({
		store,
		description: 'We need to create a new directory called projects!\nCorrect the following command:',
		command: 'mkdir projects -p',
		correctCommands: [
			'mkdir -p projects',
			'mkdir projects'
		],
		isLlmAssisted: false
	}),
	new Test({
		store,
		description: 'We need to check the currently logged-in users!\nCorrect the following command:',
		command: 'who all',
		correctCommands: [
			'who',
			'who -a'
		],
		isLlmAssisted: false
	}),
	new Test({
		store,
		description: 'We need to display the last 10 lines of a file named file.txt!\nCorrect the following command:',
		command: 'tail --lines=10 file.txt',
		correctCommands: [
			'tail -n 10 file.txt',
			'tail -10 file.txt'
		],
		isLlmAssisted: false
	}),
	new Test({
		store,
		description: 'We need to display disk space usage in human-readable format!\nCorrect the following command:',
		command: 'df size -h',
		correctCommands: [
			'df -h',
			'df -Th'
		],
		isLlmAssisted: false
	})
];

// Run tests, limiting to the specified count
const testsToRun = tests.slice(0, testCount);

// Sort tests based on condition order and LLM assistance
testsToRun.sort((a, b) => {
    // If traditional-first, non-LLM assisted tests should come first
    if (conditionOrder === 'traditional-first') {
        return a.isLlmAssisted === b.isLlmAssisted ? 0 : a.isLlmAssisted ? 1 : -1;
    } 
    // If ai-first, LLM assisted tests should come first
    else {
        return a.isLlmAssisted === b.isLlmAssisted ? 0 : a.isLlmAssisted ? -1 : 1;
    }
});

// Run test by awaiting each test
for (const test of testsToRun) {
	console.clear();
	await test.run();
}

// Run post-questionnaire unless skipped
if (!skipQuestionnaires) {
    await questionnaireManager.runPostQuestionnaire();

    // Use the centralized title banner function
    console.log(createTitleBanner('THANK YOU FOR YOUR PARTICIPATION!'));

    // Final message with centralized info box
    const completionSections: Section[] = [
        {
            emoji: "📈",
            label: "Research Impact",
            content: "Your responses will help improve CLI usability and AI assistance methods. We appreciate your valuable contribution to this research."
        }
    ];

    console.log(createInfoBox(completionSections, 'STUDY COMPLETION'));
} else {
    console.log(createTitleBanner('TEST COMPLETED'));
}
