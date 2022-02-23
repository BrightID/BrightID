import React from 'react';
import moment from 'moment';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Linking,
  FlatList,
  ScrollView,
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/stack';
import { store, useSelector } from '@/store';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { photoDirectory } from '@/utils/filesystem';
import { getBituReportedByText } from '@/utils/verifications';
import { GREY, BLUE, BLACK, RED } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { selectAllConnections } from '@/reducer/connectionsSlice';

export const BituVerificationScreen = function ({ route }) {
  const { url } = route.params;
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const {
    user: { verifications },
  } = store.getState();
  const connections = useSelector(selectAllConnections);
  const bituVerification = (verifications.find((v) => v.name === 'Bitu') || {
    directReports: {},
    reportedConnections: {},
    score: 0,
    linksNum: 0,
    tempScore: 0,
  }) as BituVerification;
  const directReports = bituVerification
    ? Object.keys(bituVerification.directReports)
    : [];
  const reportedConnections = bituVerification
    ? Object.keys(bituVerification.reportedConnections)
    : [];
  const negativeScore = bituVerification.linksNum - bituVerification.score;
  const currentLinksNum = bituVerification.tempScore + negativeScore;
  const releaseTime = moment(bituVerification.releaseTime).fromNow();

  const renderItem = (item, index, section) => {
    let score, reportedBy;
    if (section === 'reportedConnections') {
      score = bituVerification.reportedConnections[item].length * -1;
      reportedBy = getBituReportedByText(bituVerification, connections, item);
    } else {
      score = bituVerification.directReports[item];
      reportedBy = '';
    }
    const testID = `${section}-${index}`;
    console.log(
      `Rendering Section ${section} item ${index} (${item.name}) - testID ${testID}`,
    );
    item = connections.find((c) => c.id === item) || {};
    return (
      <View testID={testID} style={styles.itemContainer}>
        <View style={styles.itemPhoto}>{renderPhoto(item)}</View>
        <View style={styles.itemLabel}>
          <Text style={styles.itemLabelText}>{item.name || 'Unknown'}</Text>
          {reportedBy.length > 0 && (
            <Text style={styles.itemReportedByText}>{reportedBy}</Text>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.negativeScoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
    );
  };

  const renderPhoto = (item) => {
    const imageSource = item?.photo?.filename
      ? { uri: `file://${photoDirectory()}/${item.photo.filename}` }
      : require('@/static/default_profile.jpg');
    return (
      <Image
        source={imageSource}
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

  return (
    <ScrollView
      style={[styles.container, { marginTop: headerHeight }]}
      testID="BituVerificationScreen"
    >
      <View style={styles.headerContainer}>
        <View
          style={
            bituVerification
              ? styles.imageContainer
              : styles.imageContainerDisabled
          }
        >
          <Image
            source={require('@/static/verifications/bitu.png')}
            accessible={true}
            accessibilityLabel="Bitu"
            resizeMode="cover"
            style={styles.logo}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>Bitu Verification</Text>
          <Text style={styles.scoreTitle}>Score:</Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{bituVerification?.score || 0}</Text>
        </View>
      </View>
      <Text style={styles.infoText}>
        Bitu is released once a week and last release was {releaseTime}.{'\n'}
        You have {currentLinksNum} Bitu verified connections now.
      </Text>
      <Text style={styles.guideText}>
        You can get verified and increase your score in "Bitu" by making
        "already known" connections to friends or family who are connected to
        BrightID graph and have "Bitu" verification. Never make "already known"
        connections to users you do not know, because you lose 5 scores if they
        report you and 1 score every time they are reported.
        <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(url)}>
          more ...
        </Text>
      </Text>
      {directReports.length > 0 && (
        <Text style={styles.reportTitle}>Being reported by</Text>
      )}
      <FlatList
        data={directReports}
        renderItem={({ item, index }) =>
          renderItem(item, index, 'directReports')
        }
        keyExtractor={(item) => item}
      />
      {reportedConnections.length > 0 && (
        <Text style={styles.reportTitle}>Reported friends/family</Text>
      )}
      <FlatList
        data={reportedConnections}
        renderItem={({ item, index }) =>
          renderItem(item, index, 'reportedConnections')
        }
        keyExtractor={(item) => item}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingLeft: 18,
    paddingRight: 18,
    overflow: 'scroll',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  imageContainer: {
    width: 64,
    height: 64,
    backgroundColor: BLUE,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainerDisabled: {
    width: 64,
    height: 64,
    backgroundColor: GREY,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
  textContainer: {
    paddingLeft: 10,
  },
  titleText: {
    fontSize: fontSize[25],
    fontFamily: 'Poppins-Bold',
  },
  scoreTitle: {
    fontSize: fontSize[13],
  },
  scoreContainer: {
    alignSelf: 'flex-end',
    width: 60,
    height: 60,
    borderColor: BLUE,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: fontSize[28],
  },
  guideText: {
    fontSize: fontSize[16],
    paddingTop: 30,
    fontFamily: 'Poppins-Mediums',
    lineHeight: 25,
  },
  infoText: {
    fontSize: fontSize[16],
    paddingTop: 30,
    fontFamily: 'Poppins-Bold',
    lineHeight: 25,
  },
  reportTitle: {
    paddingTop: 20,
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPhoto: {
    margin: 10,
  },
  itemLabel: {},
  itemLabelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: BLACK,
  },
  itemReportedByText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: RED,
  },
  photo: {
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  negativeScoreContainer: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderColor: RED,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BituVerificationScreen;
