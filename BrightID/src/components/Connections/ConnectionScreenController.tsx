import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useDispatch, useSelector } from '@/store';
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
  setConnectionVerifications,
} from '@/reducer/connectionsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import { selectAllApps } from '@/reducer/appsSlice';
import ConnectionScreen from './ConnectionScreen';

type ConnectionRoute = RouteProp<
  { Connection: { connectionId: string } },
  'Connection'
>;

function ConnectionScreenController() {
  const navigation = useNavigation();
  const route = useRoute<ConnectionRoute>();
  const dispatch = useDispatch();
  const { connectionId } = route.params;
  const api = useContext(NodeApiContext);
  const apps = useSelector(selectAllApps);
  const connection = useSelector((state: State) =>
    selectConnectionById(state, connectionId),
  );
  const myConnections = useSelector(selectAllConnections);
  const myGroups = useSelector((state: State) => state.groups.groups);
  const [mutualGroups, setMutualGroups] = useState<Array<Group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<Connection>>(
    [],
  );
  const [verificationsTexts, setVerificationsTexts] = useState<Array<string>>([]);
  const [connectedAt, setConnectedAt] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connectionProfile, setConnectionProfile] = useState<
    ProfileInfo | undefined
  >(undefined);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        setLoading(true);
        console.log(`fetching connection info for ${connectionId}`);
        const profile: ProfileInfo = await api.getProfile(connectionId);
        setConnectionProfile(profile);
        setLoading(false);
      };
      if (connectionId !== undefined) {
        fetchData(connectionId);
      }
    }, [api, connectionId]),
  );

  // Update connection verifications
  useEffect(() => {
    if (connectionProfile) {
      console.log(`Updating verifications for ${connectionProfile.id}`);
      const texts = [];
      const verifications = connectionProfile.verifications;
      let v = verifications.find(v => v.name === 'SeedConnected');
      if (v && v.rank > 0) {
        texts.push(`Joined Meets`);
      }
      v = verifications.find(v => v.name === 'Bitu');
      if (v && v.score > 0) {
        texts.push(`Bitu ${v.score}`);
      }
      v = verifications.find(v => v.name === 'Seed');
      if (v) {
        texts.push('Seed');
      }
      setVerificationsTexts(texts);
      dispatch(
        setConnectionVerifications({
          id: connectionProfile.id,
          verifications,
        }),
      );
    }
  }, [connectionProfile, dispatch]);

  // Update mutual groups etc. in local state
  useEffect(() => {
    if (connectionProfile) {
      console.log(`Updating mutual groups etc. for ${connectionProfile.id}`);
      setConnectedAt(connectionProfile.connectedAt);
      setMutualConnections(
        myConnections.filter((conn) => {
          return connectionProfile.mutualConnections.includes(conn.id);
        }),
      );
      setMutualGroups(
        myGroups.filter((g) => {
          return connectionProfile.mutualGroups.includes(g.id);
        }),
      );
    }
  }, [connectionProfile, myConnections, myGroups]);

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

  return (
    <ConnectionScreen
      connection={connection}
      verificationsTexts={verificationsTexts}
      loading={loading}
      connectedAt={connectedAt}
      mutualConnections={mutualConnections}
      mutualGroups={mutualGroups}
    />
  );
}

export default ConnectionScreenController;
