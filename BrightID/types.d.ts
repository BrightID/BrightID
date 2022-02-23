import { EntityState as _EntityState } from '@reduxjs/toolkit';
import { RouteProp as _RouteProp } from '@react-navigation/native';
import { CountryCode } from 'react-native-country-picker-modal';
import { BigInteger } from 'jsbn';
import {
  channel_states,
  channel_types,
} from '@/components/PendingConnections/channelSlice';
import ChannelAPI from '@/api/channelService';
import { AppDispatch, RootState } from '@/store';
import { connection_levels } from '@/utils/constants';
import { pendingConnection_states } from '@/components/PendingConnections/pendingConnectionSlice';
import {
  SocialMediaType,
  SocialMediaShareActionType,
  SocialMediaShareType,
  SocialMediaShareTypeDisplay,
} from '@/components/EditProfile/socialMediaVariations';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';

declare global {
  type EntityState<T> = _EntityState<T>;
  type ValueOf<T> = T[keyof T];
  type RouteProp<ParamList, RouteName> = _RouteProp<ParamList, RouteName>;

  type IntervalId = ReturnType<typeof setInterval>;
  type TimeoutId = ReturnType<typeof setTimeout>;

  type getState = () => State;
  type GetState = getState;

  // TODO: make this type more specific
  type dispatch = AppDispatch;
  type Dispatch = dispatch;

  type navigation = () => any;
  type State = RootState;

  type ContextInfo = {
    context: string;
    contextId: string;
    dateAdded: number;
    state: string;
  };

  type SigInfo = {
    sig?: WISchnorrBlindSignature;
    app: string;
    appUserId?: string;
    roundedTimestamp: number;
    verification: string;
    uid: string;
    linked: boolean;
    linkedTimestamp: number;
    signedTimestamp: number;
    pub: string;
    challenge: WISchnorrChallenge;
  };

  type DisplayChannel = {
    displayChannelType: ChannelType;
    myChannelIds: {
      SINGLE: string;
      GROUP: string;
      STAR: string;
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
    verifications: Verification[];
    connectionsNum: number;
    reports: Array<{ id: string; reportReason: string }>;
    connectedAt: number;
    groupsNum: number;
    mutualConnections: string[];
    existingConnection: Connection;
    socialMedia: SocialMedia[];
    mutualGroups: string[];
    createdAt: number;
    profileTimestamp: number;
    initiator: string;
    myself?: boolean;
    secretKey?: string;
  }>;

  type PendingConnectionsState = EntityState<PendingConnection>;

  type RecoveryData = {
    publicKey: string;
    secretKey: Uint8Array;
    id: string;
    name: string;
    photo: string;
    aesKey: string;
    timestamp: number;
    recoveredConnections: number;
    recoveredGroups: number;
    recoveredBlindSigs: number;
    uploadCompletedBy: { [uploader: string]: boolean };
    sigs: { [sig: string]: Signature };
    qrcode: string;
    channel: {
      channelId: string;
      url: URL;
      expires: number;
    };
    errorType: RecoveryErrorType;
    errorMessage: string;
  };

  type RecoveryChannel = {
    aesKey: string;
    url: URL;
    t: QrCodeURL_Type;
  };
  type QrCodeURL_Type = typeof qrCodeURL_types[keyof typeof qrCodeURL_types];

  // We are sure that these properties are
  // shared in old or new versions of app
  interface SocialMediaVariationShared {
    name: string;
    shareType: SocialMediaShareType;
  }

  type SocialMediaId = string;

  type SocialMediaVariation = SocialMediaVariationShared & {
    id: SocialMediaId;
    type: SocialMediaType;
    shareTypeDisplay: SocialMediaShareTypeDisplay;
    shareActionType: SocialMediaShareActionType;
    shareActionDataFormat: string;
    icon: any;
    brightIdAppName: string;
  };

  type SocialMediaVariationState = EntityState<SocialMediaVariation>;

  type SocialMediaVariations = SocialMediaVariation[];

  type SocialMediaShared = {
    id: SocialMediaId;
    company: SocialMediaVariationShared;
    order: number;
    profile: string;
    profileDisplayWidth?: number | string;
  };

  type BrightIdSocialAppData = {
    linked: boolean;
    contextId: string;
    token: string;
    synced: boolean;
  };

  type SocialMedia = SocialMediaShared & {
    brightIdSocialAppData?: BrightIdSocialAppData;
  };

  type PhoneNumberObject = {
    country: CountryCode;
    number: string;
  };

  type SocialMediaState = EntityState<SocialMedia>;

  type TasksState = { [taskId: string]: TasksStateEntry };

  type TasksStateEntry = {
    id: string;
    completed: boolean;
    timestamp: number;
  };

  type User = {
    id: string;
    name: string;
    photo: Photo;
    password: string;
    secretKey: string;
  };

  type GroupMember = User | Connection;

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
      reporting?: boolean;
    };
    SortConnections: undefined;
    ViewPasswordWalkthrough: undefined;
    RecoveryCooldownInfo: {
      connectionId: string;
      cooldownPeriod: number;
      successCallback?: () => void;
    };
    NodeModal: undefined;
  };

  type WISchnorrChallenge = {
    e: string;
    t: {
      t1: BigInteger;
      t2: BigInteger;
      t3: BigInteger;
      t4: BigInteger;
    };
  };

  type WISchnorrBlindSignature = {
    rho: string;
    omega: string;
    sigma: string;
    delta: string;
  };

  type SyncDeviceInfo = {
    signingKey?: string;
    lastSyncTime?: number;
    isPrimaryDevice: boolean;
  };
}
