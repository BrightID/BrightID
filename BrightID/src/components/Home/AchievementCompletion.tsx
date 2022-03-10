import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ProgressCircle } from 'react-native-svg-charts';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { ORANGE } from '@/theme/colors';

export default function ConnectionsCard(props) {
  const { completedTaskIDs, taskIDs, onPress } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.rowHeader} onPress={onPress}>
        <Text style={styles.header}>Achievement Completion</Text>
        <Material name="arrow-right" size={25} color={ORANGE} />
      </TouchableOpacity>

      <Text style={styles.taskRemaining}>
        {taskIDs - completedTaskIDs} Task Remaining
      </Text>

      <View style={{ marginTop: 30 }}>
        <ProgressCircle
          style={{ height: 200 }}
          progress={completedTaskIDs / taskIDs}
          strokeWidth={10}
          progressColor="#4CDC89"
          startAngle={-Math.PI * 0.5}
          endAngle={Math.PI * 0.5}
        />

        <Text style={styles.percentage}>
          {Math.round((completedTaskIDs / taskIDs) * 100)}%
        </Text>
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
    elevation: 2,
  },
  header: {
    fontFamily: 'Poppins-Bold',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rowDetail: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
  percentage: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
  },
  taskRemaining: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
});
