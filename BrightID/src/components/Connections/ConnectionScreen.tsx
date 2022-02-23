import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  SectionList,
  Linking,
  FlatList,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { SvgXml } from 'react-native-svg';
import Clipboard from '@react-native-community/clipboard';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import UnverifiedSticker from '@/components/Icons/UnverifiedSticker';
import GroupAvatar from '@/components/Icons/GroupAvatar';
import { photoDirectory } from '@/utils/filesystem';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  ORANGE,
  BLUE,
  WHITE,
  BLACK,
  DARKER_GREY,
  DARK_BLUE,
  LIGHT_GREY,
  DARK_GREEN,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import {
  connection_levels,
  POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE,
} from '@/utils/constants';
import Chevron from '../Icons/Chevron';
import TrustLevelView from './TrustLevelView';
import { useSelector } from '@/store';
import stringSimilarity from '@/utils/stringSimilarity';
import {
  SocialMediaShareActionType,
  SocialMediaType,
} from '@/components/EditProfile/socialMediaVariations';
import { selectAllSocialMediaVariationsByType } from '@/reducer/socialMediaVariationSlice';

/**
 Connection details screen
 To make maximum use of the performance optimization from Flatlist/SectionList, the whole
 screen is rendered as SectionList. The Profile information (Photo, Name etc.) is rendered
 via ListHeaderComponent, the "Report" button on the bottom via ListFooterComponent.
* */
type Props = {
  connection: Connection;
  verificationsTexts: Array<string>;
  connectedAt: number;
  mutualGroups: Array<Group>;
  mutualConnections: Array<Connection>;
  recoveryConnections: Array<RecoveryConnection>;
  loading: boolean;
};

type SocialMediaOnConnectionPage = {
  id: SocialMediaId;
  icon: any;
  shareActionType: SocialMediaShareActionType;
  shareActionData: string;
};

interface Section {
  title: string;
  data: Array<Connection | Group | SocialMediaOnConnectionPage[]>;
  key: ConnectionScreenSectionKeys;
  numEntries: number;
}

enum ConnectionScreenSectionKeys {
  CONNECTIONS = 'connections',
  GROUPS = 'groups',
  RECOVERY_CONNECTIONS = 'recoveryConnections',
  DUPLICATES = 'duplicates',
  SOCIAL_MEDIA = 'socialMedia',
}

const isPhoneNumber = (profile: string): boolean => {
  const c = profile[0];
  return c === '+' || (c >= '0' && c <= '9');
};

function ConnectionScreen(props: Props) {
  const {
    connection,
    verificationsTexts,
    connectedAt,
    mutualGroups,
    mutualConnections,
    recoveryConnections,
    loading,
  } = props;
  const navigation = useNavigation();
  const myConnections = useSelector(selectAllConnections);

  const selectSocialMediaVariations = useMemo(
    selectAllSocialMediaVariationsByType,
    [],
  );
  const socialMediaVariations = useSelector((state) =>
    selectSocialMediaVariations(state, SocialMediaType.SOCIAL_PROFILE),
  );

  const [groupsCollapsed, setGroupsCollapsed] = useState(true);
  const [connectionsCollapsed, setConnectionsCollapsed] = useState(true);
  const [recoveryConnectionsCollapsed, setRecoveryConnectionsCollapsed] =
    useState(true);
  const [possibleDuplicatesCollapsed, setPossibleDuplicatesCollapsed] =
    useState(true);
  const [socialMediaCollapsed, setSocialMediaCollapsed] = useState(true);
  const [possibleDuplicates, setPossibleDuplicates] = useState([]);
  const [connectionSocialMedia, setConnectionSocialMedia] = useState<
    SocialMediaOnConnectionPage[]
  >([]);

  useEffect(() => {
    setPossibleDuplicates(
      myConnections.filter(
        (conn) =>
          stringSimilarity(conn.name, connection.name) >=
            POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE &&
          conn.id !== connection.id,
      ),
    );
  }, [connection.id, connection.name, myConnections]);

  useEffect(() => {
    const socialMediaOnConnectionPage: SocialMediaOnConnectionPage[] = [];
    for (let i = 0; i < socialMediaVariations.length; i++) {
      const element = socialMediaVariations[i];
      const profile = connection.socialMedia?.find(
        (s) => s.id === element.id,
      )?.profile;
      if (profile) {
        let { shareActionType } = element;
        if (
          shareActionType ===
          SocialMediaShareActionType.COPY_IF_PHONE_LINK_IF_USERNAME
        ) {
          if (isPhoneNumber(profile)) {
            shareActionType = SocialMediaShareActionType.COPY;
          } else {
            shareActionType = SocialMediaShareActionType.OPEN_LINK;
          }
        }
        socialMediaOnConnectionPage.push({
          id: element.id,
          icon: element.icon,
          shareActionType,
          shareActionData: element.shareActionDataFormat.replace(
            '%%PROFILE%%',
            profile,
          ),
        });
      }
    }
    setConnectionSocialMedia(socialMediaOnConnectionPage);
  }, [connection, socialMediaVariations]);
  const { t } = useTranslation();

  const toggleSection = (key) => {
    switch (key) {
      case ConnectionScreenSectionKeys.CONNECTIONS:
        setConnectionsCollapsed(!connectionsCollapsed);
        break;
      case ConnectionScreenSectionKeys.GROUPS:
        setGroupsCollapsed(!groupsCollapsed);
        break;
      case ConnectionScreenSectionKeys.RECOVERY_CONNECTIONS:
        setRecoveryConnectionsCollapsed(!recoveryConnectionsCollapsed);
        break;
      case ConnectionScreenSectionKeys.DUPLICATES:
        setPossibleDuplicatesCollapsed(!possibleDuplicatesCollapsed);
        break;
      case ConnectionScreenSectionKeys.SOCIAL_MEDIA:
        setSocialMediaCollapsed(!socialMediaCollapsed);
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
        key: ConnectionScreenSectionKeys.CONNECTIONS,
        numEntries: mutualConnections.length,
      },
      {
        title: t('connectionDetails.label.mutualGroups'),
        data: groupsCollapsed ? [] : mutualGroups,
        key: ConnectionScreenSectionKeys.GROUPS,
        numEntries: mutualGroups.length,
      },
      {
        title: t('connectionDetails.label.recoveryConnections'),
        data: recoveryConnectionsCollapsed ? [] : recoveryConnections,
        key: ConnectionScreenSectionKeys.RECOVERY_CONNECTIONS,
        numEntries: recoveryConnections.length,
      },
      {
        title: t('connectionDetails.label.possibleDuplicates'),
        data: possibleDuplicatesCollapsed ? [] : possibleDuplicates,
        key: ConnectionScreenSectionKeys.DUPLICATES,
        numEntries: possibleDuplicates.length,
      },
      {
        title: t('connectionDetails.label.socialMedia'),
        data: socialMediaCollapsed ? [] : [connectionSocialMedia],
        key: ConnectionScreenSectionKeys.SOCIAL_MEDIA,
        numEntries: connectionSocialMedia.filter((s) => !!s.shareActionData)
          .length,
      },
    ];
    return data;
  }, [
    t,
    connectionsCollapsed,
    mutualConnections,
    groupsCollapsed,
    mutualGroups,
    recoveryConnectionsCollapsed,
    recoveryConnections,
    possibleDuplicatesCollapsed,
    possibleDuplicates,
    connectionSocialMedia,
    socialMediaCollapsed,
  ]);

  const renderSticker = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={DARKER_GREY} animating />;
    } else {
      return verificationsTexts.length > 0 ? (
        verificationsTexts.map((verificationText, i) => (
          <View key={`verificationView-${i}`} style={styles.verificationBox}>
            <Text key={`verificationText-${i}`} style={styles.verificationText}>
              {verificationText}
            </Text>
          </View>
        ))
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
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.verificationsContainer}>{renderSticker()}</View>
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
    if (section.key === ConnectionScreenSectionKeys.RECOVERY_CONNECTIONS) {
      return renderRecoveryItem({ item, index });
    }
    if (section.key === ConnectionScreenSectionKeys.SOCIAL_MEDIA) {
      return renderSocialMediaVariations({ item, index });
    }
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

  const renderSocialMediaVariations = ({
    item,
    index,
  }: {
    item: SocialMediaOnConnectionPage[];
    index: number;
  }) => {
    return (
      <FlatList
        style={styles.socialMediaVariations}
        columnWrapperStyle={styles.socialMediaVariationsColumn}
        data={item}
        numColumns={5}
        renderItem={renderSocialMediaVariation}
        keyExtractor={socialMediaVariationsKeyExtractor}
      />
    );
  };

  const socialMediaVariationsKeyExtractor = (
    item: SocialMediaOnConnectionPage,
  ) => {
    return item.id;
  };

  const renderSocialMediaVariation = ({
    item,
  }: {
    item: SocialMediaOnConnectionPage;
  }) => {
    return (
      <TouchableWithoutFeedback
        onPress={() => {
          if (item.shareActionData) {
            const data = item.shareActionData;
            if (item.shareActionType === SocialMediaShareActionType.OPEN_LINK) {
              Linking.openURL(data);
            } else if (
              item.shareActionType === SocialMediaShareActionType.COPY
            ) {
              Clipboard.setString(data);
              if (Platform.OS === 'android') {
                ToastAndroid.show(
                  t('connectionDetails.text.copied'),
                  ToastAndroid.LONG,
                );
              } else {
                Alert.alert(t('connectionDetails.text.copied'));
              }
            }
          }
        }}
      >
        <SvgXml
          xml={item.icon}
          width={DEVICE_LARGE ? 40 : 36}
          height={DEVICE_LARGE ? 40 : 36}
        />
      </TouchableWithoutFeedback>
    );
  };

  const renderRecoveryItem = ({ item, index }) => {
    const testID = `recoveryConnections-${index}`;
    console.log(
      `Rendering Section recoveryConnections item ${index} (${item.id}) - testID ${testID}`,
    );
    const activeAfter = item.activeAfter
      ? `(activates in ${moment
          .duration(item.activeAfter, 'milliseconds')
          .humanize()})`
      : '';
    const activeBefore = item.activeBefore
      ? `(deactivates in ${moment
          .duration(item.activeBefore, 'milliseconds')
          .humanize()})`
      : '';
    return (
      <View testID={testID} style={styles.itemContainer}>
        <View style={styles.itemPhoto}>{renderRecoveryPhoto(item.conn)}</View>
        <View style={styles.itemLabel}>
          <Text style={styles.itemLabelText}>
            {item?.conn?.name
              ? item.conn.name
              : t('connectionDetails.text.unkownRecoveryConnection')}{' '}
            {activeAfter} {activeBefore}{' '}
          </Text>
        </View>
      </View>
    );
  };

  const renderRecoveryPhoto = (item) => {
    const source = item?.photo?.filename
      ? { uri: `file://${photoDirectory()}/${item.photo.filename}` }
      : require('@/static/default_profile.jpg');
    return (
      <Image
        source={source}
        style={styles.photo}
        resizeMode="cover"
        onError={(e) => {
          console.log(e);
        }}
        accessible={true}
        accessibilityLabel="photo"
      />
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
      case ConnectionScreenSectionKeys.CONNECTIONS:
        collapsed = connectionsCollapsed;
        break;
      case ConnectionScreenSectionKeys.GROUPS:
        collapsed = groupsCollapsed;
        break;
      case ConnectionScreenSectionKeys.RECOVERY_CONNECTIONS:
        collapsed = recoveryConnectionsCollapsed;
        break;
      case ConnectionScreenSectionKeys.DUPLICATES:
        collapsed = possibleDuplicatesCollapsed;
        break;
      case ConnectionScreenSectionKeys.SOCIAL_MEDIA:
        collapsed = socialMediaCollapsed;
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
  socialMediaVariations: {
    marginTop: DEVICE_LARGE ? 8 : 6,
    marginBottom: DEVICE_LARGE ? 8 : 6,
  },
  socialMediaVariationsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginRight: 10,
    marginTop: DEVICE_LARGE ? 10 : 8,
    marginBottom: DEVICE_LARGE ? 10 : 8,
  },
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
  verificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: DEVICE_LARGE ? 10 : 0,
    width: '100%',
    backgroundColor: WHITE,
  },
  verificationBox: {
    margin: 1,
  },
  verificationText: {
    paddingLeft: 3,
    paddingRight: 3,
    paddingTop: 3,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[11],
    color: BLUE,
    borderColor: BLUE,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
  },
  profileDivider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
    width: '98%',
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
