# Deploying QuranLingo to GitHub Pages

This document provides step-by-step instructions for deploying the QuranLingo app to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Basic knowledge of Git commands

## Steps to Deploy

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "quranlingo")
4. Choose "Public" visibility
5. Click "Create repository"

### 2. Generate App Icons

Before pushing to GitHub, you need to generate the app icons:

1. Open the `icons/generate-icons.html` file in your browser
2. Right-click on each canvas and select "Save Image As..."
3. Save each image with the corresponding filename shown above it (e.g., "icon-72x72.png")
4. Make sure all the icon files are saved in the `icons` directory

### 3. Initialize Git and Push to GitHub

Open a terminal or command prompt in your project directory and run the following commands:

```bash
# Initialize a Git repository
git init

# Add all files to the repository
git add .

# Commit the changes
git commit -m "Initial commit"

# Add the GitHub repository as a remote
git remote add origin https://github.com/YOUR_USERNAME/quranlingo.git

# Push to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "GitHub Actions"
5. The deployment workflow will automatically run when you push to the main branch

### 5. Access Your Deployed App

After the GitHub Actions workflow completes, your app will be available at:

```
https://YOUR_USERNAME.github.io/quranlingo/
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Updating Your App

To update your app after making changes:

```bash
# Add all changed files
git add .

# Commit the changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

The GitHub Actions workflow will automatically deploy the updated app.

## Troubleshooting

If your app is not deploying correctly:

1. Check the "Actions" tab in your GitHub repository to see if there are any errors in the workflow
2. Ensure that all file paths in your code are relative (not starting with "/")
3. Make sure all required files are included in your repository
4. Verify that the `manifest.json` file has the correct paths to your icons
