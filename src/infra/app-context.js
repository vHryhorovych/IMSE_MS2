const INITIAL_CONTEXT = {
  db: 'pg',
};

export class AppContext {
  static #context = INITIAL_CONTEXT;

  static set(key, value) {
    this.#context[key] = value;
  }

  static get(key) {
    return this.#context[key];
  }
}
