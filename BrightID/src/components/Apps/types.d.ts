type Params = {
  baseUrl?: string;
  appId: string;
  appUserId: string;
};

type AppsRoute = RouteProp<{ Apps: Params }, 'Apps'>;
