// @flow

declare type dispatch = (any) => any;

declare type getState = () => { main: Main };

declare type Main = {
  trustScore: string,
  nameornym: string,
  photo: {
    uri: string,
  },
  groupsCount: string,
  searchParam: string,
  newGroupCoFounders: [],
  eligibleGroups: [],
  currentGroups: [],
  connections: [],
  nearbyPeople: [],
  publicKey: Uint8Array,
  secretKey: Uint8Array,
  connectionsSort: string,
  connectQrData: {
    aesKey: string,
    ipAddress: string,
    uuid: string,
    qrString: string,
    channel: string,
  },
  connectUserData: {
    publicKey: Uint8Array,
    photo: {
      uri: string,
    },
    nameornym: string,
    timestamp: number,
  },
  encryptedUserData: string,
};

declare type connection = {
  publicKey: string,
  name: string,
  score: number,
  secretKey?: Uint8Array,
  connectionDate: number,
  photo: {
    filename: string,
  },
};

declare type eligibleGroups = {
  isNew: boolean,
  score: number,
  id: string,
  knownMembers: string[],
  founders: string[],
}[];
