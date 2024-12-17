import readline from "readline";
import chalk from "chalk";
import { handleUserInput, handleExit } from "./events.ts";

// Create a readline interface for input/output
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: chalk.greenBright("> "),
});

// Banner message
console.log(chalk.blueBright("Welcome to the TypeScript CLI Tool!"));
console.log(chalk.yellow("Type commands to execute them in the OS shell."));
console.log(chalk.magentaBright("Type 'exit' to quit.\n"));

// Start the prompt
rl.prompt();

// Register event listeners
rl.on("line", (line) => handleUserInput(line, rl));
rl.on("close", handleExit);

// Test commands
// Non-existent file
// awk -F, '{print $2}' ../tests/nonexistent.csv

// File missing the expected field ($1)
// awk '$1 == "John" {print $0}' ../tests/data.txt

// Syntax error in the BEGIN block
// awk 'BEGIN{IGNORECASE 1} /error/ {print $0}' ../tests/logs.txt

// Referencing a non-numeric field for summation ($2 might be non-numeric)
// awk 'BEGIN {sum = 0} {sum += $2} END {print sum}' ../tests/text_numbers.txt

// File has less than 3 fields per line
// awk 'NF >= 3 {print $3}' ../tests/short_data.txt

// $2 field doesn't exist in the file
// awk '{print substr($2, 1, 5)}' ../tests/missing_field.txt

// Missing END block causes premature termination (logical issue)
// awk 'BEGIN {print "Header Line"} {print $0} END' ../tests/data.txt

// Invalid substitution variables (undefined variables `foo` and `bar`)
// awk 'BEGIN {foo="foo"; bar} {gsub(foo, bar, $1); print $0}' ../tests/data.txt

// File missing second field ($2)
// awk '{printf "%s\t%s\n", $1, $2}' ../tests/incomplete_data.txt

