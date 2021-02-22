/**
 * Apps
 */

/**
 * Connections
 */

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

type Group = GroupInfo & {
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
