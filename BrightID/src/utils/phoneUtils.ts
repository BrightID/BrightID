import { parsePhoneNumber as parsePhoneNumberLib } from 'libphonenumber-js';

const isPhoneNumberValid = (phoneNumberString: string) => {
  try {
    const phoneNumber = parsePhoneNumberLib(phoneNumberString);
    if (phoneNumber) {
      return phoneNumber.isValid();
    }
  } catch {}
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

const extractDigits = (phoneNumber: string) =>
  parseInt(phoneNumber.match(/\d/g).join(''), 10).toString();

export { isPhoneNumberValid, parsePhoneNumber, extractDigits };
