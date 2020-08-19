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
    paddingTop: 15,
    paddingRight: 0,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  taskInfo: {
    marginRight: 25,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  title: {
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
  },
  description: {
    fontSize: DEVICE_TYPE === 'large' ? 15 : 12,
  },
  taskStatus: {
    borderRadius: 30,
    width: 30,
    height: 30,
    marginRight: 14,
  },
});

export default TaskCard;
