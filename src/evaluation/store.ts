import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class Store {
	private userName: string = '';
	private storeFilePath: string;
	private runId: string;

	constructor(storeFilePath: string) {
		this.storeFilePath = storeFilePath;
		this.runId = uuidv4();
		// Ensure the directory exists
		const directory = path.dirname(storeFilePath);
		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}

		// Ensure the file exists
		if (!fs.existsSync(storeFilePath)) {
			fs.writeFileSync(storeFilePath, 'runId,userName,testName,metricName,metricValue,timestamp\n', 'utf8');
		}
	}

	public setUserName(userName: string) {
		this.userName = userName;
	}

	public addMetricForTest(testName: string, metricName: string, metricValue: any) {
		if (!this.userName) {
			throw new Error('User name must be set before adding metrics.');
		}

		const timestamp = new Date().toISOString();
		const csvRow = `${this.runId},${this.userName},${testName},${metricName},${metricValue},${timestamp}\n`;

		fs.appendFileSync(this.storeFilePath, csvRow, 'utf8');
	}
}
