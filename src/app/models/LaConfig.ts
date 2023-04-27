import { LaAtom } from '@app/shared';




export class LaConfig extends LaAtom {
  treeRoot: any;
  globalExceptions: Array<string>;
  globalSplitters: Array<string>;
  keyAttributes: any;
  standardSections: any;
  index!: string;

  ExceptionDictionary: any;

  constructor(properties?: any) {
    super(properties);

    this.globalSplitters = properties.globalSplitters;
    this.globalExceptions = properties.globalExceptions;
    this.ExceptionDictionary = this.buildExceptionDictionary(this.globalExceptions);

    // if (this.index) {
    //   this.readIndex();
    // }
  }



  // readIndex() {
  //   const sourceFile = `${process.cwd()}\\${this.index}`;
  //   const data = fs.readFileSync(sourceFile, { encoding: 'utf-8' });

  //   const text = data.toString();
  //   const list = text.split('\r\n');
  //   for (var i = 0; i < list.length; i++) {
  //     const item = list[i].trim();

  //     if (item.length > 0) {
  //       this.standardSections[item] = item;
  //     }
  //   }
  // }

  buildExceptionDictionary(list: Array<string>) {
    const exDic: any = {};
    const exRev: any = {};

    list.forEach(key => {
      const val = key.replace(/\./g, '@!');
      exDic[key] = val;
      exRev[val] = key;
    });
    return { exDic, exRev };
  }

}
