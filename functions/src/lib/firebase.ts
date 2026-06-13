import * as admin from 'firebase-admin';
import { AsyncLocalStorage } from 'async_hooks';
import {
  onCall as firebaseOnCall,
  CallableRequest,
  CallableOptions,
  CallableFunction,
} from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

if (!admin.apps.length) {
  admin.initializeApp();
}

export const storage = new AsyncLocalStorage<{ origin?: string }>();

const defaultDb = getFirestore();

// Proxy Firestore to dynamically route requests based on client origin
export const db = new Proxy(defaultDb, {
  get(target, prop, receiver) {
    const store = storage.getStore();
    const origin = store?.origin || '';
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const activeDb = isLocal ? getFirestore(admin.app(), 'dev-db') : defaultDb;

    const value = Reflect.get(activeDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(activeDb);
    }
    return value;
  },
});

// Custom onCall wrapper to populate AsyncLocalStorage with request origin
export function onCall<T = unknown, Return = unknown>(
  handler: (request: CallableRequest<T>) => Return | Promise<Return>
): CallableFunction<T, Return extends Promise<unknown> ? Return : Promise<Return>>;

export function onCall<T = unknown, Return = unknown>(
  opts: CallableOptions<T>,
  handler: (request: CallableRequest<T>) => Return | Promise<Return>
): CallableFunction<T, Return extends Promise<unknown> ? Return : Promise<Return>>;

export function onCall<T = unknown, Return = unknown>(
  optsOrHandler: CallableOptions<T> | ((request: CallableRequest<T>) => Return | Promise<Return>),
  handler?: (request: CallableRequest<T>) => Return | Promise<Return>
): unknown {
  if (typeof optsOrHandler === 'function') {
    const originalHandler = optsOrHandler;
    return firebaseOnCall((request) => {
      const origin =
        (request.rawRequest?.headers?.origin as string) ||
        (request.rawRequest?.headers?.referer as string) ||
        '';
      return storage.run({ origin }, () => originalHandler(request));
    });
  }

  const opts = optsOrHandler;
  const originalHandler = handler!;
  return firebaseOnCall(opts, (request) => {
    const origin =
      (request.rawRequest?.headers?.origin as string) ||
      (request.rawRequest?.headers?.referer as string) ||
      '';
    return storage.run({ origin }, () => originalHandler(request));
  });
}
