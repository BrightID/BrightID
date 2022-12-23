import { Parser, Value } from 'expr-eval';
import { Dictionary } from 'ramda';
import _ from 'lodash';
import { UserTasks } from '@/components/Tasks/UserTasks';

export const isVerified = (
  verifications: Value | Dictionary<any>,
  verification: string,
) => {
  try {
    const expr = Parser.parse(verification);
    for (const v of expr.variables()) {
      if (!verifications[v]) {
        verifications[v] = false;
      }
    }
    return expr.evaluate(verifications);
  } catch (err) {
    console.log(`verification ${verification} can not be evaluated.`, err);
    return false;
  }
};

export const isVerifiedForApp = (
  userVerifications: Verification[],
  appVerifications: string[],
) => {
  let count = 0;
  for (const verification of appVerifications) {
    const verified = isVerified(
      _.keyBy(userVerifications, (v) => v.name),
      verification,
    );
    if (verified) {
      count++;
    }
  }
  return count === appVerifications.length;
};

export const getVerificationPatches = (verifications: Verification[]) => {
  const patches: Array<{ text: string; task?: UserTasksEntry }> = [];
  let v = verifications.find((v) => v.name === 'SeedConnected');
  if (v && (v as SeedConnectedVerification).rank > 0) {
    patches.push({ text: 'Meets' });
  }
  v = verifications.find((v) => v.name === 'Bitu');
  if (v && (v as BituVerification).score > 0) {
    patches.push({
      text: `Bitu ${(v as BituVerification).score}`,
      task: UserTasks.bitu_verification,
    });
  }
  v = verifications.find((v) => v.name === 'Seed');
  if (v) {
    patches.push({ text: 'Seed' });
  }
  return patches;
};

export const getBituReportedByText = (
  bituVerification: BituVerification,
  connections: Connection[],
  item: string,
) => {
  const reportersNames = bituVerification.reportedConnections[item].map(
    (id) => connections.find((c) => c.id === id)?.name,
  );
  const parts = reportersNames.filter((name) => !!name);
  const unknownReportersCount = reportersNames.filter((name) => !name).length;
  if (unknownReportersCount > 0) {
    parts.push(
      `${unknownReportersCount} unkown user${
        unknownReportersCount > 1 ? 's' : ''
      }`,
    );
  }
  // this function is used to convert ['a', 'b', 'c'] to 'a, b and c'
  const joinParts = (a) =>
    [a.slice(0, -1).join(', '), a.slice(-1)[0]].join(
      a.length < 2 ? '' : ' and ',
    );
  return `Reported by ${joinParts(parts)}`;
};
