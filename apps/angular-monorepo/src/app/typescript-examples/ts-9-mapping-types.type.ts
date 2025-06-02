import { Prettify } from './ts-7-prettify.type';

type ActionShape = {
  login: {
    name: string;
    password: string;
  };
  logout: { reason: string };
  update: { id: string; data: string };
};

// On hover it will be ugly but it works now
// We created new type and added new param as object key
type ActionAsUnion1 = {
  [K in keyof ActionShape]: {
    type: K;
  } & ActionShape[K];
};

// Improvements
// IMPORTANT it Woeks only in VS Code , cause it has computed type calculation
type ActionAsUnion2 = {
  [K in keyof ActionShape]: Prettify<
    {
      type: K;
    } & ActionShape[K]
  >;
}[keyof ActionShape];

function fn(a: ActionAsUnion1, b: ActionAsUnion2) {
  return [a, b];
}
