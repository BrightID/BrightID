import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SectionList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
import UnverifiedSticker from '@/components/Icons/UnverifiedSticker';
import GroupAvatar from '@/components/Icons/GroupAvatar';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { photoDirectory } from '@/utils/filesystem';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  ORANGE,
  WHITE,
  BLACK,
  DARKER_GREY,
  DARK_BLUE,
  LIGHT_GREY,
  DARK_GREEN,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { connection_levels } from '@/utils/constants';
import Chevron from '../Icons/Chevron';
import TrustLevelView from './TrustLevelView';

/**
 Connection details screen
 To make maximum use of the performance optimization from Flatlist/SectionList, the whole
 screen is rendered as SectionList. The Profile information (Photo, Name etc.) is rendered
 via ListHeaderComponent, the "Report" button on the bottom via ListFooterComponent.
* */
type Props = {
  connection: Connection;
  brightIdVerified: boolean;
  verifiedAppsCount: number;
  connectedAt: number;
  mutualGroups: Array<Group>;
  mutualConnections: Array<Connection>;
  loading: boolean;
};

interface Section {
  title: string;
  data: Array<Connection | Group>;
  key: string;
  numEntries: number;
}

function ConnectionScreen(props: Props) {
  const {
    connection,
    brightIdVerified,
    verifiedAppsCount,
    connectedAt,
    mutualGroups,
    mutualConnections,
    loading,
  } = props;
  const navigation = useNavigation();

  const [groupsCollapsed, setGroupsCollapsed] = useState(true);
  const [connectionsCollapsed, setConnectionsCollapsed] = useState(true);
  const { t } = useTranslation();

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
    const data: Section[] = [
      {
        title: t('connectionDetails.label.mutualConnections'),
        data: connectionsCollapsed ? [] : mutualConnections,
        key: 'connections',
        numEntries: mutualConnections.length,
      },
      {
        title: t('connectionDetails.label.mutualGroups'),
        data: groupsCollapsed ? [] : mutualGroups,
        key: 'groups',
        numEntries: mutualGroups.length,
      },
    ];
    return data;
  }, [
    connectionsCollapsed,
    groupsCollapsed,
    mutualConnections,
    mutualGroups,
    t,
  ]);

  const renderSticker = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={DARKER_GREY} animating />;
    } else {
      const plural = verifiedAppsCount > 1 ? 's' : '';
      return verifiedAppsCount > 0 ? (
        <Text style={styles.verifiedText}>
          Verified for {verifiedAppsCount} app{plural}
        </Text>
      ) : (
        <UnverifiedSticker width={100} height={19} />
      );
    }
  };

  const connectionHeader = (
    <>
      <View style={styles.profile}>
        <View style={styles.photoContainer}>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.navigate('FullScreenPhoto', {
                photo: connection.photo,
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
              accessibilityLabel={t('common.accessibilityLabel.userPhoto')}
            />
          </TouchableWithoutFeedback>
          <View style={styles.connectionInfo}>
            <View style={styles.connectionTimestamp}>
              <Text style={styles.connectionTimestampText}>
                {loading
                  ? t('connectionDetails.tags.loading')
                  : t('connectionDetails.tags.connectedAt', {
                      date: `${moment(
                        parseInt(String(connectedAt), 10),
                      ).fromNow()}`,
                    })}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.nameContainer}>
          <View style={styles.nameLabel}>
            <Text style={styles.name} numberOfLines={1}>
              {connection.name}
            </Text>
            {brightIdVerified && (
              <View style={styles.badge}>
                <VerifiedBadge width={16} height={16} />
              </View>
            )}
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.verificationSticker}>{renderSticker()}</View>
        </View>
      </View>

      <View style={styles.trustLevelContainer}>
        <TrustLevelView level={connection.level} connectionId={connection.id} />
      </View>
    </>
  );

  const connectionFooter =
    connection.level !== connection_levels.REPORTED ? (
      <TouchableOpacity
        testID="ReportBtn"
        style={styles.reportBtn}
        onPress={() => {
          navigation.navigate('ReportReason', {
            connectionId: connection.id,
            reporting: true,
          });
        }}
      >
        <Text style={styles.reportBtnText}>
          {t('connectionDetails.button.report')}
        </Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        testID="UnReportBtn"
        style={styles.unReportBtn}
        onPress={() => {
          navigation.navigate('ReportReason', {
            connectionId: connection.id,
            reporting: false,
          });
        }}
      >
        <Text style={styles.unReportBtnText}>
          {t('connectionDetails.button.undoReport')}
        </Text>
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
      return (
        <GroupAvatar
          width={DEVICE_LARGE ? 40 : 36}
          height={DEVICE_LARGE ? 40 : 36}
        />
      );
    }
  };

  const renderSectionHeader = ({ section }: { section: Section }) => {
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
            <Chevron
              width={DEVICE_LARGE ? 18 : 16}
              height={DEVICE_LARGE ? 18 : 16}
              color={section.numEntries ? DARK_BLUE : LIGHT_GREY}
              direction={collapsed ? 'down' : 'up'}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <View testID="ConnectionScreen" style={styles.container}>
        <SectionList
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
          sections={getSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          ListHeaderComponent={connectionHeader}
          ListFooterComponent={connectionFooter}
          // @ts-ignore: mistyped
          ListFooterComponentStyle={styles.connectionFooter}
          ItemSeparatorComponent={ItemSeparator}
        />
      </View>
    </>
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

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    marginBottom: 5,
    paddingLeft: '8%',
    paddingRight: '8%',
    paddingTop: DEVICE_LARGE ? 20 : 18,
    overflow: 'hidden',
    zIndex: 10,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  photoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    minWidth: '45%',
  },
  profilePhoto: {
    borderRadius: DEVICE_LARGE ? 45 : 39,
    width: DEVICE_LARGE ? 90 : 78,
    height: DEVICE_LARGE ? 90 : 78,
    marginLeft: DEVICE_LARGE ? -5 : -4,
  },
  nameContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: -3,
    flexGrow: 1,
    maxWidth: '60%',
  },
  nameLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[17],
    color: BLACK,
  },
  badge: {
    marginLeft: DEVICE_LARGE ? 7 : 5,
  },
  verifiedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: ORANGE,
  },
  profileDivider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
    width: '98%',
  },
  verificationSticker: {
    marginTop: 8,
  },
  connectionInfo: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionTimestamp: {
    // width: '100%',
  },
  connectionTimestampText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[10],
    color: ORANGE,
  },
  trustLevelContainer: {
    marginTop: DEVICE_LARGE ? 16 : 15,
    marginBottom: 10,
  },
  reportBtn: {
    width: '90%',
    borderRadius: 100,
    borderColor: ORANGE,
    borderWidth: 1,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DEVICE_LARGE ? 13 : 12,
    paddingBottom: DEVICE_LARGE ? 13 : 12,
  },
  reportBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: ORANGE,
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
  unReportBtn: {
    width: '75%',
    borderRadius: 100,
    borderColor: DARK_GREEN,
    borderWidth: 1,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DEVICE_LARGE ? 13 : 12,
    paddingBottom: DEVICE_LARGE ? 13 : 12,
  },
  unReportBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: DARK_GREEN,
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
  header: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLabel: {
    // flex: 2,
  },
  headerLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerCount: {
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContentText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[17],
    color: ORANGE,
  },
  collapseButton: {
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
  chevron: {
    margin: DEVICE_LARGE ? 7 : 6,
  },
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: BLACK,
  },
  connectionFooter: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConnectionScreen;
