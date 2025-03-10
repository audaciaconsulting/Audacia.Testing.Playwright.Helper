#!/usr/bin/env bash

# Script Name: pw-debug.sh
# Description: This script downloads and processes Playwright artifacts or test trace from Azure DevOps.
#              It supports downloading Playwright HTML reports or trace files based on the provided URL.
# Usage: ./pw-debug.sh <url>
#        - <url>: The URL of the artifact or test result to download.
# Prerequisites: 
#    - git Bash (for Windows) or any Bash shell (for Linux/macOS)
#       - curl (should be available by default in git Bash)
#       - unzip (should be available by default in git Bash)
#    - Node.js with Playwright installed (for viewing reports and traces)
#    - A valid Azure DevOps Personal Access Token (PAT)

# Check if the correct number of arguments is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <url>"
    exit 1
fi

# Define variables
USERNAME="PAT" # Does not need changing
# How to create Token for password: https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat
PASSWORD="${AZURE_DEVOPS_PAT}"
URL=$1

# Check if PASSWORD is empty
if [ -z "$PASSWORD" ]; then
    echo "Error: PASSWORD is not set. Please set the PASSWORD variable with your Personal Access Token."
    exit 1
fi

# Check if PASSWORD is valid
if [[ ${#PASSWORD} -lt 20 ]]; then
    echo "Error: The Personal Access Token provided seems invalid."
    exit 1
fi

# Check for curl
if ! command -v curl &> /dev/null; then
    echo "Error: curl is not installed."
    exit 1
fi

# Check for unzip
if ! command -v unzip &> /dev/null; then
    echo "Error: unzip is not installed."
    exit 1
fi

# Check for node
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    exit 1
fi

# Function to delete files when the script exits
cleanup() {
    rm -f $TRACE_FILE
    rm -f html-report.zip
    rm -rf playwright-report
    echo "Cleaned up temporary files"
}

# Register the cleanup function to be called on the EXIT signal
trap cleanup EXIT

# Check if the URL is for artifacts or test results
if [[ $URL == *"artifacts.visualstudio.com"* ]]; then
    # Download the artifact
    curl -u $USERNAME:$PASSWORD \
    -H "Content-Type: application/json" \
    -o html-report.zip \
    "$URL"

    # Check if the download was successful
    if [ $? -ne 0 ]; then
        echo "Failed to download the artifact."
        exit 1
    fi

    # Unzip the file
    unzip html-report.zip -d playwright-report

    # Run the Playwright report command
    npx playwright show-report playwright-report/*

    echo "Report is ready. Press any key to exit and clean up..."
    read -n 1 -s

else
    # Original functionality for test result URLs
    ORG=$(echo $URL | cut -d'/' -f4)
    PROJECT=$(echo $URL | cut -d'/' -f5)

    # Extract runId and resultId from the URL
    RUN_ID=$(echo $URL | grep -oP '(?<=runId=)\d+')
    RESULT_ID=$(echo $URL | grep -oP '(?<=resultId=)\d+')

    # Construct the API endpoint URL
    API_URL="https://dev.azure.com/$ORG/$PROJECT/_apis/test/Runs/$RUN_ID/Results/$RESULT_ID/attachments?api-version=7.1-preview.1"

    # Echo the API URL
    echo "API URL: $API_URL"

    # Make a call to the API endpoint to get attachments
    ATTACHMENTS=$(curl -u $USERNAME:$PASSWORD \
    -H "Content-Type: application/json" \
    -s \
    $API_URL)

    # Extract the URL for the trace.zip file
    TRACE_URL=$(echo $ATTACHMENTS | grep -oP '"url":\s*"\K[^"]+(?=",\s*"id":\s*\d+,\s*"fileName":\s*"trace\.zip")')

    # Check if the trace.zip URL was found
    if [ -z "$TRACE_URL" ]; then
        echo "trace.zip file not found in the attachments."
        exit 1
    fi

    # Download the trace.zip file
    TRACE_FILE="trace.zip"
    curl -u $USERNAME:$PASSWORD \
    -H "Content-Type: application/json" \
    -o $TRACE_FILE \
    $TRACE_URL

    # Check if the download was successful
    if [ $? -ne 0 ]; then
        echo "Failed to download the trace file."
        exit 1
    fi

    # Show the trace using Playwright
    npx playwright show-trace $TRACE_FILE
fi
