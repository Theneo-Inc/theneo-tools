import { Command } from 'commander';

export const program = new Command();

const packageJson = require('../../package.json');
const version: string = packageJson.version;

program.version(version);
