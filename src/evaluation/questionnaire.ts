import { input, select } from '@inquirer/prompts';
import { Store } from './store.ts';
import chalk from 'chalk';
import { 
    createTitleBanner, 
    createInfoBox, 
    createSectionHeader, 
    styledPrompt,
    Section, 
    colors 
} from '../utils/formatting.ts';

interface PreQuestionnaire {
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

const AGE_OPTIONS = [
    'Under 18',
    '18–24',
    '25–34',
    '35–44',
    '45–54',
    '55+'
];

const GENDER_OPTIONS = [
    'Prefer not to say',
    'Non-binary',
    'Female',
    'Male',
    'Other'
];

const EDUCATION_OPTIONS = [
    'High school',
    'Bachelor\'s degree',
    'Master\'s degree',
    'Doctorate',
    'Other'
];

const EXPERIENCE_OPTIONS = [
    'Less than 1 year',
    '1–3 years',
    '3–5 years',
    '5–10 years',
    '10+ years'
];

const FIELD_OPTIONS = [
    'Software Engineering',
    'DevOps / System Administration',
    'Data Science / ML Engineering',
    'Research / Academia',
    'Other'
];

const USAGE_FREQUENCY_OPTIONS = [
    'Daily',
    'Weekly',
    'Monthly',
    'Rarely'
];

const CLI_ENVIRONMENTS = [
    'Bash',
    'Zsh',
    'Fish',
    'Windows Command Prompt / PowerShell',
    'Other'
];

const LEARNING_METHODS = [
    'Documentation / Manuals',
    'Online tutorials',
    'Trial and error',
    'Asking AI assistants',
    'Other'
];

export class QuestionnaireManager {
    private store: Store;

    constructor(store: Store) {
        this.store = store;
    }

    async runPreQuestionnaire(): Promise<PreQuestionnaire> {
        console.clear();
        
        // Header with centralized title banner
        console.log(createTitleBanner('📋 PRE-STUDY QUESTIONNAIRE 📋', colors.primary));
        
        // Intro message with centralized info box
        const introSections: Section[] = [
            {
                label: "Questionnaire Purpose",
                content: "Please answer the following questions to help us understand your background and experience. Your responses will be kept confidential and used only for research purposes."
            }
        ];
        
        console.log(createInfoBox(introSections, 'BACKGROUND INFORMATION'));

        const demographics = await this.collectDemographics();
        const professional = await this.collectProfessionalInfo();
        const cliProficiency = await this.collectCLIProficiency();
        const aiExperience = await this.collectAIExperience();
        const learningPreferences = await this.collectLearningPreferences();

        const questionnaire: PreQuestionnaire = {
            demographics,
            professional,
            cliProficiency,
            aiExperience,
            learningPreferences
        };

        this.store.setPreQuestionnaire(questionnaire);
        
        // Set user name in store
        this.store.setUserName(demographics.name);
        
        return questionnaire;
    }

    async runPostQuestionnaire(): Promise<PostQuestionnaire> {
        console.clear();
        
        // Header with centralized title banner
        console.log(createTitleBanner('📝 POST-STUDY QUESTIONNAIRE 📝', colors.purple));
        
        // Intro message with centralized info box
        const feedbackSections: Section[] = [
            {
                emoji: "💬",
                label: "Feedback",
                content: "Please share your experience with the CLI tool you just used. Your feedback is valuable and will help us improve the system."
            }
        ];
        
        console.log(createInfoBox(feedbackSections, 'YOUR EXPERIENCE', colors.purple));

        const satisfaction = await this.collectSatisfaction();
        const effectiveness = await this.collectEffectiveness();
        const comments = await this.collectComments();

        const questionnaire: PostQuestionnaire = {
            satisfaction,
            effectiveness,
            comments
        };

        this.store.setPostQuestionnaire(questionnaire);
        return questionnaire;
    }

    private async collectDemographics() {
        // Section header with centralized section header
        console.log(createSectionHeader('DEMOGRAPHICS', '👤', colors.info));

        const name = await input({ 
            message: styledPrompt('Enter your full name:', colors.secondary)
        });

        const age = await select({
            message: styledPrompt('Age:', colors.secondary),
            choices: AGE_OPTIONS.map(option => ({ value: option }))
        });

        const gender = await select({
            message: styledPrompt('Gender:', colors.secondary),
            choices: GENDER_OPTIONS.map(option => ({ value: option }))
        });

        const education = await select({
            message: styledPrompt('Education Level:', colors.secondary),
            choices: EDUCATION_OPTIONS.map(option => ({ value: option }))
        });

        return { name, age, gender, education };
    }

    private async collectProfessionalInfo() {
        // Section header with centralized section header
        console.log(createSectionHeader('PROFESSIONAL BACKGROUND', '👔', colors.primary));

        const role = await input({ 
            message: styledPrompt('Current Role:', colors.primary)
        });

        const experience = await select({
            message: styledPrompt('Years of Professional Experience:', colors.primary),
            choices: EXPERIENCE_OPTIONS.map(option => ({ value: option }))
        });

        const field = await select({
            message: styledPrompt('Primary Field of Work:', colors.primary),
            choices: FIELD_OPTIONS.map(option => ({ value: option }))
        });

        return { role, experience, field };
    }

    private async collectCLIProficiency() {
        // Section header with centralized section header
        console.log(createSectionHeader('CLI PROFICIENCY', '💻', colors.secondary));

        const usageFrequency = await select({
            message: styledPrompt('How often do you use a command-line interface?', colors.cyan),
            choices: USAGE_FREQUENCY_OPTIONS.map(option => ({ value: option }))
        });

        const proficiencyLevel = await select({
            message: styledPrompt('Self-rated CLI Proficiency (1 = Novice, 5 = Expert):', colors.cyan),
            choices: [1, 2, 3, 4, 5].map(level => ({ value: level }))
        });

        // Collect environments one by one with better styling
        console.log(chalk.hex(colors.cyan).bold("\nSelect all CLI environments you have used:"));
        const environments: string[] = [];
        let addMore = true;
        while (addMore) {
            const environment = await select({
                message: styledPrompt('Select a CLI environment (or "Done" to finish):', colors.cyan),
                choices: [...CLI_ENVIRONMENTS.map(option => ({ value: option })), { value: 'done', name: '✅ Done selecting' }]
            });

            if (environment === 'done') {
                addMore = false;
            } else {
                environments.push(environment);
                console.log(chalk.hex('#2E8B57')(`✓ Added: ${environment} (${environments.length} selected)`));
            }
        }

        return { usageFrequency, proficiencyLevel, environments };
    }

    private async collectAIExperience() {
        // Section header with centralized section header
        console.log(createSectionHeader('AI EXPERIENCE', '🤖', colors.purple));

        const hasUsedAI = await select({
            message: styledPrompt('Have you previously used any AI-assisted tools or coding assistants?', colors.purple),
            choices: [
                { value: true, name: 'Yes' },
                { value: false, name: 'No' }
            ]
        });

        let experienceDescription;
        if (hasUsedAI) {
            experienceDescription = await input({
                message: styledPrompt('Briefly describe your experience or which tools you\'ve used:', colors.purple)
            });
        }

        return { hasUsedAI, experienceDescription };
    }

    private async collectLearningPreferences() {
        // Section header with centralized section header
        console.log(createSectionHeader('LEARNING PREFERENCES', '📚', colors.success));

        const preferredMethod = await select({
            message: styledPrompt('When learning CLI commands, what is your preferred method?', colors.success),
            choices: LEARNING_METHODS.map(option => ({ value: option }))
        });

        return { preferredMethod };
    }

    private async collectSatisfaction() {
        // Section header with centralized section header
        console.log(createSectionHeader('SATISFACTION', '😊', colors.warning));

        const easeOfUse = await select({
            message: styledPrompt('Rate the ease of use (1 = Very Difficult, 5 = Very Easy):', colors.warning),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(Very Difficult)' : level === 5 ? '(Very Easy)' : ''}` 
            }))
        });

        const confidence = await select({
            message: styledPrompt('Rate your confidence in using the CLI (1 = Not Confident, 5 = Very Confident):', colors.warning),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(Not Confident)' : level === 5 ? '(Very Confident)' : ''}` 
            }))
        });

        const frustration = await select({
            message: styledPrompt('Rate your level of frustration (1 = No Frustration, 5 = Very Frustrated):', colors.warning),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(No Frustration)' : level === 5 ? '(Very Frustrated)' : ''}` 
            }))
        });

        return { easeOfUse, confidence, frustration };
    }

    private async collectEffectiveness() {
        // Section header with centralized section header
        console.log(createSectionHeader('EFFECTIVENESS', '⚡', colors.success));

        const taskCompletion = await select({
            message: styledPrompt('Rate the effectiveness in completing tasks (1 = Not Effective, 5 = Very Effective):', colors.success),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(Not Effective)' : level === 5 ? '(Very Effective)' : ''}` 
            }))
        });

        const errorHandling = await select({
            message: styledPrompt('Rate the effectiveness in handling errors (1 = Not Effective, 5 = Very Effective):', colors.success),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(Not Effective)' : level === 5 ? '(Very Effective)' : ''}` 
            }))
        });

        const learning = await select({
            message: styledPrompt('Rate the effectiveness in learning CLI commands (1 = Not Effective, 5 = Very Effective):', colors.success),
            choices: [1, 2, 3, 4, 5].map(level => ({ 
                value: level, 
                name: `${level} ${level === 1 ? '(Not Effective)' : level === 5 ? '(Very Effective)' : ''}` 
            }))
        });

        return { taskCompletion, errorHandling, learning };
    }

    private async collectComments() {
        // Section header with centralized section header
        console.log(createSectionHeader('ADDITIONAL FEEDBACK', '💬', colors.secondary));

        return await input({
            message: styledPrompt('Please provide any additional comments or feedback:', colors.secondary)
        });
    }
} 