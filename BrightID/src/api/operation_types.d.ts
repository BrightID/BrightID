/**
 * Operation Types
 */

type NodeOps =
  | AddAdminOp
  | AddGroupOp
  | AddMembershipOp
  | ConnectOp
  | DismissOp
  | InviteOp
  | LinkContextIdOp
  | RemoveGroupOp
  | RemoveMembershipOp
  | SocialRecoveryOp;

type AddAdminOp = {
  name: 'Add Admin';
  id: string;
  admin: string;
  group: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type AddGroupOp = {
  name: 'Add Group';
  group: string;
  id: string;
  url: string;
  type: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type AddMembershipOp = {
  name: 'Add Membership';
  id: string;
  group: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type ConnectOp = {
  name: 'Connect';
  id1: string;
  id2: string;
  level: string;
  timestamp: number;
  v: number;
  sig1?: string;
  reportReason?: string;
  replacedWith?: string;
  requestProof?: string;
  hash?: string;
};

type DismissOp = {
  name: string;
  dismisser: string;
  dismissee: string;
  group: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type InviteOp = {
  name: 'Invite';
  inviter: string;
  invitee: string;
  group: string;
  data: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type LinkContextIdOp = {
  api?: NodeApi;
  name: 'Link ContextId';
  timestamp: number;
  v: number;
  context: string;
  contextId?: string;
  encrypted?: string;
  id?: string;
  sig?: string;
  hash?: string;
};

type RemoveGroupOp = {
  name: 'Remove Group';
  id: string;
  group: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type RemoveMembershipOp = {
  name: string;
  id: string;
  group: string;
  timestamp: number;
  v: number;
  sig?: string;
  hash?: string;
};

type SocialRecoveryOp = {
  name: 'Social Recovery';
  id: string;
  signingKey: string;
  timestamp: number;
  v: number;
  id1?: string;
  id2?: string;
  sig1?: string;
  sig2?: string;
  hash?: string;
};
