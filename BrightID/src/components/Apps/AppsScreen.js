// @flow

import * as React from 'react';
import { Linking, StyleSheet, View, FlatList, Text } from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';
import AppCard from './AppCard';
import { handleAppContext, deleteApp } from './model';

let deleteSheetRef = '';

type State = {
  selectedApp: string,
};

export class AppsScreen extends React.Component<Prop, State> {
  static navigationOptions = () => ({
    title: 'Apps',
    headerRight: () => <View />,
  });

  deleteSheetRef: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedApp: '',
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('willFocus', async () => {
      this.handleDeepLink();
      Linking.addEventListener('url', this.handleDeepLink);
    });
    navigation.addListener('willBlur', async () => {
      Linking.removeEventListener('url', this.handleDeepLink);
    });
  }

  handleDeepLink = (e) => {
    const { navigation } = this.props;
    if (navigation.state.params) {
      handleAppContext(navigation.state.params);
    }
  };

  handleAction = (selectedApp: string) => () => {
    this.setState({ selectedApp }, () => {
      if (deleteSheetRef) deleteSheetRef.show();
    });
  };

  sponsorLabel = () => {
    const { isSponsored } = this.props;
    if (!isSponsored) {
      return (
        <View style={styles.sponsorContainer}>
          <Text style={styles.sponsorMessage}>
            You're not sponsored.{'\n'}Please find an app below to sponsor you.
          </Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  render() {
    const { selectedApp } = this.state;
    return (
      <View style={styles.container}>
        <this.sponsorLabel />
        <FlatList
          style={styles.AppsList}
          data={this.props.apps}
          keyExtractor={({ name }, index) => name + index}
          renderItem={({ item }) => (
            <AppCard {...item} handleAction={this.handleAction} />
          )}
        />
        <ActionSheet
          ref={(o) => {
            deleteSheetRef = o;
          }}
          title={`Are you sure you want to delete ${selectedApp}`}
          options={['Delete', 'cancel']}
          cancelButtonIndex={1}
          onPress={(index) => {
            if (index === 0) {
              deleteApp(selectedApp);
            }
          }}
        />
      </View>
    );
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
  sponsorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  sponsorMessage: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#e39f2f',
  },
});

export default connect(({ apps, user }) => ({ ...apps, ...user }))(AppsScreen);
