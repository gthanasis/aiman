## Brief
We have a cli environment in which we invoke chatGPT in case the command 
fails to get back a corrected command and an explanation of why and some 
best practises for the user to learn. The goal here is to evaluate the use 
of genAI when a user is stuck in a command error and probably needs the 
documentation to solve it. The tool is picking up the error and suggesting 
the correct command. All the commands given the user are mostly display commands
and won't alter the system

## Testing framework
We will use the following testing framework to evaluate the user experience:
1. With each test the user needs to provide feedback on the following:
    - Were you able to find the correct command? If yes please provide the command.
    - Why was it failing?
    - What was the command trying to do?

### User Tests (Explained)
1. Incorrect flag usage
```bash
grep -rec "aiman-non-existent-string" todo.md
```
This command attempts to recursively search for the word "error" in files, but the flag -rec is invalid.
NOTES: User could be using the -c to count but also count be using -r to search recursively. We need to
suggest the correct flag to use or make sure we address both possibilities.

2. Missing Required Argument
```bash
curl -o
```
The curl command with the -o flag is missing the required filename argument for the output file.

3. Incorrect Command Order
```bash
ls sort
```
The user is likely trying to list files and sort them, but sort is not a valid argument for ls.

4. Invalid Argument Format
```bash
find . --name*.txt
```
The user is attempting to search for all .txt files using find, but the --name*.txt syntax is invalid.

5. Confusion Between Similar Flags
```bash
head --lines=5 file.txt
```
The user is trying to display the first 5 lines of file.txt but mistakenly uses --lines instead of -n (POSIX-compliant head implementation).

6. Unrecognized Subcommand
```bash
git clone --repo https://github.com/user/repo.git
```
The user is attempting to clone a Git repository but mistakenly adds a non-existent flag --repo.
