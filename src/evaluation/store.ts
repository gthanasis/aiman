import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TestAttempt {
	attemptNumber: number;
	command: string;
	timestamp: string;
	timeMs?: number;
	errorType?: string;
	stdout?: string;
	stderr?: string;
	success?: boolean;
}

interface TestResult {
	testName: string;
	description: string;
	attempts: TestAttempt[];
	totalTimeMs: number;
	totalAttempts: number;
	errorTypes: string[];
	startTime: string;
	endTime: string;
}

interface SessionData {
	runId: string;
	userName: string;
	startTime: string;
	tests: TestResult[];
}

export class Store {
	private userName: string = '';
	private storeFilePath: string;
	private runId: string;
	private sessionStartTime: number;
	private currentTest: TestResult | null = null;
	private sessionData: SessionData;

	constructor(storeFilePath: string) {
		this.storeFilePath = storeFilePath;
		this.runId = uuidv4();
		this.sessionStartTime = Date.now();
		
		// Ensure the directory exists
		const directory = path.dirname(storeFilePath);
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}

		// Initialize session data
		this.sessionData = {
			runId: this.runId,
			userName: '',
			startTime: new Date().toISOString(),
			tests: []
		};

		// Load existing data if file exists
		if (fs.existsSync(storeFilePath)) {
			try {
				const existingData = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
				this.sessionData = existingData;
			} catch (error) {
				console.error('Error loading existing data:', error);
			}
		}
	}

	public setUserName(userName: string) {
		this.userName = userName;
		this.sessionData.userName = userName;
		this.saveData();
	}

	public startTest(testName: string, description: string) {
		this.currentTest = {
			testName,
			description,
			attempts: [],
			totalTimeMs: 0,
			totalAttempts: 0,
			errorTypes: [],
			startTime: new Date().toISOString(),
			endTime: ''
		};
	}

	public addAttempt(command: string, stdout?: string, stderr?: string, errorType?: string, timeMs?: number, success?: boolean) {
		if (!this.currentTest) {
			throw new Error('No test is currently active');
		}

		const attempt: TestAttempt = {
			attemptNumber: this.currentTest.attempts.length + 1,
			command,
			timestamp: new Date().toISOString(),
			stdout,
			stderr,
			errorType,
			timeMs,
			success
		};

		this.currentTest.attempts.push(attempt);
		this.currentTest.totalAttempts = this.currentTest.attempts.length;
		
		if (errorType && !this.currentTest.errorTypes.includes(errorType)) {
			this.currentTest.errorTypes.push(errorType);
		}

		if (timeMs) {
			this.currentTest.totalTimeMs += timeMs;
		}

		this.saveData();
	}

	public endTest() {
		if (!this.currentTest) {
			throw new Error('No test is currently active');
		}

		this.currentTest.endTime = new Date().toISOString();
		this.sessionData.tests.push(this.currentTest);
		this.currentTest = null;
		this.saveData();
	}

	private saveData() {
		try {
			fs.writeFileSync(
				this.storeFilePath,
				JSON.stringify(this.sessionData, null, 2),
				'utf8'
			);
		} catch (error) {
			console.error('Error saving data:', error);
		}
	}

	public getSessionData(): SessionData {
		return this.sessionData;
	}
}
