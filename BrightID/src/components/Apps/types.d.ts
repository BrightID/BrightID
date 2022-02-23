type Params = {
  baseUrl: string;
  context: string;
  contextId: string;
  callbackUrl: string;
};

type AppsRoute = RouteProp<{ Apps: Params }, 'Apps'>;
