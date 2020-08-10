// @flow

import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { DEVICE_TYPE } from '@/utils/constants';

type TaskCardProps = {
  id: string,
  title: string,
  description: string,
  fulfilled: boolean,
};

function TaskCard(props: TaskCardProps) {
  const { title, description, fulfilled } = props;

  return (
    <View style={styles.container}>
      <View style={styles.taskInfo}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.taskStatus}>{fulfilled ? 'OK' : 'NOK'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  taskInfo: {
    marginRight: 25,
    flex: 1,
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  title: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  description: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  taskStatus: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginRight: 14,
  },
});

export default TaskCard;
