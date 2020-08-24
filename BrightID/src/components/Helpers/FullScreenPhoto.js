// @flow

import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import RNFS from 'react-native-fs';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */

const FullScreenPhoto = ({ route, navigation }) => {
  // const dispatch = useDispatch();
  const photo = route.params?.photo;
  const base64 = route.params?.base64;
  const uri = base64
    ? photo
    : `file://${RNFS.DocumentDirectoryPath}/photos/${photo?.filename}`;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel="go back"
      >
        <View style={styles.blackScreen} />
      </TouchableWithoutFeedback>
      <Image
        source={{
          uri,
        }}
        style={styles.photo}
        resizeMethod="scale"
        resizeMode="contain"
      />
      <TouchableWithoutFeedback
        onPress={() => {
          navigation.goBack();
        }}
        accessibilityLabel="go back"
      >
        <View style={styles.blackScreen} />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  blackScreen: {
    // minHeight: PADDING,
    width: '100%',
    // flex: 1,
    flex: DEVICE_LARGE ? 0.5 : 0.35,
  },
  photo: {
    width: '100%',
    flex: 1,
  },
});

export default FullScreenPhoto;
