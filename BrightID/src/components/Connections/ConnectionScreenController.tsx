import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ConnectionTestButton from '@/utils/connectionTestButton';
import api from '@/api/brightId';
import ConnectionScreen from './ConnectionScreen';
import { connectionByIdSelector } from '../../utils/connectionsSelector';

type ConnectionScreenProps = {
  route: any;
  navigation: any;
};

function ConnectionScreenController(props: ConnectionScreenProps) {
  const { route, navigation } = props;
  const { connectionId } = route.params;
  const connection: connection = useSelector((state: State) =>
    connectionByIdSelector(state, connectionId),
  );
  const myConnections = useSelector((state: State) => state.connections.connections);
  const myGroups = useSelector((state: State) => state.groups.groups);
  const [connectionsNum, setConnectionsNum] = useState(0);
  const [groupsNum, setGroupsNum] = useState(0);
  const [mutualGroups, setMutualGroups] = useState<Array<group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<connection>>(
    [],
  );
  const [verifications, setVerifications] = useState<Array<any>>([]);
  const [createdAt, setCreatedAt] = useState(0);
  const [connectedAt, setConnectedAt] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        setLoading(true);
        console.log(`fetching connection info for ${connectionId}`);
        const profile = await api.getUserProfile(connectionId);
        setConnectionsNum(profile.connectionsNum);
        setGroupsNum(profile.groupsNum);
        setVerifications(profile.verifications);
        setCreatedAt(profile.createdAt);
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
    }, [connection, myConnections, myGroups, connectionId]),
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
      navigation={navigation}
      connection={connection}
      brightIdVerified={brightIdVerified}
      loading={loading}
      createdAt={createdAt}
      connectedAt={connectedAt}
      connectionsNum={connectionsNum}
      groupsNum={groupsNum}
      mutualConnections={mutualConnections}
      mutualGroups={mutualGroups}
    />
  );
}

export default ConnectionScreenController;