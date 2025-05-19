import { spawn } from "child_process";

export function runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number | null }> {
	return new Promise((resolve, reject) => {
		// Use 'pipe' for stdout and stderr to prevent automatic console output
		const child = spawn(command, args, { 
			shell: true,
			stdio: ['inherit', 'pipe', 'pipe'] // inherit stdin, pipe stdout and stderr
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("error", (error) => {
			reject(error);
		});

		child.on("close", (code) => {
			resolve({ stdout, stderr, code });
		});
	});
}
