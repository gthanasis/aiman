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
		description: 'We need to download https://example.com to output.html!\nCorrect the following command',
		command: 'curl -o',
		correctCommands: [
			'curl -o output.html https://example.com',
			'curl -o output.html http://example.com',
			'curl -o filename.html http://example.com',
			'curl -o filename.txt https://example.com'
		]
	}),
	new Test({
		store,
		description: 'We need to list and sort the files!\nCorrect the following command:',
		command: 'ls sort',
		correctCommands: ['ls | sort']
	}),
	new Test({
		store,
		description: 'We need to find all files that end in .txt!\nCorrect the following command:',
		command: 'find . --name*.txt',
		correctCommands: ['find . -name "*.txt"']
	}),
	new Test({
		store,
		description: 'We need to list the first 5 lines of a file.txt!\nCorrect the following command:',
		command: 'head -line=5 file.txt',
		correctCommands: ['head -n 5 file.txt']
	}),
	new Test({
		store,
		description: 'We need to count the number of lines in file.txt!\nCorrect the following command:',
		command: 'wc -k file.txt',
		correctCommands: [
			'wc -l file.txt',
			'cat file.txt | wc -l'
		]
	}),
	new Test({
		store,
		description: 'We need to check disk usage of the current directory!\nCorrect the following command:',
		command: 'du h .',
		correctCommands: [
			'du -h .',
			'du -sh .'
		]
	}),
	new Test({
		store,
		description: 'We need to create a new directory called projects!\nCorrect the following command:',
		command: 'mkdir projects -p',
		correctCommands: [
			'mkdir -p projects',
			'mkdir projects'
		]
	}),
	new Test({
		store,
		description: 'We need to check the currently logged-in users!\nCorrect the following command:',
		command: 'who all',
		correctCommands: [
			'who',
			'who -a'
		]
	}),
	new Test({
		store,
		description: 'We need to display the last 10 lines of a file named file.txt!\nCorrect the following command:',
		command: 'tail --lines=10 file.txt',
		correctCommands: [
			'tail -n 10 file.txt',
			'tail -10 file.txt'
		]
	}),
	// new Test({
	// 	store,
	// 	description: 'We need to compress a directory named data using gzip!\nCorrect the following command:',
	// 	command: 'gzip data',
	// 	correctCommands: [
	// 		'tar -czvf data.tar.gz data',
	// 		'zip -r data.zip data'
	// 	]
	// }),
	new Test({
		store,
		description: 'We need to find all processes running by user "john"!\nCorrect the following command:',
		command: 'ps -U john all',
		correctCommands: [
			'ps -u john',
			'ps aux | grep john'
		]
	}),
	new Test({
		store,
		description: 'We need to schedule a command to run in 10 minutes using at!\nCorrect the following command:',
		command: 'at now+10 command.sh',
		correctCommands: [
			'echo "command.sh" | at now +10 minutes',
			'echo "sh command.sh" | at now +10 min'
		]
	}),
	new Test({
		store,
		description: 'We need to display disk space usage in human-readable format!\nCorrect the following command:',
		command: 'df size -h',
		correctCommands: [
			'df -h',
			'df -Th'
		]
	})
];


// Run test by awaiting each test
for (const test of tests) {
	console.clear();
	await test.run();
}
