#!/bin/bash

# Run tests script for QuranLingo
# This script installs dependencies and runs the tests

# Set error handling
set -e

# Print header
echo "========================================"
echo "QuranLingo Test Runner"
echo "========================================"
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo "Dependencies installed successfully."
else
    echo "Dependencies already installed."
fi

# Run the tests
echo
echo "Running tests..."
echo "========================================"
npm test

# Check if tests passed
if [ $? -eq 0 ]; then
    echo
    echo "========================================"
    echo "✅ All tests passed!"
    echo "The code is ready to be merged to main."
    echo "========================================"
    exit 0
else
    echo
    echo "========================================"
    echo "❌ Tests failed!"
    echo "Please fix the issues before merging to main."
    echo "========================================"
    exit 1
fi
