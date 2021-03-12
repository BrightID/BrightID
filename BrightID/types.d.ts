// @flow

import { EntityState } from '@reduxjs/toolkit';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnections/channelSlice';
import ChannelAPI from '@/api/channelService';
import { AppDispatch } from '@/store';
import { connection_levels } from '@/utils/constants';
import { pendingConnection_states } from '@/components/PendingConnections/pendingConnectionSlice';
import { socialMediaList } from '@/components/EditProfile/socialMediaList';

declare global {
  type ValueOf<T> = T[keyof T];

  type IntervalId = ReturnType<typeof setInterval>;
  type TimeoutId = ReturnType<typeof setTimeout>;

  type getState = () => State;
  type GetState = getState;

  // TODO: make this type more specific
  type dispatch = AppDispatch;
  type Dispatch = dispatch;

  type navigation = () => any;

  type State = {
    apps: AppsState;
    connections: ConnectionsState;
    channels: ChannelsState;
    groups: GroupsState;
    keypair: Keypair;
    notifications: NotificationsState;
    operations: OperationsState;
    pendingConnections: PendingConnectionsState;
    recoveryData: RecoveryData;
    socialMedia: SocialMediaState;
    tasks: TasksState;
    user: UserState;
    walkthrough: WalkthroughState;
  };

  type AppsState = {
    apps: AppInfo[];
    linkedContexts: ContextInfo[];
  };

  // type AppInfo = {
  //   id: string;
  //   name: string;
  //   logo: string;
  //   context: string;
  //   verification: string;
  //   url: string;
  //   unusedSponsorships: number;
  //   assignedSponsorships: number;
  // };

  type ContextInfo = {
    context: string;
    contextId: string;
    dateAdded: number;
    state: string;
  };

  type DisplayChannel = {
    displayChannelType: ChannelType;
    myChannelIds: {
      SINGLE: string;
      GROUP: string;
    };
  };

  type ChannelsState = EntityState<Channel> & DisplayChannel;

  type ChannelState = keyof typeof channel_states;
  type ChannelType = keyof typeof channel_types;

  type Channel = {
    id: string;
    initiatorProfileId: string;
    myProfileId: string;
    aesKey: string;
    timestamp: number;
    ttl: number;
    pollTimerId?: IntervalId;
    timeoutId?: TimeoutId;
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

  type Photo = {
    filename: string;
  };

  // TODO: extract DEV properties to separate type and join them conditionally depending on __DEV__
  // RESPONSE: this should not matter because we cannot type check the compiled code in release mode

  type ConnectionLevel = ValueOf<typeof connection_levels>;

  type NotificationsState = {
    activeNotification?: BannerNotification;
    backupPending: boolean;
    deviceToken: string;
    sessionNotifications: Array<string>;
    notificationToken: string;
    recoveryConnectionsPending: boolean;
  };

  type BannerNotification = {
    title?: string;
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

  type OperationsState = {
    operations: operation[];
  };

  type operation = {
    name: string;
    timestamp: number;
    v: string;
    hash: string;
  };

  type PendingConnectionState = keyof typeof pendingConnection_states;

  type PendingConnection = Partial<{
    id: string;
    channelId: string;
    brightId: string;
    name: string;
    photo: string;
    notificationToken: string;
    score: number;
    state: PendingConnectionState;
    verifications: { name: string }[];
    connectionsNum: number;
    reports: string[];
    connectedAt: number;
    groupsNum: number;
    mutualConnections: string[];
    existingConnection: Connection;
    socialMedia: string[];
    mutualGroups: string[];
    createdAt: number;
    profileTimestamp: number;
    initiator: string;
    myself?: boolean;
    secretKey?: any;
  }>;

  type PendingConnectionsState = EntityState<PendingConnection>;

  type RecoveryData = {
    publicKey: string;
    secretKey: string;
    id: string;
    name: string;
    photo: string;
    aesKey: string;
    timestamp: number;
    recoveredConnections: number;
    recoveredGroups: number;
    sigs: { [sig: string]: Signature };
    qrcode: string;
    channel: {
      channelId: string;
      url: URL;
      expires: number;
    };
  };

  type SocialMediaId = keyof typeof socialMediaList;

  type SocialMedia = {
    id: SocialMediaId;
    company: ValueOf<typeof socialMediaList>;
    order: number;
    profile: string;
    profileDisplayWidth?: number | string;
  };

  type SocialMediaState = EntityState<SocialMedia>;

  type TasksState = { [taskId: string]: TasksStateEntry };

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
    // TODO: Fix verifications type
    verifications: Array<any>;
    id: string;
    password: string;
    secretKey: string;
    isSponsored: boolean;
    eula: boolean;
    migrated?: boolean;
  };

  type LayoutBox = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
  };

  type WalkthroughState = {
    editProfileTextLayout: LayoutBox;
    editProfileMenuLayout: LayoutBox;
    headerHeight: number;
  };

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

  type ModalStackParamList = {
    FullScreenPhoto: {
      photo?: Photo;
      base64?: boolean;
    };
    ChangePassword: undefined;
    SelectSocialMedia: {
      order: number;
      page: number;
      prevId: SocialMediaId;
    };
    SetTrustlevel: {
      connectionId: string;
    };
    ReportReason: {
      connectionId: string;
      successCallback?: () => void;
    };
    SortConnections: undefined;
    ViewPasswordWalkthrough: undefined;
    RecoveryCooldownInfo: {
      connectionId: string;
      cooldownPeriod: number;
      successCallback?: () => void;
    };
  };

  // Jest global functions
  let element: any;
  let by: any;
  let waitFor: any;
  let device: any;
}
