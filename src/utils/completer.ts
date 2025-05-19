import fs from "fs";
import path from "path";
import os from "os";

/**
 * Get common command paths from PATH environment variable
 * @returns Array of available commands
 */
export function getCommandsFromPath(): string[] {
    const pathDirs = (process.env.PATH || '').split(path.delimiter);
    const commands: string[] = [];
    
    for (const dir of pathDirs) {
        try {
            const files = fs.readdirSync(dir);
            commands.push(...files);
        } catch (e) {
            // Skip directories that can't be read
        }
    }
    
    return [...new Set(commands)]; // Remove duplicates
}

/**
 * Create a completer function for readline tab completion
 * @param availableCommands Array of available commands to use for completion
 * @returns Completer function compatible with readline interface
 */
export function createCompleter(availableCommands: string[]): (line: string) => [string[], string] {
    return (line: string): [string[], string] => {
        // Command completion if at start of line and no path separator
        if (!line.includes(' ') && !line.includes('/')) {
            const hits = availableCommands.filter((c) => c.startsWith(line));
            return [hits.length ? hits : [], line];
        }
        
        // File path completion
        try {
            let dir = '.';
            let prefix = '';
            let linePrefix = '';
            
            // Extract the relevant part for completion
            if (line.includes(' ')) {
                const parts = line.split(' ');
                linePrefix = parts.slice(0, -1).join(' ') + ' ';
                const lastPart = parts[parts.length - 1];
                
                if (lastPart.endsWith('/')) {
                    dir = lastPart;
                    prefix = '';
                } else if (lastPart.includes('/')) {
                    dir = path.dirname(lastPart);
                    prefix = path.basename(lastPart);
                } else {
                    dir = '.';
                    prefix = lastPart;
                }
            } else {
                if (line.endsWith('/')) {
                    dir = line;
                    prefix = '';
                } else if (line.includes('/')) {
                    dir = path.dirname(line);
                    prefix = path.basename(line);
                } else {
                    dir = '.';
                    prefix = line;
                }
            }
            
            // Handle home directory expansion
            if (dir.startsWith('~')) {
                dir = dir.replace(/^~/, os.homedir());
            }
            
            // Make sure directory path doesn't have duplicate slashes
            dir = path.normalize(dir);
            
            // Get the entries
            const entries = fs.readdirSync(dir);
            const matches = entries.filter(entry => entry.startsWith(prefix));
            
            // Format the completions
            const formattedCompletions = matches.map(match => {
                try {
                    const fullPath = path.join(dir, match);
                    const stats = fs.statSync(fullPath);
                    
                    // Complete with full path based on the line prefix
                    if (linePrefix) {
                        return stats.isDirectory() 
                            ? `${linePrefix}${path.join(dir, match)}/`.replace(/\/+/g, '/')
                            : `${linePrefix}${path.join(dir, match)}`;
                    }
                    
                    // Regular completion (first word)
                    return stats.isDirectory() 
                        ? `${path.join(dir, match)}/`.replace(/\/+/g, '/')
                        : path.join(dir, match);
                } catch (e) {
                    return match;
                }
            });
            
            return [formattedCompletions, line];
        } catch (error) {
            return [[], line];
        }
    };
} 