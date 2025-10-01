/*
 Mock implementation of react-native-Contacts.

 Instead of accessing contacts on device return predefined contacts.
 */

import { Contact } from 'react-native-contacts/type';

export const testContacts: Array<Partial<Contact>> = [
  {
    displayName: 'Al Pacino',
    emailAddresses: [
      {
        label: 'private',
        email: 'al@gmail.com',
      },
    ],
    phoneNumbers: [
      {
        label: 'mobile',
        number: '+49 170 12345678',
      },
    ],
  },
  {
    displayName: 'Milla Jovovich',
    emailAddresses: [
      {
        label: 'private',
        email: 'milla@gmail.com',
      },
    ],
    phoneNumbers: [
      {
        label: 'mobile',
        number: '+49 171 55566677',
      },
    ],
  },
];

const Contacts = {
  getAll: () => {
    console.log(`Getting mock contacts...`);
    return new Promise((resolve) => {
      resolve(testContacts);
    });
  },
};

export default Contacts;
