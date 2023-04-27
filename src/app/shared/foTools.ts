export enum foNames {
  UNKNOWN = 'unknown',
  AT = '@',
  THIS = 'this',
  SELF = 'self',
  ROOT = 'root',
}

export type Constructable<T> = new (...args: any) => T;
export type ConstructableClass<T> = new (...args: any[]) => {};
export type FuncAny = (...args: any) => any;
export type FuncT<T> = (arg: T) => any;

export function hasKey<O>(obj: O, key: string | number | symbol): key is keyof O {
  return key in obj;
}


class foTools {
  // Speed up calls to hasOwnProperty
  private hasOwnProperty = Object.prototype.hasOwnProperty;

  /**
   * http://stackoverflow.com/questions/6588977/how-to-to-extract-a-javascript-function-from-a-javascript-file
   * @param funct
   */
  getFunctionName(funct: string) {
    let ret = funct.toString(); // do with regx
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret.trim();
  }

  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  generateUUID() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        // tslint:disable-next-line:no-bitwise
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // tslint:disable-next-line:no-bitwise
        return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  asJson(target: any) {
    const result = this.stringify(target);
    return JSON.parse(result);
  }

  formatPrediction(value: string): Number {
    const data = 10000 * parseFloat(value);
    return Math.round(data) / 100
  }

  replaceAll(target: string, search: string, replacement: string) {
    return target.split(search).join(replacement);
  }

  stringify(target: any, func = undefined, deep = 3) {
    function resolveReference(value: any) {
      if (value && value.asReference) {
        return (
          'resolveRef(' +
          value.asReference() +
          ',' +
          value.constructor.name +
          ')'
        );
      }
      return value;
    }
    function resolveCircular(key: any, value: any) {
      switch (key) {
        case 'myParent':
          return resolveReference(value);
        case 'myMembers':
          return value
            ? value.map((item: any) => {
              return resolveReference(item);
            })
            : value;
        case '_lookup':
          return value;
        case '_members':
          return value;
        case 'gridApis':
          return '';
        case 'columnApis':
          return '';
      }
      if (key.startsWith('_')) {
        return;
      }
      // if (this.isCustomLinkName(key)) {
      //    return resolveReference(value);
      // }

      return value;
    }

    return JSON.stringify(target, resolveCircular, deep);
  }

  splitNamespaceType(id: string, primitive?: string) {
    const typeId = id.split('::');
    let result = { namespace: '', name: id };
    if (typeId.length === 2) {
      result = {
        namespace: typeId[0],
        name: typeId[1],
      };
    } else if (primitive) {
      result = {
        namespace: typeId[0],
        name: primitive,
      };
    }
    return result;
  }

  getNamespace(obj: any) {
    let myNamespace = obj.myType ? obj.myType.split('::') : [''];
    myNamespace = myNamespace[0];
    return myNamespace;
  }

  getType(obj: any): string {
    let myType = obj.myType ? obj.myType.split('::') : [''];
    myType = myType.length === 2 ? myType[1] : myType[0];
    return myType;
  }

  namespace(namespace: string, name: string) {
    return `${namespace}::${name}`;
  }

  randomInt(low: number, high: number) {
    return low + Math.floor(Math.random() * (high - low + 1));
  }

  random(low: number, high: number) {
    return low + Math.random() * (high - low);
  }

  randomRGBColor() {
    // tslint:disable-next-line:no-bitwise
    const r = (255 * Math.random()) | 0;
    // tslint:disable-next-line:no-bitwise
    const g = (255 * Math.random()) | 0;
    // tslint:disable-next-line:no-bitwise
    const b = (255 * Math.random()) | 0;
    return `rgb(${r},${g},${b})`;
  }

  randomName() {
    const names = [
      'Llam',
      'Noah',
      'Oliver',
      'Elijah',
      'Lucas',
      'Mason',
      'Henry',
      'Logan',
      'Sebastian',
      'Wyatt',
      'Carter',
      'Isaac',
      'Dylan',
      'Aaron',
    ];
    const index = this.randomInt(0, names.length - 1);
    const result = `${names[index]}_${this.randomInt(0, names.length - 1)}`;
    return result;
  }

  randomThing() {
    const things = [
      'Farmhouse',
      'Barn',
      'Silo',
      'Garage',
      'Box Truck',
      'Yellow House',
      'School',
      'Brick Building',
      'Statue',
    ];
    const index = this.randomInt(0, things.length - 1);
    const result = `${things[index]}_${this.randomInt(0, things.length - 1)}`;
    return result;
  }

  matches(str1: string, str2: string) {
    if (str1 === str2) {
      return true;
    }
    return (
      str1 && str2 && str1.toLocaleLowerCase() === str2.toLocaleLowerCase()
    );
  }

  startsWith(str1: string, str2: string) {
    if (str1 === str2) {
      return true;
    }
    return (
      str1 &&
      str2 &&
      str1.toLocaleLowerCase().startsWith(str2.toLocaleLowerCase())
    );
  }

  endsWith(str1: string, str2: string) {
    if (str1 === str2) {
      return true;
    }
    return (
      str1 &&
      str2 &&
      str1.toLocaleLowerCase().endsWith(str2.toLocaleLowerCase())
    );
  }

  includes(str1: string, str2: string) {
    if (str1.includes(str2) === true) {
      return true;
    }
    return (
      str1 &&
      str2 &&
      str1.toLocaleLowerCase().includes(str2.toLocaleLowerCase())
    );
  }

  capitalizeFirstLetter(str1: string) {
    return str1.charAt(0).toUpperCase() + str1.slice(1);
  }

  capitalize(s: string) {
    return Tools.isEmpty(s) ? s : Tools.capitalizeFirstLetter(s);
  }

  isSelf(ref: any) {
    return (
      this.matches(ref, foNames.AT) ||
      this.matches(ref, foNames.THIS) ||
      this.matches(ref, foNames.SELF)
    );
  }

  isArray(obj: any) {
    if (Array.isArray) {
      return Array.isArray(obj);
    }
    return Object.prototype.toString.call(obj) === '[object Array]'
      ? true
      : false;
  }

  isFunction(obj: any) {
    return typeof obj === 'function';
  }

  isString(obj: any) {
    return typeof obj === 'string';
  }

  isNumber(obj: any) {
    return typeof obj === 'number';
  }

  isDate(obj: any) {
    return obj instanceof Date;
  }

  isObject(obj: any) {
    return obj && typeof obj === 'object'; // prevents typeOf null === 'object'
  }

  isCustomLinkName(key: any) {
    return false;
  }

  isTyped(obj: any) {
    return obj && obj.isInstanceOf;
  }

  isNotEmpty(obj: any): boolean {
    return !this.isEmpty(obj);
  }

  isEmpty(obj: any): boolean {
    // null and undefined are "empty"
    if (!obj || obj == undefined || obj == null || obj == '') {
      return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) {
      return false;
    }
    if (obj.length === 0) {
      return true;
    }

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') {
      return true;
    }

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    // tslint:disable-next-line:prefer-const
    for (let key in obj) {
      if (this.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }

    return true;
  }

  replaceSpaces(str: string) {
    return str.replace(/[\s]/g, '_');
  }

  removeSpaces(str: string) {
    return str.replace(/[\s]/g, '_');
  }

  removeSpecial(str: string) {
    return str.replace(/[^a-zA-Z 0-9]+/g, '');
  }

  toVirtualFolder(str: string) {
    let result = this.removeSpecial(str);
    result = this.removeSpaces(result);
    return result.toLocaleLowerCase();
  }

  applyTemplate(str: string, obj: any) {
    let result = str || '';
    const keys = Object.keys(obj);
    for (const key of keys) {
      const name = '{' + key + '}';
      const value = obj[key];
      result = result.replace(name, value);
    }
    // result = this.removeSpecial(result);
    // result = this.removeSpaces(result);
    return result;
  }

  removeDQ(str: string): string {
    return str.replace(/^"(.*)"$/, '$1');
  }

  unwrap(str: string): string {
    return str.substring(1, str.length - 1);
  }

  wrapDQ(str: string): string {
    return `"${str}"`;
  }

  wrapSQ(str: string): string {
    return `'${str}'`;
  }

  decomposeHostPath(filename: string) {
    let string = filename.toLowerCase();
    string = string.replace('http://', '');
    string = string.replace('https://', '');

    const host = string.split('/')[0];
    const path = string.replace(host, '');
    return {
      fullpath: filename,
      host,
      path,
    };
  }

  extend(target: any, source: any) {
    if (!source) {
      return target;
    }
    // tslint:disable-next-line:prefer-const
    for (let key in source) {
      if (this.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  mixin(target: any, source: any) {
    if (!source) {
      return target;
    }
    if (!target) {
      return source;
    }

    for (const key of source) {
      target[key] = source[key];
    }
    return target;
  }

  mixExact(target: any, source: any) {
    if (!source) {
      return target;
    }
    if (!target) {
      return source;
    }
    for (const key in source) {
      if (foTools.hasOwnProperty.call(target, key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  mixout(target: any, source: any) {
    if (!source) {
      return target;
    }
    if (!target) {
      return source;
    }
    for (const key in source) {
      if (this.hasOwnProperty.call(target, key)) {
        delete target[key];
      }
    }
    return target;
  }

  extract(target: any, keys?: string[]) {
    const spec: any = {};
    // tslint:disable-next-line: no-unused-expression
    keys &&
      keys.forEach((key) => {
        spec[key] = target[key];
      });
    return spec;
  }

  mixMap(target: any, source: any) {
    if (!source) {
      return target;
    }

    const result: any = {};
    for (const key of target) {
      const keyMap = source[key] || key;
      result[keyMap] = target[key];
    }
    return result;
  }

  intersect(target: any, source: any) {
    if (!source) {
      return target;
    }
    if (!target) {
      return source;
    }
    const intersect: any = {};
    for (const key in target) {
      if (this.hasOwnProperty.call(source, key)) {
        intersect[key] = source[key];
      } else {
        intersect[key] = target[key];
      }
    }
    return intersect;
  }

  union(target: any, source: any) {
    const result: any = {};
    if (target) {
      for (const key of target) {
        result[key] = target[key];
      }
    }
    if (source) {
      for (const key of source) {
        result[key] = source[key];
      }
    }
    return result;
  }
  defineValueProperty(target: any, name: string, value: any) {
    Object.defineProperty(target, name, {
      value,
      enumerable: true,
      configurable: true,
    });
    return target;
  }

  defineComputeOnlyProperty(target: any, name: string, func: () => any) {
    // var self = target;
    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      get: func,
    });
    return target;
  }

  defineCalculatedProperty(target: any, name: string, func: () => any) {
    // var self = target;
    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      get: func, // .call(self, self),
      set(value) {
        this[`_${name}`] = value;
      },
    });
    return target;
  }

  getMethods(obj: any) {
    const list: any[] = [];
    for (const m in obj.prototype) {
      if (typeof obj[m] === 'function') {
        list.push(m);
      }
    }
    return list;
  }

  asArray(obj: any, funct?: any) {
    if (this.isArray(obj)) {
      return obj;
    }
    return this.mapOverKeyValue(obj, (key: any, value: any) => {
      return funct ? funct(key, value) : value;
    });
  }

  concatURL(s1: string, s2: string) {
    let first = s1.endsWith('/') ? s1.substring(0, s1.length - 1) : s1;
    let last = s2.startsWith('/') ? s2 : `/${s2}`;
    return `${first}${last}`;
  }

  removeFromEnd(s1: string, s2: string) {
    let result = s1.endsWith(s2) ? s1.substring(0, s1.length - s2.length) : s1;
    return result;
  }

  applyOverKeyValue(obj: any, mapFunc: any) {
    // funct has 2 args.. key,value
    const body: any = {};
    const keys = obj ? Object.keys(obj) : [];
    keys.forEach((key) => {
      if (this.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const result = mapFunc(key, value);
        if (result) {
          body[key] = result;
        }
      }
    });
    return body;
  }

  mapOverKeyValue(obj: any, mapFunc: any): [] {
    // funct has 2 args.. key,value
    const list: any = [];
    const keys = obj ? Object.keys(obj) : [];
    keys.forEach((key) => {
      if (this.hasOwnProperty.call(obj, key)) {
        const value: any = obj[key];
        const result: any = mapFunc(key, value);
        if (result) {
          list.push(result);
        }
      }
    });
    return list;
  }

  forEachKeyValue(obj: any, mapFunc: any) {
    // funct has 2 args.. key,value
    const keys = obj ? Object.keys(obj) : [];
    keys.forEach((key) => {
      if (this.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        mapFunc(key, value);
      }
    });
  }

  findKeyForValue(obj: any, key: any) {
    for (const name in obj) {
      if (this.hasOwnProperty.call(obj, key)) {
        if (obj[name].matches(key)) {
          return name;
        }
      }
    }
    return obj;
  }
  addToListByKey(target: any, key: string, value: any) {
    if (!target[key]) {
      target[key] = [value];
    } else {
      target[key].push(value);
    }
  }

  extractReadWriteKeys(spec: any) {
    const keys: string[] = [];
    Tools.forEachKeyValue(spec, (k: any, v: any) => {
      if (!Tools.isFunction(v)) {
        keys.push(k);
      }
    });
    return keys;
  }

  extractComputedKeys(spec: any) {
    const keys: string[] = [];
    Tools.forEachKeyValue(spec, (k: any, v: any) => {
      if (Tools.isFunction(v)) {
        keys.push(k);
      }
    });
    return keys;
  }

  overrideComputed(obj: any, properties: any) {
    Tools.forEachKeyValue(properties, (key: any, value: any) => {
      try {
        if (Tools.isFunction(value)) {
          Tools.defineCalculatedProperty(obj, key, value);
        } else {
          obj[key] = value;
        }
      } catch (ex) {
        console.log(ex);
      }
    });
  }

  extendComputed(obj: any, properties: any) {
    Tools.forEachKeyValue(properties, (key: any, value: any) => {
      try {
        if (!obj[key]) {
          if (Tools.isFunction(value)) {
            Tools.defineCalculatedProperty(obj, key, value);
          } else {
            obj[key] = value;
          }
        }
      } catch (ex) {
        console.log(ex);
      }
    });
  }

  pluck(name: string) {
    return (x: any) => {
      return x[name];
    };
  }

  distinctItems(list: []) {
    const distinct = {};
    list.forEach((item) => {
      distinct[item] = item;
    });
    return Object.keys(distinct);
  }

  groupBy(pluckBy: any, list: []) {
    const dictionary: any = {};
    list.forEach((item) => {
      const key = pluckBy(item);
      if (!dictionary[key]) {
        dictionary[key] = [];
      }
      dictionary[key].push(item);
    });
    return dictionary;
  }
  mergeGroups(g1: any, g2: any) {
    const dictionary: any = {};
    Object.keys(g1).forEach((key) => {
      const item1 = g1[key];
      const item2 = g2[key];
      if (item2) {
        dictionary[key] = [...item2, ...item1];
      } else {
        dictionary[key] = [...item1];
      }
    });
    return dictionary;
  }

  getNowIsoDate() {
    return (new Date()).toISOString();
  }

  getDeltaSeconds(isoDate: string) {
    const old = new Date(isoDate);
    const now = new Date();
    // const delta = now.getSeconds() - old.getSeconds();
    const delta = (now.getTime() - old.getTime()) / 1000;
    return delta;
}

  now() {
    return (new Date()).getTime();
  }

  getYearYYYY() {
    return (new Date()).getFullYear();
  }

  get doNothing() {
    return () => { };
  }

  isPasteEvent(event: any): boolean {
    return event?.ctrlKey && (event?.key || '').toUpperCase() === 'V';
  }

  getPositiveInteger(number: number): number {
    const value = Math.abs(Math.round(number));
    return value === 0 ? 1 : value;
  }

  padZero(number = 0, targetLength = 3) {
    return `${number}`.padStart(targetLength, '0');
  }

  // add this to new service to dynamicaly load javascript,  maybe over signalR

  // xmlHttpGet(url:string, onComplete, onFailure) {
  //     let xmlHttp = new window.XMLHttpRequest();
  //     xmlHttp.onload = function () {
  //        let result = xmlHttp.responseText;
  //         onComplete && onComplete(result, xmlHttp);
  //     };
  //     try {
  //         xmlHttp.open("GET", url, false);  //this may give chrome some problems
  //         xmlHttp.send(null);
  //     }
  //     catch (ex) {
  //         onFailure && onFailure(ex, xmlHttp);
  //     }
  // }
  // loadAsScript(url:string, onComplete) {
  //     this.xmlHttpGet(url, function (text, xhr) {
  //         if (xhr.status == 200 || xhr.status == 304) {
  //            let head = document.getElementsByTagName("head")[0];
  //            let script = document.createElement('script');
  //             script.innerHTML = text;
  //             head.appendChild(script);
  //             onComplete && onComplete(script);
  //         }
  //     });
  // }
}

export let Tools: foTools = new foTools();
