import React, { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { RootState, useDispatch, useSelector } from '@/store';
import {
  addNodeUrl,
  clearBaseUrl,
  selectAllNodeUrls,
  selectBaseUrl,
  setBaseUrl,
} from '@/reducer/settingsSlice';
import { NodeApi } from '@/api/brightId';
import { pollOperations } from '@/utils/operations';
import chooseNode from '@/utils/nodeChooser';
import { NodeApiGateScreen } from '@/components/NodeApiGateScreen';

type ApiContext = NodeApi | null;

export const NodeApiContext = React.createContext<ApiContext>(null);

export const ApiGateState = {
  INITIAL: 'INITIAL',
  SEARCH_REQUESTED: 'SEARCH_REQUESTED', // should start looking for node
  SEARCHING_NODE: 'SEARCHING', // currently looking for working node
  NODE_AVAILABLE: 'NODE_AVAILABLE', // All good, valid node is set
  ERROR_NO_NODE: 'ERROR_NO_NODE', // Failed to find a working node
} as const;
export type ApiGateState = typeof ApiGateState[keyof typeof ApiGateState];

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const id = useSelector<string>((state: RootState) => state.user.id);
  const secretKey = useSelector<Uint8Array>(
    (state: RootState) => state.keypair.secretKey,
  );
  const url = useSelector<string>(selectBaseUrl);
  const candidates = useSelector(selectAllNodeUrls);
  const [api, setApi] = useState<NodeApi | null>(null);
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [gateState, setGateState] = useState<ApiGateState>(
    ApiGateState.INITIAL,
  );
  const dispatch = useDispatch();

  // Trigger nodechooser when user clicks retry
  const retryHandler = () => {
    // Only allow retry if I'm in error state
    if (gateState === ApiGateState.ERROR_NO_NODE) {
      console.log(`User clicked retry -> triggering search.`);
      setGateState(ApiGateState.SEARCH_REQUESTED);
    }
  };

  // Trigger nodechooser when no url is set
  useEffect(() => {
    if (!url) {
      console.log(`URL is null -> triggering search.`);
      setGateState(ApiGateState.SEARCH_REQUESTED);
    }
  }, [url]);

  // Run nodechooser if requested
  useEffect(() => {
    const runEffect = async () => {
      if (candidates.length === 0) {
        console.log(`No node candidates available`);
        setGateState(ApiGateState.ERROR_NO_NODE);
      } else {
        console.log(`Running nodechooser to select backend`);
        setStartTimestamp(Date.now());
        setGateState(ApiGateState.SEARCHING_NODE);
        try {
          const fastestUrl = await chooseNode(candidates);
          dispatch(setBaseUrl(fastestUrl));
        } catch (e) {
          // No usable node found :-(
          setGateState(ApiGateState.ERROR_NO_NODE);
        } finally {
          setStartTimestamp(0);
        }
      }
    };
    if (gateState === ApiGateState.SEARCH_REQUESTED) {
      runEffect();
    }
  }, [candidates, dispatch, gateState]);

  // Manage NodeAPI instance
  useEffect(() => {
    if (url) {
      let apiInstance: NodeApi;
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

  /* Manually set node url */
  const setNode = async (nodeUrl: string) => {
    try {
      // Check if node is working
      setGateState(ApiGateState.SEARCHING_NODE);
      const url = await chooseNode([nodeUrl]);
      // Add it to node list and set as current node
      dispatch(addNodeUrl(url));
      dispatch(setBaseUrl(url));
    } catch (e) {
      // Node does not work :-(
      setGateState(ApiGateState.ERROR_NO_NODE);
    }
  };

  if (api && gateState === ApiGateState.NODE_AVAILABLE) {
    return (
      <NodeApiContext.Provider value={api}>
        {props.children}
      </NodeApiContext.Provider>
    );
  } else {
    return (
      <NodeApiGateScreen
        gateState={gateState}
        retryHandler={retryHandler}
        startTimestamp={startTimestamp}
      />
    );
  }
};

export default NodeApiGate;
