// https://stackoverflow.com/questions/13613524/get-an-objects-class-name-at-runtime
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
export const nameKey = Symbol('name');

/**
 * To perserve class name though mangling.
 * @example
 * @name('Customer')
 * class Customer {}
 * @param className
 */
export function name(className: string): ClassDecorator {
  return (Reflect as any).metadata(nameKey, className);
}

/**
 * @example
 * const type = Customer;
 * getName(type); // 'Customer'
 * @param type
 */
export function getName(type: Function): string {
  return (Reflect as any).getMetadata(nameKey, type);
}

/**
 * @example
 * const instance = new Customer();
 * getInstanceName(instance); // 'Customer'
 * @param instance
 */
export function getInstanceName(instance: Object): string {
  return (Reflect as any).getMetadata(nameKey, instance.constructor);
}