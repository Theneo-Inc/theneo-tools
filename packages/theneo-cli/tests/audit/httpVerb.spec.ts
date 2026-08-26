import { ProjectModel } from '../../src/core/audit/model';
import { sectionJsonHttpVerbRule } from '../../src/core/audit/rules/sectionJsonHttpVerb';

function modelWithMethod(method: string): ProjectModel {
  return {
    root: '/tmp/p',
    dirExists: true,
    theneoJson: { status: 'ok', value: { name: 'd', sections: [] } },
    rootHasIndexMd: false,
    declaredSections: [],
    diskSections: [
      {
        relPath: 'sec',
        hasIndexMd: true,
        hasSectionJson: true,
        sectionJson: {
          status: 'ok',
          value: { endpoints: { method, path: '/x' } },
        },
      },
    ],
  };
}

describe('section-json-http-verb rule', () => {
  it.each(['GET', 'get', 'Post', 'DELETE', 'CONNECT', 'connect'])(
    'accepts valid verb "%s" (case-insensitive, incl. CONNECT)',
    method => {
      expect(sectionJsonHttpVerbRule.run(modelWithMethod(method))).toEqual([]);
    }
  );

  it.each(['FETCH', 'gettt', 'xyz'])('flags invalid verb "%s"', method => {
    const findings = sectionJsonHttpVerbRule.run(modelWithMethod(method));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('ignores an empty method (non-endpoint section)', () => {
    expect(sectionJsonHttpVerbRule.run(modelWithMethod(''))).toEqual([]);
  });
});
