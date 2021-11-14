import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  FlatList,
  Text,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import EmptyList from '@/components/Helpers/EmptyList';
import Spinner from 'react-native-spinkit';
import { ORANGE, BLUE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { any, propEq, find } from 'ramda';
import {
  fetchApps,
  selectAllApps,
  selectPendingLinkedContext,
} from '@/actions';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { NodeApiContext } from '@/components/NodeApiGate';
import AppCard from './AppCard';
import { handleAppContext, handleBlindSigApp } from './model';

export const AppsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<AppsRoute>();
  const api = useContext(NodeApiContext);

  const apps = useSelector(selectAllApps);
  const isSponsored = useSelector((state: State) => state.user.isSponsored);
  const pendingLink = useSelector(selectPendingLinkedContext);

  const [refreshing, setRefreshing] = useState(false);
  const [sponsoringApp, setSponsoringApp] = useState(null);
  const { t } = useTranslation();

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

  useFocusEffect(refreshApps);

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
    const app = route.params?.context;
    const appInfo = find(propEq('id', app))(apps) as AppInfo;
    if (appInfo && appInfo.usingBlindSig) {
      handleBlindSigApp(route.params, setSponsoringApp, api);
    } else {
      Alert.alert(
        t('apps.alert.title.invalidApp'),
        t('apps.alert.text.invalidApp', { app: `${app}` }),
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
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="appsScreen">
        <AppStatus />
        <FlatList
          testID="appsList"
          data={apps}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
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
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
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
});

export default AppsScreen;
