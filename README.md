# AIMAN: AI-assisted CLI Testing Framework

AIMAN began as a proof of concept for an AI-assisted command line interface and evolved into a comprehensive HCI testing framework. It provides researchers with tools to evaluate how AI assistance affects CLI usability through structured experiments.

## Overview

This framework allows researchers and developers to:
- Conduct HCI experiments on CLI interfaces
- Evaluate the impact of AI assistance on command-line usage
- Collect structured data for human-computer interaction research
- Customize experimental parameters through configuration files

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Docker (for running user tests)
- OpenAI API Key

### Environment Setup

Before running the application, you must set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

1. **AI-driven CLI interface** (proof of concept):
```bash
yarn dev
```

2. **User testing framework** (should only be run in Docker):
```bash
yarn user:test:docker
```

## Customizing Experiments

All experiment configuration is stored in configuration files that can be easily modified:

### Questionnaires

- `src/evaluation/config/pre-questionnaire.config.ts`: Define demographics and background questions
- `src/evaluation/config/post-questionnaire.config.ts`: Configure experience and satisfaction questions

### Test Cases

- `src/evaluation/config/tests.config.ts`: Define CLI commands to test, correct solutions, and categorization

### UI Text and Appearance

- `src/evaluation/config/wording.config.ts`: Centralized configuration for all text, labels, and UI appearance

## Data Collection and Storage

The framework includes a comprehensive data tracking system:

### Store Mechanism

The `Store` class in `src/evaluation/store.ts` manages all experimental data:

- **Session Tracking**: Each user session receives a unique ID and timestamps
- **Test Results**: Records every command attempt, success/failure status, and timing
- **Questionnaire Data**: Stores pre and post questionnaire responses
- **Error Types**: Categorizes and tracks different types of errors

### Data Structure

Data is stored in JSON format with the following structure:

```json
[
  {
    "runId": "unique-session-id",
    "userName": "participant-name",
    "startTime": "ISO timestamp",
    "tests": [
      {
        "testName": "command-test-name",
        "description": "test description",
        "attempts": [
          {
            "attemptNumber": 1,
            "command": "user-entered-command",
            "timestamp": "ISO timestamp",
            "stdout": "command output",
            "stderr": "error output if any",
            "errorType": "categorized error",
            "timeMs": 1234,
            "success": true/false
          }
        ],
        "totalTimeMs": 5678,
        "totalAttempts": 3,
        "errorTypes": ["syntax", "parameter"],
        "startTime": "ISO timestamp",
        "endTime": "ISO timestamp",
        "isLlmAssisted": true/false,
        "category": "test category"
      }
    ],
    "preQuestionnaire": { /* questionnaire responses */ },
    "postQuestionnaire": { /* questionnaire responses */ },
    "conditionOrder": "traditional-first" // or "ai-first"
  }
]
```

### Data Output

All collected data is written to the `/output` directory, which is mounted as a volume when running in Docker, allowing you to access the results after the experiment concludes.

### Study Metrics

The framework collects key metrics for analyzing CLI usability:

1. **Performance Metrics**:
   - Task completion rates
   - Time spent per command
   - Number of attempts before success
   - Types of errors encountered

2. **Questionnaire Metrics**:
   - User satisfaction ratings
   - Perceived ease of use
   - Confidence levels
   - Frustration scores
   - Qualitative feedback

3. **Comparative Analysis**:
   - AI-assisted vs. traditional command-line performance
   - User experience differences between conditions
   - Learning patterns across test categories

### Experimental Design

AIMAN implements a **within-subjects experiment design** where each participant experiences both conditions:
- **Condition A**: Traditional CLI (no AI assistance)
- **Condition B**: AI-assisted CLI

The **conditionOrder** parameter controls the sequence of conditions to counterbalance learning effects:
- "traditional-first": Participant first uses the traditional CLI, then the AI-assisted CLI
- "ai-first": Participant first uses the AI-assisted CLI, then the traditional CLI

This within-groups design allows for:
- Direct comparison of both interfaces by the same user
- Reduced variance by controlling for individual differences
- More statistical power with fewer participants
- Analysis of learning and transfer effects between conditions

The framework automatically balances condition orders across participants and tracks which order was assigned to each session in the stored data.

Additional experimental controls:
- Test counts can be configured via command line arguments
- Questionnaires can be skipped for testing with the `--skip-questionnaires` flag
- Test categories are balanced across conditions

## Experiment Structure

The framework guides users through:
1. Pre-study questionnaire to gather demographics and experience level
2. CLI test scenarios in both conditions (with and without AI assistance)
3. Post-study questionnaire to evaluate user experience

Data is collected for analysis on command success rates, completion times, and user satisfaction.

## Docker Usage

The Docker container ensures a consistent testing environment. It mounts an output directory to preserve results:

```bash
# Build and run with Docker
docker build --no-cache -t aiman .
docker run -it --rm -e OPENAI_API_KEY -v $(pwd)/output:/app/output aiman /bin/sh
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
