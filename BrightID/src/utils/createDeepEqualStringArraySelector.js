import { createSelectorCreator, defaultMemoize } from 'reselect';
import { isEqual } from 'lodash';

function isArrayOfStrings(value: any): boolean {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}
/*
`DeepEqualStringArraySelector` will use
  - deep equality check for arrays of strings
  - referential equality check for all other inputs.
 */
export const createDeepEqualStringArraySelector = createSelectorCreator(
  defaultMemoize,
  (a, b) => {
    if (isArrayOfStrings(a) && isArrayOfStrings(b)) {
      // got two arrays of strings. Do deep-equal comparison
      return isEqual(a, b);
    } else {
      return a === b;
    }
  },
);
