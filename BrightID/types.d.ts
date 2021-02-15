// @flow

import { ThunkDispatch } from 'redux-thunk';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnections/channelSlice';
import ChannelAPI from '@/api/channelService';
import { connection_levels } from './src/utils/constants';
import { pendingConnection_states } from './src/components/PendingConnections/pendingConnectionSlice';

declare global {
  type getState = () => State;

  // TODO: make this type more specific
  type dispatch = ThunkDispatch<any, any, any>;

  type navigation = () => any;

  type State = {
    channels: ChannelsState;
    apps: AppsState;
    connections: ConnectionsState;
    groups: GroupsState;
    keypair: Keypair;
    notifications: NotificationsState;
    operations: OperationsState;
    pendingConnections: PendingConnectionsState;
    recoveryData: RecoveryData;
    tasks: TasksState;
    user: UserState;
    walkthrough: WalkthroughState;
  };

  type AppsState = {
    apps: AppInfo[];
    linkedContexts: ContextInfo[];
  };

  type AppInfo = {
    id: string;
    name: string;
    logo: string;
    context: string;
    verification: string;
    url: string;
    unusedSponsorships: number;
    assignedSponsorships: number;
  };

  type ContextInfo = {
    context: string;
    contextId: string;
    dateAdded: number;
    state: string;
  };

  type ChannelsState = {
    displayChannelType: string;
    myChannelIds: {
      [id: string]: string;
    };
    ids: string[];
    entities: Channel[];
  };

  type ChannelState = keyof typeof channel_states;
  type ChannelType = keyof typeof channel_types;

  type Channel = {
    id: string;
    initiatorProfileId: string;
    myProfileId: string;
    aesKey: string;
    timestamp: number;
    ttl: number;
    pollTimerId?: ReturnType<typeof setInterval>;
    timeoutId?: ReturnType<typeof setTimeout>;
    type: ChannelType;
    state: ChannelState;
    myProfileTimestamp?: number;
    api: ChannelAPI;
    url: URL;
  };

  type ChannelInfo = {
    version: number;
    type: ChannelType;
    timestamp: number;
    ttl: number;
    initiatorProfileId: string;
  };

  type ConnectionsState = {
    connections: connection[];
    connectionsSort: string;
    searchParam: string;
    searchOpen: boolean;
    filters: string[]
  };

  type Photo = {
    filename: string;
  };

  // TODO: extract DEV properties to separate type and join them conditionally depending on __DEV__
  type connection = {
    id: string;
    name: string;
    score: number;
    secretKey?: string;
    aesKey: string;
    connectionDate: number;
    photo: Photo;
    status: string;
    signingKey: string;
    createdAt: number;
    hasPrimaryGroup: boolean;
    publicKey?: string;
    flaggers?: any; // TODO: Proper definition, maybe refactor
    level: ConnectionLevel,
  };

  type GroupsState = {
    newGroupCoFounders: string[];
    invites: invite[];
    groups: group[];
    searchParam: string;
    searchOpen: boolean;
  };

  type Keypair = {
    publicKey: string;
    secretKey: Uint8Array;
  };

  type group = {
    score: number;
    isNew: boolean;
    admins: string[];
    url: string;
    type: 'general' | 'primary';
    timestamp: number;
    founders: string[];
    members: string[];
    id: string;
    name: string;
    photo: { filename: string };
    aesKey: string;
  };

  type invite = {
    score: number;
    isNew: boolean;
    admins: string[];
    url: string;
    type: 'general' | 'primary';
    timestamp: number;
    founder: string[];
    inviter: string;
    inviteId: string;
    data: string;
    members: string[];
    id: string;
    name: string;
    state: string;
    photo: { filename: string };
    aesKey: string;
  };

  type OperationsState = {
    operations: operation[];
  };

  type operation = {
    name: string;
    timestamp: number;
    v: string;
    hash: string;
  };

  type PendingConnectionsState = {
    ids: string[];
    entities: PendingConnection[];
  };

  type PendingConnection = {
    id: string;
    channelId: string;
    state: string;
    brightId?: string;
    name?: string;
    photo?: string;
    notificationToken?: string;
    secretKey?: string;
    score?: number;
  };

  type RecoveryData = {
    publicKey: string;
    secretKey: string;
    id: string;
    name: string;
    photo: string;
    aesKey: string;
    timestamp: number;
    sigs: { [sig: string]: Signature };
    qrcode: string;
    channel: {
      channelId: string;
      url: string;
      expires: number;
    };
  };

  type TasksState = {
    tasks: { [taskId: string]: TasksStateEntry };
  };

  type TasksStateEntry = {
    id: string;
    completed: boolean;
    timestamp: number;
  };

  type UserState = {
    score: number;
    name: string;
    photo: Photo;
    searchParam: string;
    backupCompleted: boolean;
    verifications: any[];
    id: string;
    password: string;
    secretKey: string;
    isSponsored: boolean;
  };

  type WalkthroughState = {
    editProfileLayout: {
      width?: number;
      height?: number;
      x?: number;
      y?: number;
    };
    headerHeight: number;
  };

  type NotificationsState = {
    activeNotification?: BannerNotification;
    pendingConnections: PendingConnection[];
    backupPending: boolean;
    deviceToken: string;
    sessionNotifications: Array<string>;
    notificationToken: string;
    recoveryConnectionsPending: boolean;
  };

  type BannerNotification = {
    message: string;
    type: string;
    navigationTarget?: string;
    icon?: string;
    oncePerSession?: boolean;
  };

  type BackupNotification = {
    msg: string;
    icon: string;
  };

  type PendingConnectionNotification = {
    id: string;
  };

  type Notification = BackupNotification &
    invite &
    PendingConnectionNotification;

  type Signature = {
    signer: string;
    sig: string;
    id: string;
  };

  type Uint8Obj = {
    [index: string]: number;
  };

  type action = {
    type: string;
    [key: string]: any;
  };

  type FakeUser = {
    id: string;
    secretKey: string; // Base64 encoded secretkey
  };

  type ConnectionLevel = keyof typeof connection_levels;
  type PendingConnectionState = keyof typeof pendingConnection_states;

  // Jest global functions
  let element: any;
  let by: any;
  let waitFor: any;
  let device: any;
}
