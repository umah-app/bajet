import _xs from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';

/** @type {typeof import('xstream').Stream} */
const xs = _xs.default || _xs;

export default class OrbitDBDocumentStoreSource {
  /**
   * @param {Promise<import('orbit-db-docstore')>} dbPromise
   */
  constructor(dbPromise) {
    this.dbPromise = dbPromise;
  }

  put(doc) {
    return {
      dbPromise: this.dbPromise,
      operation: 'put',
      operationArgs: [
        doc,
      ],
    };
  }

  get(key) {
    const docs$ = xs.create({
      start: async (listener) => {
        const db = await this.dbPromise;

        await db.load();
        listener.next(db.get(key));
      },
      stop: () => {},
    });

    return adapt(docs$);
  }

  query(mapper) {
    const docs$ = xs.create({
      start: async (listener) => {
        const db = await this.dbPromise;

        db.events.on('write', (_address, _entry, _heads) => {
          listener.next(db.query(mapper));
        });
        db.events.on('replicated', (_address) => {
          listener.next(db.query(mapper));
        });

        await db.load();
        listener.next(db.query(mapper));
      },
      stop: () => {},
    });

    return adapt(docs$);
  }

  del(key) {
    return {
      dbPromise: this.dbPromise,
      operation: 'del',
      operationArgs: [
        key,
      ],
    };
  }
}
