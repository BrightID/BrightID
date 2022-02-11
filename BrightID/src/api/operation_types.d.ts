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

type BaseOp = {
  apiUrl?: string;
  v: number;
  hash?: string;
  timestamp: number;
};

type AddAdminOp = BaseOp & {
  name: 'Add Admin';
  id: string;
  admin: string;
  group: string;
  sig?: string;
};

type AddGroupOp = BaseOp & {
  name: 'Add Group';
  group: string;
  id: string;
  url: string;
  type: string;
  sig?: string;
};

type AddMembershipOp = BaseOp & {
  name: 'Add Membership';
  id: string;
  group: string;
  sig?: string;
};

type ConnectOp = BaseOp & {
  name: 'Connect';
  id1: string;
  id2: string;
  level: string;
  sig1?: string;
  reportReason?: string;
  replacedWith?: string;
  requestProof?: string;
};

type DismissOp = BaseOp & {
  name: string;
  dismisser: string;
  dismissee: string;
  group: string;
  sig?: string;
};

type InviteOp = BaseOp & {
  name: 'Invite';
  inviter: string;
  invitee: string;
  group: string;
  data: string;
  sig?: string;
};

type LinkContextIdOp = BaseOp & {
  name: 'Link ContextId';
  context: string;
  contextId?: string;
  encrypted?: string;
  id?: string;
  sig?: string;
};

type RemoveGroupOp = BaseOp & {
  name: 'Remove Group';
  id: string;
  group: string;
  sig?: string;
};

type RemoveMembershipOp = BaseOp & {
  name: string;
  id: string;
  group: string;
  sig?: string;
};

type SocialRecoveryOp = BaseOp & {
  name: 'Social Recovery';
  id: string;
  signingKey: string;
  id1?: string;
  id2?: string;
  sig1?: string;
  sig2?: string;
};

type SpendSponsorshipOp = BaseOp & {
  name: 'Spend Sponsorship';
  app: string;
  appId: string;
};
