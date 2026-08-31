import { Rule } from '../rule';
import { duplicateSectionSlugRule } from './duplicateSectionSlug';
import { indexTabMarkerRule } from './indexTabMarker';
import { noRootIndexMdRule } from './noRootIndexMd';
import { orphanDeclaredMissingRule } from './orphanDeclaredMissing';
import { orphanOnDiskUndeclaredRule } from './orphanOnDiskUndeclared';
import { projectDirectoryExistsRule } from './projectDirectoryExists';
import { sectionDeclarationValidRule } from './sectionDeclarationValid';
import { sectionHasIndexMdRule } from './sectionHasIndexMd';
import { sectionHasSectionJsonRule } from './sectionHasSectionJson';
import { sectionInOneTabRule } from './sectionInOneTab';
import { sectionJsonHttpVerbRule } from './sectionJsonHttpVerb';
import { sectionJsonValidRule } from './sectionJsonValid';
import { sectionSlugMatchesFolderRule } from './sectionSlugMatchesFolder';
import { tabFieldsRequiredRule } from './tabFieldsRequired';
import { tabIconXorSvgRule } from './tabIconXorSvg';
import { tabSectionsResolveRule } from './tabSectionsResolve';
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
  tabFieldsRequiredRule,
  tabIconXorSvgRule,
  sectionInOneTabRule,
  tabSectionsResolveRule,
  indexTabMarkerRule,
];
