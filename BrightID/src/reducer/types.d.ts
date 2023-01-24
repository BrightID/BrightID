/**
 * Apps
 */

type LinkingAppInfo = {
  appId: string;
  appUserId: string;
  baseUrl?: string;
  v: number;
  skipSponsoring?: boolean;
  sigsToLink?: Array<SigInfo>;
};

type AppsState = {
  apps: AppInfo[];
  linkedContexts: EntityState<ContextInfo>;
  sigs: EntityState<SigInfo>;
  sigsUpdating: boolean;
  appLinkingStep: AppLinkingStep_Type;
  appLinkingStepText?: string;
  sponsorOperationHash?: string;
  linkingAppInfo?: LinkingAppInfo;
  linkingAppError?: string;
};

/**
 * Connections
 */

type ConnectionsState = {
  connections: EntityState<Connection>;
  connectionsSort: SortTypes;
  searchParam: string;
  searchOpen: boolean;
  filters: ConnectionLevel[];
  firstRecoveryTime: number;
};

type LocalConnectionData = {
  id: string;
  name: string;
  connectionDate: number;
  photo: Photo;
  status?: string;
  level?: ConnectionLevel;
  socialMedia?: SocialMedia[];
  incomingLevel?: ConnectionLevel;
  notificationToken?: string;
  publicKey?: string;
  secretKey?: any;
  reportReason?: string;
  requestProof?: string;
  verifications: Verification[];
};

type Connection = Partial<ConnectionInfo> & Partial<LocalConnectionData>;

/**
 * Groups
 */

type GroupsState = {
  invites: Invite[];
  groups: JoinedGroup[];
  searchParam: string;
  searchOpen: boolean;
};

type JoinedGroup = Group & {
  joined: number;
  state: GroupState_Type;
};

type Group = GroupInfo & {
  name?: string;
  photo?: Photo;
  aesKey?: string;
};

type Invite = InviteInfo & {
  groupObj: Group;
  state: string;
};

/**
 * KeypairSlice
 */

type Keypair = {
  publicKey: string;
  secretKey: Uint8Array;
};

/**
 * Notifications
 */

/**
 * Operations
 */

type OperationsState = EntityState<NodeOps>;

/**
 * UserSlice
 */
type UserState = User & {
  searchParam: string;
  backupCompleted: boolean;
  verifications: Array<Verification>;
  isSponsored: boolean;
  isSponsoredv6: boolean;
  eula: boolean;
  migrated?: boolean;
  updateTimestamps: {
    isSponsored: number;
    isSponsoredv6: number;
    photo: number;
    name: number;
    backupCompleted: number;
    password: number;
  };
  localServerUrl: string;
};

/**
 * WalkthroughSlice
 */

/**
 * SettingsSlice
 */

type SettingsState = {
  baseUrl: string;
  api: any | undefined;
};

type Photo = {
  filename: string;
};

/**
 * DevicesSlice
 */

type Device = {
  name: string;
  signingKey: string;
  active: boolean;
};

type DevicesState = {
  devices: EntityState<Device>;
};
