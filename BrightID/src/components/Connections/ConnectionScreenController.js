// @flow

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import ConnectionScreen from './ConnectionScreen';
import ConnectionTestButton from '@/utils/connectionTestButton';
import api from '@/api/brightId';

type ConnectionScreenProps = {
  route: any,
  navigation: any,
};

function ConnectionScreenController(props: ConnectionScreenProps) {
  const { route, navigation } = props;
  const { connectionId } = route.params;
  const connection: connection = useSelector((state: State) =>
    state.connections.connections.find((conn) => conn.id === connectionId),
  );
  const myConnections = useSelector((state) => state.connections.connections);
  const myGroups = useSelector((state) => state.groups.groups);
  const [connectionsNum, setConnectionsNum] = useState(0);
  const [groupsNum, setGroupsNum] = useState(0);
  const [mutualGroups, setMutualGroups] = useState<Array<group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<connection>>([]);
  const [verified, setVerified] = useState(false);
  const [createdAt, setCreatedAt] = useState(0);
  const [connectedAt, setConnectedAt] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        setLoading(true);
        console.log(`fetching connection info for ${connectionId}`);
        const profile = await api.getUserProfile(connectionId);
        console.log(profile, 22);
        setConnectionsNum(profile.connectionsNum);
        setGroupsNum(profile.groupsNum);
        setVerified(profile.verified);
        setCreatedAt(profile.createdAt);
        setConnectedAt(profile.connectedAt);
        profile.mutualConnections = myConnections.filter(function (conn) {
          return profile.mutualConnections.includes(conn.id);
        });
        setMutualConnections(profile.mutualConnections);
        profile.mutualGroups = myGroups.filter(function (group) {
          return profile.mutualGroups.includes(group.id);
        });
        setMutualGroups(profile.mutualGroups);
        setLoading(false);
      };
      fetchData(connectionId);
    }, [connection, myConnections, myGroups]),
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

  return (
    <ConnectionScreen
      navigation={navigation}
      connection={connection}
      verified={verified}
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
