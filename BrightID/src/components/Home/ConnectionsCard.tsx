import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { ORANGE } from '@/theme/colors';

export default function ConnectionsCard(props) {
  const { onPress } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader} onPress={onPress}>
        <Text style={{ fontFamily: 'Poppins-Bold' }}>Connections</Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <View
        style={{
          height: 90,
          width: 90,
          // backgroundColor: 'black',
          marginBottom: 10,
          alignSelf: 'center',
        }}
      >
        {/* <Svg width={400} height={100}>
          <Path fill="grey" stroke="#DDDDDD" strokeWidth={1} {...{ d }} />
        </Svg> */}
      </View>

      <View style={styles.rowHeader}>
        <View style={styles.rowDetail}>
          <Text style={styles.alreadyKnowLabel}>😎 Already know</Text>
          <Text style={styles.scoreLabel}>2</Text>
        </View>
        <View style={{ width: 15 }} />
        <View style={styles.rowDetail}>
          <Text style={styles.recoveryLabel}>🔐 Recovery</Text>
          <Text style={styles.scoreLabel}>2</Text>
        </View>
      </View>

      <View style={styles.rowHeader}>
        <View style={styles.rowDetail}>
          <Text style={styles.justMetLabel}>👋 Just Met</Text>
          <Text style={styles.scoreLabel}>2</Text>
        </View>
        <View style={{ width: 15 }} />
        <View style={styles.rowDetail}>
          <Text style={styles.suspiciousLabel}>🤔 Suspicious</Text>
          <Text style={styles.scoreLabel}>2</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 330,
    height: 222,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 1, 10)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowDetail: {
    flex: 1,
    marginLeft: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alreadyKnowLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#4EC580',
  },
  justMetLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFD037',
  },
  recoveryLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#2185D0',
  },
  suspiciousLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#ED1B24',
  },
  scoreLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
});
