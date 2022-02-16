import { parsePhoneNumber as parsePhoneNumberLib } from 'libphonenumber-js';

const isPhoneNumberValid = (phoneNumberString: string) => {
  const phoneNumber = parsePhoneNumberLib(phoneNumberString);
  if (phoneNumber) {
    return phoneNumber.isValid();
  }
  return false;
};

const parsePhoneNumber = (phoneNumberString: string) => {
  try {
    const phoneNumber = parsePhoneNumberLib(phoneNumberString);
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        country: phoneNumber.country,
        number: phoneNumber.nationalNumber,
      } as PhoneNumberObject;
    }
  } catch {}
  return {
    country: 'US',
    number: '',
  } as PhoneNumberObject;
};

export { isPhoneNumberValid, parsePhoneNumber };
