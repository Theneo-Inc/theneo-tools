import { Rule } from '../rule';
import { projectDirectoryExistsRule } from './projectDirectoryExists';
import { theneoJsonExistsRule } from './theneoJsonExists';

export const allRules: readonly Rule[] = [
  projectDirectoryExistsRule,
  theneoJsonExistsRule,
];
