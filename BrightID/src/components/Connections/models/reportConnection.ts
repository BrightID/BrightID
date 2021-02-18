import api from '@/api/brightId';
import { deleteConnection } from '@/actions';
import { backupUser } from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import { connection_levels } from '@/utils/constants';

export const reportConnection = ({
  id,
  reason,
}: {
  id: string;
  reason: string;
}) => async (dispatch: Dispatch, getState: GetState) => {
  try {
    const {
      user: { id: brightId, backupCompleted },
    } = getState();

    // Change connection to REPORTED level
    await api.addConnection(
      brightId,
      id,
      connection_levels.REPORTED,
      Date.now(),
      reason,
    );
    // remove connection from local storage
    dispatch(deleteConnection(id));
    if (backupCompleted) {
      await dispatch(backupUser());
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
