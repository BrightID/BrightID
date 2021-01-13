// const existsMock = jest.fn();
// existsMock.mockReturnValueOnce({ then: jest.fn() });

export default {
  DocumentDir: () => {},
  fs: {
    exists: () => Promise.resolve(true),
    dirs: {
      DocumentDir: '',
    },
    unlink: () => Promise.resolve(true),
    mkdir: () => Promise.resolve(true),
    readFile: () => Promise.resolve(true),
    writeFile: () => Promise.resolve(true),
  },
  fetch: () => Promise.resolve(true),
};
