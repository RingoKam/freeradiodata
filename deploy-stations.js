const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const EXPORT_DIR = path.join('public', 'stations');
const GITHUB_PAGES_DIR = path.join('docs', 'stations');

async function deployToGitHubPages() {
    try {
        // Create docs directory if it doesn't exist
        await fs.mkdir(GITHUB_PAGES_DIR, { recursive: true });

        // Copy all files from EXPORT_DIR to GITHUB_PAGES_DIR
        console.log('Copying files to GitHub Pages directory...');
        const files = await fs.readdir(EXPORT_DIR);
        for (const file of files) {
            const sourcePath = path.join(EXPORT_DIR, file);
            const destPath = path.join(GITHUB_PAGES_DIR, file);
            await fs.copyFile(sourcePath, destPath);
            console.log(`Copied ${file}`);
        }

        // Create a simple index.html in docs directory
        const indexHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Radio Stations API</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        code { background: #eee; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Radio Stations API</h1>
    <p>This is a static API for radio stations, organized by language.</p>
    
    <div class="endpoint">
        <h2>Available Endpoints:</h2>
        <ul>
            <li><code>/stations/index.json</code> - List of all languages and statistics</li>
            <li><code>/stations/{language}.json</code> - Stations for a specific language</li>
        </ul>
    </div>

    <div class="endpoint">
        <h2>Example Usage:</h2>
        <pre><code>// Get all languages
fetch('https://your-username.github.io/your-repo/stations/index.json')
    .then(response => response.json())
    .then(data => console.log(data));

// Get stations for a specific language
fetch('https://your-username.github.io/your-repo/stations/english.json')
    .then(response => response.json())
    .then(data => console.log(data));</code></pre>
    </div>
</body>
</html>`;

        await fs.writeFile(path.join('docs', 'index.html'), indexHtml);

        // Create .nojekyll file to ensure GitHub Pages processes the files correctly
        await fs.writeFile(path.join('docs', '.nojekyll'), '');

        console.log('\nFiles prepared for GitHub Pages deployment.');
        console.log('\nTo deploy:');
        console.log('1. Commit these changes to your repository');
        console.log('2. Go to your repository settings');
        console.log('3. Under "Pages", select the "docs" folder as your source');
        console.log('4. Your API will be available at: https://your-username.github.io/your-repo/stations/');
        
    } catch (error) {
        console.error('Deployment preparation failed:', error.message);
        process.exit(1);
    }
}

// Also create a GitHub Actions workflow for automatic deployment
async function createGitHubWorkflow() {
    const workflowDir = path.join('.github', 'workflows');
    await fs.mkdir(workflowDir, { recursive: true });

    const workflowYaml = `name: Deploy Radio Stations API

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm install
        
      - name: Fetch and process stations
        run: node scripts/fetch-stations.js
        
      - name: Export stations
        run: node scripts/export-stations.js
        
      - name: Deploy to GitHub Pages
        run: node scripts/deploy-stations.js
        
      - name: Commit and push if changed
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update radio stations data" && git push)`;

    await fs.writeFile(path.join(workflowDir, 'deploy-stations.yml'), workflowYaml);
    console.log('Created GitHub Actions workflow for automatic deployment');
}

async function main() {
    try {
        await deployToGitHubPages();
        await createGitHubWorkflow();
    } catch (error) {
        console.error('Script failed:', error.message);
        process.exit(1);
    }
}

main(); 