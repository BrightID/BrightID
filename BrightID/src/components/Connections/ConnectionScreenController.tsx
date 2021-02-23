import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useSelector } from '@/store';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import ConnectionTestButton from '@/utils/connectionTestButton';
import api from '@/api/brightId';
import { connectionByIdSelector } from '@/utils/connectionsSelector';
import ConnectionScreen from './ConnectionScreen';

type ConnectionRoute = RouteProp<
  { Connection: { connectionId: string } },
  'Connection'
>;

function ConnectionScreenController() {
  const navigation = useNavigation();
  const route = useRoute<ConnectionRoute>();
  const { connectionId } = route.params;
  const connection = useSelector((state: State) =>
    connectionByIdSelector(state, connectionId),
  );
  const myConnections = useSelector(
    (state: State) => state.connections.connections,
  );
  const myGroups = useSelector((state: State) => state.groups.groups);
  const [mutualGroups, setMutualGroups] = useState<Array<Group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<Connection>>(
    [],
  );
  const [verifications, setVerifications] = useState<Array<any>>([]);
  const [connectedAt, setConnectedAt] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        setLoading(true);
        console.log(`fetching connection info for ${connectionId}`);
        const profile = await api.getUserProfile(connectionId);
        setVerifications(profile.verifications);
        setConnectedAt(profile.connectedAt);
        setMutualConnections(
          myConnections.filter((conn) => {
            return profile.mutualConnections.includes(conn.id);
          }),
        );
        setMutualGroups(
          myGroups.filter((g) => {
            return profile.mutualGroups.includes(g.id);
          }),
        );
        setLoading(false);
      };
      if (connectionId !== undefined) {
        fetchData(connectionId);
      }
      // REMOVED CONNECTION FROM DEPENDENCY ARRAY
    }, [myConnections, myGroups, connectionId]),
  );

  useEffect(() => {
    if (!connection) {
      // connection not there anymore.
      navigation.goBack();
    }
  }, [navigation, connection]);

  // Add fake user functionality in DEV mode
  useLayoutEffect(() => {
    if (__DEV__) {
      navigation.setOptions({
        headerRight: () => <ConnectionTestButton connectionId={connectionId} />,
      });
    }
  }, [navigation, connectionId]);

  if (!connection) {
    return null;
  }

  const brightIdVerified = verifications
    .map((v) => v.name)
    .includes('BrightID');

  return (
    <ConnectionScreen
      connection={connection}
      brightIdVerified={brightIdVerified}
      loading={loading}
      connectedAt={connectedAt}
      mutualConnections={mutualConnections}
      mutualGroups={mutualGroups}
    />
  );
}

export default ConnectionScreenController;
