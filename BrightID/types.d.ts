import {
  ThunkAction,
  AnyAction,
  EntityState as _EntityState,
} from '@reduxjs/toolkit';
import { RouteProp as _RouteProp } from '@react-navigation/native';
import { CountryCode } from 'react-native-country-picker-modal';
import { BigInteger } from 'jsbn';
import ChannelAPI from '@/api/channelService';
import { store } from '@/store';
import {
  channel_states,
  channel_types,
  connection_levels,
  report_reasons,
} from '@/utils/constants';
import { pendingConnection_states } from '@/components/PendingConnections/pendingConnectionSlice';
import {
  SocialMediaType,
  SocialMediaShareActionType,
  SocialMediaShareType,
  SocialMediaShareTypeDisplay,
  SocialMediaVariationIds,
} from '@/components/EditProfile/socialMediaVariations';
import { RecoveryErrorType } from '@/components/Onboarding/RecoveryFlow/RecoveryError';

declare global {
  type RootState = ReturnType<typeof store.getState>;
  type AppDispatch = typeof store.dispatch;
  type EntityState<T> = _EntityState<T>;
  type ValueOf<T> = T[keyof T];
  type RouteProp<ParamList, RouteName> = _RouteProp<ParamList, RouteName>;
  type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
  >;

  type IntervalId = ReturnType<typeof setInterval>;
  type TimeoutId = ReturnType<typeof setTimeout>;

  type navigation = () => any;

  type ContextInfo = {
    context: string;
    contextId: string;
    dateAdded: number;
    state: 'pending' | 'applied' | 'failed';
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
    expires: number; // unix timestamp (seconds)
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
    initiatorProfileId: string;
  };

  /* Profile information shared P2P via channel when making connections */
  type SharedProfile = {
    requestProof?: string;
    id: string;
    photo: string;
    name: string;
    socialMedia?: Array<SocialMedia>;
    profileTimestamp: number;
    secretKey?: string;
    notificationToken?: string;
    version: number;
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

  /**
   * PendingConnectionData contains all available info about a pending connection
   * - existingConnection, if there already is a connection to this user
   * - sharedProfile: The connection data that was shared via channel
   * - profileInfo: The connection data that was obtained via brightID node API
   */
  type PendingConnectionData = {
    existingConnection?: Connection;
    sharedProfile: SharedProfile;
    profileInfo?: ProfileInfo;
    notificationToken?: string;
    myself: boolean;
  };

  /**
   * Pending connection is made of
   * - identifier (channelId, profileId)
   * - state
   * The actual connection data is downloaded from a channel and stored in pendingConnectionData.
   */
  type PendingConnection = {
    profileId: string;
    channelId: string;
    state: PendingConnectionState;
    pendingConnectionData?: PendingConnectionData;
  };

  type RecoveryData = {
    publicKey: string;
    secretKey: Uint8Array;
    id: string;
    name: string;
    photo: Photo;
    aesKey: string;
    timestamp: number;
    recoveredConnections: number;
    recoveredGroups: number;
    recoveredBlindSigs: number;
    uploadCompletedBy: { [uploader: string]: boolean };
    sigs: { [sig: string]: Signature };
    qrcode: string;
    channel: RecoveryChannel;
    errorType: RecoveryErrorType;
    errorMessage: string;
    recoverStep: RecoverStep_Type;
  };

  type RecoveryChannel = {
    channelId: string;
    url: URL;
    expires: number;
    pollTimerId: IntervalId;
  };
  type QrCodeURL_Type = typeof qrCodeURL_types[keyof typeof qrCodeURL_types];

  // We are sure that these properties are
  // shared in old or new versions of app
  interface SocialMediaVariationShared {
    name: string;
    shareType: SocialMediaShareType;
  }

  type SocialMediaId = string | SocialMediaVariationIds;

  type SocialMediaVariation = SocialMediaVariationShared & {
    id: SocialMediaId;
    type: SocialMediaType;
    shareTypeDisplay: SocialMediaShareTypeDisplay;
    shareActionType: SocialMediaShareActionType;
    shareActionDataFormat: string;
    icon: any;
    brightIdAppId: string;
  };

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
    appUserId: string;
    token: string;
    synced: boolean;
  };

  type SocialMedia = SocialMediaShared & {
    shareWithConnections?: boolean;
    brightIdSocialAppData?: BrightIdSocialAppData;
  };

  type PhoneNumberObject = {
    country: CountryCode;
    number: string;
  };

  type SocialMediaState = EntityState<SocialMedia>;

  /*
    Connection information synced via channel when using multiple
    devices or performing recovery.
  */
  type SyncConnection = {
    id: string;
    name: string;
    photo: string; // base64-encoded photo data
    timestamp: number;
    socialMedia?: SocialMedia[];
  };

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

  type ReportReason = keyof typeof report_reasons;

  type ModalStackParamList = {
    FullScreenPhoto: {
      photo?: Photo;
      base64?: boolean;
    };
    ChangePassword: undefined;
    SelectSocialMedia: {
      type: SocialMediaType;
      order: number;
      page: number;
      prevId: SocialMediaId;
    };
    SetTrustlevel: {
      connectionId: string;
    };
    ReportReason: {
      connectionId: string;
      connectionName: string;
      reportReason: ReportReason;
      successCallback?: (ReportReason) => void;
      reporting?: boolean;
      source: ReportSource;
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

  type RecoverStep_Type = typeof recover_steps[keyof typeof recover_steps];
}
