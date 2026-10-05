import { Branch, BranchKind } from '@theneo/sdk';

export function formatExpiry(expiresAt: string | null | undefined): string {
  if (!expiresAt) return '';
  const date = new Date(expiresAt);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function getBranchRow(
  index: number,
  branch: Branch,
  appUrl: string
): string[] {
  const editorUrl = `${appUrl}/editor/${branch.projectId}/${branch.versionId}?branch=${branch.id}`;
  return [
    String(index),
    branch.name,
    branch.kind === BranchKind.PREVIEW ? 'preview' : 'standard',
    branch.status,
    formatExpiry(branch.expiresAt),
    editorUrl,
    branch.id,
  ];
}

export function parseExpiresIn(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const hours = Number(value);
  if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
    throw new Error(
      '--expiresIn must be a whole number of hours between 1 and 168'
    );
  }
  return hours;
}
