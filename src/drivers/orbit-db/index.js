import IPFS from 'ipfs/dist/index.min.js';
import OrbitDB from 'orbit-db';

import OrbitDBSource from './OrbitDBSource.js';

async function createInstance(ipfsOptions, options) {
  const ipfs = await IPFS.create(ipfsOptions);

  return OrbitDB.createInstance(ipfs, options);
}

export function makeOrbitDBDriver(ipfsOptions, options) {
  const orbitdbPromise = createInstance(ipfsOptions, options);

  function orbitdbDriver(operation$) {
    operation$.addListener({
      next: async ({ dbPromise, operation, operationArgs }) => {
        const db = await dbPromise;

        await db.load();
        db[operation](...operationArgs);
      },
      error: () => {},
      complete: () => {},
    });

    return new OrbitDBSource(orbitdbPromise);
  }

  return orbitdbDriver;
}

export {
  OrbitDBSource,
};
