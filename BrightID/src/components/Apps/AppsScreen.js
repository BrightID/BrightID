// @flow

import * as React from 'react';
import { Linking, StyleSheet, View, FlatList, Text } from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';
import EmptyList from '@/components/Helpers/EmptyList';
import AppCard from './AppCard';
import { handleAppContext, deleteApp } from './model';

let deleteSheetRef = '';

type State = {
  selectedApp: string,
};

export class AppsScreen extends React.Component<Prop, State> {
  deleteSheetRef: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedApp: '',
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    navigation.addListener('focus', async () => {
      this.handleDeepLink();
      Linking.addEventListener('url', this.handleDeepLink);
    });
    navigation.addListener('blur', async () => {
      Linking.removeEventListener('url', this.handleDeepLink);
    });
  }

  handleDeepLink = () => {
    const { route, navigation } = this.props;
    console.log('params', route.params);
    if (route.params?.context) {
      handleAppContext(route.params);
    }
    // reset params
    navigation.setParams({
      baseUrl: '',
      context: '',
      contextId: '',
    });
  };

  handleAction = (selectedApp: string) => () => {
    this.setState({ selectedApp }, () => {
      if (deleteSheetRef) deleteSheetRef.show();
    });
  };

  sponsorLabel = () => {
    const { isSponsored, apps } = this.props;
    if (!isSponsored && apps.length > 0) {
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
    const { apps } = this.props;
    const { selectedApp } = this.state;
    return (
      <View style={styles.container}>
        <this.sponsorLabel />
        <FlatList
          data={apps}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={({ name }, index) => name + index}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <AppCard {...item} handleAction={this.handleAction} />
          )}
          ListEmptyComponent={<EmptyList title="No Apps" iconType="flask" />}
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
    height: '100%',
  },
  centerItem: {
    alignItems: 'center',
    justifyContent: 'center',
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
