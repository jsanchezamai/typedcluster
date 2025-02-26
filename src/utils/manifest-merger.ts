import * as fs from 'fs';
import * as path from 'path';

interface VSCodeManifest {
    contributes?: any;
    activationEvents?: string[];
    engines?: { [key: string]: string };
    categories?: string[];
    [key: string]: any;
}

function mergeManifests(): void {
    try {
        // Read the files
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        const manifestPath = path.resolve(process.cwd(), 'vscode-extension-manifest.json');

        if (!fs.existsSync(manifestPath)) {
            throw new Error('VS Code extension manifest file not found');
        }

        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as VSCodeManifest;

        // Required VS Code extension fields that must be present
        const requiredFields = ['engines', 'activationEvents', 'contributes'];
        const missingFields = requiredFields.filter(field => !manifest[field]);

        if (missingFields.length > 0) {
            throw new Error(`Missing required VS Code fields: ${missingFields.join(', ')}`);
        }

        // VS Code specific fields to merge
        const vsCodeFields = [
            'contributes'
        ];

        // Preserve existing scripts and dependencies
        const existingScripts = packageJson.scripts || {};
        const existingDependencies = packageJson.dependencies || {};
        const existingDevDependencies = packageJson.devDependencies || {};

        // Merge fields from manifest to package.json
        for (const field of vsCodeFields) {
            if (manifest[field]) {
                packageJson[field] = manifest[field];
            }
        }

        // Ensure critical VS Code extension fields
        packageJson.name = packageJson.name || 'iot-cluster-simulator';
        packageJson.displayName = packageJson.displayName || 'IoT Cluster Simulator';
        packageJson.version = packageJson.version || '0.1.0';
        packageJson.main = './dist/extension.js';

        // Restore preserved fields
        packageJson.scripts = {
            ...existingScripts
        };
        packageJson.dependencies = existingDependencies;
        packageJson.devDependencies = existingDevDependencies;

        // Write back to package.json with proper formatting
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log('Successfully merged VS Code manifest into package.json');
    } catch (error) {
        console.error('Failed to merge manifests:', error);
        process.exit(1);
    }
}

// Execute the merge
mergeManifests();