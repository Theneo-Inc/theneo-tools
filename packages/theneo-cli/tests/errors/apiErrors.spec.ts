import { handleApiThrownError } from '../../../theneo-sdk/src/requests/base/requests';

interface FakeAxiosError {
  isAxiosError: boolean;
  message: string;
  response: {
    status: number;
    statusText: string;
    data: unknown;
  };
}

function htmlAxiosError(
  status: number,
  statusText: string,
  html: string
): FakeAxiosError {
  return {
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: { status, statusText, data: html },
  };
}

const HTML_413 =
  '<html>\n<head><title>413 Request Entity Too Large</title></head>\n' +
  '<body>\n<center><h1>413 Request Entity Too Large</h1></center>\n' +
  '<hr><center>nginx</center>\n</body>\n</html>';

const HTML_503 =
  '<html>\n<head><title>503 Service Temporarily Unavailable</title></head>\n' +
  '<body>\n<center><h1>503 Service Temporarily Unavailable</h1></center>\n' +
  '<hr><center>nginx</center>\n</body>\n</html>';

describe('handleApiThrownError — gateway HTML responses', () => {
  it('413 -> friendly upload-limit message, no HTML', () => {
    const res = handleApiThrownError(
      htmlAxiosError(413, 'Payload Too Large', HTML_413)
    );

    expect(res.err).toBe(true);
    const message: string = res.error.message;
    expect(message).not.toContain('<html>');
    expect(message).not.toContain('<');
    expect(message.toLowerCase()).toContain('upload limit');
  });

  it('503 -> friendly service-unavailable message, no HTML', () => {
    const res = handleApiThrownError(
      htmlAxiosError(503, 'Service Unavailable', HTML_503)
    );

    expect(res.err).toBe(true);
    const message: string = res.error.message;
    expect(message).not.toContain('<html>');
    expect(message).not.toContain('<');
    expect(message.toLowerCase()).toContain('temporarily unavailable');
  });

  it('still surfaces JSON API { message } errors unchanged', () => {
    const res = handleApiThrownError({
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Project key already exists' },
      },
    });

    expect(res.err).toBe(true);
    const message: string = res.error.message;
    expect(message).toBe('Project key already exists');
  });
});
