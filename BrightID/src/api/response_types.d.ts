/**
 * Response Types
 */
type OperationState = {
  state: typeof operation_states[keyof typeof operation_states];
};

type NodeApiRes =
  | AppRes
  | AppsRes
  | BlindSigRes
  | OperationPostRes
  | OperationRes
  | PublicRes
  | StateRes
  | UserConnectionsRes
  | UserProfileRes
  | UserVerificationsRes
  | UserInvitesRes
  | UserMembershipsRes
  | GroupRes
  | SponsorshipRes;

type AppRes = {
  data: AppInfo;
};

type AppsRes = {
  data: {
    apps: AppInfo[];
  };
};

type StateRes = {
  data: StateInfo;
};

type PublicRes = {
  data: {
    public: string;
  };
};

type BlindSigRes = {
  data: {
    response: string;
  };
};

type ErrRes = {
  code: number;
  errorMessage: string;
  errorNum: number;
};

type OperationPostRes = {
  data: {
    hash: string;
  };
};

type OperationRes = {
  data: OperationInfo;
};

type UserConnectionsRes = {
  data: {
    connections: ConnectionInfo[];
  };
};

type UserMembershipsRes = {
  data: {
    memberships: MembershipInfo[];
  };
};

type UserInvitesRes = {
  data: {
    invites: InviteInfo[];
  };
};

type UserVerificationsRes = {
  data: {
    verifications: Verification[];
  };
};

type UserProfileRes = {
  data: ProfileInfo;
};

type GroupRes = {
  data: GroupInfo;
};

type SponsorshipRes = {
  data: SponsorshipInfo;
};

/**
 * Info Types
 */

type StateInfo = {
  lastProcessedBlock: number;
  verificationsBlock: number;
  wISchnorrPublic?: {
    p: string;
    q: string;
    g: string;
    y: string;
  };
};

type AppInfo = {
  id: string;
  name: string;
  context: string;
  verifications: Array<string>;
  verificationUrl: string;
  logo?: string;
  url?: string;
  assignedSponsorships?: number;
  unusedSponsorships?: number;
  testing: boolean;
  idsAsHex: boolean;
  usingBlindSig: boolean;
  verificationExpirationLength?: number;
  sponsorPublicKey?: string;
  nodeUrl?: string;
};

type OperationInfo = OperationState & {
  result: string;
};

type ConnectionInfo = {
  incomingLevel: ConnectionLevel;
  id: string;
  level: ConnectionLevel;
  timestamp: number;
  reportReason?: string;
};

type MembershipInfo = {
  id: string;
  timestamp: number;
};

type GroupInfo = {
  id: string;
  members: string[];
  invites: InviteInfo[];
  admins: string[];
  type: string;
  url: string;
  timestamp: number;
  seed?: boolean;
  region?: string;
  info?: string;
};

type InviteInfo = {
  id: string;
  group: string;
  inviter: string;
  invitee: number;
  timestamp: number;
  data: string;
};

type Report = { id: string; reportReason: string };

type ProfileInfo = {
  id: string;
  connectionsNum: number;
  groupsNum: number;
  mutualConnections?: string[];
  mutualGroups?: string[];
  recoveryConnections: RecoveryConnection[];
  connectedAt: number;
  createdAt: number;
  reports: Array<Report>;
  verifications: Verification[];
  signingKeys: string[];
  sponsored: boolean;
};

type RecoveryConnection = {
  id: string;
  isActive: boolean;
  activeBefore: number;
  activeAfter: number;
};

type SponsorshipInfo = {
  app: string;
  timestamp: number;
  appHasAuthorized: boolean;
  spendRequested: boolean;
};

type GetRecoveryRes = {
  data: string;
};
