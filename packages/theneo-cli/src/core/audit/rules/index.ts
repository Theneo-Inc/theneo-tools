import { Rule } from '../rule';
import { duplicateSectionSlugRule } from './duplicateSectionSlug';
import { noRootIndexMdRule } from './noRootIndexMd';
import { orphanDeclaredMissingRule } from './orphanDeclaredMissing';
import { orphanOnDiskUndeclaredRule } from './orphanOnDiskUndeclared';
import { projectDirectoryExistsRule } from './projectDirectoryExists';
import { sectionDeclarationValidRule } from './sectionDeclarationValid';
import { sectionHasIndexMdRule } from './sectionHasIndexMd';
import { sectionHasSectionJsonRule } from './sectionHasSectionJson';
import { sectionJsonHttpVerbRule } from './sectionJsonHttpVerb';
import { sectionJsonValidRule } from './sectionJsonValid';
import { sectionSlugMatchesFolderRule } from './sectionSlugMatchesFolder';
import { theneoJsonExistsRule } from './theneoJsonExists';
import { theneoJsonRequiredFieldsRule } from './theneoJsonRequiredFields';

export const allRules: readonly Rule[] = [
  projectDirectoryExistsRule,
  theneoJsonExistsRule,
  theneoJsonRequiredFieldsRule,
  sectionDeclarationValidRule,
  duplicateSectionSlugRule,
  noRootIndexMdRule,
  sectionHasIndexMdRule,
  sectionHasSectionJsonRule,
  sectionSlugMatchesFolderRule,
  orphanDeclaredMissingRule,
  orphanOnDiskUndeclaredRule,
  sectionJsonValidRule,
  sectionJsonHttpVerbRule,
];
