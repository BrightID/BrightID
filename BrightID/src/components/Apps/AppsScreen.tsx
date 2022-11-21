import React, { useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  RefreshControl,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/stack';
import Spinner from 'react-native-spinkit';
import { useFocusEffect } from '@react-navigation/native';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, BLUE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import AppCard from './AppCard';
import AnimatedLinearGradient from './AnimatedLinearGradient';
import AppsScreenFilter from '@/components/Apps/AppsScreenFilter';
import { selectSponsoringStep } from '@/reducer/appsSlice';
import { useSelector } from '@/store/hooks';
import { sponsoring_steps } from '@/utils/constants';

type Props = {
  sponsoringApp: AppInfo | undefined;
  pendingLink: ContextInfo | undefined;
  isSponsored: boolean;
  totalApps: number;
  linkedContextsCount: number;
  totalVerifiedApps: number;
  activeFilter: number;
  searchTerm: string;
  setFilter: (filter: number) => void;
  setSearch: (term: string) => void;
  filteredApps: AppInfo[];
  refreshing: boolean;
  sigsUpdating: boolean;
  refreshApps: () => void;
};

export const AppsScreen = ({
  sponsoringApp,
  pendingLink,
  isSponsored,
  totalApps,
  linkedContextsCount,
  totalVerifiedApps,
  activeFilter,
  setFilter,
  searchTerm,
  setSearch,
  filteredApps,
  refreshing,
  sigsUpdating,
  refreshApps,
}: Props) => {
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();
  useFocusEffect(refreshApps);
  const sponsoringStep = useSelector(selectSponsoringStep);
  const scrollViewRef = useRef(null);

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const notifHeight = useRef(new Animated.Value(0)).current;
  const fadeBackgroundSearch = scrollY.interpolate({
    inputRange: [0, 230],
    outputRange: [0, 1],
  });
  const fadeBackgroundHeader = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
  });
  const translateYHeader = scrollY.interpolate({
    inputRange: [0, 290],
    outputRange: [0, -290],
    extrapolate: 'clamp',
  });
  const translateYSearch = scrollY.interpolate({
    // @ts-ignore notifHeight._value
    inputRange: [0, notifHeight._value + 160],
    // @ts-ignore notifHeight._value
    outputRange: [notifHeight._value + 160, 0],
    extrapolate: 'clamp',
  });
  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY },
        },
      },
    ],
    {
      useNativeDriver: true,
    },
  );
  const showView = Animated.timing(notifHeight, {
    toValue: 100,
    duration: 500,
    easing: Easing.linear,
    useNativeDriver: false, // <-- neccessary
  });
  const closeView = Animated.timing(notifHeight, {
    toValue: 0,
    duration: 500,
    easing: Easing.linear,
    useNativeDriver: false, // <-- neccessary
  });

  const OverallDescription = () => {
    let msg: string, waiting: boolean;

    showView.start();

    switch (sponsoringStep) {
      case sponsoring_steps.WAITING_OP:
        msg = `Waiting for request-sponsor operation to confirm (WAITING_OP)`;
        waiting = true;
        break;
      case sponsoring_steps.ERROR_OP:
        msg = `request-sponsor operation did not confirm (ERROR_OP)`;
        waiting = false;
        break;
      case sponsoring_steps.WAITING_APP:
        msg = `Waiting for app to execute sponsorship (WAITING_APP)`;
        waiting = true;
        break;
      case sponsoring_steps.ERROR_APP:
        msg = `App failed to execute sponsorship (ERROR_APP)`;
        waiting = false;
        break;
      case sponsoring_steps.LINK_WAITING_V5:
        msg = `Linking v5 app... (LINK_WAITING_V5)`;
        waiting = true;
        break;
      case sponsoring_steps.LINK_WAITING_V6:
        msg = `Linking v6 app... (LINK_WAITING_V6)`;
        waiting = true;
        break;
      case sponsoring_steps.LINK_ERROR:
        msg = `Error while linking app (LINK_ERROR)`;
        waiting = false;
        break;
      case sponsoring_steps.LINK_SUCCESS:
        msg = `Success linking app (LINK_SUCCESS)`;
        waiting = false;
        break;
      case sponsoring_steps.SUCCESS:
      case sponsoring_steps.IDLE:
        if (!isSponsored) {
          msg = t('apps.text.notSponsored');
          waiting = false;
        }
        break;
      default:
        waiting = false;
        msg = '';
        closeView.start();
    }

    /*
    if (sponsoringApp) {
      msg = t('apps.text.sponsoring', { app: `${sponsoringApp.name}` });
      waiting = true;
    } else if (pendingLink) {
      msg = t('apps.text.pendingLink', { context: `${pendingLink.context}` });
      waiting = true;
    } else if (sigsUpdating) {
      msg = t('apps.text.sigsUpdating');
      waiting = true;
    } else if (!isSponsored) {
      msg = t('apps.text.notSponsored');
      waiting = false;
    } else {
      msg = '';
      waiting = false;
      closeView.start();
    }
     */

    return (
      <AnimatedLinearGradient
        containerStyle={[
          styles.headerContainer,
          {
            // @ts-ignore notifHeight._value
            height: 310 + notifHeight._value,
            opacity: fadeBackgroundHeader,
            transform: [{ translateY: translateYHeader }],
          },
        ]}
        style={{ paddingHorizontal: 20, paddingTop: headerHeight }}
        colors={['#3E4481', '#999ECD', '#ED7A5D']}
      >
        {msg ? (
          <Animated.View
            style={[styles.statusContainer, { maxHeight: notifHeight }]}
          >
            <Spinner
              isVisible={waiting}
              size={DEVICE_LARGE ? 48 : 42}
              type="ThreeBounce"
              color={WHITE}
            />
            <Text style={styles.statusMessage}>{msg}</Text>
          </Animated.View>
        ) : (
          <View />
        )}

        <View style={styles.rowContainer}>
          <View style={styles.appDetailContainer}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detail}>
              {totalApps} <Text style={styles.detailLabel}>apps</Text>
            </Text>
          </View>
          <View style={{ width: 10 }} />
          <View style={styles.appDetailContainer}>
            <Text style={styles.detailLabel}>You're linked to</Text>
            <Text style={styles.detail}>
              {linkedContextsCount}
              <Text style={styles.detailLabel}> apps</Text>
            </Text>
          </View>
        </View>
        <View style={styles.criteriaContainer}>
          <Text style={styles.detailLabel}>
            You meet the verification criteria of
          </Text>
          <Text style={[styles.detail, { textAlign: 'right' }]}>
            {totalVerifiedApps} <Text style={styles.detailLabel}>apps</Text>
          </Text>
        </View>
      </AnimatedLinearGradient>
    );
  };

  console.log(`Rendering appsscreen`);
  return (
    <>
      <View style={styles.container} testID="appsScreen">
        <AnimatedLinearGradient
          containerStyle={[
            styles.headerTitleContainer,
            { height: headerHeight, opacity: fadeBackgroundSearch },
          ]}
          colors={['#3E4481', '#999ECD']}
        />

        <OverallDescription />

        <AppsScreenFilter
          filter={activeFilter}
          searchTerm={searchTerm}
          setFilter={setFilter}
          setSearchTerm={setSearch}
          fadeBackgroundSearch={fadeBackgroundSearch}
          translateYSearch={translateYSearch}
        />

        <Animated.FlatList
          ref={(ref) => (scrollViewRef.current = ref)}
          testID="appsList"
          data={filteredApps}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          numColumns={2}
          columnWrapperStyle={styles.wrapperColumn}
          contentContainerStyle={[
            styles.contentContainer,
            // @ts-ignore notifHeight._value
            { marginTop: headerHeight + 190 + notifHeight._value },
          ]}
          keyExtractor={({ name }, index) => name + index}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <AppCard {...item} />}
          ListEmptyComponent={
            <EmptyList title={t('apps.text.noApps')} iconType="flask" />
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshApps} />
          }
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shadow: {
    ...Platform.select({
      android: { shadowColor: 'rgba(0,0,0,1)' },
      ios: { shadowColor: 'rgba(0,0,0,0.2)' },
    }),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  centerItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 10,
  },
  statusMessage: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[14],
    color: WHITE,
  },
  linkingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  headerTitleContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 100,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
  },
  rowContainer: {
    flexGrow: 0.4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appDetailContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 10,
  },
  criteriaContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  detailLabel: {
    flex: 1,
    fontFamily: 'Poppins-Light',
    fontSize: 13,
    color: WHITE,
  },
  detail: {
    flex: 1,
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: WHITE,
  },
  wrapperColumn: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contentContainer: {
    paddingTop: 100,
    paddingBottom: 500,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});

export default AppsScreen;
