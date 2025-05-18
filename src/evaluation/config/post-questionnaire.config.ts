// Define our own interfaces temporarily to avoid import issues
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

export const postQuestionnaireConfig: QuestionConfig[] = [
  // Satisfaction section
  {
    id: 'satisfaction.easeOfUse',
    section: 'SATISFACTION',
    sectionIcon: '😊',
    sectionColor: '#f39c12', // warning color
    type: 'select',
    question: 'Rate the ease of use (1 = Very Difficult, 5 = Very Easy):',
    options: [
      { value: 1, label: '1 (Very Difficult)' },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5, label: '5 (Very Easy)' }
    ]
  },
  {
    id: 'satisfaction.confidence',
    section: 'SATISFACTION',
    type: 'select',
    question: 'Rate your confidence in using the CLI (1 = Not Confident, 5 = Very Confident):',
    options: [
      { value: 1, label: '1 (Not Confident)' },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5, label: '5 (Very Confident)' }
    ]
  },
  {
    id: 'satisfaction.frustration',
    section: 'SATISFACTION',
    type: 'select',
    question: 'Rate your level of frustration (1 = No Frustration, 5 = Very Frustrated):',
    options: [
      { value: 1, label: '1 (No Frustration)' },
      { value: 2 },
      { value: 3 },
      { value: 4 },
      { value: 5, label: '5 (Very Frustrated)' }
    ]
  },

  // Additional Feedback
  {
    id: 'comments',
    section: 'ADDITIONAL FEEDBACK',
    sectionIcon: '💬',
    sectionColor: '#e67e22', // secondary color
    type: 'input',
    question: 'Please provide any additional comments or feedback:'
  }
]; 