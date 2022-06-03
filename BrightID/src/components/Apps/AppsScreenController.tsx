import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { any, find, propEq } from 'ramda';
import { Alert } from 'react-native';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store';
import { AppsRoute } from '@/components/Apps/types';
import { NodeApiContext } from '@/components/NodeApiGate';
import {
  linkedContextTotal,
  selectAllApps,
  selectAllLinkedContexts,
  selectAllLinkedSigs,
  selectPendingLinkedContext,
} from '@/reducer/appsSlice';
import AppsScreen from '@/components/Apps/AppsScreen';
import { fetchApps } from '@/actions';
import { handleV5App, handleV6App } from '@/components/Apps/model';
import { isVerified } from '@/utils/verifications';

const AppsScreenController = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute<AppsRoute>();
  const api = useContext(NodeApiContext);
  const apps = useSelector(selectAllApps);
  const isSponsored = true; /* useSelector(
   (state: State) => state.user.isSponsored || state.user.isSponsoredv6,
   ); */
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
  const [totalVerifiedApps, setTotalVerifiedApps] = useState(0);

  // filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setFilter] = useState(0);
  const [filteredApps, setFilteredApps] = useState(apps);

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
    setTotalVerifiedApps(verifiedApps.length);

    let filteredApp: AppInfo[] = [];
    if (activeFilter === 0) {
      filteredApp = allApps;
    } else if (activeFilter === 1) {
      filteredApp = linkedApps;
    } else if (activeFilter === 2) {
      filteredApp = verifiedApps;
    }

    // filter using search bar
    if (searchTerm !== '') {
      const filterResult = filteredApp.filter(
        (app) =>
          app.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1,
      );
      setFilteredApps(filterResult);
    } else {
      setFilteredApps(filteredApp);
    }
  }, [
    searchTerm,
    activeFilter,
    apps,
    selectLinkedSigs,
    linkedContext,
    userVerifications,
  ]);

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

  return (
    <AppsScreen
      sponsoringApp={sponsoringApp}
      pendingLink={pendingLink}
      isSponsored={isSponsored}
      totalApps={totalApps}
      linkedContextsCount={linkedContextsCount}
      totalVerifiedApps={totalVerifiedApps}
      activeFilter={activeFilter}
      searchTerm={searchTerm}
      setFilter={setFilter}
      setSearch={setSearchTerm}
      filteredApps={filteredApps}
      refreshApps={refreshApps}
      refreshing={refreshing}
    />
  );
};

export default AppsScreenController;
