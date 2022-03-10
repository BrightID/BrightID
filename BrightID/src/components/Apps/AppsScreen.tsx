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
  FlatList,
  Text,
  TextInput,
  StatusBar,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Platform,
  SafeAreaView,
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
import AnimatedLinearGradient from './AnimatedLinearGradient';
import { handleAppContext, handleBlindSigApp } from './model';

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
  const linkedContext = useSelector(selectAllLinkedContexts);
  const linkedContextsCount = useSelector(linkedContextTotal);
  const selectLinkedSigs = useSelector(selectAllLinkedSigs);
  const isSponsored = useSelector((state: State) => state.user.isSponsored);
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
  const fadeBackgroundSearch = scrollY.interpolate({
    inputRange: [0, 230],
    outputRange: [0, 1],
  });
  const fadeBackgroundHeader = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
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

  const handleDeepLink = useCallback(() => {
    const context = route.params?.context;
    const isValidContext = any(propEq('context', context))(apps);
    if (isValidContext) {
      handleAppContext(route.params);
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
  }, [navigation, route.params, apps, t]);

  const handleAppDeepLink = useCallback(() => {
    const appId = route.params?.context;
    const appInfo = find(propEq('id', appId))(apps) as AppInfo;
    if (api && appInfo && appInfo.usingBlindSig) {
      handleBlindSigApp(route.params, setSponsoringApp, api);
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
      handleDeepLink();
    } else if (apps.length > 0 && route.params?.context) {
      handleAppDeepLink();
    }
  }, [apps, handleDeepLink, handleAppDeepLink, route.params]);

  // handle filter
  useEffect(() => {
    const allApps = apps.filter((app) => {
      const isLinked = linkedContext.find(
        (link) => link.context === app.context,
      );
      const isLinkedTemp = isLinked && isLinked.state === 'applied';
      return !app.testing || isLinkedTemp;
    });

    const linkedApps = allApps.filter((app) => {
      const appSig = selectLinkedSigs.filter((sig) => sig.app === app.id);
      const isLinked = linkedContext.find(
        (link) => link.context === app.context,
      );
      const isLinkedTemp = isLinked && isLinked.state === 'applied';
      return (app.usingBlindSig && appSig.length > 0) || isLinkedTemp;
    });

    const verifiedApps = allApps.filter((app) => {
      /* eslint no-var: 0 */
      var count = 0;
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

    var filteredApp: AppInfo[] = [];
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

  const AppStatus = () => {
    let msg: string, waiting: boolean;
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
    }
    return msg ? (
      <View style={styles.statusContainer}>
        <Text style={styles.statusMessage}>{msg}</Text>
        <Spinner
          isVisible={waiting}
          size={DEVICE_LARGE ? 48 : 42}
          type="Wave"
          color={BLUE}
        />
      </View>
    ) : (
      <View style={{ height: DEVICE_LARGE ? 12 : 10 }} />
    );
  };

  return (
    <>
      <View style={styles.container} testID="appsScreen">
        {/* <AppStatus /> */}

        <AnimatedLinearGradient
          containerStyle={{
            position: 'absolute',
            top: 0,
            width: '100%',
            height: headerHeight,
            zIndex: 100,
            opacity: fadeBackgroundSearch,
          }}
          colors={['#3E4481', '#999ECD']}
        />

        <AnimatedLinearGradient
          containerStyle={[
            styles.headerContainer,
            {
              opacity: fadeBackgroundHeader,
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 150],
                    outputRange: [0, -150],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
          style={{ paddingHorizontal: 20, paddingTop: headerHeight }}
          colors={['#3E4481', '#999ECD', '#ED7A5D']}
        >
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

        <Animated.View
          testID="searchBarBackground"
          style={{
            position: 'absolute',
            top: headerHeight,
            width: '100%',
            height: 120,
            backgroundColor: `white`,
            opacity: fadeBackgroundSearch,
            zIndex: 5,
          }}
        />

        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: headerHeight + 10,
            alignSelf: 'center',
            alignItems: 'center',
            width: '100%',
            height: 100,
            zIndex: 6,
            overflow: 'visible',
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-500, 0, 150],
                  outputRange: [650, 150, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}
        >
          <TextInput
            style={[styles.shadow, styles.textInput]}
            onChangeText={(value) => setSearch(value)}
            placeholder="App name"
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

        <Animated.FlatList
          testID="appsList"
          data={filteredApp}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          numColumns={2}
          columnWrapperStyle={styles.wrapperColumn}
          contentContainerStyle={[
            styles.contentContainer,
            { marginTop: headerHeight + 190 },
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
    marginTop: 20,
    paddingBottom: 20,
  },
  statusMessage: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[14],
    color: BLUE,
  },
  linkingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 310,
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
});

export default AppsScreen;
