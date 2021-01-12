const genericPassword = {
  username: JSON.stringify({ publicKey: '', version: 1 }),
  password: 'abcd',
};

export default {
  SECURITY_LEVEL_ANY: 'SECURITY_LEVEL_ANY',
  SECURITY_LEVEL_SECURE_SOFTWARE: 'SECURITY_LEVEL_SECURE_SOFTWARE',
  SECURITY_LEVEL_SECURE_HARDWARE: 'SECURITY_LEVEL_SECURE_HARDWARE',
  setGenericPassword: () => Promise.resolve(true),
  setInternetCredentials: () => Promise.resolve(true),
  resetGenericPassword: () => Promise.resolve(true),
  getGenericPassword: () => Promise.resolve(genericPassword),
};
