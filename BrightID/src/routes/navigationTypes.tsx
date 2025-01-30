import { SocialMediaType } from '@/components/EditProfile/socialMediaVariations';
import { qrCodeURL_types } from '@/utils/constants';

type ModalStackParamList = {
  FullScreenPhoto: {
    photo?: Photo | string;
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
    reportReason?: ReportReason;
    successCallback?: (ReportReason) => void;
    reporting?: boolean;
    source: any; // ReportSource;
  };
  SortConnections: undefined;
  ViewPasswordWalkthrough: undefined;
  RecoveryCooldownInfo: {
    connectionId?: string;
    cooldownPeriod?: number;
    successCallback?: () => void;
  };
  NodeModal: undefined;
};

// 1st level - Just render "Home" (not HomeScreen!)
// "Home" renders only one actual screen which contains the "HomeDrawer".
type HomeParamList = {
  Home: undefined;
};

type ImportParamList = {
  ImportCode: {
    urlType: qrCodeURL_types;
    action: string;
  };
  Import: {
    changePrimaryDevice: boolean;
  };
};
type RestoreParamList = {
  RecoveryCode: {
    urlType: qrCodeURL_types;
    action: string;
  };
  Restore: undefined;
};
type OnboardingParamList = {
  Onboard: undefined;
  SignupName: undefined;
  SignUpPhoto: undefined;
  OnboardSuccess: undefined;
} & ImportParamList &
  RestoreParamList;

// 2nd level - HomeDrawer below "Home"
// HomeDrawer renders a DrawerNavigator with the following screens
export type HomeDrawerParamList = {
  HomeScreen: undefined;
  Achievements: undefined;
  FindFriendsScreen: undefined;
  BituVerification: {
    url: string;
  };
  EditProfile: undefined;
  RecoveryConnections: undefined;
  CopyExplorerCode: undefined;
  Settings: undefined;
  ContactUs: undefined;
  SampleIconPage: undefined;
};

type PendingConnectionsParamList = {
  MyCode: undefined;
  ScanCode: undefined;
  PendingConnections: undefined;
  GroupConnection: {
    channel: Channel;
  };
};
type ConnectionsParamList = {
  Connections: undefined;
  Connection: {
    connectionId: string;
  };
};
type RecoveryConnectionsParamList = {
  RecoveryConnectionsList: undefined;
};
type GroupsParamList = {
  Groups: undefined;
  NewGroup: { photo: string; name: string; isPrimary: boolean };
  GroupInfo: undefined;
  Members: { group: Group };
  InviteList: { group: Group };
};
type NotificationsParamList = {
  Notifications: undefined;
};
type DevicesParamList = {
  AddDevice: {
    name: string;
    changePrimaryDevice: boolean;
    isSuper: boolean;
  };
  Devices: {
    syncing: boolean;
    asScanner: boolean;
  };
  SyncCode: {
    urlType: qrCodeURL_types;
    action: string;
  };
};

export type AppsRouteParams = {
  baseUrl?: string;
  appId: string;
  appUserId: string;
};
type AppsParamList = {
  Apps: AppsRouteParams;
};

type RecoveringConnectionParamList = {
  RecoveringConnection: undefined;
};

type EulaParamList = {
  LicenseAgreement: undefined;
};
type MainTabsParamList = HomeParamList &
  PendingConnectionsParamList &
  ConnectionsParamList &
  RecoveryConnectionsParamList &
  GroupsParamList &
  NotificationsParamList &
  DevicesParamList &
  AppsParamList &
  ModalStackParamList &
  RecoveringConnectionParamList &
  OnboardingParamList &
  EulaParamList;

export type RootStackParamList = MainTabsParamList & HomeDrawerParamList;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
