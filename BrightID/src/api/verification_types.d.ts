/* Properties shared by all verifications */
interface BaseVerification {
  name: string;
  block: number;
  timestamp: number;
}

/*
  'expression' verification
 */
type ExpressionVerification = BaseVerification & {
  expression: boolean;
};

/*
  'hash' verification
 */
type HashVerification = BaseVerification & {
  hash: string;
};

type SeedConnectedVerification = HashVerification & {
  name: 'SeedConnected';
  rank: number;
  connected: Array<string>; // hashes of seedgroups that connected with user
  reported: Array<string>; // hashes of seedgroups that reported this user
};

type SeedConnectedWithFriendVerification = HashVerification & {
  name: 'SeedConnectedWithFriend';
  friend: any; // TODO: expected content?
};

type YektaVerification = HashVerification & {
  name: 'Yekta';
  rank: number;
  raw_rank: number;
};

type BituReport = Record<string, number>;

type BituVerification = HashVerification & {
  name: 'Bitu';
  score: number;
  directReports: BituReport;
  indirectReports: BituReport;
};

type Verification =
  | ExpressionVerification
  | HashVerification
  | SeedConnectedVerification
  | SeedConnectedWithFriendVerification
  | YektaVerification
  | BituVerification;
