// @flow

import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';

declare type State = {
  score: number,
  name: string,
  photo: {
    filename: string,
  },
  groupsCount: number,
  searchParam: string,
  newGroupCoFounders: string[],
  eligibleGroups: group[],
  currentGroups: group[],
  connections: connection[],
  trustedConnections: string[],
  notifications: NotificationInfo[],
  backupCompleted: boolean,
  apps: AppInfo[],
  verifications: any[],
  publicKey: string,
  id: string,
  safePublicKey?: string,
  password: string,
  hashedId: string,
  secretKey: Uint8Array,
  connectionsSort: string,
  connectQrData: {
    aesKey: string,
    ipAddress: string,
    uuid: string,
    user: string,
    qrString: string,
    channel: string,
  },
  connectUserData: {
    id: string,
    photo: string,
    name: string,
    timestamp: number,
    signedMessage: string,
    score: number,
    secretKey?: Uint8Array,
  },
  recoveryData: {
    publicKey: string,
    secretKey: string,
    timestamp: number,
    id: string,
    sigs: Signature[],
  },
};

declare type state = State;

declare type getState = () => state;

declare type dispatch = Dispatch;

declare type navigation = NavigationScreenProp;

declare type Props = State & navigation & dispatch;

declare type connection = {
  publicKey?: string,
  id: string,
  name: string,
  score: number,
  secretKey?: Uint8Array,
  connectionDate: number,
  photo: {
    filename: string,
  },
};

declare type group = {
  isNew: boolean,
  score: number,
  id: string,
  knownMembers: string[],
  founders: string[],
};

declare type NotificationInfo = {
  msg: string,
  icon: string,
};

declare type Signature = {
  signer: string,
  sig: string,
  id: string,
};

declare type AppInfo = {
  name: string,
  url: string,
  logoFile: string,
  verified: boolean,
  dateAdded: number,
};

declare type Uint8Obj = {
  [index: string]: number,
};

declare type action = {
  type: string,
  [key: string]: any,
};
