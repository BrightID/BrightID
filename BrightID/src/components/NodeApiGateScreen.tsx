import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ApiGateState } from '@/components/NodeApiGate';

export const NodeApiGateScreen = ({
  gateState,
  retryHandler,
}: {
  gateState: ApiGateState;
  retryHandler: () => any;
}) => {
  let message: string;
  let retryInfo;
  switch (gateState) {
    case ApiGateState.INITIAL:
    case ApiGateState.SEARCHING_NODE:
      message = 'Selecting node backend...';
      break;
    case ApiGateState.NODE_AVAILABLE:
      message = 'Node found';
      break;
    case ApiGateState.ERROR_NO_NODE:
      message = 'Failed to find a node';
      retryInfo = (
        <TouchableOpacity onPress={retryHandler}>
          <Text>Retry</Text>
        </TouchableOpacity>
      );
      break;
    default:
      console.log(`Unhandled gateState ${gateState}!`);
  }

  return (
    <View>
      <Text>Gatestate: {message}</Text>
      {retryInfo || null}
    </View>
  );
};
