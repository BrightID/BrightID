/*
 Mock implementation of react-native-Contacts.

 Instead of accessing contacts on device return predefined contacts.
 */

import { Contact } from 'expo-contacts';

export const testContacts: Array<Partial<Contact>> = [
  {
    firstName: 'Al',
    lastName: 'Pacino',
    emails: [
      {
        id: '0',
        label: 'private',
        email: 'al@gmail.com',
      },
    ],
    phoneNumbers: [
      {
        id: '0',
        label: 'mobile',
        number: '+49 170 12345678',
      },
    ],
  },
  {
    firstName: 'Milla',
    lastName: 'Jovovich',
    emails: [
      {
        id: '1',
        label: 'private',
        email: 'milla@gmail.com',
      },
    ],
    phoneNumbers: [
      {
        id: '1',
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
