// import React, { useCallback, useEffect } from 'react';
// import {
//   Alert,
//   Linking,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { BlurView } from '@react-native-community/blur';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { useTranslation } from 'react-i18next';
// import { isEqual } from 'lodash';
// import { NetworkInfo } from 'react-native-network-info';
// import Clipboard from '@react-native-clipboard/clipboard';
// import { useDispatch, useSelector } from '@/store/hooks';
// import { BLACK, GREEN, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
// import { DEVICE_LARGE } from '@/utils/deviceConstants';
// import { fontSize } from '@/theme/fonts';
// import {
//   clearBaseUrl,
//   removeCurrentNodeUrl,
//   resetNodeUrls,
//   selectAllNodeUrls,
//   selectBaseUrl,
//   selectDefaultNodeUrls,
// } from '@/reducer/settingsSlice';
// import { leaveAllChannels } from '@/components/PendingConnections/actions/channelThunks';
// import GraphQl from '@/components/Icons/GraphQl';
// import { LOCAL_HTTP_SERVER_PORT } from '@/utils/constants';
// import { startHttpServer, stopHttpServer } from '@/utils/httpServer';
// import { setLocalServerUrl, userSelector } from '@/reducer/userSlice';

// const NodeModal = () => {
//   const route = useRoute() as {
//     params?: { next: string; run: boolean };
//   };

//   const navigation = useNavigation();
//   const { t } = useTranslation();
//   const currentBaseUrl = useSelector(selectBaseUrl);
//   const defaultNodeUrls = useSelector(selectDefaultNodeUrls);
//   const currentNodeUrls = useSelector(selectAllNodeUrls);
//   const user = useSelector(userSelector);
//   const dispatch = useDispatch();

//   const goBack = () => {
//     navigation.goBack();
//   };

//   const changeNodeHandler = () => {
//     navigation.goBack();
//     dispatch(leaveAllChannels());
//     dispatch(removeCurrentNodeUrl());
//   };

//   const resetHandler = () => {
//     dispatch(resetNodeUrls());
//     dispatch(leaveAllChannels());
//     dispatch(clearBaseUrl());
//   };

//   let resetContainer;
//   if (!isEqual(defaultNodeUrls, currentNodeUrls)) {
//     resetContainer = (
//       <>
//         <View style={styles.resetInfoContainer}>
//           <Text style={styles.resetInfoText}>
//             {t('nodeApiGate.reset.text')}
//           </Text>
//         </View>
//         <TouchableOpacity style={styles.resetButton} onPress={resetHandler}>
//           <Text style={styles.resetButtonText}>
//             {t('nodeApiGate.reset.button')}
//           </Text>
//         </TouchableOpacity>
//       </>
//     );
//   }

//   const localServerUrl = useSelector((state) => state.user.localServerUrl);

//   const startHttpServerCallback = useCallback(async () => {
//     await startHttpServer(user);
//     const ip = await NetworkInfo.getIPV4Address();
//     const serverUrl = `${ip}:${LOCAL_HTTP_SERVER_PORT}`;
//     dispatch(setLocalServerUrl(serverUrl));
//     return serverUrl;
//   }, [dispatch, user]);

//   const toggleHttpServer = useCallback(async () => {
//     if (!localServerUrl) {
//       const serverUrl = await startHttpServerCallback();
//       Clipboard.setString(serverUrl);
//       Alert.alert(t('home.alert.text.copied'));
//     } else {
//       stopHttpServer();
//       dispatch(setLocalServerUrl(''));
//     }
//   }, [dispatch, localServerUrl, startHttpServerCallback, t]);

//   useEffect(() => {
//     const openNext = async () => {
//       const next = route.params?.next;
//       if (next) {
//         await Linking.openURL(next);
//       }
//     };
//     if (route.params?.run) {
//       if (!localServerUrl) {
//         startHttpServerCallback().then(openNext);
//       } else {
//         openNext();
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [route.params]);

//   return (
//     <View style={styles.container}>
//       <BlurView
//         style={styles.blurView}
//         blurType="dark"
//         blurAmount={5}
//         reducedTransparencyFallbackColor={BLACK}
//       />
//       <TouchableWithoutFeedback onPress={goBack}>
//         <View style={styles.blurView} />
//       </TouchableWithoutFeedback>
//       <View style={styles.modalContainer}>
//         <View style={styles.header}>
//           <Text style={styles.headerText}>
//             {t('nodeModal.currentNode.header')}
//           </Text>
//           <Text style={styles.subHeaderText}>{currentBaseUrl}</Text>
//         </View>
//         <TouchableOpacity
//           testID="SaveLevelBtn"
//           style={styles.switchNodeButton}
//           onPress={changeNodeHandler}
//         >
//           <Text style={styles.switchNodeButtonText}>
//             {t('nodeModal.switchNodeButtonLabel')}
//           </Text>
//         </TouchableOpacity>
//         {resetContainer}
//         <TouchableOpacity
//           testID="httpServerBtn"
//           style={[
//             styles.switchNodeButton,
//             styles.httpServerButton,
//             {
//               backgroundColor: localServerUrl ? GREEN : ORANGE,
//             },
//           ]}
//           onPress={toggleHttpServer}
//           accessible={true}
//           accessibilityLabel={t('home.button.httpServer')}
//         >
//           <GraphQl
//             width={DEVICE_LARGE ? 25 : 20}
//             height={DEVICE_LARGE ? 25 : 20}
//           />
//           {localServerUrl ? (
//             <View style={styles.httpServerInfo}>
//               <Text
//                 style={[
//                   styles.switchNodeButtonText,
//                   {
//                     color: BLACK,
//                   },
//                 ]}
//               >
//                 {localServerUrl}
//               </Text>
//               <Text style={styles.wifiSharingText}>WiFi Sharing Url</Text>
//             </View>
//           ) : (
//             <Text style={styles.switchNodeButtonText}>
//               {t('home.button.httpServer')}
//             </Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   blurView: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     top: 0,
//     bottom: 0,
//   },
//   modalContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: WHITE,
//     width: '90%',
//     borderRadius: 25,
//     padding: DEVICE_LARGE ? 30 : 25,
//   },
//   header: {
//     marginTop: 5,
//     marginBottom: 10,
//   },
//   headerText: {
//     fontFamily: 'Poppins-Bold',
//     fontSize: fontSize[19],
//     textAlign: 'center',
//     color: LIGHT_BLACK,
//   },
//   subHeaderText: {
//     fontFamily: 'Poppins-Bold',
//     fontSize: fontSize[16],
//     textAlign: 'center',
//     color: LIGHT_BLACK,
//   },
//   switchNodeButton: {
//     width: '90%',
//     paddingTop: 8,
//     paddingBottom: 8,
//     backgroundColor: ORANGE,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//   },
//   switchNodeButtonText: {
//     paddingLeft: 4,
//     fontFamily: 'Poppins-Medium',
//     fontSize: fontSize[15],
//     color: WHITE,
//   },
//   resetInfoContainer: {
//     marginBottom: 3,
//     marginTop: 25,
//   },
//   resetInfoText: {
//     fontFamily: 'Poppins-Medium',
//     fontSize: fontSize[14],
//     color: LIGHT_BLACK,
//   },
//   resetButton: {
//     width: '70%',
//     paddingTop: 8,
//     paddingBottom: 8,
//     backgroundColor: ORANGE,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//   },
//   resetButtonText: {
//     fontFamily: 'Poppins-Medium',
//     fontSize: fontSize[14],
//     color: WHITE,
//   },
//   httpServerButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     marginTop: DEVICE_LARGE ? 8 : 6,
//   },
//   httpServerInfo: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'column',
//   },
//   wifiSharingText: {
//     fontFamily: 'Poppins-Medium',
//     fontSize: fontSize[10],
//     color: BLACK,
//     lineHeight: DEVICE_LARGE ? 12 : 10,
//   },
// });

// export default NodeModal;
