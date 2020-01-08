// @flow

import * as React from 'react';
import { StyleSheet, View, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { saveApp } from '../../actions/apps';
import BottomNav from '../BottomNav';

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
      const { baseUrl, context, id } = navigation.state.params;
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
          `Do you want to allow ${context} to link the account with id ${id} to your BrightID verification?`,
          [
            {
              text: 'Yes',
              onPress: () =>
                this.linkVerification(baseUrl, context, contextInfo, id),
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
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.AppsList}
          data={this.props.apps}
          keyExtractor={({ name }, index) => name + index}
          renderItem={({ item }) => <AppCard {...item} />}
        />
        <BottomNav style={{ flex: 0 }} navigation={navigation} />
      </View>
    );
  }

  async linkVerification(baseUrl, context, contextInfo, id) {
    const { navigation, dispatch } = this.props;
    const oldBaseUrl = api.baseUrl;

    try {
      api.baseUrl = baseUrl;
      const verification = await api.getVerification(context, id);
      // not all contexts have a verification URL
      if (contextInfo.verificationUrl) {
        const response = await fetch(`${contextInfo.verificationUrl}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(verification),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          contextInfo.verified = true;
        } else {
          throw new Error(response.statusText);
        }
      }
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
