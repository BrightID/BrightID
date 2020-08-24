// @flow

import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';
import {
  channel_states,
  channel_types,
} from '@/components/NewConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';

declare type getState = () => State;

declare type dispatch = Dispatch;

declare type navigation = NavigationScreenProp;

declare type Props = State & navigation & dispatch;

declare type State = {
  apps: AppState,
  channels: ChannelsState,
  connections: ConnectionsState,
  groups: GroupsState,
  notifications: NotificationsState,
  operations: OperationsState,
  pendingConnections: PendingConnectionsState,
  recoveryData: RecoveryData,
  user: UserState,
};

declare type AppsState = {
  apps: AppInfo[],
};

declare type AppInfo = {
  name: string,
  url: string,
  logoFile: string,
  verified: boolean,
  dateAdded: number,
};

declare type ChannelsState = {
  displayChannelType: string,
  myChannelIds: {
    [channel_types.SINGLE]: string,
    [channel_types.GROUP]: string,
  },
  ids: string[],
  entities: Channel[],
};

declare type ChannelState = $Keys<typeof channel_states>;
declare type ChannelType = $Keys<typeof channel_types>;

declare type Channel = {
  id: string,
  initiatorProfileId: string,
  myProfileId: string,
  ipAddress: string,
  aesKey: string,
  timestamp: number,
  ttl: number,
  pollTimerId?: IntervalID,
  timeoutId?: TimeoutID,
  type: ChannelType,
  state: ChannelState,
  myProfileTimestamp?: number,
  api: ChannelAPI,
};

declare type ConnectionsState = {
  connections: connection[],
  trustedConnections: string[],
  connectionsSort: string,
  searchParam: string,
  searchOpen: boolean,
};

declare type Photo = {
  filename: string,
};

declare type connection = {
  id: string,
  name: string,
  score: number,
  secretKey?: Uint8Array,
  aesKey: string,
  connectionDate: number,
  photo: Photo,
  status: string,
  signingKey: string,
  createdAt: number,
  hasPrimaryGroup: boolean,
  publicKey?: string,
  flaggers?: any, // TODO: Proper definition, maybe refactor
};

declare type GroupsState = {
  newGroupCoFounders: string[],
  invites: invite[],
  groups: group[],
  searchParam: string,
  searchOpen: boolean,
};

declare type group = {
  score: number,
  isNew: boolean,
  admins: string[],
  url: string,
  type: 'general' | 'primary',
  timestamp: number,
  founders: string[],
  members: string[],
  id: string,
  name: string,
  photo: { filename: string },
  aesKey: string,
};

declare type invite = {
  score: number,
  isNew: boolean,
  admins: string[],
  url: string,
  type: 'general' | 'primary',
  timestamp: number,
  founder: string[],
  inviter: string,
  inviteId: string,
  data: string,
  members: string[],
  id: string,
  name: string,
  state: string,
  photo: { filename: string },
  aesKey: string,
};

declare type OperationsState = {
  operations: operation[],
};

declare type operation = {
  name: string,
  timestamp: string,
  v: string,
  _key: string,
  [val: string]: string,
};

declare type PendingConnectionsState = {
  ids: string[],
  entities: PendingConnection[],
};

declare type PendingConnection = {
  id: string,
  channelId: string,
  state: string,
  brightId?: string,
  name?: string,
  photo?: string,
  notificationToken?: string,
  timestamp?: number,
  signedMessage?: string,
  score?: number,
};

declare type RecoveryData = {
  publicKey: string,
  secretKey: string,
  timestamp: number,
  id: string,
  sigs: Signature[],
};

declare type UserState = {
  score: number,
  name: string,
  photo: Photo,
  searchParam: string,
  backupCompleted: boolean,
  verifications: any[],
  publicKey: string,
  id: string,
  safePublicKey?: string,
  password: string,
  hashedId: string,
};

declare type NotificationsState = {
  activeNotification: { message: string, type: string },
  pendingConnections: PendingConnection[],
  backupPending: boolean,
  deviceToken: string,
};

declare type BackupNotification = {
  msg: string,
  icon: string,
};

declare type PendingConnection = {
  id: string,
};

declare type Notification = BackupNotification & invite & PendingConnection;

declare type Signature = {
  signer: string,
  sig: string,
  id: string,
};

declare type Uint8Obj = {
  [index: string]: number,
};

declare type action = {
  type: string,
  [key: string]: any,
};
