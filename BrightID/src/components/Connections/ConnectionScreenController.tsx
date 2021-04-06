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
import {
  selectConnectionById,
  selectAllConnections,
} from '@/reducer/connectionsSlice';
import { selectNodeApi } from '@/reducer/settingsSlice';
import ConnectionScreen from './ConnectionScreen';

type ConnectionRoute = RouteProp<
  { Connection: { connectionId: string } },
  'Connection'
>;

function ConnectionScreenController() {
  const navigation = useNavigation();
  const route = useRoute<ConnectionRoute>();
  const { connectionId } = route.params;
  const api = useSelector(selectNodeApi);
  const connection = useSelector((state: State) =>
    selectConnectionById(state, connectionId),
  );
  const myConnections = useSelector(selectAllConnections);
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
    }, [connectionId, api, myConnections, myGroups]),
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

  const brightIdVerified = verifications.some((v) => v?.name === 'BrightID');

  const verifiedAppsCount = verifications.filter((v) => v.app).length;
  return (
    <ConnectionScreen
      connection={connection}
      brightIdVerified={brightIdVerified}
      verifiedAppsCount={verifiedAppsCount}
      loading={loading}
      connectedAt={connectedAt}
      mutualConnections={mutualConnections}
      mutualGroups={mutualGroups}
    />
  );
}

export default ConnectionScreenController;
