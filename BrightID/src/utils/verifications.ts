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

export const getVerificationsTexts = (verifications: Verification[]) => {
  const texts = [];
  let v = verifications.find((v) => v.name === 'SeedConnected');
  if (v && (v as SeedConnectedVerification).rank > 0) {
    texts.push(`Joined Meets`);
  }
  v = verifications.find((v) => v.name === 'Bitu');
  if (v && (v as BituVerification).score > 0) {
    texts.push(`Bitu ${(v as BituVerification).score}`);
  }
  v = verifications.find((v) => v.name === 'Seed');
  if (v) {
    texts.push('Seed');
  }
  return texts;
};
