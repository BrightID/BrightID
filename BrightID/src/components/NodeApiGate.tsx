import { useDispatch, useSelector } from '@/store';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import React, { useEffect, useState } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { NodeApi } from '@/api/brightId';
import { pollOperations } from '@/utils/operations';

export const NodeApiContext = React.createContext(null);

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector<string>((state: State) => state.user.id);
  const secretKey = useSelector<Uint8Array>(
    (state: State) => state.keypair.secretKey,
  );
  const url = useSelector<string>(selectBaseUrl);
  const [api, setApi] = useState<NodeApi | null>(null);
  const dispatch = useDispatch();

  // Create and maintain NodeAPI instance
  useEffect(() => {
    let apiInstance;
    if (id && id.length > 0 && secretKey && secretKey.length > 0) {
      console.log(`Creating API with credentials using ${url}`);
      apiInstance = new NodeApi({ url, id, secretKey });
    } else {
      console.log(`Creating anonymous API using ${url}`);
      apiInstance = new NodeApi({
        url,
        id: undefined,
        secretKey: undefined,
      });
    }
    setApi(apiInstance);
  }, [url, dispatch, id, secretKey]);

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
