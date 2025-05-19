export interface TestConfig {
  name: string;
  description: string;
  command: string;
  correctCommands: string[];
  isLlmAssisted: boolean;
  category: string;
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
	  name: 'cd_to_script_directory',
	  description: "You're writing a shell script and want it to change directory to wherever the script file is located, regardless of where it's called from.\nCorrect the following command:",
	  command: 'cd $0',
	  correctCommands: ['cd "$(dirname "$0")"', 'cd $(dirname "${BASH_SOURCE[0]}")'],
	  isLlmAssisted: true,
	  category: 'File navigation'
	},
	{
	  name: 'list_with_hidden_files_sorted',
	  description: 'You need to list all files, including hidden ones, sorted by modification time descending.\nCorrect the following command:',
	  command: 'ls all --sort=time',
	  correctCommands: ['ls -lat', 'ls -ltA'],
	  isLlmAssisted: true,
	  category: 'File navigation'
	},
	{
	  name: 'resolve_physical_path',
	  description: 'You want to see the physical path (no symlinks) of your current directory.\nCorrect the following command:',
	  command: 'pwd logical',
	  correctCommands: ['pwd -P'],
	  isLlmAssisted: true,
	  category: 'File navigation'
	},
  
	// File management
	{
	  name: 'mkdir_parents_verbose',
	  description: "You want to create nested directories and see what's being created.\nCorrect the following command:",
	  command: 'mkdir src/components/utils',
	  correctCommands: ['mkdir -pv src/components/utils'],
	  isLlmAssisted: false,
	  category: 'File management'
	},
	{
	  name: 'safe_copy_overwrite',
	  description: 'You want to copy a file interactively only if the target exists.\nCorrect the following command:',
	  command: 'cp file.txt backup.txt --interactive',
	  correctCommands: ['cp -i file.txt backup.txt'],
	  isLlmAssisted: false,
	  category: 'File management'
	},
	{
	  name: 'move_all_with_progress',
	  description: 'You want to move all files from one directory to another with a visible progress bar.\nCorrect the following command:',
	  command: 'mv * /backup --verbose',
	  correctCommands: ['rsync -a --info=progress2 ./ /backup/'],
	  isLlmAssisted: true,
	  category: 'File management'
	},
  
	// File search & text search
	{
	  name: 'find_exclude_path',
	  description: 'Find all Python files, excluding node_modules.\nCorrect the following command:',
	  command: 'find . -name "*.py" -exclude node_modules',
	  correctCommands: ['find . -path "./node_modules" -prune -o -name "*.py" -print'],
	  isLlmAssisted: true,
	  category: 'File search'
	},
	{
	  name: 'grep_multiline_match',
	  description: 'You want to search for multiline patterns across log files.\nCorrect the following command:',
	  command: 'grep -e "Exception.*Caused by"',
	  correctCommands: ['grep -Pzo "Exception(.|\n)*?Caused by" *.log'],
	  isLlmAssisted: true,
	  category: 'Text search'
	},
  
	// File viewing
	{
	  name: 'tail_follow_json',
	  description: "You're trying to follow updates in a growing JSON file.\nCorrect the following command:",
	  command: 'tail json.log',
	  correctCommands: ['tail -f json.log | jq .'],
	  isLlmAssisted: true,
	  category: 'File viewing'
	},
	{
	  name: 'preview_large_file_fast',
	  description: 'You want to preview the first 100 lines of a large file quickly without loading the whole file.\nCorrect the following command:',
	  command: 'less -n 100 bigfile.txt',
	  correctCommands: ['head -n 100 bigfile.txt'],
	  isLlmAssisted: false,
	  category: 'File viewing'
	},
  
	// Text processing
	{
	  name: 'cut_utf8_column',
	  description: 'You want to extract the second column from a UTF-8 file where columns are separated by `·` (middle dot).\nCorrect the following command:',
	  command: 'cut -f2 file.txt',
	  correctCommands: ['cut -d "·" -f2 file.txt'],
	  isLlmAssisted: true,
	  category: 'Text processing'
	},
	{
	  name: 'sort_human_numerical',
	  description: 'You want to sort files by size in human-readable format correctly.\nCorrect the following command:',
	  command: 'ls -lh | sort -k5n',
	  correctCommands: ['ls -lh | sort -h -k5'],
	  isLlmAssisted: true,
	  category: 'Text processing'
	},
  
	// System information
	{
	  name: 'disk_usage_inode_check',
	  description: 'You want to check inode exhaustion for all mounted filesystems.\nCorrect the following command:',
	  command: 'df --inodes',
	  correctCommands: ['df -i'],
	  isLlmAssisted: false,
	  category: 'Disk usage'
	},
	{
	  name: 'check_large_files',
	  description: 'You want to find all files over 1GB in the current directory tree.\nCorrect the following command:',
	  command: 'ls -lh * > 1G',
	  correctCommands: ['find . -type f -size +1G -exec ls -lh {} +'],
	  isLlmAssisted: true,
	  category: 'Disk space'
	},
  
	// Process management
	{
	  name: 'kill_by_memory',
	  description: 'You want to kill the process consuming the most memory.\nCorrect the following command:',
	  command: 'kill -9 maxmem',
	  correctCommands: ['kill -9 $(ps aux --sort=-%mem | awk \'NR==2{print $2}\')'],
	  isLlmAssisted: true,
	  category: 'Process management'
	},
  
	// Networking
	{
	  name: 'check_open_ports',
	  description: 'You want to see all currently listening ports and their associated services.\nCorrect the following command:',
	  command: 'netstat -p',
	  correctCommands: ['ss -tuln', 'lsof -i -P -n'],
	  isLlmAssisted: true,
	  category: 'Networking'
	},
  
	// Advanced
	{
	  name: 'extract_tar_from_url',
	  description: 'You want to download and extract a `.tar.gz` file from a URL in one step.\nCorrect the following command:',
	  command: 'wget archive.tar.gz | tar -xzf',
	  correctCommands: ['curl -L http://example.com/archive.tar.gz | tar xz'],
	  isLlmAssisted: true,
	  category: 'Archiving'
	},
	{
	  name: 'run_background_limit_cpu',
	  description: 'You want to run a script in the background while limiting it to 20% CPU.\nCorrect the following command:',
	  command: './heavy-task.sh & cpu-limit 20',
	  correctCommands: ['cpulimit -l 20 -- ./heavy-task.sh &'],
	  isLlmAssisted: true,
	  category: 'Output splitting'
	}
  ];
  