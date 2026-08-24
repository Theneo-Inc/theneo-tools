import { Rule } from '../rule';
import { theneoJsonExistsRule } from './theneoJsonExists';

export const allRules: readonly Rule[] = [theneoJsonExistsRule];
