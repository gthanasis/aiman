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
	isLlmAssisted: boolean;
}

interface PreQuestionnaire {
	demographics: {
		age: string;
		gender: string;
		education: string;
	};
	professional: {
		role: string;
		experience: string;
		field: string;
	};
	cliProficiency: {
		usageFrequency: string;
		proficiencyLevel: number;
		environments: string[];
	};
	aiExperience: {
		hasUsedAI: boolean;
		experienceDescription?: string;
	};
	learningPreferences: {
		preferredMethod: string;
	};
}

interface PostQuestionnaire {
	satisfaction: {
		easeOfUse: number;
		confidence: number;
		frustration: number;
	};
	effectiveness: {
		taskCompletion: number;
		errorHandling: number;
		learning: number;
	};
	comments: string;
}

interface SessionData {
	runId: string;
	userName: string;
	startTime: string;
	tests: TestResult[];
	preQuestionnaire?: PreQuestionnaire;
	postQuestionnaire?: PostQuestionnaire;
	conditionOrder?: 'traditional-first' | 'ai-first';
}

export class Store {
	private userName: string = '';
	private storeFilePath: string;
	private runId: string;
	private sessionStartTime: number;
	private currentTest: TestResult | null = null;
	private sessionData: SessionData;
	private allSessions: SessionData[] = [];

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
				const fileData = fs.readFileSync(storeFilePath, 'utf8');
				const existingData = JSON.parse(fileData);
				
				// Check if data is an array (new format) or single object (old format)
				if (Array.isArray(existingData)) {
					this.allSessions = existingData;
				} else {
					// If it's a single object, convert to array
					this.allSessions = [existingData];
				}
			} catch (error) {
				console.error('Error loading existing data:', error);
				this.allSessions = [];
			}
		}
	}

	public setUserName(userName: string) {
		this.userName = userName;
		this.sessionData.userName = userName;
		this.saveData();
	}

	public startTest(testName: string, description: string, isLlmAssisted: boolean = true) {
		this.currentTest = {
			testName,
			description,
			attempts: [],
			totalTimeMs: 0,
			totalAttempts: 0,
			errorTypes: [],
			startTime: new Date().toISOString(),
			endTime: '',
			isLlmAssisted
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

	public setPreQuestionnaire(questionnaire: PreQuestionnaire) {
		this.sessionData.preQuestionnaire = questionnaire;
		this.saveData();
	}

	public setPostQuestionnaire(questionnaire: PostQuestionnaire) {
		this.sessionData.postQuestionnaire = questionnaire;
		this.saveData();
	}

	public setConditionOrder(order: 'traditional-first' | 'ai-first') {
		this.sessionData.conditionOrder = order;
		this.saveData();
	}

	public getLastUserConditionOrder(): 'traditional-first' | 'ai-first' | undefined {
		const previousSessions = this.allSessions.filter(session => session.runId !== this.runId);
		
		if (previousSessions.length === 0) {
			return undefined;
		}
		
		previousSessions.sort((a, b) => 
			new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
		);
		
		return previousSessions[0].conditionOrder;
	}

	private saveData() {
		try {
			const existingIndex = this.allSessions.findIndex(
				session => session.runId === this.sessionData.runId
			);
			
			if (existingIndex >= 0) {
				this.allSessions[existingIndex] = this.sessionData;
			} else {
				this.allSessions.push(this.sessionData);
			}
			
			fs.writeFileSync(
				this.storeFilePath,
				JSON.stringify(this.allSessions, null, 2),
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
