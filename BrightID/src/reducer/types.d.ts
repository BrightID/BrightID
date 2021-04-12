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
  pendingDeletions: {
    [id: string]: number;
  };
};

type LocalConnectionData = {
  id: string;
  name: string;
  connectionDate: number;
  photo: { filename: string };
  status?: string;
  level?: ConnectionLevel;
  incomingLevel?: ConnectionLevel;
  socialMedia?: string[];
  notificationToken?: string;
  publicKey?: string;
  hiddenFlag?: string;
  secretKey?: any;
};

type Connection = Partial<ConnectionInfo> & Partial<LocalConnectionData>;

/**
 * Groups
 */
type GroupsState = {
  newGroupCoFounders: string[];
  invites: Invite[];
  groups: Group[];
  searchParam: string;
  searchOpen: boolean;
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
