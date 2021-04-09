import { useDispatch, useSelector } from '@/store';
import { selectBaseUrl, setBaseUrl } from '@/reducer/settingsSlice';
import React, { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { NodeApi } from '@/api/brightId';
import { pollOperations } from '@/utils/operations';
import chooseNode from '@/utils/nodeChooser';
import { NodeApiGateScreen } from '@/components/NodeApiGateScreen';

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
const TestCandidates = ['http://test.brightid.org2'];

export const ApiGateState = {
  INITIAL: 'INITIAL',
  SEARCHING_NODE: 'SEARCHING', // currently looking for working node
  NODE_AVAILABLE: 'NODE_AVAILABLE', // All good, valid node is set
  ERROR_NO_NODE: 'ERROR_NO_NODE', // Failed to find a working node
} as const;
export type ApiGateState = typeof ApiGateState[keyof typeof ApiGateState];

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector<string>((state: State) => state.user.id);
  const secretKey = useSelector<Uint8Array>(
    (state: State) => state.keypair.secretKey,
  );
  const url = useSelector<string>(selectBaseUrl);
  const [api, setApi] = useState<NodeApi | null>(null);
  const [gateState, setGateState] = useState<ApiGateState>(
    ApiGateState.INITIAL,
  );
  const [rerun, setRerun] = useState<boolean>(false);
  const dispatch = useDispatch();

  const retryHandler = () => {
    setRerun(true);
  };

  // Run nodechooser if no baseUrl is set or user triggerd retry
  useEffect(() => {
    const runEffect = async () => {
      console.log(`Running nodechooser to select backend`);
      setGateState(ApiGateState.SEARCHING_NODE);
      setRerun(false);
      try {
        const fastestUrl = await chooseNode(
          __DEV__ ? TestCandidates : ProdCandidates,
        );
        dispatch(setBaseUrl(fastestUrl));
      } catch (e) {
        // No usable node found :-(
        setGateState(ApiGateState.ERROR_NO_NODE);
      }
    };
    if (!url || rerun) {
      runEffect();
    }
  }, [dispatch, rerun, url]);

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
      setGateState(ApiGateState.NODE_AVAILABLE);
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

  if (api) {
    return (
      <NodeApiContext.Provider value={api}>
        {props.children}
      </NodeApiContext.Provider>
    );
  } else {
    return (
      <NodeApiGateScreen gateState={gateState} retryHandler={retryHandler} />
    );
  }
};

export default NodeApiGate;
