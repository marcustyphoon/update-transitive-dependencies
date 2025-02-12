#!/usr/bin/env node

import fs from 'node:fs';
import childProcess from 'node:child_process';

const updateTransitiveDependencies = () => {
  const dir = fs.readdirSync('./');

  if (!dir.includes('package.json')) {
    console.error('no package.json found!');
    return;
  }

  const packageJson = fs.readFileSync('package.json', 'utf8');
  let mutableParsedPackageJson = {};

  try {
    mutableParsedPackageJson = JSON.parse(packageJson);
  } catch {
    console.error('could not parse package.json!');
    return;
  }

  const { lockFile, installCommand } = [
    { lockFile: 'pnpm-lock.yaml', installCommand: ['pnpm', ['i']] },
    { lockFile: 'package-lock.json', installCommand: ['npm', ['i']] },
    { lockFile: 'yarn.lock', installCommand: ['yarn', ['install']] },
  ].find(({ lockFile }) => dir.includes(lockFile));

  if (!installCommand) {
    console.error('no lock file found! (package manager detection is not implemented)');
    return;
  }

  if (!mutableParsedPackageJson.dependencies && !mutableParsedPackageJson.devDependencies) {
    console.error('no package.json dependencies!');
    return;
  }

  for (const [key, value] of Object.entries(mutableParsedPackageJson.dependencies ?? {})) {
    mutableParsedPackageJson.dependencies[key] = value.replace(/^\^/, '').replace(/^~/, '');
  }
  for (const [key, value] of Object.entries(mutableParsedPackageJson.devDependencies ?? {})) {
    mutableParsedPackageJson.devDependencies[key] = value.replace(/^\^/, '').replace(/^~/, '');
  }

  console.log('- locking dependency versions');
  fs.writeFileSync('package.json', JSON.stringify(mutableParsedPackageJson, null, 2), {
    flag: 'w+',
  });

  console.log('- removing node_modules and lock file');
  childProcess.spawnSync('rm', ['-r', 'node_modules'], { stdio: 'inherit' });
  childProcess.spawnSync('rm', ['-r', lockFile], { stdio: 'inherit' });

  console.log('- installing dependencies');
  childProcess.spawnSync(...installCommand, { stdio: 'inherit' });

  console.log('- unlocking dependency versions');
  fs.writeFileSync('package.json', packageJson, { flag: 'w+' });

  console.log('- updating lockfile');
  childProcess.spawnSync(...installCommand, { stdio: 'inherit' });

  console.log('- done! be sure to check that actual dependency versions are unchanged.');
  console.log('- you can commit this as e.g. "chore(deps): Update transitive dependencies"');
};

updateTransitiveDependencies();
