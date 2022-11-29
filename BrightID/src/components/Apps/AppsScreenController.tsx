import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { NodeApiContext } from '@/components/NodeApiGate';
import {
  linkedContextTotal,
  selectAllApps,
  selectAllLinkedContexts,
  selectAllLinkedSigs,
  selectApplinkingStep,
} from '@/reducer/appsSlice';
import AppsScreen from '@/components/Apps/AppsScreen';
import { fetchApps, selectIsSponsored } from '@/actions';
import { isVerified } from '@/utils/verifications';
import { useDispatch, useSelector } from '@/store/hooks';
import { requestLinking } from '@/components/Apps/appThunks';
import { app_linking_steps } from '@/utils/constants';
import AppLinkingScreen from '@/components/Apps/AppLinkingScreen';

// get app linking details from route params
const parseRouteParams = (params: Params) => {
  const { appId, appUserId, baseUrl } = params;
  return {
    baseUrl,
    appId,
    appUserId,
    v: baseUrl ? 5 : 6, // apps providing baseUrl use v5 api
  };
};

const AppsScreenController = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const route = useRoute<AppsRoute>();
  const api = useContext(NodeApiContext);
  const apps = useSelector(selectAllApps);
  const linkedContext = useSelector(selectAllLinkedContexts);
  const linkedContextsCount = useSelector(linkedContextTotal);
  const selectLinkedSigs = useSelector(selectAllLinkedSigs);
  const sponsoringStep = useSelector(selectApplinkingStep);
  const isSponsored = useSelector(selectIsSponsored);
  const userVerifications = useSelector((state) => state.user.verifications);
  const sigsUpdating = useSelector((state) => state.apps.sigsUpdating);

  const [refreshing, setRefreshing] = useState(false);
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

  // start process to link app/context if according route parameters were set
  useEffect(() => {
    // can only start linking if api is available
    if (route.params.appId && api) {
      // get all app linking details from route params
      const linkingParams = parseRouteParams(route.params);
      // start linking process
      dispatch(requestLinking(linkingParams));
    }
  }, [t, api, dispatch, route.params]);

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
    <>
      <AppsScreen
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
        sigsUpdating={sigsUpdating}
      />
      {sponsoringStep !== app_linking_steps.IDLE && <AppLinkingScreen />}
    </>
  );
};

export default AppsScreenController;
