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
    question: 'Which CLI was easier to use?',
    options: [
      { value: 1, label: 'Traditional CLI was much easier' },
      { value: 2, label: 'Traditional CLI was somewhat easier' },
      { value: 3, label: 'Both were equally easy to use' },
      { value: 4, label: 'LLM-assisted CLI was somewhat easier' },
      { value: 5, label: 'LLM-assisted CLI was much easier' }
    ]
  },
  {
    id: 'satisfaction.confidence',
    section: 'SATISFACTION',
    type: 'select',
    question: 'Which CLI made you feel more confident?',
    options: [
      { value: 1, label: 'Much more confident with traditional CLI' },
      { value: 2, label: 'Somewhat more confident with traditional CLI' },
      { value: 3, label: 'Felt equally confident with both' },
      { value: 4, label: 'Somewhat more confident with LLM-assisted CLI' },
      { value: 5, label: 'Much more confident with LLM-assisted CLI' }
    ]
  },
  {
    id: 'satisfaction.frustration',
    section: 'SATISFACTION',
    type: 'select',
    question: 'Which CLI was more frustrating to use?',
    options: [
      { value: 1, label: 'Traditional CLI was much more frustrating' },
      { value: 2, label: 'Traditional CLI was somewhat more frustrating' },
      { value: 3, label: 'Both were equally frustrating' },
      { value: 4, label: 'LLM-assisted CLI was somewhat more frustrating' },
      { value: 5, label: 'LLM-assisted CLI was much more frustrating' }
    ]
  },

  // Additional Feedback
  {
    id: 'comments',
    section: 'ADDITIONAL FEEDBACK',
    sectionIcon: '💬',
    sectionColor: '#e67e22', // secondary color
    type: 'input',
    question: 'Please provide any additional comments or feedback about your experience with both CLIs:'
  }
]; 