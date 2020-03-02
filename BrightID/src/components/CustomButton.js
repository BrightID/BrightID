// @flow

import * as React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  type:
    | 'basic'
    | 'default'
    | 'primary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger',
  title: string,
  onPress: func,
};

class CustomButton extends React.Component<Props> {
  render() {
    let { title, onPress, type } = this.props;
    let containerStyle = type + '-container';
    let titleStyle = type + '-title';
    return (
      <View>
        <TouchableOpacity
          style={[styles['global-container'], styles[containerStyle]]}
          onPress={onPress}
        >
          <Text style={[styles['global-title'], styles[titleStyle]]}>{title}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

CustomButton.defaultProps = {
  type: 'primary',
};

const styles = StyleSheet.create({
  'global-container': {
    backgroundColor: '#428BE5',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 9,
    marginTop: 22,
  },
  'global-title': {
    fontFamily: 'ApexNew-Medium',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  'basic-container': { backgroundColor: '#ddd' },
  'basic-title': { color: 'black' },
  'default-container': {
    backgroundColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  'default-title': { color: 'black' },
  'primary-container': {},
  'primary-title': {},
  'success-container': { backgroundColor: '#5db85b' },
  'success-title': {},
  'info-container': { backgroundColor: '#5bc0de' },
  'info-title': {},
  'warning-container': { backgroundColor: '#f0ad4e' },
  'warning-title': {},
  'danger-container': { backgroundColor: '#d9534f' },
  'danger-title': {},
});

export default CustomButton;
