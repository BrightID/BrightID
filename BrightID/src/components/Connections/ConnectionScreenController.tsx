import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
import ConnectionTestButton from '@/utils/connectionTestButton';
import { getVerificationPatches } from '@/utils/verifications';
import {
  selectConnectionById,
  selectAllConnections,
  setConnectionVerifications,
} from '@/reducer/connectionsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import ConnectionScreen from './ConnectionScreen';
import stringSimilarity from '@/utils/stringSimilarity';
import {
  MAX_CONNECTIONS_DUPLICATE_SEARCH,
  POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE,
} from '@/utils/constants';

type ConnectionRoute = RouteProp<
  { Connection: { connectionId: string } },
  'Connection'
>;

type DetailedRecoveryConnection = RecoveryConnection & { conn?: Connection };

function ConnectionScreenController() {
  const navigation = useNavigation();
  const route = useRoute<ConnectionRoute>();
  const dispatch = useDispatch();
  const { connectionId } = route.params;
  const api = useContext(NodeApiContext);
  const connection = useSelector((state) =>
    selectConnectionById(state, connectionId),
  );
  const myConnections = useSelector(selectAllConnections);
  const myGroups = useSelector((state) => state.groups.groups);
  const me = useSelector((state) => state.user);
  const [mutualGroups, setMutualGroups] = useState<Array<Group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<Connection>>(
    [],
  );
  const [recoveryConnections, setRecoveryConnections] = useState<
    Array<DetailedRecoveryConnection>
  >([]);
  const [verificationsTexts, setVerificationsTexts] = useState<Array<string>>(
    [],
  );
  const [possibleDuplicates, setPossibleDuplicates] = useState<
    Array<Connection>
  >([]);
  const [connectedAt, setConnectedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionProfile, setConnectionProfile] = useState<
    ProfileInfo | undefined
  >(undefined);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        setLoading(true);
        console.log(`fetching connection info for ${connectionId}`);
        try {
          const profile: ProfileInfo = await api.getProfile(connectionId);
          setConnectionProfile(profile);
          console.log(`Updating verifications for ${profile.id}`);
          const texts = getVerificationPatches(profile.verifications).map(
            (patch) => patch.text,
          );
          setVerificationsTexts(texts);
          // TODO: This causes unnecessary rerender by replacing the verifications array in redux
          //  store, although contents are most likely identical
          dispatch(
            setConnectionVerifications({
              id: connectionId,
              verifications: profile.verifications,
            }),
          );
        } catch (e) {
          console.log(`Error getting profile for ${connectionId}: ${e}`);
        }
        setLoading(false);
      };
      if (connectionId !== undefined) {
        fetchData(connectionId);
      }
    }, [api, connectionId, dispatch]),
  );

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
      const recoveryConnections: Array<DetailedRecoveryConnection> =
        connectionProfile.recoveryConnections.map(
          (rc: DetailedRecoveryConnection) => {
            if (rc.id === me.id) {
              rc.conn = me;
            } else {
              rc.conn = myConnections.find((c) => rc.id === c.id);
            }
            return rc;
          },
        );
      setRecoveryConnections(recoveryConnections);
    }
  }, [connectionProfile, me, myConnections, myGroups]);

  // get possible duplicates
  useEffect(() => {
    console.log(`Searching possible duplicates for ${connection?.id}`);
    // Prevent high system load: Don't try to search duplicates if we have too many connections
    if (
      connection &&
      myConnections.length <= MAX_CONNECTIONS_DUPLICATE_SEARCH
    ) {
      setPossibleDuplicates(
        myConnections.filter(
          (conn) =>
            stringSimilarity(conn.name, connection.name) >=
              POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE &&
            conn.id !== connection.id,
        ),
      );
    } else {
      setPossibleDuplicates([]);
    }
  }, [connection, myConnections]);

  // Add fake user functionality in DEV mode
  useLayoutEffect(() => {
    if (__DEV__) {
      navigation.setOptions({
        headerRight: () => <ConnectionTestButton connectionId={connectionId} />,
      });
    }
  }, [navigation, connectionId]);

  if (!connection) {
    navigation.goBack();
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
      recoveryConnections={recoveryConnections}
      possibleDuplicates={possibleDuplicates}
    />
  );
}

export default ConnectionScreenController;
