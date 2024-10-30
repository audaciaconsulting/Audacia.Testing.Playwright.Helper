# Audacia Playright Helpers

# Playwright Helpers

# File Scaffolding (with Plop)

# pw-debug

## Description

This script downloads and processes Playwright artifacts or test trace from Azure DevOps. 

It supports downloading Playwright HTML reports or trace files based on the provided URL.

## Prerequisites

- **Bash Shell:** Required to run the script. (git Bash (for Windows) or any Bash shell (for Linux/macOS))
- **curl and unzip:** Should be available by default.
- **Node.js with Playwright installed:** For viewing reports and traces.
- **Azure DevOps Personal Access Token (PAT):** Required to authenticate.

## Usage

### 1. Set the AZURE_DEVOPS_PAT Environment Variable

**Unix/Linux/macOS:**

```bash
export AZURE_DEVOPS_PAT=your_personal_access_token
```

**Windows Command Prompt:**
```cmd
set AZURE_DEVOPS_PAT=your_personal_access_token
```

**Windows PowerShell:**
```powershell
$env:AZURE_DEVOPS_PAT="your_personal_access_token"
```

### 2. Run the Script
```bash
npx pw-debug <url>
```
Replace `<url>` with the URL of the artifact or test result you want to download.

**Example:**
```bash
npx pw-debug https://dev.azure.com/your_org/your_project/_build/results?buildId=123&view=artifacts&type=publishedArtifacts
```

## Notes
- The Personal Access Token (PAT) is sensitive information. Do not share or commit it to source control.
- For persistent usage, consider adding the `export` command to your shell profile (e.g., `~/.bashrc` or `~/.bash_profile`).

## How to Create a PAT
Follow the official Microsoft documentation: [Create a PAT](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)