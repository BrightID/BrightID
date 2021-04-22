// Shim Promise.any() which is not yet available in react native
import any from 'promise.any';
import { NODE_CHOOSER_TIMEOUT_MS } from '@/utils/constants';

any.shim();

/**
 * Returns a promise that
 *  -> Resolves with the baseUrl that is providing the fastest response
 *  -> Rejects if no url is providing a valid answer in time
 * @param nodeUrls String array of baseUrls
 */
const chooseNode = async (nodeUrls: Array<string>) => {
  const promises: Array<Promise<string>> = [];

  // add timeout promise to limit waiting time
  promises.push(
    new Promise((resolve) => {
      setTimeout(resolve, NODE_CHOOSER_TIMEOUT_MS, 'TIMEOUT');
    }),
  );

  // create promise for each candidate
  for (const baseUrl of nodeUrls) {
    promises.push(validateNode(baseUrl));
  }

  // Wait for the first promise to resolve with Promise.any()
  // @ts-ignore: Property 'any' does not exist on type 'PromiseConstructor'
  const winner: string = await Promise.any(promises);

  return new Promise<string>((resolve, reject) => {
    if (winner === 'TIMEOUT') {
      // no node responded within my time limit
      return reject(new Error('No node responded in time'));
    } else {
      console.log(`Nodechooser: Fastest node is ${winner}.`);
      return resolve(winner);
    }
  });
};

/*
  Check if the provided Url points to a working BrightID node.
  Get the response from /brightid/v5/state endpoint and check if the reply
  makes sense.
  TODO: Extend this to also check if the profile service is working
 */
const validateNode = (baseUrl: string) =>
  new Promise<string>((resolve, reject) => {
    const start = Date.now();
    fetch(`${baseUrl}/brightid/v5/state`)
      .then((response) => {
        // network request was okay, now check server response on http level
        if (!response.ok) {
          console.log(
            `Nodechooser: Invalid http response from ${baseUrl}: ${response.status} ${response.statusText}`,
          );
          reject(new Error('Response not ok'));
        } else {
          // Response is fine on http level. Now see if the content is also fine.
          return response.json(); // will throw if response body is not JSON
        }
      })
      .then((json) => {
        // Body contains JSON. Now check if JSON content is acceptable.
        if (validateJsonResponse(json)) {
          const elapsed = Date.now() - start;
          console.log(
            `Nodechooser: Node ${baseUrl} passed all tests after ${elapsed}ms`,
          );
          resolve(baseUrl);
        } else {
          console.log(
            `Nodechooser: Node ${baseUrl} provided unexpected JSON data`,
          );
          reject(new Error('JSON response not valid'));
        }
      })
      .catch((error) => {
        const elapsed = Date.now() - start;
        console.log(`Nodechooser: Node ${baseUrl} failed after ${elapsed}ms.`);
        reject(error);
      });
  });

/**
 * Check if json contains expected content.
 *
 * Expected schema:
 * {
 *   "data": {
 *     "lastProcessedBlock": number,
 *     "verificationsBlock": number,
 *     "initOp": number,
 *     "sentOp": number,
 *     "verificationsHashes": object
 *   }
 * }
 *
 * @param json
 */
const expectedRootKey = 'data';
const expectedBodyKeys = [
  'lastProcessedBlock',
  'verificationsBlock',
  'initOp',
  'sentOp',
  'verificationsHashes',
];

const validateJsonResponse = (json) => {
  const body = json[expectedRootKey];
  if (!body) {
    throw new Error(`Missing rootkey ${expectedRootKey}`);
  }
  const keys = Object.keys(body);
  for (const key of expectedBodyKeys) {
    if (keys.indexOf(key) === -1) {
      throw new Error(`Missing bodykey ${key}`);
    }
  }
  return true;
};

export default chooseNode;
