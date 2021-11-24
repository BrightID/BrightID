import { Parser, Value } from 'expr-eval';

export const isVerified = (verifications: Value, verification: string) => {
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
