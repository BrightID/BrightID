// @flow

import React, { useMemo, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SectionList,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import moment from 'moment';
import default_group from '@/static/default_group.svg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { photoDirectory } from '@/utils/filesystem';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import TrustLevelView from './TrustLevelView';

/**
 Connection details screen
 To make maximum use of the performance optimization from Flatlist/SectionList, the whole
 screen is rendered as SectionList. The Profile information (Photo, Name etc.) is rendered
 via ListHeaderComponent, the "Flag" button on the bottom via ListFooterComponent.
* */

type Props = {
  navigation: any,
  connection: connection,
  brightIdVerified: boolean,
  mutualGroups: Array<group>,
  mutualConnections: Array<connection>,
};

function ConnectionScreen(props: Props) {
  const {
    navigation,
    connection,
    brightIdVerified,
    mutualGroups,
    mutualConnections,
  } = props;

  const [groupsCollapsed, setGroupsCollapsed] = useState(true);
  const [connectionsCollapsed, setConnectionsCollapsed] = useState(true);

  const toggleSection = (key) => {
    switch (key) {
      case 'connections':
        setConnectionsCollapsed(!connectionsCollapsed);
        break;
      case 'groups':
        setGroupsCollapsed(!groupsCollapsed);
        break;
    }
  };

  const imageSource = {
    uri: `file://${photoDirectory()}/${connection?.photo?.filename}`,
  };

  const getSections = useMemo(() => {
    const data = [
      {
        title: 'Mutual Connections',
        data: connectionsCollapsed ? [] : mutualConnections,
        key: 'connections',
        numEntries: mutualConnections.length,
      },
      {
        title: 'Mutual Groups',
        data: groupsCollapsed ? [] : mutualGroups,
        key: 'groups',
        numEntries: mutualGroups.length,
      },
    ];
    return data;
  }, [connectionsCollapsed, groupsCollapsed, mutualConnections, mutualGroups]);

  const connectionHeader = (
    <>
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
              style={styles.profilePhoto}
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
          <View style={styles.nameLabel}>
            <Text style={styles.name}>{connection.name}</Text>
            {brightIdVerified && (
              <SvgXml
                style={styles.verificationSticker}
                width="16"
                height="16"
                xml={verificationSticker}
              />
            )}
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.badges}>
            {brightIdVerified ? (
              <Text style={[styles.badge, styles.verified]}>verified</Text>
            ) : (
              <Text style={[styles.badge, styles.unverified]}>unverified</Text>
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
      <View style={styles.trustLevelContainer}>
        <TrustLevelView level={connection.level} connectionId={connection.id} />
      </View>
    </>
  );

  const connectionFooter = (
    <TouchableOpacity
      testID="ReportBtn"
      style={styles.flagBtn}
      onPress={() => {
        navigation.navigate('ReportReason', {
          connectionId: connection.id,
        });
      }}
    >
      <Text style={styles.flagBtnText}>Report this person</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item, index, section }) => {
    const testID = `${section.key}-${index}`;
    console.log(
      `Rendering Section ${section.key} item ${index} (${item.name}) - testID ${testID}`,
    );
    return (
      <View testID={testID} style={styles.itemContainer}>
        <View style={styles.itemPhoto}>{renderPhoto(item)}</View>
        <View style={styles.itemLabel}>
          <Text style={styles.itemLabelText}>{item.name}</Text>
        </View>
      </View>
    );
  };

  const renderPhoto = (item) => {
    if (item?.photo?.filename) {
      return (
        <Image
          source={{ uri: `file://${photoDirectory()}/${item.photo.filename}` }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="photo"
        />
      );
    } else {
      return <SvgXml xml={default_group} width={40} height={40} />;
    }
  };

  const renderSectionHeader = ({ section }) => {
    let collapsed;
    switch (section.key) {
      case 'connections':
        collapsed = connectionsCollapsed;
        break;
      case 'groups':
        collapsed = groupsCollapsed;
        break;
    }
    return (
      <View style={styles.header}>
        <View style={styles.headerLabel}>
          <Text style={styles.headerLabelText}>{section.title}</Text>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerCount}>
            <Text
              testID={`${section.key}-count`}
              style={styles.headerContentText}
            >
              {section.numEntries}
            </Text>
          </View>
          <TouchableOpacity
            testID={`${section.key}-toggleBtn`}
            style={styles.collapseButton}
            onPress={() => toggleSection(section.key)}
            disabled={section.numEntries < 1}
          >
            <MaterialCommunityIcons
              style={styles.chevron}
              size={50}
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              color={section.numEntries ? '#0064AE' : '#C4C4C4'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View testID="ConnectionScreen" style={styles.container}>
      <SectionList
        sections={getSections}
        keyExtractor={(item, index) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={connectionHeader}
        ListFooterComponent={connectionFooter}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
}

const ItemSeparator = () => {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: ORANGE,
      }}
    />
  );
};

const ORANGE = '#ED7A5D';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: '8%',
    paddingRight: '8%',
    paddingTop: 10,
    marginBottom: 5,
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
  profilePhoto: {
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  nameContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 20,
  },
  nameLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#000',
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 8 : 5,
  },
  profileDivider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
    width: '118%',
  },
  badges: {},
  badge: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 6,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 23,
    paddingRight: 23,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  verified: {
    color: ORANGE,
    borderColor: ORANGE,
  },
  unverified: {
    color: '#707070',
    borderColor: '#707070',
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
    fontWeight: '500',
    fontSize: 10,
    color: ORANGE,
  },
  trustLevelContainer: {
    marginTop: 15,
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
    marginTop: 15,
  },
  flagBtnText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: ORANGE,
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    flex: 2,
  },
  headerLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#000',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerCount: {},
  headerContentText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: ORANGE,
  },
  collapseButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
  chevron: {},
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPhoto: {
    margin: 10,
  },
  photo: {
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  itemLabel: {},
  itemLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 15,
    color: '#000',
  },
});

export default ConnectionScreen;
