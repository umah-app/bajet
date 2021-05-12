import hash from 'object-hash';

import OrbitDBDocumentStoreSource from './OrbitDBDocumentStoreSource.js';
import OrbitDBFeedStoreSource from './OrbitDBFeedStoreSource.js';

const databases = new Map();

/**
 * @param {Promise<import('orbit-db')>} orbitdbPromise
 */
async function openDatabase(orbitdbPromise, address, type, options) {
  const orbitdb = await orbitdbPromise;

  const key = hash({
    address,
    type,
    options,
  });
  let dbPromise = databases.get(key);
  if (!dbPromise) {
    dbPromise = orbitdb.open(address, {
      ...options,
      create: true,
      type,
    });

    databases.set(key, dbPromise);
  }

  return dbPromise;
}

export default class OrbitDBSource {
  /**
   * @param {Promise<import('orbit-db')>} orbitdbPromise
   */
  constructor(orbitdbPromise) {
    this.orbitdbPromise = orbitdbPromise;
  }

  docs(address, options) {
    return new OrbitDBDocumentStoreSource(openDatabase(this.orbitdbPromise, address, 'docstore', options));
  }

  feed(address, options) {
    return new OrbitDBFeedStoreSource(openDatabase(this.orbitdbPromise, address, 'feed', options));
  }
}
