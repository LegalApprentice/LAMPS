import { spParser } from './sp-parser';
export class spToken {

  private _text: string;
  public isTerminator:boolean = false;

  constructor(text: string = '') {
    this._text = text;
  }

  contains(str: string) {
    return this._text.indexOf(str) != -1;
  }

  isFootnoteRef(): boolean {
    const ref = this.startsWith("{{")  && this.text.endsWith("}}")
    return ref;
  }

  extractFootnote() {
     const list1 = this._text.split('{{')
     const list2 = list1[1].split('}}');
     return list2[0];
}

  public static isSpecial(text:string, i:number=0){
    const str = text[i];

    if (str == '⁰') return true;
    if (str == '¹') return true;
    if (str == '²') return true;
    if (str == '³') return true;
    if (str == '⁴') return true;
    if (str == '⁵') return true;
    if (str == '⁶') return true;
    if (str == '⁷') return true;
    if (str == '⁸') return true;
    if (str == '⁹') return true;

    const val = text.charCodeAt(i);
    if ( val > 255) return true;
    return false;
  }

  get text() {
    return this._text;
  }


  asString(): string {
    return this._text || '';
  }

  removingEndingPeriod(){
    if ( this._text.endsWith('.')) {
      this._text =  this._text.slice(0, -1)
    }
    return this._text;
  }

  private isDigits(str: string): boolean {
    return /^\d+$/.test(str);
  }

  isGrouped(): boolean {
    const grouped = this._text.startsWith("[") || this._text.startsWith("(")
    return grouped;
  }

  isEmpty(): boolean {
    return this._text === '';
  }

  isNumber(): boolean {
    return !this.isEmpty() && this.isDigits(this._text);
  }

  isNull(): boolean {
    if (!this._text || this._text.length === 0) {
      return true;
    }
    return false;
  }

  isWhiteSpace(): boolean {
    return /^\s*$/.test(this._text);
  }

  isNullOrWhiteSpace(): boolean {
    return this.isNull() || this.isWhiteSpace();
  }

  findKeyAttribute(parser: spParser) {
    return parser.isAttributeText(this._text)
  }

  findStandardSection(parser: spParser) {
    return parser.isSectionText(this._text)
  }

  startsWithCapital() {
    if ( !this.isEmpty() ) {
      const cha = this._text[0]
      if ( cha == '(') return false;
      return cha.toUpperCase() === cha;
    }
    return false;
  }



  removeLastChar() {
    const len = this._text.length - 1;
    this._text = this._text.substring(0, len);
  }

  startsWithChar(char: string) {
    return !this.isEmpty() && this._text[0] === char;
  }

  startsWith(str: string) {
    return !this.isEmpty() && this._text.startsWith(str);
  }

  endsWithChar(char: string) {
    const len = this._text.length - 1;
    return !this.isEmpty() && this._text[len] === char;
  }

  endsWith(str: string) {
    return !this.isEmpty() && this._text.endsWith(str);
  }

  append(char: string): spToken {
    this._text = `${this._text}${char}`;
    return this;
  }

  replace(oldString: string, newString: string): spToken {
    this._text = this._text.replace(oldString, newString);
    return this;
  }



  createFootnoteList() {
    const list = Array<string>();

    let last = spToken.isSpecial(this._text,0)
    let found = "" + this._text[0];
    for (var i = 1, n = this._text.length; i < n; i++) {
      let currentCode = this._text.charCodeAt(i);
      let current = spToken.isSpecial(this._text,i)

      let char = this._text[i]
      if (currentCode == 32) {
        found += char;
        list.push(found);
        found = "";
      } else if (char == '.') {
        found += char;
        list.push(found);
        found = "";
      } else if (last != current && current) {
        if (found.length > 0) list.push(found);
        found = char;
      } else if (last != current && !current) {
        if (found.length > 0) list.push(found);
        found = char;
      } else {
        found += char;
      }
      last = current;

    }
    list.push(found);
    //console.log(list)
    return list;
  }


  replaceAll(x: string, y: string) {
    const len = y.length;
    let result = this.asString();
    let found = result.indexOf(x);
    while (found !== -1) {
      result = result.replace(x, y);
      found = result.indexOf(x, found + len);
    }
    this._text = result;
    return result;
  }



}
