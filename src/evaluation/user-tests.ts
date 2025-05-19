import chalk from "chalk";
import { Store } from "./store.ts";
import { input } from '@inquirer/prompts';
import { Test } from './test.ts';
import { QuestionnaireManager } from './questionnaire.ts';
import { 
    createTitleBanner, 
    createInfoBox, 
    createDangerBox, 
    createNotificationBox, 
    styledPrompt,
    Section,
    colors 
} from '../utils/formatting.ts';
import { tests } from './config/tests.config.ts';
import { wordingConfig } from './config/wording.config.ts';
import { determineConditionOrder } from "../utils/ordering.ts";
import { determineTestCount } from "../utils/test-count.ts";
import { checkForHelpCommand } from "../utils/help.ts";

async function main() {
    const args = process.argv.slice(2);
    checkForHelpCommand(args)

    //----------------------------------------------
    // Initialize data storage and questionnaires
    //----------------------------------------------
    const store = new Store('./output/results.json');
    const questionnaireManager = new QuestionnaireManager(store);

    //----------------------------------------------
    // Initialize and parse command line arguments
    //----------------------------------------------
    const skipQuestionnaires = args.includes('--skip-questionnaires') || args.includes('-s');
    const testCountArg = args.find(arg => arg.startsWith('--test-count=') || arg.startsWith('-t='));
    const forceConditionOrder = args.find(arg => arg.startsWith('--condition-order='));
    const conditionOrder = determineConditionOrder(forceConditionOrder, store)
    let testCount = determineTestCount(testCountArg);

    // Save the chosen order for this user
    store.setConditionOrder(conditionOrder);

    //----------------------------------------------
    // Display study introduction and information
    //----------------------------------------------
    console.clear();
    console.log(createTitleBanner(wordingConfig.study.mainTitle));

    const combinedInfoSections: Section[] = [
        {
            emoji: wordingConfig.study.aboutStudyEmoji,
            label: wordingConfig.study.aboutStudyLabel,
            content: wordingConfig.study.aboutStudyContent
        },
        {
            emoji: wordingConfig.study.taskInstructionsEmoji,
            label: wordingConfig.study.taskInstructionsLabel,
            content: wordingConfig.study.taskInstructionsContent
        },
        {
            emoji: wordingConfig.study.dataCollectionEmoji,
            label: wordingConfig.study.dataCollectionLabel,
            content: wordingConfig.study.dataCollectionContent
        }
    ];

    console.log(createInfoBox(combinedInfoSections, wordingConfig.study.studyInfoTitle));

    //----------------------------------------------
    // Get user consent (unless skipped)
    //----------------------------------------------
    let proceed = 'yes';

    if (!skipQuestionnaires) {
        console.log(createNotificationBox(wordingConfig.study.consentMessage));

        proceed = await input({ 
            message: styledPrompt(wordingConfig.study.consentPrompt, colors.white) 
        });
    }

    if (proceed.toLowerCase() !== 'yes' && !skipQuestionnaires) {
        console.log(createDangerBox(wordingConfig.study.declinedMessage));
        process.exit(0);
    }

    //----------------------------------------------
    // Run pre-study questionnaire (unless skipped)
    //----------------------------------------------
    if (!skipQuestionnaires) {
        await questionnaireManager.runPreQuestionnaire();
    }

    //----------------------------------------------
    // Prepare test instances
    //----------------------------------------------
    const testInstances = tests.map(testConfig => 
        new Test({
            store,
            config: testConfig,
        })
    );

    // Limit to the specified count
    const testsToRun = testInstances.slice(0, testCount);

    // Sort tests based on condition order
    testsToRun.sort((a, b) => {
        // If traditional-first, non-LLM assisted tests should come first
        if (conditionOrder === 'traditional-first') {
            return a.isLlmAssisted === b.isLlmAssisted ? 0 : a.isLlmAssisted ? 1 : -1;
        } 
        // If ai-first, LLM assisted tests should come first
        else {
            return a.isLlmAssisted === b.isLlmAssisted ? 0 : a.isLlmAssisted ? -1 : 1;
        }
    });

    //----------------------------------------------
    // Run all test instances
    //----------------------------------------------
    for (const test of testsToRun) {
        console.clear();
        // run pre command
        await test.runPreCommand();
        // run test
        await test.run();
    }

    //----------------------------------------------
    // Run post-study questionnaire and show completion
    //----------------------------------------------
    if (!skipQuestionnaires) {
        await questionnaireManager.runPostQuestionnaire();

        console.log(createTitleBanner(wordingConfig.study.completionTitle));

        const completionSections: Section[] = [
            {
                emoji: wordingConfig.study.researchImpactEmoji,
                label: wordingConfig.study.researchImpactLabel,
                content: wordingConfig.study.researchImpactContent
            }
        ];

        console.log(createInfoBox(completionSections, wordingConfig.study.completionSectionTitle));
    } else {
        console.log(createTitleBanner(wordingConfig.study.testCompletedTitle));
    }
}

main().catch(error => {
    console.error(chalk.red('Fatal error:'));
    console.error(error);
    process.exit(1);
});