/**
 * Apps
 */

type AppsState = {
  apps: AppInfo[];
  linkedContexts: EntityState<ContextInfo>;
  sigs: EntityState<SigInfo>;
};

/**
 * Connections
 */

type ConnectionsState = {
  connections: EntityState<Connection>;
  connectionsSort: string;
  searchParam: string;
  searchOpen: boolean;
  filters: ConnectionLevel[];
  firstRecoveryTime: number;
};

type LocalConnectionData = {
  id: string;
  name: string;
  connectionDate: number;
  photo: { filename: string };
  status?: string;
  level?: ConnectionLevel;
  socialMedia?: string[];
  incomingLevel?: ConnectionLevel;
  notificationToken?: string;
  publicKey?: string;
  secretKey?: any;
  reportReason?: string;
  verifications: Verification[];
};

type Connection = Partial<ConnectionInfo> & Partial<LocalConnectionData>;

/**
 * Groups
 */

type GroupsState = {
  newGroupInvitees: string[];
  invites: Invite[];
  groups: Group[];
  searchParam: string;
  searchOpen: boolean;
};

type Group = GroupInfo & {
  name?: string;
  photo?: { filename: string };
  aesKey?: string;
  joined: number;
  state: string;
};

type Invite = InviteInfo & {
  group: Group;
  state: string;
};

// type Invite = Omit<InviteInfo, 'group'> & {
//   group: Group;
//   state: string;
// };

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


