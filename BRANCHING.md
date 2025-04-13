# QuranLingo Branching Strategy

This document outlines the branching strategy for the QuranLingo project.

## Branch Structure

The project uses the following branch structure:

### Main Branch (`main`)
- The production branch
- Contains stable, tested code that is ready for deployment
- Deployed to GitHub Pages
- Protected from direct commits

### Development Branch (`development`)
- Integration branch for features that have been tested and are ready for release
- Code in this branch should be stable and pass all tests
- Features are merged here from the features branch after review
- When ready, code from this branch is merged into main for deployment

### Features Branch (`features`)
- Branch for developing new features and enhancements
- All new development work should start here
- Once a feature is complete and tested, it can be merged into the development branch

## Workflow

1. **Feature Development**:
   - All new features and enhancements are developed in the `features` branch
   - Developers work on the `features` branch for all new development

2. **Feature Testing**:
   - Once a feature is complete, it is tested in the `features` branch
   - If issues are found, they are fixed in the `features` branch

3. **Integration**:
   - After a feature is tested and working correctly, it is merged into the `development` branch
   - The `development` branch is where features are integrated and tested together

4. **Release**:
   - When the `development` branch is stable and all features are working together correctly
   - The `development` branch is merged into the `main` branch
   - The `main` branch is then deployed to GitHub Pages

## Best Practices

- Always pull the latest changes before starting new work
- Create descriptive commit messages
- Regularly push your changes to the remote repository
- Ensure all tests pass before merging into higher branches
- Document significant changes in the README or other documentation
