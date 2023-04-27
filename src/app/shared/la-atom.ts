export type classProxy<T> = new (...args: any) => T;

export class LaAtom {

  constructor(properties?: any) {
    properties && this.override(properties);
  }

  override(data?: any) {
    data && Object.keys(data).forEach(key => {
      this[key] = data[key];
    });
  }

  asJson() {
    return {}
  }
}
