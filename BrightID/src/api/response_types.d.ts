/**
 * Response Types
 */

type NodeApiRes =
  | AppRes
  | AppsRes
  | OperationRes
  | OperationStateRes
  | UserconnectionRes
  | UserInfoRes
  | UserProfileRes;

type AppRes = {
  data: AppInfo;
};

type AppsRes = {
  data: {
    apps: AppInfo[];
  };
};

type ErrRes = {
  code: number;
  errorMessage: string;
  errorNum: number;
};

type IpRes = {
  data: {
    ip: string;
  };
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
    verifications: Array<{
      app: boolean;
      name: string;
      block: number;
      timestamp: number;
    }>;
  };
};

type UserInfoRes = {
  data: {
    score: number;
    createdAt: number;
    groups: GroupInfo[];
    invites: InviteInfo[];
    connections: ConnectionInfo[];
    verifications: string[];
    isSponsored: boolean;
    trusted: string[];
    flaggers: {
      [id: string]: string;
    };
  };
};

type UserProfileRes = {
  data: {
    connectionsNum: number;
    groupsNum: number;
    mutualConnections: string[];
    mutualGroups: string[];
    connectedAt: number;
    createdAt: number;
    reports: Array<{ id: string; reportReason: string }>;
    verifications: Array<{ name: string }>;
  };
};

/**
 * Info Types
 */

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
};

type GroupInfo = {
  id: string;
  members: string[];
  type: string;
  founders: string[];
  admins: string[];
  isNew: boolean;
  url: string;
  timestamp: number;
  joined: number;
  score?: number;
};

type InviteInfo = {
  id: string;
  members: string[];
  type: string;
  founders: string[];
  admins: string[];
  isNew: boolean;
  url: string;
  timestamp: number;
  inviteId: string;
  invited: number;
  inviter: string;
  data: string;
  score?: number;
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
  score?: number;
};
