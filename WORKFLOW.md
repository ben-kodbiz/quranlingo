# QuranLingo Development Workflow

This document provides a step-by-step guide on how to use the branching strategy for the QuranLingo project.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/ben-kodbiz/quranlingo.git
   cd quranlingo
   ```

2. Check out the features branch to start working on new features:
   ```bash
   git checkout features
   ```

## Development Process

### 1. Working on a New Feature

When starting work on a new feature:

1. Make sure you're on the features branch:
   ```bash
   git checkout features
   ```

2. Pull the latest changes:
   ```bash
   git pull origin features
   ```

3. Make your changes, add, and commit them:
   ```bash
   git add .
   git commit -m "Add feature XYZ"
   ```

4. Push your changes to the remote features branch:
   ```bash
   git push origin features
   ```

### 2. Testing a Feature

Before merging a feature into the development branch:

1. Test the feature thoroughly in the features branch
2. Fix any bugs or issues found during testing
3. Commit and push the fixes to the features branch

### 3. Merging to Development

Once a feature is complete and tested:

1. Switch to the development branch:
   ```bash
   git checkout development
   ```

2. Pull the latest changes:
   ```bash
   git pull origin development
   ```

3. Merge the features branch into development:
   ```bash
   git merge features
   ```

4. Resolve any merge conflicts if they occur

5. Test the merged code to ensure everything works correctly

6. Push the changes to the remote development branch:
   ```bash
   git push origin development
   ```

### 4. Deploying to Production

When ready to deploy to production:

1. Switch to the main branch:
   ```bash
   git checkout main
   ```

2. Pull the latest changes:
   ```bash
   git pull origin main
   ```

3. Merge the development branch into main:
   ```bash
   git merge development
   ```

4. Resolve any merge conflicts if they occur

5. Test the merged code to ensure everything works correctly

6. Push the changes to the remote main branch:
   ```bash
   git push origin main
   ```

7. The changes will be automatically deployed to GitHub Pages

## Best Practices

- Always work on the features branch for new features
- Regularly pull changes from the remote repository
- Write clear, descriptive commit messages
- Test thoroughly before merging to higher branches
- Document significant changes in the README or other documentation
- Communicate with the team about major changes or merge conflicts

## Troubleshooting

If you encounter issues with the workflow:

1. Make sure you're on the correct branch
2. Pull the latest changes before starting work
3. Resolve merge conflicts carefully
4. If in doubt, consult with the team before pushing major changes
