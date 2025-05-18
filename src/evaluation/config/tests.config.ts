export interface TestConfig {
  name: string;
  description: string;
  command: string;
  correctCommands: string[];
  isLlmAssisted: boolean;
  category: string;
  preCommand?: string; // Optional setup command to run before the test
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
	  name: 'cd_symlink_loop',
	  description: "You're trying to navigate into a directory, but the path is part of a symlink loop.\nCorrect the following command:",
	  command: 'cd /mnt/data/loop',
	  correctCommands: ['cd -P /mnt/data/loop'],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'mkdir -p /tmp/test_dir/loop && ln -sf /tmp/test_dir/loop /tmp/test_dir/loop/link'
	},
	{
	  name: 'list_with_hidden_files_sorted',
	  description: 'You need to list all files, including hidden ones, sorted by modification time descending.\nCorrect the following command:',
	  command: 'ls all --sort=time',
	  correctCommands: ['ls -lat', 'ls -ltA'],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'touch .hidden_file regular_file && touch -t 202001010000 older_file'
	},
	{
	  name: 'resolve_physical_path',
	  description: 'You want to see the physical path (no symlinks) of your current directory.\nCorrect the following command:',
	  command: 'pwd logical',
	  correctCommands: ['pwd -P'],
	  isLlmAssisted: true,
	  category: 'File navigation',
	  preCommand: 'mkdir -p /tmp/test_dir/actual && ln -sf /tmp/test_dir/actual /tmp/test_dir/symlink && cd /tmp/test_dir/symlink'
	},
  
	// File management
	{
	  name: 'mkdir_parents_verbose',
	  description: "You want to create nested directories and see what's being created.\nCorrect the following command:",
	  command: 'mkdir src/components/utils',
	  correctCommands: ['mkdir -pv src/components/utils'],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'rm -rf src'
	},
	{
	  name: 'safe_copy_overwrite',
	  description: 'You want to copy a file interactively only if the target exists.\nCorrect the following command:',
	  command: 'cp file.txt backup.txt --interactive',
	  correctCommands: ['cp -i file.txt backup.txt'],
	  isLlmAssisted: false,
	  category: 'File management',
	  preCommand: 'echo "original content" > file.txt && echo "backup content" > backup.txt'
	},
	{
	  name: 'move_all_with_progress',
	  description: 'You want to move all files from one directory to another with a visible progress bar.\nCorrect the following command:',
	  command: 'mv * /backup --verbose',
	  correctCommands: ['rsync -a --info=progress2 ./ /backup/'],
	  isLlmAssisted: true,
	  category: 'File management',
	  preCommand: 'mkdir -p source backup && for i in {1..10}; do dd if=/dev/zero of=source/file$i bs=1M count=10; done && cd source'
	},
  
	// File search & text search
	{
	  name: 'find_exclude_path',
	  description: 'Find all Python files, excluding node_modules.\nCorrect the following command:',
	  command: 'find . -name "*.py" -exclude node_modules',
	  correctCommands: ['find . -path "./node_modules" -prune -o -name "*.py" -print'],
	  isLlmAssisted: true,
	  category: 'File search',
	  preCommand: 'mkdir -p node_modules src/utils && touch test.py src/main.py node_modules/setup.py src/utils/helpers.py'
	},
	{
	  name: 'grep_multiline_match',
	  description: 'You want to search for multiline patterns across log files.\nCorrect the following command:',
	  command: 'grep -e "Exception.*Caused by"',
	  correctCommands: ['grep -Pzo "Exception(.|\n)*?Caused by" *.log'],
	  isLlmAssisted: true,
	  category: 'Text search',
	  preCommand: 'echo -e "java.lang.Exception: Could not process request\\n    at Service.process()\\n    Caused by: NullPointerException" > error.log'
	},
  
	// File viewing
	{
	  name: 'tail_follow_json',
	  description: "You're trying to follow updates in a growing JSON file.\nCorrect the following command:",
	  command: 'tail json.log',
	  correctCommands: ['tail -f json.log | jq .'],
	  isLlmAssisted: true,
	  category: 'File viewing',
	  preCommand: 'echo \'{"status": "running", "timestamp": "2023-06-01T12:00:00Z"}\' > json.log'
	},
	{
	  name: 'preview_large_file_fast',
	  description: 'You want to preview the first 100 lines of a large file quickly without loading the whole file.\nCorrect the following command:',
	  command: 'less -n 100 bigfile.txt',
	  correctCommands: ['head -n 100 bigfile.txt'],
	  isLlmAssisted: false,
	  category: 'File viewing',
	  preCommand: 'for i in {1..200}; do echo "Line $i of the big file" >> bigfile.txt; done'
	},
  
	// Text processing
	{
	  name: 'cut_utf8_column',
	  description: 'You want to extract the second column from a UTF-8 file where columns are separated by `·` (middle dot).\nCorrect the following command:',
	  command: 'cut -f2 file.txt',
	  correctCommands: ['cut -d "·" -f2 file.txt'],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'echo -e "name·age·location\\njohn·25·london\\nanna·34·paris" > file.txt'
	},
	{
	  name: 'sort_human_numerical',
	  description: 'You want to sort files by size in human-readable format correctly.\nCorrect the following command:',
	  command: 'ls -lh | sort -k5n',
	  correctCommands: ['ls -lh | sort -h -k5'],
	  isLlmAssisted: true,
	  category: 'Text processing',
	  preCommand: 'dd if=/dev/zero of=file1 bs=1K count=10 && dd if=/dev/zero of=file2 bs=1M count=1 && dd if=/dev/zero of=file3 bs=10K count=10'
	},
  
	// System information
	{
	  name: 'disk_usage_inode_check',
	  description: 'You want to check inode exhaustion for all mounted filesystems.\nCorrect the following command:',
	  command: 'df --inodes',
	  correctCommands: ['df -i'],
	  isLlmAssisted: false,
	  category: 'Disk usage',
	  preCommand: ''
	},
	{
	  name: 'check_large_files',
	  description: 'You want to find all files over 1GB in the current directory tree.\nCorrect the following command:',
	  command: 'ls -lh * > 1G',
	  correctCommands: ['find . -type f -size +1G -exec ls -lh {} +'],
	  isLlmAssisted: true,
	  category: 'Disk space',
	  preCommand: 'mkdir -p test_dir && touch test_dir/small.txt && truncate -s 50M large_file.bin'
	},
  
	// Process management
	{
	  name: 'kill_by_memory',
	  description: 'You want to kill the process consuming the most memory.\nCorrect the following command:',
	  command: 'kill -9 maxmem',
	  correctCommands: ['kill -9 $(ps aux --sort=-%mem | awk \'NR==2{print $2}\')'],
	  isLlmAssisted: true,
	  category: 'Process management',
	  preCommand: ''
	},
  
	// Networking
	{
	  name: 'check_open_ports',
	  description: 'You want to see all currently listening ports and their associated services.\nCorrect the following command:',
	  command: 'netstat -p',
	  correctCommands: ['ss -tuln', 'lsof -i -P -n'],
	  isLlmAssisted: true,
	  category: 'Networking',
	  preCommand: ''
	},
  
	// Advanced
	{
	  name: 'extract_tar_from_url',
	  description: 'You want to download and extract a `.tar.gz` file from a URL in one step.\nCorrect the following command:',
	  command: 'wget archive.tar.gz | tar -xzf',
	  correctCommands: ['curl -L http://example.com/archive.tar.gz | tar xz'],
	  isLlmAssisted: true,
	  category: 'Archiving',
	  preCommand: 'mkdir -p /tmp/test_archive && echo "test content" > /tmp/test_archive/test.txt && tar -czf /tmp/archive.tar.gz -C /tmp test_archive'
	},
	{
	  name: 'run_background_limit_cpu',
	  description: 'You want to run a script in the background while limiting it to 20% CPU.\nCorrect the following command:',
	  command: './heavy-task.sh & cpu-limit 20',
	  correctCommands: ['cpulimit -l 20 -- ./heavy-task.sh &'],
	  isLlmAssisted: true,
	  category: 'Output splitting',
	  preCommand: 'echo "#!/bin/bash\\nwhile true; do echo \\"Running...\\"; sleep 1; done" > heavy-task.sh && chmod +x heavy-task.sh'
	}
  ];
  