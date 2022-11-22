import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { NodeApiContext } from '@/components/NodeApiGate';
import {
  linkedContextTotal,
  resetLinkingAppState,
  selectAllApps,
  selectAllLinkedContexts,
  selectAllLinkedSigs,
  selectLinkingAppInfo,
  selectLinkingAppStartTime,
  selectPendingLinkedContext,
  selectSponsoringStep,
  setSponsoringStep,
} from '@/reducer/appsSlice';
import AppsScreen from '@/components/Apps/AppsScreen';
import { fetchApps, selectIsSponsored } from '@/actions';
import { getSponsorship } from '@/components/Apps/model';
import { isVerified } from '@/utils/verifications';
import { useDispatch, useSelector } from '@/store/hooks';
import {
  linkAppId,
  linkContextId,
  startLinking,
} from '@/components/Apps/appThunks';
import {
  SPONSOR_WAIT_TIME,
  SPONSORING_POLL_INTERVAL,
  sponsoring_steps,
} from '@/utils/constants';

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
  const navigation = useNavigation();
  const route = useRoute<AppsRoute>();
  const api = useContext(NodeApiContext);
  const apps = useSelector(selectAllApps);
  const linkedContext = useSelector(selectAllLinkedContexts);
  const linkedContextsCount = useSelector(linkedContextTotal);
  const selectLinkedSigs = useSelector(selectAllLinkedSigs);
  const pendingLink = useSelector(selectPendingLinkedContext);
  const sponsoringStep = useSelector(selectSponsoringStep);
  const linkingAppInfo = useSelector(selectLinkingAppInfo);
  const linkingAppStarttime = useSelector(selectLinkingAppStartTime);
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
    // can only start linking if api is available and apps are known
    if (route.params.appId && api && apps.length) {
      // get all app linking details from route params
      const linkingParams = parseRouteParams(route.params);
      // reset route params
      navigation.setParams({
        appId: '',
        appUserId: '',
        baseUrl: '',
      });
      // start linking
      dispatch(startLinking(linkingParams));
    }
  }, [api, apps.length, dispatch, navigation, route.params]);

  // track sponsor by app progress
  useEffect(() => {
    if (
      sponsoringStep === sponsoring_steps.WAITING_APP &&
      linkingAppInfo?.appUserId
    ) {
      // Op to request sponsoring is submitted. Now wait for app to actually perform it.
      const intervalId = setInterval(async () => {
        const timeElapsed = Date.now() - linkingAppStarttime;
        let sponsorshipInfo: SponsorshipInfo | undefined;
        try {
          sponsorshipInfo = await getSponsorship(linkingAppInfo.appUserId, api);
        } catch (error) {
          console.log(`Error getting sponsorship info:`);
          console.log(`${error}`);
        }
        console.log(
          `Got sponsorship info - Authorized: ${sponsorshipInfo.appHasAuthorized}, spendRequested: ${sponsorshipInfo.spendRequested}`,
        );
        if (
          sponsorshipInfo &&
          sponsorshipInfo.appHasAuthorized &&
          sponsorshipInfo.spendRequested
        ) {
          console.log(`Sponsorship complete!`);
          clearInterval(intervalId);
          dispatch(setSponsoringStep(sponsoring_steps.SUCCESS));
        } else if (timeElapsed > SPONSOR_WAIT_TIME) {
          console.log(`Timeout waiting for sponsoring!`);
          clearInterval(intervalId);
          dispatch(setSponsoringStep(sponsoring_steps.ERROR_APP));
        }
      }, SPONSORING_POLL_INTERVAL);
      console.log(`Started pollSponsorship ${intervalId}`);

      return () => {
        console.log(`Stop pollSponsorship ${intervalId}`);
        clearInterval(intervalId);
      };
    }
  }, [
    api,
    dispatch,
    linkingAppInfo?.appUserId,
    linkingAppStarttime,
    sponsoringStep,
  ]);

  // trigger linking when sponsoring is complete
  useEffect(() => {
    if (sponsoringStep === sponsoring_steps.SUCCESS) {
      if (sigsUpdating) {
        console.log(`Waiting for updating sigs before linking...`);
        return;
      }
      // sponsoring ok, now start linking.
      const { v } = linkingAppInfo;
      switch (v) {
        case 5:
          // v5 app
          dispatch(linkContextId());
          break;
        case 6:
          // v6 app
          dispatch(linkAppId({ silent: false }));
          break;
        default:
          console.log(`Unhandled app version v: ${v}`);
          throw new Error(`Unhandled app version v: ${v}`);
      }
    }
  }, [dispatch, linkingAppInfo, sigsUpdating, sponsoringStep]);

  // Error handler
  // TODO Create extra component, probably modal popup
  useEffect(() => {
    const errorCases = [
      sponsoring_steps.ERROR_APPINFO,
      sponsoring_steps.ERROR_INVALIDAPP,
      sponsoring_steps.ERROR_APP,
      sponsoring_steps.ERROR_OP,
      sponsoring_steps.LINK_ERROR,
    ];

    if (errorCases.includes(sponsoringStep)) {
      let msg = `Unknown Error`;
      switch (sponsoringStep) {
        case sponsoring_steps.ERROR_APPINFO:
          msg = t('apps.alert.text.invalidContext', {
            context: `${linkingAppInfo.appId}`,
          });
          break;
        case sponsoring_steps.ERROR_INVALIDAPP:
          msg = t('apps.alert.text.invalidApp', {
            app: `${linkingAppInfo.appId}`,
          });
          break;
        default:
          msg = `Sponsoring step: ${sponsoringStep}`;
      }
      Alert.alert(i18next.t('apps.alert.title.linkingFailed'), msg, [
        {
          text: i18next.t('common.alert.dismiss'),
          style: 'cancel',
          onPress: () => dispatch(resetLinkingAppState()),
        },
      ]);
    }
  }, [dispatch, linkingAppInfo?.appId, sponsoringStep, t]);

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
      sponsoringApp={linkingAppInfo?.appInfo}
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
      sigsUpdating={sigsUpdating}
    />
  );
};

export default AppsScreenController;
