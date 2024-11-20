#!/usr/bin/env node

// Create an array of these tasks with the commands only
// Task 1: Fix missing delimiter in CSV: awk -F, '{print $2}' data.csv.
// Task 2: Add braces for action: awk '$1 == "John" {print $0}' data.txt.
// Task 3: Use IGNORECASE for regex: awk 'BEGIN{IGNORECASE=1} /error/ {print $0}' logs.txt.
// Task 4: Initialize variables for summation: awk 'BEGIN {sum = 0} {sum += $2} END {print sum}' numbers.txt.
// Task 5: Check field existence before printing: awk 'NF >= 3 {print $3}' data.txt.
// Task 6: Use substr correctly: awk '{print substr($2, 1, 5)}' data.txt.
// Task 7: Add header using BEGIN: awk 'BEGIN {print "Header Line"}; {print $0}' data.txt.
// Task 8: Initialize variables for gsub: awk 'BEGIN {foo="foo"; bar="bar"} {gsub(foo, bar, $1); print $0}' data.txt.
// Task 9: Use printf for formatted output: awk '{printf "%s\t%s\n", $1, $2}' data.txt.

const openai = require('./openai.js');
const commandWrapper = require('./command-wrapper.js');
const userTasksCommands = [
    {
        "command": "awk",
        "arguments": ["-F,", "{print $2}", "data.csv"]
    },
    {
        "command": "awk",
        "arguments": ["'$1 == \"John\" {print $0}'", "data.txt"]
    },
    {
        "command": "awk",
        "arguments": ["BEGIN{IGNORECASE=1}", "/error/", "{print $0}", "logs.txt"]
    },
    {
        "command": "awk",
        "arguments": ["BEGIN {sum = 0}", "{sum += $2}", "END {print sum}", "numbers.txt"]
    },
    {
        "command": "awk",
        "arguments": ["NF >= 3 {print $3}", "data.txt"]
    },
    {
        "command": "awk",
        "arguments": ["{print substr($2, 1, 5)}", "data.txt"]
    },
    {
        "command": "awk",
        "arguments": ["BEGIN {print \"Header Line\"}", "{print $0}", "data.txt"]
    },
    {
        "command": "awk",
        "arguments": ["BEGIN {foo=\"foo\"; bar=\"bar\"}", "{gsub(foo, bar, $1); print $0}", "data.txt"]
    },
    {
        "command": "awk",
        "arguments": ["{printf \"%s\\t%s\\n\", $1, $2}", "data.txt"]
    }
];


const run = async () => {
    for (const command of userTasksCommands) {
        console.log('Command:', `${command.command} ${command.arguments}`);
        console.log('------------------------')
        const results = await commandWrapper(command.command, command.arguments, openai);
        if (results.suggestions && results.suggestions.length > 0) {
            results.suggestions.forEach((suggestion) => {
                console.log(`\u2705  ${suggestion.title}`);
                console.log(suggestion.content);
                console.log('\n');
            });
        } else {
            console.log(results);
        }
    }
}

run();
