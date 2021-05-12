import _xs from 'xstream';
import { adapt } from '@cycle/run/lib/adapt';

/** @type {typeof import('xstream').Stream} */
const xs = _xs.default || _xs;

export default class OrbitDBFeedStoreSource {
  /**
   * @param {Promise<import('orbit-db-feedstore')>} dbPromise
   */
  constructor(dbPromise) {
    this.dbPromise = dbPromise;
  }

  add(data) {
    return {
      dbPromise: this.dbPromise,
      operation: 'add',
      operationArgs: [
        data,
      ],
    };
  }

  iterator(options) {
    const iterator$ = xs.create({
      start: async (listener) => {
        const db = await this.dbPromise;

        db.events.on('write', (_address, _entry, _heads) => {
          listener.next(db.iterator(options));
        });
        db.events.on('replicated', (_address) => {
          listener.next(db.iterator(options));
        });

        await db.load();
        listener.next(db.iterator(options));
      },
      stop: () => {},
    });

    return adapt(iterator$);
  }
}
