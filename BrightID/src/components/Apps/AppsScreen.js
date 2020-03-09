// @flow

import * as React from 'react';
import { StyleSheet, View, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import nacl from 'tweetnacl';
import { saveApp } from '../../actions/apps';

import { strToUint8Array, uInt8ArrayToB64 } from '../../utils/encoding';
import api from '../../Api/BrightId';
import AppCard from './AppCard';

export class AppsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Apps',
    headerRight: () => <View />,
  });

  async componentDidMount() {
    const { navigation } = this.props;
    if (navigation.state.params) {
      // if 'params' is defined, the user came through a deep link
      const { baseUrl, context, contextId } = navigation.state.params;
      const oldBaseUrl = api.baseUrl;
      let contextInfo;
      try {
        api.baseUrl = baseUrl;
        contextInfo = await api.getContext(context);
      } catch (e) {
        console.log(e);
      } finally {
        api.baseUrl = oldBaseUrl;
      }
      if (contextInfo && contextInfo.verification) {
        Alert.alert(
          'App Verification?',
          `Do you want to verify your account in ${context} by your BrightID?`,
          [
            {
              text: 'Yes',
              onPress: () =>
                this.linkVerification(baseUrl, context, contextInfo, contextId),
            },
            {
              text: 'No',
              style: 'cancel',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        navigation.goBack();
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.AppsList}
          data={this.props.apps}
          keyExtractor={({ name }, index) => name + index}
          renderItem={({ item }) => <AppCard {...item} />}
        />
      </View>
    );
  }

  async linkVerification(baseUrl, context, contextInfo, contextId) {
    const { navigation, dispatch, isSponsored } = this.props;
    const oldBaseUrl = api.baseUrl;
    try {
      if (!isSponsored && !contextInfo.hasSponsorships) {
        throw new Error("user is not sponsored and the context doesn't have any sponsorship too");
      }
      if (contextInfo.verificationUrl) {
        const { publicKey, secretKey } = await nacl.sign.keyPair();
        const b64PubKey = uInt8ArrayToB64(publicKey);
        const sig = uInt8ArrayToB64(
          nacl.sign.detached(strToUint8Array(contextId), secretKey),
        );
        let resp = await fetch(contextInfo.verificationUrl, {
          method: 'PUT',
          body: JSON.stringify({
            contextId,
            publicKey: b64PubKey,
            sig,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        resp = await resp.json();
        contextId = b64PubKey;
      }
      api.baseUrl = baseUrl;
      api.linkContextId(context, contextId);
    } catch (e) {
      Alert.alert(`App verification failed`, `${e.message}\n${e.stack || ''}`, [
        {
          text: 'Dismiss',
          style: 'cancel',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } finally {
      api.baseUrl = oldBaseUrl;
      if (contextInfo.isApp) {
        dispatch(saveApp(context, contextInfo));
      }
      navigation.goBack();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  AppsList: {
    flex: 1,
  },
});

export default connect((state) => state)(AppsScreen);
