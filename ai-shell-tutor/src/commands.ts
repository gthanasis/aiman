import { spawn } from "child_process";

export function runCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { shell: true });

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
			resolve({ stdout, stderr });
		});
	});
}
