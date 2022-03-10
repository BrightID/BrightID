import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { PieChart } from 'react-native-svg-charts';
import { ORANGE } from '@/theme/colors';
import { connection_levels } from '@/utils/constants';

export default function ConnectionsCard(props) {
  const { onPress, connections = [] } = props;

  const alreadyKnowConnection = connections.filter(
    (conn) => conn?.level === connection_levels.ALREADY_KNOWN,
  ).length;
  const justMetConnection = connections.filter(
    (conn) => conn?.level === connection_levels.JUST_MET,
  ).length;
  const recoveryConnection = connections.filter(
    (conn) => conn?.level === connection_levels.RECOVERY,
  ).length;
  const suspicousConnection = connections.filter(
    (conn) => conn?.level === connection_levels.SUSPICIOUS,
  ).length;

  const data = [
    {
      key: 1,
      amount: alreadyKnowConnection,
      svg: { fill: '#4EC580' },
    },
    {
      key: 2,
      amount: justMetConnection,
      svg: { fill: '#FFD037' },
    },
    {
      key: 3,
      amount: recoveryConnection,
      svg: { fill: '#2185D0' },
    },
    {
      key: 4,
      amount: suspicousConnection,
      svg: { fill: '#ED1B24' },
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader} onPress={onPress}>
        <Text style={{ fontFamily: 'Poppins-Bold' }}>Connections</Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <View style={styles.chartContainer}>
        <PieChart
          style={styles.pieChart}
          valueAccessor={({ item }) => item.amount}
          data={data}
          spacing={0}
          innerRadius="70%"
          outerRadius="95%"
          padAngle={0}
        />
        <View style={styles.chartLabelContainer}>
          <Text style={styles.connectionTotal}>{connections.length}</Text>
          <Text style={styles.connection}>Connections</Text>
        </View>
      </View>

      <View style={styles.rowHeader}>
        <View style={styles.rowDetail}>
          <Text style={styles.alreadyKnowLabel}>😎 Already know</Text>
          <Text style={styles.scoreLabel}>{alreadyKnowConnection}</Text>
        </View>
        <View style={{ width: 15 }} />
        <View style={styles.rowDetail}>
          <Text style={styles.recoveryLabel}>🔐 Recovery</Text>
          <Text style={styles.scoreLabel}>{recoveryConnection}</Text>
        </View>
      </View>

      <View style={styles.rowHeader}>
        <View style={styles.rowDetail}>
          <Text style={styles.justMetLabel}>👋 Just Met</Text>
          <Text style={styles.scoreLabel}>{justMetConnection}</Text>
        </View>
        <View style={{ width: 15 }} />
        <View style={styles.rowDetail}>
          <Text style={styles.suspiciousLabel}>🤔 Suspicious</Text>
          <Text style={styles.scoreLabel}>{suspicousConnection}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 330,
    height: 250,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    ...Platform.select({
      android: { shadowColor: 'rgba(0, 0, 0, 1)' },
      ios: { shadowColor: 'rgba(0, 0, 0, 0.2)' },
    }),
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
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  pieChart: {
    height: 115,
    width: 115,
  },
  chartLabelContainer: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionTotal: {
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
  },
  connection: {
    fontFamily: 'Poppins-Medium',
    fontSize: 9,
  },
});
