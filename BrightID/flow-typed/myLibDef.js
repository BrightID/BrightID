// @flow

import { NavigationScreenProp } from 'react-navigation';
import { Dispatch } from 'redux';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnectionsScreens/channelSlice';
import ChannelAPI from '@/api/channelService';

declare type getState = () => State;

declare type dispatch = Dispatch;

declare type navigation = NavigationScreenProp;

declare type Props = State & navigation & dispatch;

declare type State = {
  channels: ChannelsState,
  apps: AppsState,
  connections: ConnectionsState,
  groups: GroupsState,
  notifications: NotificationsState,
  operations: OperationsState,
  pendingConnections: PendingConnectionsState,
  recoveryData: RecoveryData,
  tasks: TasksState,
  user: UserState,
};

declare type AppsState = {
  apps: AppInfo[],
  linkedContexts: ContextInfo[],
};

declare type AppInfo = {
  id: string,
  name: string,
  url: string,
  logo: string,
  context: string,
  verification: string,
  url: string,
  unusedSponsorships: number,
  assignedSponsorships: number,
};

declare type ContextInfo = {
  context: string,
  contextId: string,
  dateAdded: number,
  state: string,
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
  timestamp: number,
  v: string,
  hash: string,
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

declare type TasksState = {
  tasks: { [taskId: string]: TasksStateEntry },
};

declare type TasksStateEntry = {
  id: string,
  completed: boolean,
  timestamp: number,
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
  secretKey: string,
};

declare type NotificationsState = {
  activeNotification?: BannerNotification,
  pendingConnections: PendingConnection[],
  backupPending: boolean,
  deviceToken: string,
  sessionNotifications: Array<String>,
};

declare type BannerNotification = {
  message: string,
  type: string,
  navigationTarget?: string,
  xmlIcon?: string,
  oncePerSession?: boolean,
};

declare type BackupNotification = {
  msg: string,
  icon: string,
};

declare type PendingConnectionNotification = {
  id: string,
};

declare type Notification = BackupNotification &
  invite &
  PendingConnectionNotification;

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
