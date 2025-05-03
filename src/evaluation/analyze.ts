import fs from 'fs';
import path from 'path';

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

interface Questionnaire {
    demographics: {
        name: string;
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
        experienceDescription: string;
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
    preQuestionnaire?: Questionnaire;
    postQuestionnaire?: PostQuestionnaire;
}

interface Analytics {
    efficiency: {
        averageTimePerTest: number;
        averageTimePerAttempt: number;
        fastestTest: { testName: string; timeMs: number };
        slowestTest: { testName: string; timeMs: number };
        timeDistribution: {
            under30s: number;
            under1min: number;
            over1min: number;
        };
    };
    effectiveness: {
        successRate: number;
        averageAttemptsPerTest: number;
        errorDistribution: Record<string, number>;
        mostCommonErrors: Array<{ errorType: string; count: number }>;
        commandProgression: {
            averageCommandsToSuccess: number;
            mostCommonFirstCommands: Array<{ command: string; count: number }>;
        };
    };
    patterns: {
        errorPatterns: Array<{
            testName: string;
            commonErrorSequence: string[];
        }>;
        commandPatterns: Array<{
            testName: string;
            successfulCommand: string;
            commonMistakes: string[];
        }>;
    };
    userExperience?: {
        satisfaction: {
            averageEaseOfUse: number;
            averageConfidence: number;
            averageFrustration: number;
        };
        effectiveness: {
            averageTaskCompletion: number;
            averageErrorHandling: number;
            averageLearning: number;
        };
        demographicDistribution: Record<string, number>;
        proficiencyCorrelation: {
            proficiencyLevel: number;
            successRate: number;
        };
    };
}

function analyzeResults(filePath: string): Analytics {
    const data: SessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Initialize analytics
    const analytics: Analytics = {
        efficiency: {
            averageTimePerTest: 0,
            averageTimePerAttempt: 0,
            fastestTest: { testName: '', timeMs: Infinity },
            slowestTest: { testName: '', timeMs: 0 },
            timeDistribution: {
                under30s: 0,
                under1min: 0,
                over1min: 0
            }
        },
        effectiveness: {
            successRate: 0,
            averageAttemptsPerTest: 0,
            errorDistribution: {},
            mostCommonErrors: [],
            commandProgression: {
                averageCommandsToSuccess: 0,
                mostCommonFirstCommands: []
            }
        },
        patterns: {
            errorPatterns: [],
            commandPatterns: []
        }
    };

    // Calculate efficiency metrics
    let totalTime = 0;
    let totalAttempts = 0;
    let successfulTests = 0;
    const firstCommands: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    // Get the completed tests (those with time > 0)
    const completedTests = data.tests.filter(test => test.totalTimeMs > 0);

    completedTests.forEach(test => {
        // Time metrics
        totalTime += test.totalTimeMs;
        totalAttempts += test.totalAttempts;
        
        if (test.totalTimeMs < analytics.efficiency.fastestTest.timeMs) {
            analytics.efficiency.fastestTest = { testName: test.testName, timeMs: test.totalTimeMs };
        }
        if (test.totalTimeMs > analytics.efficiency.slowestTest.timeMs) {
            analytics.efficiency.slowestTest = { testName: test.testName, timeMs: test.totalTimeMs };
        }

        // Time distribution
        if (test.totalTimeMs < 30000) analytics.efficiency.timeDistribution.under30s++;
        else if (test.totalTimeMs < 60000) analytics.efficiency.timeDistribution.under1min++;
        else analytics.efficiency.timeDistribution.over1min++;

        // Success metrics
        const lastAttempt = test.attempts[test.attempts.length - 1];
        if (lastAttempt?.success) successfulTests++;

        // Command progression
        const firstCommand = test.attempts[0]?.command;
        if (firstCommand) {
            firstCommands[firstCommand] = (firstCommands[firstCommand] || 0) + 1;
        }

        // Error analysis
        test.errorTypes.forEach(errorType => {
            errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
        });

        // Pattern analysis
        if (test.attempts.length > 1) {
            analytics.patterns.errorPatterns.push({
                testName: test.testName,
                commonErrorSequence: test.errorTypes
            });

            const successfulCommand = test.attempts.find(a => a.success)?.command;
            if (successfulCommand) {
                analytics.patterns.commandPatterns.push({
                    testName: test.testName,
                    successfulCommand,
                    commonMistakes: test.attempts
                        .filter(a => !a.success)
                        .map(a => a.command)
                });
            }
        }
    });

    // Calculate averages
    analytics.efficiency.averageTimePerTest = totalTime / completedTests.length;
    analytics.efficiency.averageTimePerAttempt = totalTime / totalAttempts;
    analytics.effectiveness.successRate = (successfulTests / completedTests.length) * 100;
    analytics.effectiveness.averageAttemptsPerTest = totalAttempts / completedTests.length;

    // Process error distribution
    analytics.effectiveness.errorDistribution = errorCounts;
    analytics.effectiveness.mostCommonErrors = Object.entries(errorCounts)
        .map(([errorType, count]) => ({ errorType, count }))
        .sort((a, b) => b.count - a.count);

    // Process command progression
    analytics.effectiveness.commandProgression.averageCommandsToSuccess = 
        successfulTests > 0 ? totalAttempts / successfulTests : 0;
    analytics.effectiveness.commandProgression.mostCommonFirstCommands = 
        Object.entries(firstCommands)
            .map(([command, count]) => ({ command, count }))
            .sort((a, b) => b.count - a.count);

    // Add user experience analytics if available
    if (data.postQuestionnaire) {
        analytics.userExperience = {
            satisfaction: {
                averageEaseOfUse: data.postQuestionnaire.satisfaction.easeOfUse,
                averageConfidence: data.postQuestionnaire.satisfaction.confidence,
                averageFrustration: data.postQuestionnaire.satisfaction.frustration
            },
            effectiveness: {
                averageTaskCompletion: data.postQuestionnaire.effectiveness.taskCompletion,
                averageErrorHandling: data.postQuestionnaire.effectiveness.errorHandling,
                averageLearning: data.postQuestionnaire.effectiveness.learning
            },
            demographicDistribution: {
                age: data.preQuestionnaire?.demographics.age ? 1 : 0,
                education: data.preQuestionnaire?.demographics.education ? 1 : 0
            },
            proficiencyCorrelation: {
                proficiencyLevel: data.preQuestionnaire?.cliProficiency.proficiencyLevel || 0,
                successRate: analytics.effectiveness.successRate
            }
        };
    }

    return analytics;
}

function generateReport(analytics: Analytics): string {
    const report = [
        "AI-CLI Evaluation Analytics Report",
        "==================================\n",
        
        "1. Efficiency Analysis",
        "---------------------",
        `Average Time per Test: ${(analytics.efficiency.averageTimePerTest / 1000).toFixed(2)}s`,
        `Average Time per Attempt: ${(analytics.efficiency.averageTimePerAttempt / 1000).toFixed(2)}s`,
        `Fastest Test: ${analytics.efficiency.fastestTest.testName} (${(analytics.efficiency.fastestTest.timeMs / 1000).toFixed(2)}s)`,
        `Slowest Test: ${analytics.efficiency.slowestTest.testName} (${(analytics.efficiency.slowestTest.timeMs / 1000).toFixed(2)}s)`,
        "\nTime Distribution:",
        `- Under 30s: ${analytics.efficiency.timeDistribution.under30s} tests`,
        `- Under 1min: ${analytics.efficiency.timeDistribution.under1min} tests`,
        `- Over 1min: ${analytics.efficiency.timeDistribution.over1min} tests\n`,

        "2. Effectiveness Analysis",
        "------------------------",
        `Success Rate: ${analytics.effectiveness.successRate.toFixed(2)}%`,
        `Average Attempts per Test: ${analytics.effectiveness.averageAttemptsPerTest.toFixed(2)}`,
        "\nMost Common Errors:",
        ...analytics.effectiveness.mostCommonErrors
            .slice(0, 5)
            .map(e => `- ${e.errorType}: ${e.count} occurrences`),
        "\nCommand Progression:",
        `Average Commands to Success: ${analytics.effectiveness.commandProgression.averageCommandsToSuccess.toFixed(2)}`,
        "\nMost Common First Commands:",
        ...analytics.effectiveness.commandProgression.mostCommonFirstCommands
            .slice(0, 5)
            .map(c => `- ${c.command}: ${c.count} times`),
        "\n",

        "3. Pattern Analysis",
        "------------------",
        "\nCommon Error Patterns:",
        ...analytics.patterns.errorPatterns
            .slice(0, 5)
            .map(p => `- ${p.testName}: ${p.commonErrorSequence.join(" -> ")}`),
        "\nCommand Patterns:",
        ...analytics.patterns.commandPatterns
            .slice(0, 5)
            .map(p => `- ${p.testName}:\n  Success: ${p.successfulCommand}\n  Common Mistakes: ${p.commonMistakes.join(", ")}`)
    ];

    // Add user experience section if available
    if (analytics.userExperience) {
        report.push(
            "\n4. User Experience",
            "------------------",
            "\nSatisfaction Metrics:",
            `- Ease of Use: ${analytics.userExperience.satisfaction.averageEaseOfUse.toFixed(2)}/5`,
            `- Confidence: ${analytics.userExperience.satisfaction.averageConfidence.toFixed(2)}/5`,
            `- Frustration: ${analytics.userExperience.satisfaction.averageFrustration.toFixed(2)}/5`,
            "\nEffectiveness Metrics:",
            `- Task Completion: ${analytics.userExperience.effectiveness.averageTaskCompletion.toFixed(2)}/5`,
            `- Error Handling: ${analytics.userExperience.effectiveness.averageErrorHandling.toFixed(2)}/5`,
            `- Learning: ${analytics.userExperience.effectiveness.averageLearning.toFixed(2)}/5`,
            "\nUser Background Correlation:",
            `- CLI Proficiency Level: ${analytics.userExperience.proficiencyCorrelation.proficiencyLevel}/5`,
            `- Success Rate: ${analytics.userExperience.proficiencyCorrelation.successRate.toFixed(2)}%`
        );
    }

    return report.join("\n");
}

// Main execution
const resultsPath = path.join(process.cwd(), 'output', 'results.json');
try {
    const analytics = analyzeResults(resultsPath);
    const report = generateReport(analytics);
    console.log(report);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'output', 'analytics-report.txt');
    fs.writeFileSync(reportPath, report);
    console.log(`\nReport saved to: ${reportPath}`);
} catch (error) {
    console.error('Error analyzing results:', error);
    process.exit(1);
} 