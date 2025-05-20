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
	  correctCommands: [
		'cd "Project Files"', 
		"cd 'Project Files'", 
		'cd Project\\ Files'
	  ],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'mkdir -p "Project Files"'
	},
	{
	  name: 'list_files_by_size',
	  description: 'We need to list all files sorted by size (largest first) with human-readable sizes!\nCorrect the following command:',
	  command: 'ls -lS --size-human',
	  correctCommands: [
		'ls -lhS', 
		'ls -lah --sort=size', 
		'ls -la --sort=size -h',
		'ls -lSh',
		'ls --human-readable -lS',
		'find . -type f -maxdepth 1 -exec ls -lh {} \; | sort -k5,5h -r',
		'ls -l | sort -k5,5nr | numfmt --field=5 --to=iec',
		'find . -maxdepth 1 -type f -printf "%s %p\n" | sort -nr | cut -d" " -f2- | xargs ls -lh',
		'ls -l --human-readable --sort=size'
	  ],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'dd if=/dev/zero of=large.bin bs=1M count=10 2>/dev/null; dd if=/dev/zero of=medium.bin bs=1M count=5 2>/dev/null; dd if=/dev/zero of=small.bin bs=10k count=1 2>/dev/null'
	},
  
	// File management
	{
		name: 'find_empty_directories',
		description: 'We need to find and remove all empty directories under the current directory!\nCorrect the following command:',
		command: 'find . -type d -empty --delete',
		correctCommands: [
			'find . -type d -empty -delete', 
			'find . -depth -type d -empty -delete', 
			'find . -mindepth 1 -type d -empty -exec rmdir {} \\;',
			'find . -type d -empty | xargs rmdir',
			'find . -type d -empty -print0 | xargs -0 rmdir',
			'find . -type d -empty -prune -exec rmdir {} \\;',
			'find . -type d -empty -not -path "." -delete',
			'find . -type d -empty -execdir rmdir {} \\;',
			'find . -type d -empty | while read dir; do rmdir "$dir"; done',
			'for d in $(find . -type d); do [ -z "$(ls -A "$d")" ] && rmdir "$d"; done',
			'find . -depth -type d -exec rmdir --ignore-fail-on-non-empty {} \\;'
		],
		isLlmAssisted: true,
		category: 'File management',
		preCommand: 'mkdir -p empty_dir1 empty_dir2 dir3/empty_subdir && touch dir3/file.txt'
	},
	{
	  name: 'create_nested_directory_if_missing',
	  description: "We need to create a directory structure for a new project, but only create directories that don't already exist!\nCorrect the following command:",
	  command: 'mkdir src/components/buttons src/components/forms src/utils',
	  correctCommands: [
		'mkdir -p src/components/buttons src/components/forms src/utils',
		'install -d src/components/buttons src/components/forms src/utils',
		'mkdir -p src/components/{buttons,forms} src/utils',
		'for dir in src/components/buttons src/components/forms src/utils; do mkdir -p "$dir"; done',
		'mkdir -p src/components/buttons && mkdir -p src/components/forms && mkdir -p src/utils'
	  ],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'mkdir -p src/components'
	},
	{
	  name: 'safe_copy_overwrite',
	  description: 'We need to copy a file interactively only if the target exists!\nCorrect the following command:',
	  command: 'cp -i backup.txt file.txt',
	  correctCommands: [
		'cp -i file.txt backup.txt',
		'cp --interactive file.txt backup.txt',
		'cp -i --preserve=all file.txt backup.txt',
		'cp -i --backup=numbered file.txt backup.txt',
		'cp -i --preserve=timestamps file.txt backup.txt'
	  ],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'touch file.txt'
	},
	{
	  name: 'copy_unique_lines',
	  description: 'We need to copy only unique lines from file1.txt to file2.txt (removing duplicates)!\nCorrect the following command:',
	  command: 'sort file1.txt | unique > file2.txt',
	  correctCommands: [
		'sort file1.txt | uniq > file2.txt', 
		'awk \'!seen[$0]++\' file1.txt > file2.txt',
		'sort -u file1.txt > file2.txt',
		'perl -ne \'print unless $seen{$_}++\' file1.txt > file2.txt',
		'cat file1.txt | awk \'!a[$0]++\' > file2.txt',
		'cat file1.txt | sort | uniq > file2.txt',
		'cat file1.txt | awk \'!seen[$0]++\' > file2.txt'
	  ],
	  isLlmAssisted: true,
	  category: 'File management',
	  preCommand: 'echo -e "apple\nbanana\ncherry\nbanana\napple\ndate\ncherry" > file1.txt'
	},
  
	// File search & text search
	{
	  name: 'find_recent_text_files',
	  description: 'We need to find all .txt files modified in the last 7 days!\nCorrect the following command:',
	  command: 'find . -name "*.txt" -mtime < 7',
	  correctCommands: [
		'find . -name "*.txt" -mtime -7', 
		'find . -name "*.txt" -mtime -7 -daystart',
		'find . -type f -name "*.txt" -mtime -7',
		'find . -name "*.txt" -newermt "7 days ago"',
		'find . -name "*.txt" -mtime -7 -ls',
		'find . -name "*.txt" -mtime -7 -printf "%T+ %p\n"',
		'find . -name "*.txt" -mtime -7 -exec ls -lh {} \\;'
	  ],
	  isLlmAssisted: true,
	  category: 'File search',
	  preCommand: 'touch test1.txt test2.txt example.log'
	},
	{
	  name: 'grep_with_context',
	  description: 'We need to search for the word "error" in log files, showing 2 lines of context before and after each match!\nCorrect the following command:',
	  command: 'grep -c 2 "error" *.log',
	  correctCommands: [
		'grep -B 2 -A 2 "error" *.log',
		'grep -C 2 "error" *.log',
		'grep --context=2 "error" *.log',
		'grep --before-context=2 --after-context=2 "error" *.log',
		'grep -B 2 -A 2 -i "error" *.log',
		'grep -C 2 --color=auto "error" *.log',
		'grep -B 2 -A 2 -H "error" *.log',
		'grep -C 2 --line-number "error" *.log'
	  ],
	  isLlmAssisted: true,
	  category: 'Text search',
	  preCommand: 'for i in {1..10}; do echo "Line $i"; done > app.log && echo "Line 11 with an error message" >> app.log && for i in {12..15}; do echo "Line $i"; done >> app.log'
	},
  
	// File viewing
	{
	  name: 'view_specific_lines',
	  description: "We need to extract lines 7-12 from a log file!\nCorrect the following command:",
	  command: 'head -n 12 log.txt | tail --n 6',
	  correctCommands: [
		'head -n 12 log.txt | tail -n 6',
		'sed -n "7,12p" log.txt',
		'awk "NR>=7 && NR<=12" log.txt',
		'sed "7,12!d" log.txt',
		'perl -ne "print if 7..12" log.txt',
		'awk "NR==7,NR==12" log.txt',
		'sed -n "7,12p;12q" log.txt',
		'awk "NR>=7 && NR<=12 {print}" log.txt'
	  ],
	  isLlmAssisted: true,
	  category: 'File viewing',
	  preCommand: 'for i in {1..20}; do echo "Line $i" >> log.txt; done'
	},
	{
	  name: 'highlight_error_lines',
	  description: 'We need to search through the log file and highlight any lines containing "ERROR"!\nCorrect the following command:',
	  command: 'grep -color error app.log',
	  correctCommands: [
		'grep --color=auto -i "ERROR" app.log',
		'grep --color=always -i "ERROR" app.log',
		'GREP_COLORS="ms=01;31" grep --color=always -i "ERROR" app.log',
		'egrep --color=always -i "ERROR" app.log',
		'grep --color=always -i "ERROR" -A 1 -B 1 app.log',
		'awk \'/ERROR/i {print "\x1b[31m" $0 "\x1b[0m"}\' app.log',
		'perl -pe \'s/(ERROR)/\x1b[31m$1\x1b[0m/gi\' app.log',
		'grep -i "ERROR" app.log | sed "s/.*ERROR.*/\x1b[31m&\x1b[0m/"'
	  ],
	  isLlmAssisted: false,
	  category: 'File viewing',
	  preCommand: 'echo "Starting application..." > app.log && echo "INFO: Configuration loaded" >> app.log && echo "ERROR: Failed to connect" >> app.log && echo "System initialized" >> app.log'
	},
  
	// Text processing
	{
	  name: 'count_non_empty_lines',
	  description: 'We need to count the number of non-empty lines in the log file!\nCorrect the following command:',
	  command: 'grep -v ^$ logfile.txt | wc -l',
	  correctCommands: [
		'grep -v "^$" logfile.txt | wc -l',
		'sed "/^$/d" logfile.txt | wc -l',
		'awk "NF" logfile.txt | wc -l',
		'awk "NF > 0" logfile.txt | wc -l',
		'grep -c "^[^[:space:]]" logfile.txt',
		'awk \'!/^[[:space:]]*$/\' logfile.txt | wc -l',
		'perl -ne \'print if /\\S/\' logfile.txt | wc -l',
		'awk \'length($0) > 0\' logfile.txt | wc -l'
	  ],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'echo "Line 1" > logfile.txt && echo "" >> logfile.txt && echo "Line 3" >> logfile.txt && echo "" >> logfile.txt && echo "Line 5" >> logfile.txt'
	},
	{
	  name: 'sort_csv_by_number',
	  description: 'We need to sort this CSV file by the numeric values in the second column (descending order)!\nCorrect the following command:',
	  command: 'sort -k2 -r data.csv',
	  correctCommands: [
		'sort -t, -k2,2nr data.csv',
		'sort -t, -k2nr data.csv',
		'sort --field-separator=, -k2,2nr data.csv',
		'awk -F, \'{print $0}\' data.csv | sort -t, -k2,2nr',
		'sort -t, -k2,2n data.csv | tac',
		'perl -F, -ane \'print\' data.csv | sort -t, -k2,2nr',
		'sort -t, -k2,2nr --stable data.csv',
		'LC_ALL=C sort -t, -k2,2nr data.csv'
	  ],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'echo "apple,5,red" > data.csv && echo "banana,10,yellow" >> data.csv && echo "cherry,7,red" >> data.csv && echo "date,2,brown" >> data.csv'
	},
  
	// System information
	{
	  name: 'find_largest_subdirectories',
	  description: 'We need to find the top 3 largest subdirectories and show their sizes in human-readable format!\nCorrect the following command:',
	  command: 'du -h | sort -hr | head -3',
	  correctCommands: [
		'du -h --max-depth=1 | sort -hr | head -3',
		'du -h --max-depth=1 . | sort -hr | head -n 3',
		'du -d 1 -h | sort -hr | head -3',
		'du -sh */ | sort -hr | head -3',
		'find . -maxdepth 1 -type d -exec du -sh {} \\; | sort -hr | head -3',
		'du -h --max-depth=1 . | sort -k1,1hr | head -3',
		'du -h --max-depth=1 . | sort -hr | sed -n "1,3p"',
		'du -h --max-depth=1 . | sort -hr | awk "NR<=3"'
	  ],
	  isLlmAssisted: false,
	  category: 'Disk usage',
	  preCommand: 'mkdir -p dir1 dir2 dir3 && dd if=/dev/zero of=dir1/file1 bs=1M count=5 2>/dev/null && dd if=/dev/zero of=dir2/file2 bs=1M count=10 2>/dev/null && dd if=/dev/zero of=dir3/file3 bs=1M count=2 2>/dev/null'
	},
	{
	  name: 'find_low_disk_space',
	  description: 'We need to identify filesystems with less than 20% free space remaining!\nCorrect the following command:',
	  command: 'df -h | awk \'$5 > "80%"\'',
	  correctCommands: [
		'df -h | awk \'$5 > "80%"\'',
		'df -h | awk \'{if(NR>1)if($5+0>80)print}\'',
		'df -h | grep -E "[8-9][0-9]%|100%"',
		'df -h | awk \'NR>1 && $5+0 > 80\'',
		'df -h | perl -ne \'print if /\\d+%/ && $& =~ /^[8-9]\\d%|^100%/\'',
		'df -h | awk \'NR>1 && substr($5,1,length($5)-1)+0 > 80\'',
		'df -h | sed -n \'2,$p\' | awk \'$5+0 > 80\'',
		'df -h | awk \'NR>1 && int($5) > 80\''
	  ],
	  isLlmAssisted: false,
	  category: 'Disk usage'
	},
  
	// Process management
	{
	  name: 'find_memory_intensive_processes',
	  description: 'We need to find the top 5 processes consuming the most memory!\nCorrect the following command:',
	  command: 'ps aux | sort -k4 -r | head -5',
	  correctCommands: [
		'ps aux --sort=-%mem | head -5',
		'ps aux | sort -k4nr | head -5',
		'ps -eo pid,ppid,cmd,%mem --sort=-%mem | head -5',
		'ps aux | awk \'{print $2, $4, $11}\' | sort -k2nr | head -5',
		'ps -eo pid,ppid,cmd,%mem,pmem --sort=-%mem | head -5',
		'ps aux | sort -k4nr | sed -n "1,5p"',
		'ps aux | awk \'NR>1 {print $0}\' | sort -k4nr | head -5',
		'top -b -n 1 | grep -A 5 "PID" | tail -n 5'
	  ],
	  isLlmAssisted: false,
	  category: 'Process management'
	},
  
	// Networking
	{
	  name: 'download_with_retry',
	  description: 'We need to download a file, automatically retrying up to 3 times if it fails, and showing a progress bar!\nCorrect the following command:',
	  command: 'curl --retry 3 -o data.json https://api.example.com/data',
	  correctCommands: [
		'curl --retry 3 --progress-bar -o data.json https://api.example.com/data',
		'curl -L --retry 3 --progress-bar -o data.json https://api.example.com/data',
		'wget -t 3 --show-progress -O data.json https://api.example.com/data',
		'curl --retry 3 --retry-delay 2 --progress-bar -o data.json https://api.example.com/data',
		'curl --retry 3 --retry-all-errors --progress-bar -o data.json https://api.example.com/data',
		'wget -t 3 --show-progress --retry-connrefused -O data.json https://api.example.com/data',
		'curl --retry 3 --retry-max-time 30 --progress-bar -o data.json https://api.example.com/data',
		'wget -t 3 --show-progress --timeout=30 -O data.json https://api.example.com/data'
	  ],
	  isLlmAssisted: true,
	  category: 'Networking'
	},
	{
	  name: 'find_user_login_history',
	  description: 'We need to see login history for a specific user (jsmith) during the last week!\nCorrect the following command:',
	  command: 'last jsmith | head -n 7',
	  correctCommands: [
		'last jsmith -s -7days',
		'last jsmith -t $(date -d "7 days ago" +\\%Y\\%m\\%d)',
		'last jsmith | awk -v d="$(date -d \\"7 days ago\\" +\\%Y\\%m\\%d)" \'$4 >= d\'',
		'last jsmith | awk -v d="$(date -d \\"7 days ago\\" +\\%s)" \'$4 >= d\'',
		'last -F jsmith | awk -v d="$(date -d \\"7 days ago\\" +\\%Y\\%m\\%d\\ %H:%M)" \'$4 >= d\'',
		'last jsmith | grep "$(date -d \\"7 days ago\\" +\\%Y\\%m\\%d)"',
		'last jsmith | awk -v d="$(date -d \\"7 days ago\\" +\\%Y\\%m\\%d)" \'$4 >= d {print}\'',
		'last jsmith | awk -v d="$(date -d \\"7 days ago\\" +\\%s)" \'$4 >= d {print; count++} count >= 20 {exit}\''
	  ],
	  isLlmAssisted: false,
	  category: 'System information'
	}
  ];
  