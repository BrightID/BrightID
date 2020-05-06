import React, { Component } from 'react';
import {
  View,
  Easing,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

const ICON_COLOR = '#fff';
const ICON_SIZE = 36;
const BACKGROUND_COLOR = '#f98961';

export default class FloatActionButton extends Component {
  constructor(props) {
    super(props);
    this.visible = true;
    this.state = {
      offset: new Animated.Value(0),
    };
    this.hideAnim = Animated.timing(this.state.offset, {
      toValue: 150,
      duration: 300,
    });
    this.showAnim = Animated.timing(this.state.offset, {
      toValue: 0,
      easing: Easing.back(),
      duration: 300,
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
        <TouchableOpacity onPress={this._onPress}>
          <View style={styles.circleButton}>
            <Material
              name="plus"
              size={ICON_SIZE}
              color={ICON_COLOR}
              style={{ width: ICON_SIZE, height: ICON_SIZE }}
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
    backgroundColor: BACKGROUND_COLOR,
    width: 54,
    height: 54,
    borderRadius: 27,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
});
