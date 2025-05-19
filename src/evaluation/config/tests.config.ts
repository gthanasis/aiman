export interface TestConfig {
  name: string;
  description: string;
  command: string;
  correctCommands: string[];
  isLlmAssisted: boolean;
  category: string;
  preCommand?: string;
}

/**
 * CLI Command Test Suite
 * 
 * Commands are selected based on research and common usage patterns from:
 * - Gharehyazie et al. (2016): Analysis of frequent command usage patterns
 * - Software Carpentry: Common Unix/Linux command curriculum
 * - Margono & Shneiderman (1987): Task categories for command-line interfaces
 * 
 * Categories include:
 * - File navigation: Moving between directories, listing files (cd, ls, pwd)
 * - File management: Creating, copying, moving files (mkdir, touch, cp, mv, rm)
 * - File search: Finding files with specific patterns (find, grep)
 * - File viewing: Examining file contents (cat, less, head, tail)
 * - Text processing: Manipulating file data (sort, uniq, wc, cut, awk, sed)
 * - System information: Getting system status (du, df, whoami, uptime)
 * - Process management: Managing running processes (ps, kill)
 * - Networking: Transferring files and data (curl, wget)
 */
export const tests: TestConfig[] = [
	// File navigation
	{
	  name: 'change_directory_with_spaces',
	  description: "We need to change to the directory named 'Project Files' which contains spaces!\nCorrect the following command:",
	  command: 'cd Project\ Files',
	  correctCommands: ['cd "Project Files"', "cd 'Project Files'", 'cd Project\\ Files'],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'mkdir -p "Project Files"'
	},
	{
	  name: 'list_files_by_size',
	  description: 'We need to list all files sorted by size (largest first) with human-readable sizes!\nCorrect the following command:',
	  command: 'ls -lS --size-human',
	  correctCommands: ['ls -lhS', 'ls -lah --sort=size', 'ls -la --sort=size -h'],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'dd if=/dev/zero of=large.bin bs=1M count=10 2>/dev/null; dd if=/dev/zero of=medium.bin bs=1M count=5 2>/dev/null; dd if=/dev/zero of=small.bin bs=10k count=1 2>/dev/null'
	},
  
	// File management
	{
		name: 'find_large_old_files',
		description: 'We need to find all files larger than 1MB that have not been accessed in the last 30 days and list them with their sizes!\nCorrect the following command:',
		command: 'find . -size +1M -atime 30 -ls',
		correctCommands: ['find . -size +1M -atime +30 -ls', 'find . -type f -size +1M -atime +30 -ls', 'find . -size +1M -atime +30 -exec ls -lh {} \\;'],
		isLlmAssisted: true,
		category: 'File management',
		preCommand: 'touch -d "60 days ago" largefile.dat && dd if=/dev/zero of=largefile.dat bs=1M count=2 2>/dev/null && touch -d "60 days ago" largefile.dat'
	},
	{
	  name: 'create_nested_directory_if_missing',
	  description: "We need to create a directory structure for a new project, but only create directories that don't already exist!\nCorrect the following command:",
	  command: 'mkdir src/components/buttons src/components/forms src/utils',
	  correctCommands: ['mkdir -p src/components/buttons src/components/forms src/utils'],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'mkdir -p src/components'
	},
	{
	  name: 'safe_copy_overwrite',
	  description: 'We need to copy a file interactively only if the target exists!\nCorrect the following command:',
	  command: 'cp -i backup.txt file.txt',
	  correctCommands: ['cp -i file.txt backup.txt'],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'touch file.txt'
	},
	{
	  name: 'copy_unique_lines',
	  description: 'We need to copy only unique lines from file1.txt to file2.txt (removing duplicates)!\nCorrect the following command:',
	  command: 'cat file1.txt | unique > file2.txt',
	  correctCommands: ['cat file1.txt | uniq > file2.txt', 'sort file1.txt | uniq > file2.txt', 'awk \'!seen[$0]++\' file1.txt > file2.txt'],
	  isLlmAssisted: true,
	  category: 'File management',
	  preCommand: 'echo -e "apple\nbanana\ncherry\nbanana\napple\ndate\ncherry" > file1.txt'
	},
  
	// File search & text search
	{
	  name: 'find_recent_text_files',
	  description: 'We need to find all .txt files modified in the last 7 days!\nCorrect the following command:',
	  command: 'find . -name "*.txt" -mtime < 7',
	  correctCommands: ['find . -name "*.txt" -mtime -7', 'find . -name "*.txt" -mtime 0', 'find . -name "*.txt" -mtime -7 -daystart'],
	  isLlmAssisted: true,
	  category: 'File search',
	  preCommand: 'touch test1.txt test2.txt example.log'
	},
	{
	  name: 'grep_with_context',
	  description: 'We need to search for the word "error" in log files with grep, showing 2 lines of context before and after each match!\nCorrect the following command:',
	  command: 'grep -c 2 "error" *.log',
	  correctCommands: ['grep -B 2 -A 2 "error" *.log', 'grep -C 2 "error" *.log', 'grep --context=2 "error" *.log'],
	  isLlmAssisted: true,
	  category: 'Text search',
	  preCommand: 'for i in {1..10}; do echo "Line $i"; done > app.log && echo "Line 11 with an error message" >> app.log && for i in {12..15}; do echo "Line $i"; done >> app.log'
	},
  
	// File viewing
	{
	  name: 'view_specific_lines',
	  description: "We need to extract lines 7-12 from a log file!\nCorrect the following command:",
	  command: 'head -n 12 log.txt | tail -n 7',
	  correctCommands: ['head -n 12 log.txt | tail -n 6', 'sed -n "7,12p" log.txt', 'awk "NR>=7 && NR<=12" log.txt'],
	  isLlmAssisted: true,
	  category: 'File viewing',
	  preCommand: 'for i in {1..20}; do echo "Line $i" >> log.txt; done'
	},
	{
	  name: 'monitor_log_changes',
	  description: 'We need to continuously monitor new entries in a log file, highlighting any lines containing "ERROR"!\nCorrect the following command:',
	  command: 'tail -f app.log | grep --color error',
	  correctCommands: ['tail -f app.log | grep --color=auto -i "ERROR"', 'tail -f app.log | grep --color=always -i "ERROR"', 'tail -f app.log | GREP_COLORS="ms=01;31" grep --color=always -i "ERROR"'],
	  isLlmAssisted: false,
	  category: 'File viewing',
	  preCommand: 'echo "Starting application..." > app.log && echo "INFO: Configuration loaded" >> app.log && echo "System initialized" >> app.log'
	},
  
	// Text processing
	{
	  name: 'count_non_empty_lines',
	  description: 'We need to count the number of non-empty lines in the log file!\nCorrect the following command:',
	  command: 'grep -v ^$ logfile.txt | wc -l',
	  correctCommands: ['grep -v "^$" logfile.txt | wc -l', 'sed "/^$/d" logfile.txt | wc -l', 'awk "NF" logfile.txt | wc -l', 'awk "NF > 0" logfile.txt | wc -l'],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'echo "Line 1" > logfile.txt && echo "" >> logfile.txt && echo "Line 3" >> logfile.txt && echo "" >> logfile.txt && echo "Line 5" >> logfile.txt'
	},
	{
	  name: 'sort_csv_by_number',
	  description: 'We need to sort this CSV file by the numeric values in the second column (descending order)!\nCorrect the following command:',
	  command: 'sort -k2 -r data.csv',
	  correctCommands: ['sort -t, -k2,2nr data.csv', 'sort -t, -k2nr data.csv', 'sort --field-separator=, -k2,2nr data.csv'],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'echo "apple,5,red" > data.csv && echo "banana,10,yellow" >> data.csv && echo "cherry,7,red" >> data.csv && echo "date,2,brown" >> data.csv'
	},
  
	// System information
	{
	  name: 'find_largest_subdirectories',
	  description: 'We need to find the top 3 largest subdirectories and show their sizes in human-readable format!\nCorrect the following command:',
	  command: 'du -h | sort -hr | head -3',
	  correctCommands: ['du -h --max-depth=1 | sort -hr | head -3', 'du -h --max-depth=1 . | sort -hr | head -n 3', 'du -d 1 -h | sort -hr | head -3'],
	  isLlmAssisted: false,
	  category: 'Disk usage',
	  preCommand: 'mkdir -p dir1 dir2 dir3 && dd if=/dev/zero of=dir1/file1 bs=1M count=5 2>/dev/null && dd if=/dev/zero of=dir2/file2 bs=1M count=10 2>/dev/null && dd if=/dev/zero of=dir3/file3 bs=1M count=2 2>/dev/null'
	},
	{
	  name: 'find_low_disk_space',
	  description: 'We need to identify filesystems with less than 20% free space remaining!\nCorrect the following command:',
	  command: 'df -h | awk \'$5 > "80%"\'',
	  correctCommands: ['df -h | awk \'$5 > "80%"\'', 'df -h | awk \'{if(NR>1)if($5+0>80)print}\' ', 'df -h | grep -E "[8-9][0-9]%|100%"'],
	  isLlmAssisted: false,
	  category: 'Disk space'
	},
  
	// Process management
	{
	  name: 'find_memory_intensive_processes',
	  description: 'We need to find the top 5 processes consuming the most memory!\nCorrect the following command:',
	  command: 'ps aux | sort -k4 -r | head -5',
	  correctCommands: ['ps aux --sort=-%mem | head -5', 'ps aux | sort -k4nr | head -5', 'ps -eo pid,ppid,cmd,%mem --sort=-%mem | head -5'],
	  isLlmAssisted: false,
	  category: 'Process management'
	},
  
	// Networking
	{
	  name: 'download_with_retry',
	  description: 'We need to download a file, automatically retrying up to 3 times if it fails, and showing a progress bar!\nCorrect the following command:',
	  command: 'curl --retry 3 -o data.json https://api.example.com/data',
	  correctCommands: ['curl --retry 3 --progress-bar -o data.json https://api.example.com/data', 'curl -L --retry 3 --progress-bar -o data.json https://api.example.com/data', 'wget -t 3 --show-progress -O data.json https://api.example.com/data'],
	  isLlmAssisted: true,
	  category: 'Networking'
	},
	{
	  name: 'find_user_login_history',
	  description: 'We need to see login history for a specific user (jsmith) during the last week!\nCorrect the following command:',
	  command: 'last jsmith | head -n 7',
	  correctCommands: ['last jsmith -s -7days', 'last jsmith -t $(date -d "7 days ago" +\\%Y\\%m\\%d)', 'last jsmith | grep -E "$(date +"%b %d"|%d" +"%b")" | head -n 20'],
	  isLlmAssisted: false,
	  category: 'System information'
	}
  ];
  