const fs = require('fs');
const https = require('https');
const {pathIsAbsolute, routeIsValid, isMdFileOrDirectory, readFileOrDirectory, findLinks, statusLink, totalLinks, uniqueLinks, brokenLinks, justStats, statsWithValidate} = require ('../src/config');

describe('pathIsAbsolute function', () => {
it('should return the same path when the input is an absolute path', () => {
  const input = 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md';
  const expectedOutput = 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md';
  const result = pathIsAbsolute(input);
  expect(result).toEqual(expectedOutput);
});


it('should return the absolute path when the input is a relative path', () => {
  const input = './src/prueba.md';
  const expectedOutput = 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md';
  const result = pathIsAbsolute(input);
  expect(result).toEqual(expectedOutput);
});
});

describe('routeIsValid', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return true when a valid route is provided', async () => {
    // Mock the fs.access function using jest.spyOn
    const accessMock = jest.spyOn(fs, 'access');
    accessMock.mockImplementation((route, mode, callback) => {
      callback(null);
    });
    const result = await routeIsValid('C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\prueba.md', fs.constants.F_OK);
    expect(result).toBe(true);
  });

  it('should throw an error when an invalid route is provided', async () => {
    // Mock the fs.access function to simulate an error
    const accessMock = jest.spyOn(fs, 'access');
    accessMock.mockImplementation((route, mode, callback) => {
      const error = new Error('Invalid route');
      callback(error);
    });

    try {
      await routeIsValid('C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\prueba.md', fs.constants.F_OK);
    } catch (error) {
      expect(error).toBe('La ruta no es válida');
    }
  });
});



describe ('isMdFileOrDirectory function', () => {
  it('should return false when the file path does not have a .md extension', () => {
    const result = isMdFileOrDirectory('./file.txt');
    expect(result).toBe(false);
  });
  it('should return false when the input is an empty string', () => {
    const result = isMdFileOrDirectory('');
    expect(result).toBe(false);
  });
});

describe ('readFileOrDirectory function', () => {
it('should return an array with the path of a single .md file when given a valid file path', () => {
  const result = readFileOrDirectory('C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md');
  expect(result).toEqual(['C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md']);
});
it('should return an array with the paths of multiple .md files in a directory when given a valid directory path', () => {
  const result = readFileOrDirectory('C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\archivos');
  expect(result).toEqual([
    'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\archivos\\file3.md',
    'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\archivos\\file4.md',
    'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\archivos\\file6.md'
  ]);
});
});

describe ('findLinks function', () => {
  it('should return an empty array when the input content is empty', () => {
      const content = [];
      const result = findLinks(content);
      expect(result).toEqual([]);
    });
    it('should return an empty array when the input content has no links', () => {
      const content = [
        { data: 'This is some text without any links.', path: 'file1.txt' },
        { data: 'More text without links.', path: 'file2.txt' }
      ];
      const result = findLinks(content);
      expect(result).toEqual([]);
    });
    it('should correctly identify and extract a single link from the input content', () => {
      const content = [
        { data: 'This is some text with a [link](https://example.com).', path: 'file1.txt' }
      ];
      const result = findLinks(content);
      expect(result).toEqual([{ href: 'https://example.com', text: 'link', file: 'file1.txt' }]);
    });
});


describe('statusLink function', () => {
  it('should resolve with status code 200 and message "ok"', async () => {
    const mockResponse = {
      statusCode: 200,
    };

      // Simulamos la función https.get reemplazándola con una función jest.fn()
    https.get = jest.fn().mockImplementation((url, callback) => {
     callback(mockResponse);
      return {
     on: jest.fn(),
    };
  });

      const result = await statusLink('https://www.google.com');

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('ok');
    });

    it('should resolve with status code 404 and message "fail" when ENOTFOUND error occurs', async () => {
      // Simulamos un error ENOTFOUND
      const mockError = {
        code: 'ENOTFOUND',
      };

      https.get = jest.fn().mockImplementation((url, callback) => {
        const request = {
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              callback(mockError);
            }
          }),
        };
        return request;
      });

      const result = await statusLink('https://www.sitioantiguo.com');

      expect(result.statusCode).toBe(404);
      expect(result.message).toBe('fail');
    });

    it('should reject with an error when an unknown error occurs', async () => {
      // Simulamos un error desconocido
      const mockError = new Error('Unknown error');

      https.get = jest.fn().mockImplementation((url, callback) => {
        const request = {
          on: jest.fn((event, callback) => {
            if (event === 'error') {
              callback(mockError);
            }
          }),
        };
        return request;
      });

      await expect(statusLink('https://www.google.com')).rejects.toEqual(mockError);
    });
  });


describe ('totalLinks function', () => {
it('should return the number of links when the input array contains objects with additional properties besides "href"', () => {
  const linksArray = [
    {
      href: 'https://www.sitioantiguo.com',
      text: 'Sitio antiguo',
      file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
    },
    {
      href: 'https://www.google.com',
      text: 'Google',
      file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
    },
    {
      text: 'rappi',
      file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
    }
  ];
  const result = totalLinks(linksArray);
  expect(result).toBe(2);
});

it('should return 0 when the input array is empty', () => {
  const linksArray = [];
  const result = totalLinks(linksArray);
  expect(result).toBe(0);
});
});

describe ('uniqueLinks function', () => {
  it('should return the number of unique links', () => {
    const linksArray = [
      {
        href: 'https://www.rappi.com',
        text: 'rappi',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 503,
        ok: 'fail'
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
      {
        href: 'https://www.sitioantiguo.com',
        text: 'Sitio antiguo',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 404,
        ok: 'fail'
      },
    ];
    const result = uniqueLinks(linksArray);
    expect(result).toBe(3);
  });

  it('should return 0 when given an empty array', () => {
    const statsLinksArray = [];
    const result = uniqueLinks(statsLinksArray);
    expect(result).toBe(0);
  });

  it('should return the number of unique links', () => {
    const linksArray = [
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
    ];
    const result = uniqueLinks(linksArray);
    expect(result).toBe(1);
  });
});

describe ('brokenLinks function', () => {
  it('should return 0 when given an array of links with no broken links', () => {
    const linksArray = [
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
    ];
    expect(brokenLinks(linksArray)).toBe(0);
  });

  it('should return the number of broken links when given an array of links with some broken links', () => {
      const linksArray = [
        {
          href: 'https://www.rappi.com',
          text: 'rappi',
          file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
          status: 503,
          ok: 'fail'
        },
        {
          href: 'https://www.google.com',
          text: 'Google',
          file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
          status: 200,
          ok: 'ok'
        },
        {
          href: 'https://www.sitioantiguo.com',
          text: 'Sitio antiguo',
          file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
          status: 404,
          ok: 'fail'
        },
      ];
    expect(brokenLinks(linksArray)).toBe(2);
  });
});

describe ('justStats function', () => {
  it('should return the number of total and unique links', () => {
    const linksArray = [
      {
        href: 'https://www.rappi.com',
        text: 'rappi',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
      },
      {
        href: 'https://www.sitioantiguo.com',
        text: 'Sitio antiguo',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
      },
    ];
  expect(justStats(linksArray)).toEqual('Total: 3 links,  Unique: 3 links');
});
});

describe ('statsWithValidate function', () => {
  it('should return the number of total, unique and broken links', () => {
    const linksArray = [
      {
        href: 'https://www.rappi.com',
        text: 'rappi',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 503,
        ok: 'fail'
      },
      {
        href: 'https://www.google.com',
        text: 'Google',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 200,
        ok: 'ok'
      },
      {
        href: 'https://www.sitioantiguo.com',
        text: 'Sitio antiguo',
        file: 'C:\\Users\\Karen\\OneDrive\\Documentos\\Laboratoria-Bootcamp\\Laboratoria_proyecto4copy\\Laboratoria_proyecto4.1\\DEV008-md-links\\src\\prueba.md',
        status: 404,
        ok: 'fail'
      },
    ];
  expect(statsWithValidate(linksArray)).toEqual('Total: 3 links,  Unique: 3 links,  Broken: 2 links');
});
});

