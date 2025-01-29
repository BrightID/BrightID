import { SocialMediaType } from '@/components/EditProfile/socialMediaVariations';

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
    source: any; // ReportSource;
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

type HomeParamList = {
  Home: undefined;
};

type PendingConnectionsParamList = {
  MyCode: undefined;
  ScanCode: undefined;
  PendingConnections: undefined;
  GroupConnection: undefined;
};
type ConnectionsParamList = {
  Connections: undefined;
  Connection: undefined;
};
type RecoveryConnectionsParamList = {
  RecoveryConnectionsList: undefined;
};
type GroupsParamList = {
  Groups: undefined;
  NewGroup: undefined;
  GroupInfo: undefined;
  Members: undefined;
  InviteList: undefined;
};
type NotificationsParamList = {
  Notifications: undefined;
};
type DevicesParamList = {
  AddDevice: undefined;
  Devices: undefined;
  SyncCode: undefined;
};
type AppsParamList = {
  Apps: undefined;
};
type RecoveringConnectionParamList = {
  RecoveringConnection: undefined;
};
type HomeDrawerParamList = {
  HomeScreen: undefined;
  Achievements: undefined;
  FindFriendsScreen: undefined;
  BituVerification: undefined;
  EditProfile: undefined;
  RecoveryConnections: undefined;
  CopyExplorerCode: undefined;
  Settings: undefined;
  ContactUs: undefined;
  SampleIconPage: undefined;
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
  RecoveringConnectionParamList;

export type RootStackParamList = MainTabsParamList & HomeDrawerParamList;
