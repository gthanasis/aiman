import chalk from "chalk";
import { Store } from "./store.ts";
import { input } from '@inquirer/prompts';
import {Test} from './test.ts'

const store = new Store('./output/results.csv');
console.clear();

// Banner message
console.log(chalk.white("\n=============================================="));
console.log(chalk.blueBright("Welcome to the TypeScript CLI Tool test suite"));
console.log(chalk.white("==============================================\n"));

const name = await input({ message: 'Enter your full name' });

console.clear();
console.log(chalk.blueBright(`Hello, ${name}`));
console.log(chalk.white(`This test is intended to simulate a user interacting with a CLI tool.
You will be asked to complete several tasks and will be presented with a cli interface.\n`));
console.log(chalk.blueBright("Instructions:"));
console.log(chalk.white(`- Most of the tasks are basically broken commands that you need to fix.
- In the experimental CLI each failed command will try to fetch help from LLM.
- Type 'exit' to close the session when the task has been completed.`));
console.log(chalk.yellow(`! Your actions will be recorded and stored for further analysis. !\n`))

// Ask a user if he agrees to proceed
const proceed = await input({ message: 'Do you agree to proceed? (yes/no)' });
if (proceed !== 'yes') {
	console.log(chalk.red('Goodbye!'));
	process.exit(0);
}
store.setUserName(name);
const tests = [
	new Test({
		store,
		description: 'We need to download https:/example.com to output.html!\nCorrect the following command',
		command: 'curl -o'
	}),
	new Test({
		store,
		description: 'We need to list and sort the files!\nCorrect the following command:',
		command: 'ls sort'
	}),
	new Test({
		store,
		description: 'We need to find all files that end in .txt!\nCorrect the following command:',
		command: 'find . --name*.txt'
	}),
	new Test({
		store,
		description: 'We need to list the first 5 lines of a file.txt!\nCorrect the following command:',
		command: 'head -line=5 file.txt'
	})
]

// Run test by awaiting each test
for (const test of tests) {
	console.clear();
	await test.run();
}
