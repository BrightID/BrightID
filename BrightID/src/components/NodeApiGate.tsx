import { useDispatch, useSelector } from '@/store';
import { selectBaseUrl, setBaseUrl } from '@/reducer/settingsSlice';
import React, { useEffect, useState } from 'react';
import { View, Text, InteractionManager } from 'react-native';
import { NodeApi } from '@/api/brightId';
import { pollOperations } from '@/utils/operations';
import chooseNode from '@/utils/nodeChooser';

export const NodeApiContext = React.createContext(null);
const ProdCandidates = [
  'http://node.brightid.org',
  'http://brightid.idealmoney.io',
  'http://brightid.onehive.org',
  'http://085e67e8aeaf31f0.dyndns.dappnode.io',
  'http://node.topupgifter.com',
  'http://node.lumos.services',
  'http://brightid.daosquare.io',
];
const TestCandidates = ['http://test.brightid.org'];

enum apiGateStates {
  INITIAL,
  SEARCHING_NODE, // currently looking for working node
  NODE_AVAILABLE, // All good, valid node is set
  ERROR_NO_NODE, // Failed to find a working node
}

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector<string>((state: State) => state.user.id);
  const secretKey = useSelector<Uint8Array>(
    (state: State) => state.keypair.secretKey,
  );
  const url = useSelector<string>(selectBaseUrl);
  const [api, setApi] = useState<NodeApi | null>(null);
  const [gateState, setGateState] = useState<apiGateStates>(
    apiGateStates.INITIAL,
  );
  const dispatch = useDispatch();

  // Run nodechooser if no baseUrl is set
  useEffect(() => {
    const runEffect = async () => {
      console.log(`No baseUrl set. Running nodechooser to select backend`);
      setGateState(apiGateStates.SEARCHING_NODE);
      try {
        const fastestUrl = await chooseNode(
          __DEV__ ? TestCandidates : ProdCandidates,
        );
        dispatch(setBaseUrl(fastestUrl));
      } catch (e) {
        // No usable node found :-(
        setGateState(apiGateStates.ERROR_NO_NODE);
      }
    };
    if (!url) {
      runEffect();
    }
  }, [dispatch, url]);

  // Manage NodeAPI instance
  useEffect(() => {
    if (url) {
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
      setGateState(apiGateStates.NODE_AVAILABLE);
      setApi(apiInstance);
    } else {
      setApi(null);
    }
  }, [url, dispatch, id, secretKey]);

  // Manage polling for operations
  useEffect(() => {
    if (api) {
      // subscribe to operations
      const timerId = setInterval(() => {
        InteractionManager.runAfterInteractions(() => {
          pollOperations(api);
        });
      }, 5000);
      console.log(`Started pollOperationsTimer ${timerId}`);

      return () => {
        console.log(`Stop pollOperationsTimer ${timerId}`);
        clearInterval(timerId);
      };
    }
  }, [api]);

  let message: string;
  switch (gateState) {
    case apiGateStates.INITIAL:
    case apiGateStates.SEARCHING_NODE:
      message = 'Selecting node backend...';
      break;
    case apiGateStates.NODE_AVAILABLE:
      message = 'Node found';
      break;
    case apiGateStates.ERROR_NO_NODE:
      message = 'Failed to find a node';
      break;
    default:
      console.log(`Unhandled gateState ${gateState}!`);
  }

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
        <Text>Gatestate: {message}</Text>
      </View>
    );
  }
};

export default NodeApiGate;
