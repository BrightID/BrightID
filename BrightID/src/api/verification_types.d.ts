/* Properties shared by all verifications */
interface BaseVerification {
  block: number;
  timestamp: number;
}

/* App verifications all have the same form */
type AppVerification = BaseVerification & {
  name: string; // name of the app
  app: boolean;
};

/*
  Properties shared by all non-app verifications
  - block
  - timestamp
  - hash
 */
interface GenericVerification extends BaseVerification {
  hash: string;
}

type BasicVerification = GenericVerification & {
  name: 'BrightID' | 'DollarForEveryOne' | 'SocialRecoverySetup';
};

type SeedConnectedVerification = GenericVerification & {
  name: 'SeedConnected';
  rank: number;
  connected: Array<string>; // hashes of seedgroups that connected with user
  reported: Array<string>; // hashes of seedgroups that reported this user
};

type SeedConnectedWithFriendVerification = GenericVerification & {
  name: 'SeedConnectedWithFriend';
  friend: any; // TODO: expected content?
  hash: string;
};

type YektaVerification = GenericVerification & {
  name: 'Yekta';
  rank: number;
  raw_rank: number;
  hash: string;
};

type Verification =
  | AppVerification
  | BasicVerification
  | SeedConnectedVerification
  | SeedConnectedWithFriendVerification
  | YektaVerification;
