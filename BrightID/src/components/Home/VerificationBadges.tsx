import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE } from '@/theme/colors';

export default function VerificationBadges(props) {
  const color = props.active ? ORANGE : 'grey';
  const icon = props.active ? 'check-circle' : 'close-circle';
  // switch (props.status) {
  //   case 'Meets':
  //   case 'Bitu':
  //   case 'Seeds':
  //     color = ORANGE;
  //     icon = 'check-circle';
  //     break;
  //   default:
  //     color = 'grey';
  //     icon = 'close-circle';
  // }

  return (
    <TouchableOpacity
      key={props.key}
      onPress={props.onPress}
      style={[styles.container, { borderColor: color }]}
    >
      <Material name={icon} color={color} size={15} />
      <Text key={props.key} style={[styles.label, { color }]}>
        {props.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderBottomRightRadius: 15,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
    marginLeft: 5,
  },
});
