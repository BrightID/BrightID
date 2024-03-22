import React from 'react';
import { NodeApiGateScreen } from '@/components/NodeApiGateScreen';
import { ApiGateState, useNodeApiContext } from '@/context/NodeApiContext';

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const { url, api, gateState } = useNodeApiContext();
  if (url && api && gateState === ApiGateState.NODE_AVAILABLE) {
    return <>{props.children}</>;
  } else {
    return <NodeApiGateScreen />;
  }
};

export default NodeApiGate;
