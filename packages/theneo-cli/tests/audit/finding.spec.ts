import { dedupeFindings, Finding, sortFindings } from '../../src/core/audit';

describe('sortFindings', () => {
  it('orders findings deterministically by file, then rule', () => {
    const input: Finding[] = [
      { severity: 'error', file: 'zzz', rule: 'r2', message: 'm' },
      { severity: 'error', file: 'aaa', rule: 'r2', message: 'm' },
      { severity: 'error', file: 'aaa', rule: 'r1', message: 'm' },
      { severity: 'warning', file: 'mmm', rule: 'r1', message: 'm' },
    ];

    const order = sortFindings(input).map(f => `${f.file}:${f.rule}`);

    expect(order).toEqual(['aaa:r1', 'aaa:r2', 'mmm:r1', 'zzz:r2']);
  });

  it('does not mutate the input array', () => {
    const input: Finding[] = [
      { severity: 'error', file: 'b', rule: 'r', message: 'm' },
      { severity: 'error', file: 'a', rule: 'r', message: 'm' },
    ];
    const copy = [...input];

    sortFindings(input);

    expect(input).toEqual(copy);
  });
});

describe('dedupeFindings', () => {
  it('removes findings identical in every field', () => {
    const dup: Finding = {
      severity: 'error',
      file: 'x',
      rule: 'r',
      message: 'm',
    };

    expect(dedupeFindings([dup, { ...dup }])).toHaveLength(1);
  });

  it('keeps findings that differ in any field', () => {
    const findings: Finding[] = [
      { severity: 'error', file: 'x', rule: 'r1', message: 'm' },
      { severity: 'error', file: 'x', rule: 'r2', message: 'm' },
    ];

    expect(dedupeFindings(findings)).toHaveLength(2);
  });
});
