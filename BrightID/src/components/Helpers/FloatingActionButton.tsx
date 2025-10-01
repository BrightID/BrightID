import React, { Component } from 'react';
import {
  View,
  Easing,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { ORANGE, WHITE } from '@/theme/colors';

type Props = { testID?: string; onPress: () => void };
type State = {
  offset: Animated.Value;
};
export default class FloatActionButton extends Component<Props, State> {
  hideAnim: Animated.CompositeAnimation;

  showAnim: Animated.CompositeAnimation;

  visible: boolean;

  constructor(props) {
    super(props);
    this.visible = true;
    this.state = {
      offset: new Animated.Value(0),
    };
    this.hideAnim = Animated.timing(this.state.offset, {
      toValue: 150,
      duration: 300,
      useNativeDriver: true,
    });
    this.showAnim = Animated.timing(this.state.offset, {
      toValue: 0,
      // @ts-ignore
      easing: Easing.back(),
      duration: 300,
      useNativeDriver: true,
    });
    this._onPress = this._onPress.bind(this);
  }

  show() {
    if (this.visible) return;
    this.visible = true;
    this.hideAnim.stop();
    this.showAnim.start();
  }

  hide() {
    if (!this.visible) return;
    this.visible = false;
    this.showAnim.stop();
    this.hideAnim.start();
  }

  _onPress = () => {
    this.props.onPress && this.props.onPress();
  };

  render() {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              {
                translateY: this.state.offset,
              },
            ],
          },
        ]}
      >
        <TouchableOpacity testID={this.props.testID} onPress={this._onPress}>
          <View style={styles.circleButton}>
            <MaterialDesignIcons
              name="plus"
              size={36}
              color={WHITE}
              style={{ width: 36, height: 36 }}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 100,
    right: 25,
    bottom: 25,
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    width: 54,
    height: 54,
    borderRadius: 27,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
});
