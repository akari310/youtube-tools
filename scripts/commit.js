const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { bumpVersion } = require('./bump');

async function commit(message, options = {}) {
    const repoRoot = path.resolve(__dirname, '..');
    
    try {
        // 1. Bump version and build
        if (!options.noBump) {
            await bumpVersion(options.bumpType || 'auto');
            console.log('Running build...');
            execSync('node scripts/build.js', { cwd: repoRoot, stdio: 'inherit' });
        }

        // 2. Git add
        console.log('Staging changes...');
        execSync('git add .', { cwd: repoRoot });

        // 3. Git commit
        const commitMsg = message || 'Update source';
        execSync(`git commit -m "${commitMsg}"`, { cwd: repoRoot, stdio: 'inherit' });

        // 4. Git push
        if (!options.noPush) {
            console.log('Pushing to GitHub...');
            execSync('git push origin main', { cwd: repoRoot, stdio: 'inherit' });
        }
        
        console.log('Done!');
    } catch (err) {
        console.error('Commit failed:', err.message);
        process.exit(1);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    let message = '';
    const options = {
        bumpType: 'auto',
        noBump: false,
        noPush: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-m' || args[i] === '--message') {
            message = args[++i];
        } else if (args[i] === '--no-bump') {
            options.noBump = true;
        } else if (args[i] === '--no-push') {
            options.noPush = true;
        } else if (args[i] === '--patch') {
            options.bumpType = 'patch';
        }
    }

    commit(message, options);
}
