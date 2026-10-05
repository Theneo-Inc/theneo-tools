import { BranchKind, BranchStatus } from '@theneo/sdk';
import {
  formatExpiry,
  getBranchRow,
  parseExpiresIn,
} from '../../src/core/cli/branch';

const EXPIRES_AT = '2026-09-27T11:30:45.000Z';

const branch = {
  id: 'b1',
  name: 'preview_dep_sep26_113045_4f2a',
  kind: BranchKind.PREVIEW,
  status: BranchStatus.ACTIVE,
  projectId: 'p1',
  versionId: 'v1',
  createdBy: 'u1',
  isFrozen: false,
  activeReviewId: null,
  expiresAt: EXPIRES_AT,
  lastActivityAt: null,
  createdAt: null,
};

describe('parseExpiresIn', () => {
  it('returns undefined when the option is not given', () => {
    expect(parseExpiresIn(undefined)).toBeUndefined();
  });

  it('accepts whole hours between 1 and 168', () => {
    expect(parseExpiresIn('1')).toBe(1);
    expect(parseExpiresIn('168')).toBe(168);
  });

  it.each(['0', '169', '1.5', 'tomorrow', '-3'])(
    'rejects %s with a readable message',
    value => {
      expect(() => parseExpiresIn(value)).toThrow(
        '--expiresIn must be a whole number of hours between 1 and 168'
      );
    }
  );
});

describe('getBranchRow', () => {
  it('renders kind, status, expiry, editor link and id', () => {
    expect(getBranchRow(2, branch, 'https://app.test')).toEqual([
      '2',
      'preview_dep_sep26_113045_4f2a',
      'preview',
      'active',
      EXPIRES_AT,
      'https://app.test/editor/p1/v1?branch=b1',
      'b1',
    ]);
  });

  it('leaves the expiry column empty for standard branches', () => {
    const row = getBranchRow(
      0,
      { ...branch, kind: BranchKind.STANDARD, expiresAt: null },
      'https://app.test'
    );
    expect(row[2]).toBe('standard');
    expect(row[4]).toBe('');
  });
});

describe('formatExpiry', () => {
  it('normalises valid dates and drops invalid ones', () => {
    expect(formatExpiry('2026-09-27T11:30:45Z')).toBe(EXPIRES_AT);
    expect(formatExpiry('not a date')).toBe('');
    expect(formatExpiry(null)).toBe('');
  });
});
