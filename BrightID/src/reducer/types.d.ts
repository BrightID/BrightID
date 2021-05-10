/**
 * Apps
 */

type AppsState = {
  apps: AppInfo[];
  linkedContexts: EntityState<ContextInfo>;
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
  socialMedia?: string[];
  notificationToken?: string;
  publicKey?: string;
  secretKey?: any;
  reportReason?: string;
};

type Connection = Partial<ConnectionInfo> & Partial<LocalConnectionData>;

/**
 * Groups
 */

type GroupsState = {
  newGroupCoFounders: string[];
  invites: Invite[];
  groups: Group[];
  groupsSearchParam: string;
  groupsSearchOpen: boolean;
  membersSearchParam: string;
  membersSearchOpen: boolean;
};

type Group = Partial<GroupInfo> & {
  name?: string;
  photo?: { filename: string };
  aesKey?: string;
};

type Invite = InviteInfo & {
  name?: string;
  state?: string;
  photo?: { filename: string };
  aesKey?: string;
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
