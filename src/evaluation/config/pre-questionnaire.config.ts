export interface QuestionOption {
  value: string | number | boolean;
  label?: string;
}

export interface QuestionConfig {
  id: string;
  section: string;
  sectionIcon?: string;
  sectionColor?: string;
  type: 'input' | 'select' | 'multi-select';
  question: string;
  options?: QuestionOption[];
  isRequired?: boolean;
  dependsOn?: {
    questionId: string;
    value: any;
  };
}

export const preQuestionnaireConfig: QuestionConfig[] = [
  // Demographics section
  {
    id: 'demographics.name',
    section: 'DEMOGRAPHICS',
    sectionIcon: '👤',
    sectionColor: '#3498db', // info color
    type: 'input',
    question: 'Enter your full name:',
    isRequired: true
  },
  {
    id: 'demographics.age',
    section: 'DEMOGRAPHICS',
    type: 'select',
    question: 'Age:',
    options: [
      { value: 'Under 18' },
      { value: '18–24' },
      { value: '25–34' },
      { value: '35–44' },
      { value: '45–54' },
      { value: '55+' }
    ]
  },
  {
    id: 'demographics.gender',
    section: 'DEMOGRAPHICS',
    type: 'select',
    question: 'Gender:',
    options: [
      { value: 'Prefer not to say' },
      { value: 'Non-binary' },
      { value: 'Female' },
      { value: 'Male' },
      { value: 'Other' }
    ]
  },
  {
    id: 'demographics.education',
    section: 'DEMOGRAPHICS',
    type: 'select',
    question: 'Education Level:',
    options: [
      { value: 'High school' },
      { value: 'Bachelor\'s degree' },
      { value: 'Master\'s degree' },
      { value: 'Doctorate' },
      { value: 'Other' }
    ]
  },

  // Professional Background
  {
    id: 'professional.role',
    section: 'PROFESSIONAL BACKGROUND',
    sectionIcon: '👔',
    sectionColor: '#2ecc71', // primary color
    type: 'input',
    question: 'Current Role:'
  },
  {
    id: 'professional.experience',
    section: 'PROFESSIONAL BACKGROUND',
    type: 'select',
    question: 'Years of Professional Experience:',
    options: [
      { value: 'Less than 1 year' },
      { value: '1–3 years' },
      { value: '3–5 years' },
      { value: '5–10 years' },
      { value: '10+ years' }
    ]
  },
  {
    id: 'professional.field',
    section: 'PROFESSIONAL BACKGROUND',
    type: 'select',
    question: 'Primary Field of Work:',
    options: [
      { value: 'Software Engineering' },
      { value: 'DevOps / System Administration' },
      { value: 'Data Science / ML Engineering' },
      { value: 'Research / Academia' },
      { value: 'Other' }
    ]
  },

  // CLI Proficiency
  {
    id: 'cliProficiency.usageFrequency',
    section: 'CLI PROFICIENCY',
    sectionIcon: '💻',
    sectionColor: '#e67e22', // secondary color
    type: 'select',
    question: 'How often do you use a command-line interface?',
    options: [
      { value: 'Daily' },
      { value: 'Weekly' },
      { value: 'Monthly' },
      { value: 'Rarely' }
    ]
  },
  {
    id: 'cliProficiency.proficiencyLevel',
    section: 'CLI PROFICIENCY',
    type: 'select',
    question: 'Self-rated CLI Proficiency (1 = Novice, 5 = Expert):',
    options: [
      { value: 1 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5 }
    ]
  },
  {
    id: 'cliProficiency.environments',
    section: 'CLI PROFICIENCY',
    type: 'multi-select',
    question: 'Select all CLI environments you have used:',
    options: [
      { value: 'Bash' },
      { value: 'Zsh' },
      { value: 'Fish' },
      { value: 'Windows Command Prompt / PowerShell' },
      { value: 'Other' }
    ]
  },

  // AI Experience
  {
    id: 'aiExperience.hasUsedAI',
    section: 'AI EXPERIENCE',
    sectionIcon: '🤖',
    sectionColor: '#9b59b6', // purple color
    type: 'select',
    question: 'Have you previously used any AI-assisted tools or coding assistants?',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  {
    id: 'aiExperience.experienceDescription',
    section: 'AI EXPERIENCE',
    type: 'input',
    question: 'Briefly describe your experience or which tools you\'ve used:',
    dependsOn: {
      questionId: 'aiExperience.hasUsedAI',
      value: true
    }
  },

  // Learning Preferences
  {
    id: 'learningPreferences.preferredMethod',
    section: 'LEARNING PREFERENCES',
    sectionIcon: '📚',
    sectionColor: '#27ae60', // success color
    type: 'select',
    question: 'When learning CLI commands, what is your preferred method?',
    options: [
      { value: 'Documentation / Manuals' },
      { value: 'Online tutorials' },
      { value: 'Trial and error' },
      { value: 'Asking AI assistants' },
      { value: 'Other' }
    ]
  }
]; 