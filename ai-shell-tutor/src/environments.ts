import * as os from "os";

type Environment = {
	osType: string;
	osVersion: string;
	terminal: string;
}

export function getEnvironmentInfo(): Environment {
	return {
		// Capture terminal and OS information
		osType: os.type(),
		osVersion: os.release(),
		terminal: process.env.TERM || "unknown"
	}
}
