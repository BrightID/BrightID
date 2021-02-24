// @flow
import {
  RECOVERY_COOLDOWN_DURATION,
  RECOVERY_COOLDOWN_EXEMPTION,
} from '@/utils/constants';

type props = {
  recoveryConnections: connection[],
  connection?: connection,
};

export const calculateCooldownPeriod = ({
  recoveryConnections,
  connection,
}: props) => {
  // no cooldown if setting the first recovery connection
  if (recoveryConnections.length === 0) {
    console.log(`No cooldown as this is the first recovery connection`);
    return 0;
  }

  // no cooldown if connection being changed is older than RECOVERY_COOLDOWN_DURATION
  if (
    connection &&
    Date.now() - connection.createdAt > RECOVERY_COOLDOWN_DURATION
  ) {
    console.log(`No cooldown as connection is older than 7 days`);
    return 0;
  }

  //  no cooldown if recovery connections are set within RECOVERY_COOLDOWN_EXEMPTION
  //  period after connecting with first recovery connection
  let firstRecoveryTimestamp = Date.now();
  for (const recovery of recoveryConnections) {
    if (recovery.createdAt < firstRecoveryTimestamp)
      firstRecoveryTimestamp = recovery.createdAt;
  }
  const initialRecoveryAge = Date.now() - firstRecoveryTimestamp;
  console.log(
    `Oldest recovery connection created at ${firstRecoveryTimestamp}, age: ${initialRecoveryAge}`,
  );
  if (initialRecoveryAge < RECOVERY_COOLDOWN_EXEMPTION) {
    console.log(
      `no cooldown as first recovery connection is younger than 1 day`,
    );
    return 0;
  }

  // if a specific connection was provided, calc the cooldown period based on connection age.
  if (connection) {
    const connectionAge = Date.now() - connection.createdAt;
    const remainingCooldown = RECOVERY_COOLDOWN_DURATION - connectionAge;
    console.log(`remaining cooldown time: ${remainingCooldown}`);
    return remainingCooldown;
  }

  // no special case and no specific connection provided. Just return default cooldown period.
  return RECOVERY_COOLDOWN_DURATION;
};
