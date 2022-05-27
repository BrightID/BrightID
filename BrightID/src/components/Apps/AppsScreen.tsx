import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TextInput,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Platform,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { any, propEq, find } from 'ramda';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import _ from 'lodash';
import Spinner from 'react-native-spinkit';
import {
  linkedContextTotal,
  selectAllLinkedContexts,
  selectAllLinkedSigs,
} from '@/reducer/appsSlice';
import { useDispatch, useSelector } from '@/store';
import EmptyList from '@/components/Helpers/EmptyList';
import { ORANGE, BLUE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  fetchApps,
  selectAllApps,
  selectPendingLinkedContext,
} from '@/actions';
import { fontSize } from '@/theme/fonts';
import { NodeApiContext } from '@/components/NodeApiGate';
import { isVerified } from '@/utils/verifications';
import AppCard from './AppCard';
import { handleV5App, handleV6App } from './model';
import { AppsRoute } from '@/components/Apps/types';
import AnimatedLinearGradient from './AnimatedLinearGradient';

export const AppsScreen = () => {
  const filters = [
    { name: 'All Apps', id: 1 },
    { name: 'Linked', id: 2 },
    { name: 'Verified', id: 3 },
  ];

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<AppsRoute>();
  const api = useContext(NodeApiContext);
  const headerHeight = useHeaderHeight();
  const { t } = useTranslation();

  const apps = useSelector(selectAllApps);
  const isSponsored = useSelector(
    (state: State) => state.user.isSponsored || state.user.isSponsoredv6,
  );
  const linkedContext = useSelector(selectAllLinkedContexts);
  const linkedContextsCount = useSelector(linkedContextTotal);
  const selectLinkedSigs = useSelector(selectAllLinkedSigs);
  const pendingLink = useSelector(selectPendingLinkedContext);
  const userVerifications = useSelector(
    (state: State) => state.user.verifications,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [sponsoringApp, setSponsoringApp] = useState<AppInfo | undefined>(
    undefined,
  );
  const [totalApps, setTotalApps] = useState(0);
  const [totalVerifiedApp, setTotalVerifiedApp] = useState(0);

  // filter state
  const [search, setSearch] = useState('');
  const [activefilter, SetFilter] = useState(0);
  const [filteredApp, setFilteredApp] = useState(apps);

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
    inputRange: [-640, 0, 290],
    // @ts-ignore notifHeight._value
    outputRange: [790, notifHeight._value + 160, 0],
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

  const refreshApps = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchApps(api))
      .then(() => {
        setRefreshing(false);
      })
      .catch((err) => {
        console.log(err.message);
        setRefreshing(false);
      });
  }, [api, dispatch]);

  const handleV5DeepLink = useCallback(() => {
    const context = route.params?.context;
    const isValidApp = any(propEq('id', context))(apps);
    const isValidContext = any(propEq('context', context))(apps);
    // legacy apps send context in the deep link but soulbound apps send app
    if (isValidApp || isValidContext) {
      handleV5App(route.params, setSponsoringApp, api);
    } else {
      Alert.alert(
        t('apps.alert.title.invalidContext'),
        t('apps.alert.text.invalidContext', { context: `${context}` }),
      );
    }
    // reset params
    navigation.setParams({
      baseUrl: '',
      context: '',
      contextId: '',
    });
  }, [navigation, route.params, apps, api, t]);

  const handleV6DeepLink = useCallback(() => {
    const appId = route.params?.context;
    const appInfo = find(propEq('id', appId))(apps) as AppInfo;
    if (api && appInfo && appInfo.usingBlindSig) {
      handleV6App(route.params, setSponsoringApp, api);
    } else {
      Alert.alert(
        t('apps.alert.title.invalidApp'),
        t('apps.alert.text.invalidApp', { app: `${appId}` }),
      );
    }
    // reset params
    navigation.setParams({
      context: '',
      contextId: '',
    });
  }, [route.params, apps, navigation, api, t]);

  useEffect(() => {
    if (apps.length > 0 && route.params?.baseUrl) {
      handleV5DeepLink();
    } else if (apps.length > 0 && route.params?.context) {
      handleV6DeepLink();
    }
  }, [apps, handleV5DeepLink, handleV6DeepLink, route.params]);

  // handle filter
  useEffect(() => {
    const allApps = apps.filter((app) => {
      const isLinked = linkedContext.find(
        (link) => link.context === app.context,
      );
      const isLinkedTemp = isLinked && isLinked.state === 'applied';
      return !app.testing || isLinkedTemp;
    });

    // filter linked app
    const linkedApps = allApps.filter((app) => {
      const appSig = selectLinkedSigs.filter((sig) => sig.app === app.id);
      const isLinked = linkedContext.find(
        (link) => link.context === app.context,
      );
      const isLinkedTemp = isLinked && isLinked.state === 'applied';
      return (app.usingBlindSig && appSig.length > 0) || isLinkedTemp;
    });

    // filter verified app
    const verifiedApps = allApps.filter((app) => {
      let count = 0;
      for (const verification of app.verifications) {
        const verified = isVerified(
          _.keyBy(userVerifications, (v) => v.name),
          verification,
        );
        if (verified) {
          count++;
        }
      }

      return count === app.verifications.length;
    });

    setTotalApps(allApps.length);
    setTotalVerifiedApp(verifiedApps.length);

    let filteredApp: AppInfo[] = [];
    if (activefilter === 0) {
      filteredApp = allApps;
    } else if (activefilter === 1) {
      filteredApp = linkedApps;
    } else if (activefilter === 2) {
      filteredApp = verifiedApps;
    }

    // filter using search bar
    if (search !== '') {
      const filterResult = filteredApp.filter(
        (app) => app.name.toLowerCase().indexOf(search.toLowerCase()) !== -1,
      );
      setFilteredApp(filterResult);
    } else {
      setFilteredApp(filteredApp);
    }
  }, [
    search,
    activefilter,
    apps,
    selectLinkedSigs,
    linkedContext,
    userVerifications,
  ]);

  useFocusEffect(refreshApps);

  const OverallDescription = () => {
    let msg: string, waiting: boolean;

    showView.start();

    if (sponsoringApp) {
      msg = t('apps.text.sponsoring', { app: `${sponsoringApp.name}` });
      waiting = true;
    } else if (pendingLink) {
      msg = t('apps.text.pendingLink', { context: `${pendingLink.context}` });
      waiting = true;
    } else if (!isSponsored) {
      msg = t('apps.text.notSponsored');
      waiting = false;
    } else {
      msg = '';
      waiting = false;
      closeView.start();
    }

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
            {totalVerifiedApp} <Text style={styles.detailLabel}>apps</Text>
          </Text>
        </View>
      </AnimatedLinearGradient>
    );
  };

  const Filter = () => {
    return (
      <>
        <Animated.View
          testID="searchBarBackground"
          style={[
            styles.searchBackground,
            { top: headerHeight, opacity: fadeBackgroundSearch },
          ]}
        />

        <Animated.View
          style={[
            styles.searchContainer,
            {
              top: headerHeight + 10,
              transform: [{ translateY: translateYSearch }],
            },
          ]}
        >
          <TextInput
            style={[styles.shadow, styles.textInput]}
            onChangeText={(value) => setSearch(value)}
            placeholder="App name"
            value={search}
          />

          <View style={styles.filterContainer}>
            {filters.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterItemContainer,
                  { backgroundColor: index === activefilter ? ORANGE : WHITE },
                ]}
                onPress={() => SetFilter(index)}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 12,
                    color: index === activefilter ? WHITE : ORANGE,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </>
    );
  };

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

        <Filter />

        <Animated.FlatList
          testID="appsList"
          data={filteredApp}
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
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
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
  textInput: {
    backgroundColor: 'white',
    width: '90%',
    height: 50,
    borderRadius: 5,
    paddingHorizontal: 10,
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
  filterContainer: {
    width: '90%',
    flexDirection: 'row',
    marginTop: 10,
  },
  filterItemContainer: {
    borderWidth: 1,
    borderColor: ORANGE,
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    height: 100,
    zIndex: 6,
    // marginTop: 40,
    overflow: 'visible',
  },
  searchBackground: {
    position: 'absolute',
    width: '100%',
    height: 120,
    backgroundColor: `white`,
    zIndex: 5,
  },
});

export default AppsScreen;
