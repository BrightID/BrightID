import { useDispatch, useSelector } from '@/store';
import { initApiThunk, selectNodeApi } from '@/reducer/settingsSlice';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

const NodeApiGate = (props: React.PropsWithChildren<unknown>) => {
  const api = useSelector(selectNodeApi);
  const dispatch = useDispatch();
  useEffect(() => {
    if (api === undefined) {
      console.log(`Starting api initialization`);
      dispatch(initApiThunk());
    }
  }, [api, dispatch]);

  if (api) {
    return <>{props.children}</>;
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
