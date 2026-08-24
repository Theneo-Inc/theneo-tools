import { Finding } from '../../src/core/audit';
import { printJson } from '../../src/core/audit/report';

describe('printJson', () => {
  it('emits exactly the findings array as valid JSON and nothing else', () => {
    const findings: Finding[] = [
      {
        severity: 'error',
        file: 'theneo.json',
        rule: 'theneo-json-exists',
        message: 'missing',
      },
    ];
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    printJson(findings);

    expect(spy).toHaveBeenCalledTimes(1);
    const printed = spy.mock.calls[0]?.[0] as string;
    expect(JSON.parse(printed)).toEqual(findings);

    spy.mockRestore();
  });
});
