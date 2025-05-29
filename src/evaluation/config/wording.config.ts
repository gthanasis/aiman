/**
 * Central configuration file for all text, labels, and UI appearance settings
 * across the application. This makes it easy to modify text without changing code.
 */

// Color palette for the application
export const colors = {
    primary: '#2ecc71',
    secondary: '#e67e22',
    info: '#3498db',
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    purple: '#9b59b6',
    cyan: '#00bcd4',
    white: '#ffffff'
};

// Questionnaire theme configuration
export const wordingConfig = {
    // Pre-questionnaire settings
    pre: {
        titleColor: colors.primary,
        title: '📋 PRE-STUDY QUESTIONNAIRE 📋',
        infoBoxTitle: 'BACKGROUND INFORMATION',
        infoBoxColor: colors.info,
        purposeLabel: "Questionnaire Purpose",
        purposeText: "Please answer the following questions to help us understand your background and experience. Your responses will be kept confidential and used only for research purposes."
    },
    
    // Post-questionnaire settings
    post: {
        titleColor: colors.purple,
        title: '📝 POST-STUDY QUESTIONNAIRE 📝',
        infoBoxTitle: 'YOUR EXPERIENCE',
        infoBoxColor: colors.purple,
        feedbackText: "Please share your experience with the CLI tool you just used. Your feedback is valuable and will help us improve the system."
    },
    
    // Multi-select options
    multiSelect: {
        doneOption: '✅ Done selecting',
        selectionPrompt: 'Select an option (or "Done" to finish):',
        addedPrefix: '✓ Added:'
    },
    
    // Test UI elements
    test: {
        promptSymbol: '❯',
        correctSolutionMessage: '✅ CORRECT SOLUTION! Great job!',
        assessingMessage: 'Assessing command output',
        passedMessage: 'Test passed',
        tryAgainPrefix: 'Try again:',
        tryAgain: 'Try again. This command does not solve the task.',
        failedAssessmentMessage: 'Failed to assess command',
        llmEnabledLabel: '🤖 LLM Assistance Enabled',
        llmDisabledLabel: '👤 No LLM Assistance'
    },
    
    // Main study UI
    study: {
        mainTitle: 'CLI USABILITY STUDY',
        completionTitle: 'THANK YOU FOR YOUR PARTICIPATION!',
        testCompletedTitle: 'TEST COMPLETED',
        studyInfoTitle: 'STUDY INFORMATION',
        completionSectionTitle: 'STUDY COMPLETION',
        
        // Study information sections
        aboutStudyLabel: 'About This Study',
        aboutStudyEmoji: '🔍',
        aboutStudyContent: "This test evaluates how users interact with different CLI interfaces. You'll complete a series of command-line tasks in a structured environment.",
        
        taskInstructionsLabel: 'Task Instructions',
        taskInstructionsEmoji: '📋',
        taskInstructionsContent: "• You will fix broken commands as they appear\n• The experimental CLI provides AI assistance for failed commands\n• Click ctrl+d to discard the current test and continue with the next one\n",
        
        dataCollectionLabel: 'Data Collection Notice',
        dataCollectionEmoji: '📊',
        dataCollectionContent: "For research purposes, we'll record:\n• Commands and errors\n• Task completion times\n• Survey responses\n• Success rates and patterns",
        
        // Consent message
        consentMessage: 'Do you consent to participate and allow data collection?',
        consentPrompt: 'Enter "yes" to continue or "no" to exit:',
        declinedMessage: 'You have declined to participate. The study has been terminated.',
        
        // Completion message
        researchImpactLabel: 'Research Impact',
        researchImpactEmoji: '📈',
        researchImpactContent: "Your responses will help improve CLI usability and AI assistance methods. We appreciate your valuable contribution to this research."
    }
}; 