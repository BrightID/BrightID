import AsyncStorage from '@react-native-community/async-storage';
import { objToUint8 } from '../../utils/encoding';
// import { bootstrapAndUpgrade } from '../index';
// import store from '../../store';

// mock();

test.skip('v0 bootstrap', async () => {
  expect.assertions(2);
  const mockStorage = [
    [
      'App:Test',
      `{"verified":true,"name":"test","url":"url","logoFile":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"},"dateAdded":1576268209344}`,
    ],
    [
      'userData',
      `{"publicKey":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3+zAIb5c=","safePubKey":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c","secretKey":{"0":253,"1":230,"2":176,"3":67,"4":91,"5":21,"6":131,"7":186,"8":235,"9":47,"10":18,"11":164,"12":32,"13":213,"14":74,"15":248,"16":221,"17":71,"18":64,"19":1,"20":1,"21":225,"22":200,"23":26,"24":121,"25":22,"26":207,"27":32,"28":7,"29":7,"30":176,"31":42,"32":81,"33":40,"34":121,"35":143,"36":52,"37":58,"38":213,"39":73,"40":51,"41":193,"42":14,"43":82,"44":163,"45":33,"46":166,"47":41,"48":135,"49":141,"50":59,"51":26,"52":142,"53":160,"54":117,"55":90,"56":73,"57":151,"58":247,"59":251,"60":48,"61":8,"62":111,"63":151},"name":"Test","photo":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"}}`,
    ],
    [
      'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ',
      `{"publicKey":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ","name":"Jacki Stode","score":0,"connectionDate":1576267974294,"photo":{"filename":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ.jpg"}}`,
    ],
    [
      'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU',
      `{"publicKey":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU","name":"Tobit Sellers","score":0,"connectionDate":1576267989542,"photo":{"filename":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU.jpg"}}`,
    ],
  ];

  await AsyncStorage.clear();
  await AsyncStorage.multiSet(mockStorage);

  await bootstrapAndUpgrade();

  const allKeys = await AsyncStorage.getAllKeys();
  console.log('store1', allKeys);

  expect(await AsyncStorage.getItem('store@v1')).toEqual(
    '{"score":100,"name":"Test","photo":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"},"groupsCount":0,"searchParam":"","newGroupCoFounders":[],"eligibleGroups":[],"currentGroups":[],"connections":[{"publicKey":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ","name":"Jacki Stode","score":0,"connectionDate":1576267974294,"photo":{"filename":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ.jpg"},"id":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ","status":"verified"},{"publicKey":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU","name":"Tobit Sellers","score":0,"connectionDate":1576267989542,"photo":{"filename":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU.jpg"},"id":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU","status":"verified"}],"verifications":[],"apps":[{"verified":true,"name":"test","url":"url","logoFile":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"},"dateAdded":1576268209344}],"notifications":[],"trustedConnections":[],"backupCompleted":false,"id":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c","publicKey":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3+zAIb5c=","password":"","hashedId":"","secretKey":{"0":253,"1":230,"2":176,"3":67,"4":91,"5":21,"6":131,"7":186,"8":235,"9":47,"10":18,"11":164,"12":32,"13":213,"14":74,"15":248,"16":221,"17":71,"18":64,"19":1,"20":1,"21":225,"22":200,"23":26,"24":121,"25":22,"26":207,"27":32,"28":7,"29":7,"30":176,"31":42,"32":81,"33":40,"34":121,"35":143,"36":52,"37":58,"38":213,"39":73,"40":51,"41":193,"42":14,"43":82,"44":163,"45":33,"46":166,"47":41,"48":135,"49":141,"50":59,"51":26,"52":142,"53":160,"54":117,"55":90,"56":73,"57":151,"58":247,"59":251,"60":48,"61":8,"62":111,"63":151},"operations":[],"connectionsSort":"BY_DATE_ADDED_DESCENDING","connectQrData":{"aesKey":"","ipAddress":"","uuid":"","user":"","qrString":"","channel":""},"connectUserData":{"id":"","photo":"","name":"","timestamp":0,"signedMessage":"","score":0},"recoveryData":{"id":"","publicKey":"","secretKey":"","timestamp":0,"sigs":[]}}',
  );

  expect(store.getState()).toEqual({
    score: 100,
    name: 'Test',
    photo: { filename: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg' },
    groupsCount: 0,
    hashedId: '',
    searchParam: '',
    newGroupCoFounders: [],
    notifications: [],
    operations: [],
    password: '',
    eligibleGroups: [],
    currentGroups: [],
    trustedConnections: [],
    connections: [
      {
        id: 'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ',
        name: 'Jacki Stode',
        publicKey: 'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ',
        score: 0,
        connectionDate: 1576267974294,
        photo: { filename: 'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ.jpg' },
        status: 'verified',
      },
      {
        id: 'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU',
        name: 'Tobit Sellers',
        publicKey: 'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU',
        score: 0,
        connectionDate: 1576267989542,
        photo: { filename: 'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU.jpg' },
        status: 'verified',
      },
    ],
    verifications: [],
    apps: [
      {
        verified: true,
        name: 'test',
        url: 'url',
        logoFile: {
          filename: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg',
        },
        dateAdded: 1576268209344,
      },
    ],
    publicKey: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3+zAIb5c=',
    id: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c',
    secretKey: objToUint8({
      0: 253,
      1: 230,
      2: 176,
      3: 67,
      4: 91,
      5: 21,
      6: 131,
      7: 186,
      8: 235,
      9: 47,
      10: 18,
      11: 164,
      12: 32,
      13: 213,
      14: 74,
      15: 248,
      16: 221,
      17: 71,
      18: 64,
      19: 1,
      20: 1,
      21: 225,
      22: 200,
      23: 26,
      24: 121,
      25: 22,
      26: 207,
      27: 32,
      28: 7,
      29: 7,
      30: 176,
      31: 42,
      32: 81,
      33: 40,
      34: 121,
      35: 143,
      36: 52,
      37: 58,
      38: 213,
      39: 73,
      40: 51,
      41: 193,
      42: 14,
      43: 82,
      44: 163,
      45: 33,
      46: 166,
      47: 41,
      48: 135,
      49: 141,
      50: 59,
      51: 26,
      52: 142,
      53: 160,
      54: 117,
      55: 90,
      56: 73,
      57: 151,
      58: 247,
      59: 251,
      60: 48,
      61: 8,
      62: 111,
      63: 151,
    }),
    connectionsSort: 'BY_DATE_ADDED_DESCENDING',
    backupCompleted: false,
    connectQrData: {
      aesKey: '',
      ipAddress: '',
      uuid: '',
      user: '',
      qrString: '',
      channel: '',
    },
    connectUserData: {
      id: '',
      photo: '',
      name: '',
      timestamp: 0,
      signedMessage: '',
      score: 0,
    },
    recoveryData: {
      id: '',
      publicKey: '',
      secretKey: '',
      sigs: [],
      timestamp: 0,
    },
  });
});

test.skip('v1 bootstrap', async () => {
  expect.assertions(1);

  const mockStorage = [
    [
      'store@v1',
      `{"score":0,"name":"Test","photo":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"},"groupsCount":0,"searchParam":"","newGroupCoFounders":[],"eligibleGroups":[],"currentGroups":[],"connections":[{"id":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU","name":"Tobit Sellers","score":0,"connectionDate":1576267989542,"photo":{"filename":"qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU.jpg"}},{"id":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ","name":"Jacki Stode","score":0,"connectionDate":1576267974294,"photo":{"filename":"HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ.jpg"}}],"verifications":[],"apps":[{"verified":true,"name":"test","url":"url","logoFile":{"filename":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg"},"dateAdded":1576268209344}],"publicKey":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3+zAIb5c=","id":"USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c","secretKey":{"0":253,"1":230,"2":176,"3":67,"4":91,"5":21,"6":131,"7":186,"8":235,"9":47,"10":18,"11":164,"12":32,"13":213,"14":74,"15":248,"16":221,"17":71,"18":64,"19":1,"20":1,"21":225,"22":200,"23":26,"24":121,"25":22,"26":207,"27":32,"28":7,"29":7,"30":176,"31":42,"32":81,"33":40,"34":121,"35":143,"36":52,"37":58,"38":213,"39":73,"40":51,"41":193,"42":14,"43":82,"44":163,"45":33,"46":166,"47":41,"48":135,"49":141,"50":59,"51":26,"52":142,"53":160,"54":117,"55":90,"56":73,"57":151,"58":247,"59":251,"60":48,"61":8,"62":111,"63":151},"connectionsSort":"BY_DATE_ADDED_DESCENDING","connectQrData":{"aesKey":"","ipAddress":"","uuid":"","user":"","qrString":"","channel":""},"connectUserData":{"id":"","photo":"","name":"","timestamp":0,"signedMessage":"","score":0}}`,
    ],
  ];

  await AsyncStorage.clear();
  await AsyncStorage.multiSet(mockStorage);
  await bootstrapAndUpgrade();

  expect(store.getState()).toEqual({
    score: 0,
    name: 'Test',
    photo: { filename: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg' },
    groupsCount: 0,
    searchParam: '',
    newGroupCoFounders: [],
    eligibleGroups: [],
    currentGroups: [],
    connections: [
      {
        id: 'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU',
        name: 'Tobit Sellers',
        score: 0,
        connectionDate: 1576267989542,
        photo: { filename: 'qTGWiWtDPuJaLbT-3ITIrIZNshC1eKefs3vvLRHRhLU.jpg' },
      },
      {
        id: 'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ',
        name: 'Jacki Stode',
        score: 0,
        connectionDate: 1576267974294,
        photo: { filename: 'HO1YfPXeLWDKnUOhiCguTuylhOTSfhz9mtBJVcfcFBQ.jpg' },
      },
    ],
    verifications: [],
    apps: [
      {
        verified: true,
        name: 'test',
        url: 'url',
        logoFile: {
          filename: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c.jpg',
        },
        dateAdded: 1576268209344,
      },
    ],
    publicKey: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3+zAIb5c=',
    id: 'USh5jzQ61UkzwQ5SoyGmKYeNOxqOoHVaSZf3-zAIb5c',
    secretKey: objToUint8({
      0: 253,
      1: 230,
      2: 176,
      3: 67,
      4: 91,
      5: 21,
      6: 131,
      7: 186,
      8: 235,
      9: 47,
      10: 18,
      11: 164,
      12: 32,
      13: 213,
      14: 74,
      15: 248,
      16: 221,
      17: 71,
      18: 64,
      19: 1,
      20: 1,
      21: 225,
      22: 200,
      23: 26,
      24: 121,
      25: 22,
      26: 207,
      27: 32,
      28: 7,
      29: 7,
      30: 176,
      31: 42,
      32: 81,
      33: 40,
      34: 121,
      35: 143,
      36: 52,
      37: 58,
      38: 213,
      39: 73,
      40: 51,
      41: 193,
      42: 14,
      43: 82,
      44: 163,
      45: 33,
      46: 166,
      47: 41,
      48: 135,
      49: 141,
      50: 59,
      51: 26,
      52: 142,
      53: 160,
      54: 117,
      55: 90,
      56: 73,
      57: 151,
      58: 247,
      59: 251,
      60: 48,
      61: 8,
      62: 111,
      63: 151,
    }),
    connectionsSort: 'BY_DATE_ADDED_DESCENDING',
    connectQrData: {
      aesKey: '',
      ipAddress: '',
      uuid: '',
      user: '',
      qrString: '',
      channel: '',
    },
    connectUserData: {
      id: '',
      photo: '',
      name: '',
      timestamp: 0,
      signedMessage: '',
      score: 0,
    },
  });
});
