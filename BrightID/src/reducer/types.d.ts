/**
 * Apps
 */

/**
 * Connections
 */
type ConnectionsState = {
  connections: Connection[];
  connectionsSort: string;
  searchParam: string;
  searchOpen: boolean;
  filters: string[];
};

type Connection = Partial<ConnectionInfo> & {
  name: string;
  photo: { filename: string };
  connectionDate: number;
  status: string;
  socialMedia?: string[];
  notificationToken?: string;
  publicKey?: string;
  secretKey?: string;
  hiddenFlag?: string;
  aesKey?: string;
};
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

/**
 * UserSlice
 */

/**
 * WalkthroughSlice
 */
