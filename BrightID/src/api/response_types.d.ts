/**
 * Response Types
 */

type NodeApiRes =
  | AppRes
  | AppsRes
  | OperationRes
  | OperationStateRes
  | UserConnectionRes
  | UserInfoRes
  | UserProfileRes
  | UserVerificationRes;

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

type OperationRes = {
  data: {
    hash: string;
  };
};

type OperationStateRes = {
  data: {
    state: string;
    result: string;
  };
};

type UserConnectionRes = {
  data: {
    connections: Array<{ id: string; level: string; timestamp: number }>;
  };
};

type UserVerificationRes = {
  data: {
    verifications: Array<Verification>;
  };
};

type UserInfoRes = {
  data: UserInfo;
};

type UserProfileRes = {
  data: UserProfile;
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
  verification: string;
  verificationUrl: string;
  logo?: string;
  url?: string;
  assignedSponsorships?: number;
  unusedSponsorships?: number;
  testing: boolean;
  usingBlindSig: boolean;
  nodeUrl?: string;
};

type GroupInfo = {
  id: string;
  members: string[];
  type: string;
  admins: string[];
  url: string;
  timestamp: number;
  joined: number;
};

type InviteInfo = {
  id: string;
  members: string[];
  type: string;
  admins: string[];
  url: string;
  timestamp: number;
  inviteId: string;
  invited: number;
  inviter: string;
  data: string;
};

type ConnectionInfo = {
  id: string;
  signingKey: string;
  level: ConnectionLevel;
  incomingLevel?: ConnectionLevel;
  verifications: string[];
  hasPrimaryGroup: boolean;
  trusted: string[];
  flaggers: {
    [id: string]: string;
  };
  createdAt: number;
  status?: string;
};

type UserInfo = {
  createdAt: number;
  groups: GroupInfo[];
  invites: InviteInfo[];
  inboundConnections: ConnectionInfo[];
  outboundConnections: ConnectionInfo[];
  verifications: string[];
  isSponsored: boolean;
  trusted: string[];
  flaggers: {
    [id: string]: string;
  };
};

type UserProfile = {
  connectionsNum: number;
  groupsNum: number;
  mutualConnections: string[];
  mutualGroups: string[];
  connectedAt: number;
  createdAt: number;
  reports: Array<{ id: string; reportReason: string }>;
  verifications: Array<{ name: string }>;
};
