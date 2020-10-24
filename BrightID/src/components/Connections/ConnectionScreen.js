// @flow

import React, { useCallback, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { useActionSheet } from '@expo/react-native-action-sheet';
import verificationSticker from '@/static/verification-sticker.svg';
import { useFocusEffect } from '@react-navigation/native';
import api from '@/api/brightId';
import moment from 'moment';
import { photoDirectory } from '../../utils/filesystem';
import { DEVICE_LARGE } from '../../utils/constants';
import { handleFlagging } from './models/flagConnection';
import { fetchConnectionInfo } from '../../utils/fetchConnectionInfo';
import MutualItems from './MutualItems';
import TrustLevelView from './TrustLevelView';
import { setConnectionLevel } from '../../actions/connections';

type ConnectionScreenProps = {
  route: any,
  navigation: any,
};

function ConnectionScreen(props: ConnectionScreenProps) {
  const { route, navigation } = props;
  const { connectionId } = route.params;
  const { showActionSheetWithOptions } = useActionSheet();
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.user.id);
  const connection: connection = useSelector((state: State) =>
    state.connections.connections.find((conn) => conn.id === connectionId),
  );
  const myConnections = useSelector((state) => state.connections.connections);
  const myGroups = useSelector((state) => state.groups.groups);
  const [mutualGroups, setMutualGroups] = useState<Array<group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<connection>>(
    [],
  );
  const [verifications, setVerifications] = useState<Array<string>>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        console.log(`fetching connection info for ${connectionId}`);
        const connectionData = await fetchConnectionInfo({
          brightId: connectionId,
          myConnections,
          myGroups,
        });
        setMutualGroups(connectionData.mutualGroups);
        setMutualConnections(connectionData.mutualConnections);
        setVerifications(connectionData.verifications);
      };
      if (connection) {
        fetchData(connection.id);
      } else {
        setMutualGroups([]);
        setMutualConnections([]);
        setVerifications([]);
      }
    }, [connection, myConnections, myGroups]),
  );

  if (!connection) {
    // connection not there anymore.
    return <Text>connection vanished.</Text>;
  }

  const imageSource = {
    uri: `file://${photoDirectory()}/${connection.photo.filename}`,
  };

  const brightIdVerified = verifications.includes('BrightID');

  const handleTrustLevelChange = async (level: ConnectionLevel) => {
    console.log(`Setting trust level '${level}' for ${connection.name}`);
    await api.addConnection(myId, connection.id, level, undefined, Date.now());
    dispatch(setConnectionLevel(connection.id, level));
  };

  let flaggingOptions = [
    'Flag as Duplicate',
    'Flag as Fake',
    'Flag as Deceased',
    'Join All Groups',
    'Connect to other fake connections',
    'cancel',
  ];
  if (!__DEV__) {
    // remove debug functionality
    flaggingOptions.splice(3, 2);
  }

  const handleFlagBtnClick = () => {
    showActionSheetWithOptions(
      {
        options: flaggingOptions,
        cancelButtonIndex: flaggingOptions.length - 1,
        title: 'What do you want to do?',
        message: `Flagging ${connection.name} will negatively effect their BrightID score, and this flag might be shown to other users.`,
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          fontSize: DEVICE_LARGE ? 20 : 17,
        },
        messageTextStyle: {
          fontSize: DEVICE_LARGE ? 15 : 12,
        },
      },
      handleFlagging({
        id: connection.id,
        name: connection.name,
        dispatch,
        secretKey: connection.secretKey,
        callback: () => navigation.goBack(),
      }),
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <View style={styles.photoContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.navigate('FullScreenPhoto', {
                photo: connection.photo,
                base64: true,
              });
            }}
          >
            <Image
              source={imageSource}
              style={styles.photo}
              resizeMode="cover"
              onError={(e) => {
                console.log(e);
              }}
              accessible={true}
              accessibilityLabel="user photo"
            />
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{connection.name}</Text>
          {brightIdVerified && (
            <SvgXml
              style={styles.verificationSticker}
              width="16"
              height="16"
              xml={verificationSticker}
            />
          )}
          <View style={styles.profileDivider} />
          <View style={styles.badges}>
            {brightIdVerified ? (
              <Text style={styles.verified}>verified</Text>
            ) : (
              <Text style={styles.unverified}>unverified</Text>
            )}
          </View>
        </View>
      </View>
      <View style={styles.connectionInfo}>
        <View style={styles.connectionTimestamp}>
          <Text style={styles.connectionTimestampText}>
            {`Connected ${moment(
              parseInt(connection.createdAt, 10),
            ).fromNow()}`}
          </Text>
        </View>
      </View>
      <View style={styles.mutualInfoContainer}>
        <TrustLevelView
          level={connection.level}
          handleChange={handleTrustLevelChange}
        />
      </View>
      <ScrollView>
        <View style={styles.mutualInfoContainer}>
          <MutualItems
            mutualItems={mutualGroups}
            header="Mutual Groups"
            pluralItemName="groups"
            singularItemName="group"
          />
        </View>
        <View style={styles.mutualInfoContainer}>
          <MutualItems
            mutualItems={mutualConnections}
            header="Mutual Connections"
            pluralItemName="connections"
            singularItemName="connection"
          />
        </View>
        <TouchableOpacity
          testID="FlagBtn"
          style={styles.flagBtn}
          onPress={handleFlagBtnClick}
        >
          <Text style={styles.flagBtnText}>Flag this person</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const ORANGE = '#ED7A5D';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: '8%',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  photoContainer: {
    margin: 10,
  },
  photo: {
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  nameContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 20,
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 17,
    color: '#000',
  },
  profileDivider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
    width: '118%',
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 8 : 5,
  },
  badges: {},
  verified: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: ORANGE,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
    marginTop: 6,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 23,
    paddingRight: 23,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  unverified: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#707070',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 10,
    marginTop: 6,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  connectionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionTimestamp: {
    width: '100%',
  },
  connectionTimestampText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 10,
    color: ORANGE,
  },
  mutualInfoContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  flagBtn: {
    width: '100%',
    borderRadius: 100,
    borderColor: ORANGE,
    borderWidth: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  flagBtnText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: ORANGE,
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
});

export default ConnectionScreen;
