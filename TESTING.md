# QuranLingo Testing Framework

This document explains how to use the testing framework for the QuranLingo app.

## Overview

QuranLingo uses Jest for unit testing. The tests ensure that the app's core functionality works correctly before merging changes to the main branch.

## Test Structure

The tests are organized in the `__tests__` directory:

- `word_meanings.test.js`: Tests for the word meanings functionality
- `app.test.js`: Tests for the app's core functionality
- `sw.test.js`: Tests for the service worker

## Running Tests

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Running Tests Locally

You can run the tests using the provided script:

```bash
./run_tests.sh
```

This script will:
1. Check if npm is installed
2. Install dependencies if needed
3. Run the tests
4. Report the results

Alternatively, you can run the tests manually:

```bash
# Install dependencies
npm install

# Run tests
npm test
```

### Continuous Integration

Tests are automatically run on GitHub Actions when:
- Code is pushed to the `development` branch
- A pull request is created targeting the `development` or `main` branch

## Test Coverage

The tests generate coverage reports in the `coverage` directory. You can view the HTML report by opening `coverage/lcov-report/index.html` in a browser.

## Writing New Tests

When adding new features, you should also add tests for them:

1. Create a new test file in the `__tests__` directory
2. Write tests for the new functionality
3. Run the tests to ensure they pass

Example test structure:

```javascript
describe('Feature Name', () => {
  test('should do something specific', () => {
    // Test code here
    expect(result).toBe(expectedValue);
  });
});
```

## Git Workflow with Tests

1. Develop features in the `features` branch
2. Run tests locally to ensure they pass
3. Push changes to the `features` branch
4. Create a pull request to merge into `development`
5. GitHub Actions will run the tests automatically
6. If tests pass, merge into `development`
7. After testing in `development`, merge into `main` for deployment

## Troubleshooting

If tests fail, check the following:

1. Are all dependencies installed?
2. Are there syntax errors in the code?
3. Has the functionality changed without updating the tests?
4. Are there environment-specific issues?

## Adding More Tests

As the app grows, you should add more tests to cover new functionality. Focus on testing:

1. Core business logic
2. Edge cases
3. User interactions
4. Error handling
