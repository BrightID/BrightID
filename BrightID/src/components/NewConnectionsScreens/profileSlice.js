import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { selectChannelById } from '@/components/NewConnectionsScreens/channelSlice';
import { decryptData } from '@/utils/cryptoHelper';

const profileAdapter = createEntityAdapter();

/*
  Profile slice contains all profiles in decrypted state

  What is a profile:
  - 'id': unique profileId
  - 'state': state of this profile
  - 'data': {
      'name'
      'photo' (base64-encoded)
      'notificationToken': token that allows pushing notifications to user
    }
 */

const profile_states = {
  INITIAL: 'INITIAL',
  DOWNLOADING: 'DOWNLOADING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
};

// By default, `createEntityAdapter` gives you `{ ids: [], entities: {} }`.
// If you want to track 'loading' or other keys, you would initialize them here:
// `getInitialState({ loading: false, activeRequestId: null })`
const initialState = profileAdapter.getInitialState();

export const fetchProfileById = createAsyncThunk(
  'profiles/fetchProfileById',
  async ({ channelId, profileId }, { getState }) => {
    const url = `http://${channel.ipAddress}/profile/download/${channelId}/${profileId}`;
    console.log(
      `fetching profile ${profileId} for channel ${channelId} from ${url}`,
    );

    try {
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) {
        throw new Error(
          `Profile download returned ${response.status}: ${response.statusText} for url: ${url}`,
        );
      }
      const profileData = await response.json();

      if (profileData && profileData.data) {
        const channel = selectChannelById(getState(), channelId);
        const decryptedObj = decryptData(profileData.data, channel.aesKey);
        console.dir(decryptedObj);
        return decryptedObj;
      }
    } catch (err) {
      err instanceof Error ? console.warn(err.message) : console.log(err);
    }
  },
);

const profileSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    removeProfile: profileAdapter.removeOne,
  },
  extraReducers: {
    [fetchProfileById.pending]: (state, action) => {
      // add the profile in "downloading" state
      state = profileAdapter.addOne(state, {
        id: action.meta.arg.profileId,
        state: profile_states.DOWNLOADING,
        data: {},
      });
    },
    [fetchProfileById.fulfilled]: (state, action) => {
      // update profile data and state
      state.entities[action.payload];
    },
  },
});

export const { addProfile, removeProfile } = profileSlice.actions;

export default profileSlice.reducer;
