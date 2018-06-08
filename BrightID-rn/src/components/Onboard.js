// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import MaintainPrivacy from './onboardingScreens/MaintainPrivacy';

/**
 * Initial Onboarding screen of BrightID
 * Uses react-native-snap-carousel for displaying privacy and other notices
 */

type Props = {
  navigation: { navigate: Function },
};
type State = {
  entries: Array<React.Element<typeof MaintainPrivacy>>,
  activeSlide: number,
};

class Onboard extends React.Component<Props, State> {
  static navigationOptions = {
    title: '',
    headerBackground: '',
    headerStyle: {
      borderBottomWidth: 0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      entries: [
        <MaintainPrivacy key={1} />,
        <MaintainPrivacy key={2} />,
        <MaintainPrivacy key={3} />,
        <MaintainPrivacy key={4} />,
      ],
      activeSlide: 0,
    };
  }

  pagination() {
    const { entries, activeSlide } = this.state;
    return (
      <Pagination
        dotsLength={entries.length}
        activeDotIndex={activeSlide}
        containerStyle={styles.pagination}
        dotStyle={{
          width: 7,
          height: 7,
          borderRadius: 3.5,
          marginHorizontal: 8,
          backgroundColor: '#333',
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={1}
      />
    );
  }
  renderItem = ({ item, index }) => (
    <View key={index} style={styles.onboardingScreens}>
      {item}
    </View>
  );
  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 471 }}>
          <Carousel
            data={this.state.entries}
            renderItem={this.renderItem}
            layout="default"
            sliderWidth={340}
            itemWidth={340}
            onSnapToItem={index => this.setState({ activeSlide: index })}
          />
        </View>
        <View style={styles.center}>{this.pagination()}</View>
        <View style={styles.center}>
          <TouchableOpacity
            onPress={() => this.props.navigation.navigate('SignUp')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center"
  },
  onboardingScreens: {
    height: 476,
    width: '100%',
  },
  pagination: {
    flex: 1,
    alignSelf: 'center',
  },
  button: {
    width: 300,
    // height: 48,
    borderWidth: 1,
    borderColor: '#4990e2',
    paddingTop: 13,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'ApexNew-Medium',
    color: '#4990e2',
    fontSize: 18,
    fontWeight: 'bold',
    // marginTop: 13,
    // marginBottom: 12
  },
});

export default connect(null)(Onboard);
