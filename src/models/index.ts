import config from '../config';

let store: any = null;

if (config.database.useInMemory) {
  const { store: inMemoryStore } = await import('./store');

  const wrap = (fn: Function) => async (...args: any[]) => Promise.resolve(fn(...args));

  store = {
    getUserByEmail: wrap(inMemoryStore.getUserByEmail.bind(inMemoryStore)),
    createUser: wrap(inMemoryStore.createUser.bind(inMemoryStore)),
    saveOTP: wrap(inMemoryStore.saveOTP.bind(inMemoryStore)),
    getOTPByEmail: wrap(inMemoryStore.getOTPByEmail.bind(inMemoryStore)),
    verifyOTP: wrap(inMemoryStore.verifyOTP.bind(inMemoryStore)),
    deleteOTPByEmail: wrap(inMemoryStore.deleteOTPByEmail.bind(inMemoryStore)),
    createSession: wrap(inMemoryStore.createSession.bind(inMemoryStore)),
    getSessionById: wrap(inMemoryStore.getSessionById.bind(inMemoryStore)),
    deleteSession: wrap(inMemoryStore.deleteSession.bind(inMemoryStore)),
    deleteAllSessionsByEmail: wrap(inMemoryStore.deleteAllSessionsByEmail.bind(inMemoryStore)),
    cleanupExpiredRecords: wrap(inMemoryStore.cleanupExpiredRecords.bind(inMemoryStore)),
    getStats: wrap(inMemoryStore.getStats.bind(inMemoryStore)),
  };
} else {
  const mongoStore = await import('./mongoStore');
  store = mongoStore.default;
}

export { store };
export default store;
