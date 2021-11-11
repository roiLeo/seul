export type EntityConstructor<T> = {
  new (...args: any[]): T;
};

export type WhereCondition = {
  string: string;
};
