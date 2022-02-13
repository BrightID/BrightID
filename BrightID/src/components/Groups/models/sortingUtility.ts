export const compareCreatedDesc = (groupA: Group, groupB: Group) => {
  return groupB.timestamp - groupA.timestamp;
};
