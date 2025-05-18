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
import { preQuestionnaireConfig } from './config/pre-questionnaire.config.ts';
import { wordingConfig } from './config/wording.config.ts';
import { postQuestionnaireConfig } from './config/post-questionnaire.config.ts';

// Exported for type compatibility with the Store
export interface PostQuestionnaire {
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

// Default color to use if section color is not specified
const DEFAULT_SECTION_COLOR = colors.primary;

export class QuestionnaireManager {
    private store: Store;
    private currentSection: string = '';

    constructor(store: Store) {
        this.store = store;
    }

    async runPreQuestionnaire(): Promise<any> {
        console.clear();
        
        // Header with centralized title banner
        console.log(createTitleBanner(
            wordingConfig.pre.title, 
            wordingConfig.pre.titleColor
        ));
        
        // Intro message with centralized info box
        const introSections: Section[] = [
            {
                label: wordingConfig.pre.purposeLabel,
                content: wordingConfig.pre.purposeText
            }
        ];
        
        console.log(createInfoBox(
            introSections, 
            wordingConfig.pre.infoBoxTitle, 
            wordingConfig.pre.infoBoxColor
        ));

        const preQuestionnaire: any = {};
        
        for (const question of preQuestionnaireConfig) {
            // Check if this question depends on another
            if (question.dependsOn) {
                const { questionId, value } = question.dependsOn;
                const [section, field] = questionId.split('.');
                
                // Skip if the dependency value doesn't match
                if (!preQuestionnaire[section] || preQuestionnaire[section][field] !== value) {
                    continue;
                }
            }
            
            // Display section header if it's a new section
            if (question.section !== this.currentSection) {
                this.currentSection = question.section;
                
                // Get the section color from the first question with this section that has a color
                const sectionConfig = preQuestionnaireConfig.find(q => 
                    q.section === question.section && q.sectionColor);
                
                const sectionColor = sectionConfig?.sectionColor || DEFAULT_SECTION_COLOR;
                
                console.log(createSectionHeader(
                    question.section,
                    question.sectionIcon || '',
                    sectionColor
                ));
            }
            
            // Initialize the section if it doesn't exist
            const [section, field] = question.id.split('.');
            if (!preQuestionnaire[section]) {
                preQuestionnaire[section] = {};
            }
            
            // Get the question color (use section color if available, otherwise default)
            const questionColor = question.sectionColor || colors.secondary;
            
            // Ask the question based on its type
            if (question.type === 'input') {
                preQuestionnaire[section][field] = await input({ 
                    message: styledPrompt(question.question, questionColor)
                });
            } else if (question.type === 'select' && question.options) {
                preQuestionnaire[section][field] = await select({
                    message: styledPrompt(question.question, questionColor),
                    choices: question.options.map(option => ({ 
                        value: option.value, 
                        name: option.label || option.value.toString() 
                    }))
                });
            } else if (question.type === 'multi-select' && question.options) {
                // Handle multi-select differently
                console.log(chalk.hex(questionColor).bold(`\n${question.question}`));
                const selectedValues: string[] = [];
                let addMore = true;
                
                while (addMore) {
                    const choices = [
                        ...question.options
                            .filter(option => !selectedValues.includes(option.value.toString()))
                            .map(option => ({ 
                                value: option.value.toString(), 
                                name: option.label || option.value.toString() 
                            })),
                        { value: 'done', name: wordingConfig.multiSelect.doneOption }
                    ];
                    
                    if (choices.length === 1) {
                        addMore = false;
                        break;
                    }
                    
                    const selected = await select({
                        message: styledPrompt(wordingConfig.multiSelect.selectionPrompt, questionColor),
                        choices
                    });

                    if (selected === 'done') {
                        addMore = false;
                    } else {
                        selectedValues.push(selected);
                        console.log(chalk.hex('#2E8B57')(`${wordingConfig.multiSelect.addedPrefix} ${selected} (${selectedValues.length} selected)`));
                    }
                }
                
                preQuestionnaire[section][field] = selectedValues;
            }
        }

        this.store.setPreQuestionnaire(preQuestionnaire);
        
        // Set user name in store if it exists
        if (preQuestionnaire.demographics && preQuestionnaire.demographics.name) {
            this.store.setUserName(preQuestionnaire.demographics.name);
        }
        
        return preQuestionnaire;
    }

    async runPostQuestionnaire(): Promise<any> {
        console.clear();
        
        // Header with centralized title banner
        console.log(createTitleBanner(
            wordingConfig.post.title, 
            wordingConfig.post.titleColor
        ));
        
        // Intro message with centralized info box
        const feedbackSections: Section[] = [
            {
                emoji: "💬",
                label: "Feedback",
                content: wordingConfig.post.feedbackText
            }
        ];
        
        console.log(createInfoBox(
            feedbackSections, 
            wordingConfig.post.infoBoxTitle, 
            wordingConfig.post.infoBoxColor
        ));

        const postQuestionnaire: any = {
            satisfaction: {},
            effectiveness: {},
            comments: ''
        };
        
        this.currentSection = '';
        
        for (const question of postQuestionnaireConfig) {
            // Display section header if it's a new section
            if (question.section !== this.currentSection) {
                this.currentSection = question.section;
                
                // Get the section color from the first question with this section that has a color
                const sectionConfig = postQuestionnaireConfig.find(q => 
                    q.section === question.section && q.sectionColor);
                
                const sectionColor = sectionConfig?.sectionColor || DEFAULT_SECTION_COLOR;
                
                console.log(createSectionHeader(
                    question.section,
                    question.sectionIcon || '',
                    sectionColor
                ));
            }
            
            // Get the question color (use section color if available, otherwise default)
            const questionColor = question.sectionColor || colors.secondary;
            
            // Ask the question based on its type and save to the appropriate place
            if (question.id === 'comments') {
                // Special case for comments which isn't nested
                postQuestionnaire.comments = await input({
                    message: styledPrompt(question.question, questionColor)
                });
            } else {
                // For nested properties
                const [section, field] = question.id.split('.');
                
                if (question.type === 'select' && question.options) {
                    postQuestionnaire[section][field] = await select({
                        message: styledPrompt(question.question, questionColor),
                        choices: question.options.map(option => ({ 
                            value: option.value, 
                            name: option.label || option.value.toString() 
                        }))
                    });
                } else if (question.type === 'input') {
                    postQuestionnaire[section][field] = await input({ 
                        message: styledPrompt(question.question, questionColor)
                    });
                }
            }
        }

        this.store.setPostQuestionnaire(postQuestionnaire);
        return postQuestionnaire;
    }
} 