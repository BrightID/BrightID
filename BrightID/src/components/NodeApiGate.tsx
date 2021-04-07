import { useDispatch, useSelector } from '@/store';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import React, { useEffect, useState } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { NodeApi } from '@/api/brightId';
import { pollOperations } from '@/utils/operations';

export const NodeApiContext = React.createContext(null);

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector((state: State) => state.user.id);
  const secretKey = useSelector((state: State) => state.keypair.secretKey);
  const baseUrl = useSelector(selectBaseUrl);
  const [api, setApi] = useState(undefined);
  const dispatch = useDispatch();

  // Maintain NodeAPI instance
  useEffect(() => {
    console.log(`Creating API using ${baseUrl}`);
    const apiInstance = new NodeApi({ url: baseUrl, id, secretKey });
    setApi(apiInstance);
  }, [baseUrl, dispatch, id, secretKey]);

  useEffect(() => {
    // subscribe to operations
    const timerId = setInterval(() => {
      InteractionManager.runAfterInteractions(() => {
        pollOperations(api);
      });
    }, 5000);

    return () => {
      clearInterval(timerId);
    };
  }, [api]);

  if (api) {
    return (
      <NodeApiContext.Provider value={api}>
        {props.children}
      </NodeApiContext.Provider>
    );
  } else {
    // TODO: waiting screen etc.
    return (
      <View>
        <Text>Waiting for API</Text>
      </View>
    );
  }
};

export default NodeApiGate;
