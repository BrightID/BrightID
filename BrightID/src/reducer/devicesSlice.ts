import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  createSelector
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

const devicesAdapter = createEntityAdapter<Device>({
  selectId: (device) => device.signingKey,
});

const devicesSlice = createSlice({
  name: 'devices',
  initialState: devicesAdapter.getInitialState(),
  reducers: {
    addDevice: devicesAdapter.upsertOne,
    removeDevice: devicesAdapter.removeOne,
    setActiveDevices: (state, action: PayloadAction<string[]>) => {
      console.log('updating devices based on server state');
      devicesAdapter.updateMany(state,
        state.ids.map((signingKey: string) => {
          const active = action.payload.indexOf(signingKey) > -1;
          return { id: signingKey, changes: { active } };
        }),
      );
      devicesAdapter.upsertMany(state, action.payload.map((signingKey) => {
        return { signingKey: signingKey, active: true }
      }));
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return devicesAdapter.getInitialState();
    },
  },
});

// Export channel actions
export const {
  addDevice,
  removeDevice,
  setActiveDevices,
} = devicesSlice.actions;

// export selectors
export const {
  selectAll: selectAllDevices,
} = devicesAdapter.getSelectors((state: State) => state.devices);

export const selectActiveDevices = createSelector(
  selectAllDevices,
  (devices) => {
    return devices.filter((d) => d?.active);
  },
);

// Export reducer
export default devicesSlice.reducer;
