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
  | SetSigningKeyOp;

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
  id1: string;
  id2: string;
  id3: string;
  inviteData2: string;
  inviteData3: string;
  url: string;
  type: string;
  timestamp: number;
  v: number;
  sig1?: string;
  hash?: string;
};

type AddMembershipOp = {
  name: string;
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
  api: NodeApi;
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

type SetSigningKeyOp = {
  name: 'Set Signing Key';
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
