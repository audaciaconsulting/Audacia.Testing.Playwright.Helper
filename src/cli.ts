#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import chalk from 'chalk';
import figlet from 'figlet';
import { execSync } from 'child_process';

// Function to get peer dependencies from the CLI package's package.json
function getPeerDependencies(): string[] {
  try {
    // Construct the path to the CLI package's package.json
    const packageJsonPath = path.join(__dirname, '../package.json');

    const packageJson = fs.readJsonSync(packageJsonPath);
    const peerDependencies = packageJson.peerDependencies || {};
    return Object.keys(peerDependencies);
  } catch (error) {
    console.error(
      chalk.red('Error reading CLI package\'s package.json:'),
      error
    );
    return [];
  }
}

// Function to update package.json with scripts
function updatePackageJsonScripts(projectPath: string): void {
  const packageJsonPath = path.join(projectPath, 'package.json');
  try {
    const packageJson = fs.readJsonSync(packageJsonPath);

    const scripts = {
      'pw:generate-types':
        'npx openapi-typescript https://api.olympus-qa.audacia.systems/swagger/v1/swagger.json -o ./types/swagger.d.ts',
      'pw:test:api':
        'npm run pw:generate-types && npx playwright test tests/api --project=chromium',
      'pw:test:e2e': 'npx playwright test tests/e2e',
      'pw:test:perf':
        'npx playwright test tests/perf-tests --project=chromium --retries 0',
      'pw:ui': 'npx playwright test --ui',
      'pw:debug': 'pw-debug',
    };

    packageJson.scripts = { ...packageJson.scripts, ...scripts };  // Merge scripts

    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('Updated package.json with Playwright scripts.'));
  } catch (error) {
    console.error(chalk.red('Error updating package.json:'), error);
  }
}

program.version('0.0.0').description('Playwright Helper CLI');

program
  .command('init')
  .description('Initializes a new Playwright project in the current directory')
  .action(async () => {
    try {
      console.log(figlet.textSync('Audacia Playwright'));
      const projectPath = process.cwd();
      const projectName = path.basename(projectPath);

      // Check if the directory already exists (but allow if it's the current directory)
      if (
        fs.existsSync(projectPath) &&
        projectPath !== process.cwd()
      ) {
        console.error(
          chalk.red(`Error: Directory '${projectName}' already exists.`)
        );
        process.exit(1);
      }

      console.log(
        chalk.green(`Initializing Playwright project in: ${projectPath}`)
      );

      // Copy template files
      const templatesDir = path.join(__dirname, '../templates');
      await fs.copy(templatesDir, projectPath);

      // Render template files (if needed)
      const baseTestPath = path.join(
        projectPath,
        'src',
        'fixtures',
        'baseTest.ts'
      );
      if (fs.existsSync(baseTestPath)) {
        const template = await fs.readFile(baseTestPath, 'utf-8');
        const rendered = ejs.render(template, { projectName });
        await fs.writeFile(baseTestPath, rendered);
      }

      // Install peer dependencies as dependencies
      const peerDependencies = getPeerDependencies();
      if (peerDependencies.length > 0) {
        console.log(chalk.yellow('Installing dependencies...'));
        const installCommand = `npm install ${peerDependencies.join(
          ' '
        )}`;
        execSync(installCommand, { cwd: projectPath, stdio: 'inherit' });
        console.log(
          chalk.green('Dependencies installed successfully. 🎉')
        );
      } else {
        console.log(chalk.yellow('No peer dependencies found in package.json.'));
      }

      // Update package.json with scripts
      updatePackageJsonScripts(projectPath);

      console.log(chalk.green(`Project initialized at: ${projectPath}`));
    } catch (error) {
      console.error(chalk.red(`Error initializing project: ${error}`));
      process.exit(1);
    }
  });

program.parse(process.argv);
