import { spBuffer } from './sp-buffer';
import { spToken } from './sp-token';
import { spSentence } from './sp-sentence';
import { spParagraph } from './sp-paragraph';
import { spConfig } from './sp-config';

import { LaSentence } from '../models';
import { spSection } from './sp-section';
import { spDocument } from './sp-document';



export const splitFlag = '###';
function enhanceSplitter(list: Array<string>) {
  const result = list.map(item => {
    return `${item}${splitFlag}`;
  });
  return result;
}


export class spParser {

  private _buffer!: spBuffer;
  private _config: spConfig;


  constructor(config?: spConfig) {
    this._config = config;
  }

  setBuffer(text: string) {
    this._buffer = new spBuffer(text);
  }

  getChar() {
    return this._buffer.getChar();
  }

  peekChar(lookAhead: number = 0) {
    return this._buffer.peekChar(lookAhead);
  }

  advanceChar(lookAhead: number = 0) {
    return this._buffer.advanceChar(lookAhead);
  }

  readNestedUntil(char: any) {
    const max = 1000;
    let result = '';
    //console.log('start read nested', char)

    if (char === '[') {
      result = this.readUntil(char, ']', max);
    } else if (char === '(') {
      result = this.readUntil(char, ')', max);
    } else if (char === '"') {
      result = this.readUntil(char, '"', max);
    }
    result = result.trim();
    //console.log('end read nested', result)
    return result;
  }

  readUntil(source:string, until: string, max:number) {
    let count = 0
    let char = this.getChar();
    let result = '';
    if ( !char ) {
      return result;
    }

    result += char;
    char = this.getChar();

    while (char && char !== until && count < max) {
      if (char === '[' || char === '(' || char === '"' ) {
        result += char;
        //ok, now we have a recursion problem
        const extra = this.readNestedUntil(char);
        result += extra;
      } else {
        result += char;
      }

      char = this.getChar();
      count++;

      if ( count == max ) {
        console.log(`------------------------------------------${max}`)
        console.log(`Cound not find character ${until}`)
        console.log(`error: ${result}`)
        console.log(`------------------------------------------`)
      }
    }


    result += until;
    //console.log(`until found |${until}|`)
    return result;
  }

  private isNull(str: string): boolean {
    if (!str || str.length === 0) {
      return true;
    }
    return false;
  }

  private isWhiteSpace(str: string): boolean {
    return /^\s*$/.test(str);
  }

  private isDigit(str: string): boolean {
    return /^\d+$/.test(str);
  }

  private isCapital(str: string): boolean {
    return /[A-Z]/.test(str);
  }

  private isNullOrWhiteSpace(str: string): boolean {
    return this.isNull(str) || this.isWhiteSpace(str);
  }



  public isSectionText(text: string, maxindex:number= 30) {
    const keys = Object.keys(this._config?.standardSections);
   // console.log(keys)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (text && text.includes(key) &&  text.indexOf(key) < maxindex) {
        //console.log('found  section', key, text);
        const result = this._config?.standardSections[key];
        //console.log('mapsto section', result);
        return result;
      }
    }
    return null;
  }

  public isAttributeText(text: string) {
    const keys: any = Object.keys(this._config?.keyAttributes);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (text && text.includes(key)) {
        return this._config?.keyAttributes[key];
      }
    }
    return null;
  }

  attributeDictionary(text: string): any {
    const result: any = {};
    Object.keys(this._config?.keyAttributes).forEach(key => {
      const buffer = new spBuffer(text);
      if (buffer.jumpToKey(key)) {
        buffer.skipWhitespace();
        const value = buffer.readUntilWhitespace();
        result[key] = value;
      }
    });
    return result;
  }

  computeSectionType(item: LaSentence) {
    if (item.HasSection()) return;

    const sectionTag = this.isSectionText(item.text);
    if (sectionTag) {
      console.log('new section', sectionTag)
      item.SetSectionTypeAndStatus(sectionTag, true);
    } else {
      const attributeTag = this.isAttributeText(item.text);
      if (attributeTag) {
        item.SetSectionTypeAndStatus(sectionTag, false);
      }
    }
  }

 /*  
    ". ",
    ".\" ",
    ".\u201D ",
    ".' ",
    ".\u2019 ",
    ".\u2019\u201D ",
    ".) ",
    ") . ",
    ".\") ",
    ".\u201D) ",
    ".\u2019) ",
    ".\u2019\u201D) "
    ]
    */

  readToken(): spToken {
    const result: any = new spToken();
    let char: any = this.peekChar();
    let peek: any = this.peekChar(1);
    while (char) {
      if (char === '.' && this.isWhiteSpace(peek)) {
        return result.append(this.getChar());
      } else if (char === '.' && this.isCapital(peek)) {
        return result.append(this.getChar());
      } else if (char === '[' || char === '(' ) {
        let rest = this.readNestedUntil(char);
        result.append(rest);
      } else if (this.isWhiteSpace(char)) {
        return result;
      } else if (char === '§') {
        result.append(this.getChar());
      } else if (char === '\u201D' || char === '\u201C') {
        this.getChar();
        result.append('"');
      } else if (char === '\u2019' || char === '\u2018') {
        this.getChar();
        result.append("'");
      } else if (char.charCodeAt(0) > 255) {
        console.log(`unicode = ${char}`)
        result.append(this.getChar());
      } else {
        result.append(this.getChar());
      }
      char = this.peekChar();
      peek = this.peekChar(1);
    }
    return result;
  }


  readWhitespace(): spToken {
    const result: any = new spToken();
    let char = this.peekChar();
    while (char && this.isWhiteSpace(char)) {
      result.append(this.getChar());
      char = this.peekChar();
    }
    return result;
  }

  getSentence() {
    let sentence = this.readSentence()
    return sentence.asString()
  }

  readSentence(): spSentence {
    const result = new spSentence();
    this.readWhitespace();
    let token = this.readToken();
    while (!token.isEmpty()) {
      result.append(token);
      if ( this.isEndOfSentence(token) ) {
        return result;
      }
      this.readWhitespace();
      token = this.readToken();
    }
    return result;
  }

  readSentenceToLastToken(): spSentence {
    const result = new spSentence();
    this.readWhitespace();
    let token = this.readToken();
    while (!token.isEmpty()) {
      result.append(token);
      this.readWhitespace();
      token = this.readToken();
    }
    return result;
  }

  replaceAll(text: string, x: string, y: string) {
    const len = y.length;
    let result = text;
    let found = result.indexOf(x);
    while (found !== -1) {
      result = result.replace(x, y);
      found = result.indexOf(x, found + len);
    }
    return result;
  }

  firstAndRest(text: string, x: string) {
    const index = text.indexOf(x);
    const first = text.substring(0, index);
    const rest = text.substring(index);
    return { first, rest };
  }

  replaceSplitJoin(text: string, x: string, y: string) {
    const temp = text.split(x);
    const result = temp.join(y);
    return result;
  }

  isSentenceException(token:spToken):boolean {
    const found = this._config?.globalExceptions?.find(item => item == token.text)
    return found ? true: false;
  }




  isEndOfSentence(token:spToken):boolean{
    if ( this.isSentenceException(token)) return false;

    const endings = ['.', '."', ".'", '. )', '. ]']
    for( var i=0; i<endings.length; i++ ){
        const ending = endings[i];
        if (token.endsWith(ending)) {
          return true;
        }
    }      
    return false;
  }

  breakUpTextBlock(text: string):string[] {
    
    this.setBuffer(text);
    const tokenSet = this.readSentenceToLastToken().onlyGroupedTokens().map( item => item.removingEndingPeriod());
    if (tokenSet.length > 0  ) {
      console.log('\r\nSpecial Tokens\r\n...........................')
      console.log(tokenSet)
    }

    const extra = this._config.buildExceptionDictionary(tokenSet)
    // the dictionaries are created once globally
    // dictionary and reverse-dictionary for each exception,
    // replacing each character with a nonsense string
    const exDic = {...this._config.ExceptionDictionary.exDic, ...extra.exDic};
    const exRev = {...this._config.ExceptionDictionary.exRev, ...extra.exRev};

    // replace exceptions strings with the exDic values
    // replace all is a semi-brut force method that does not use RegEx
    Object.keys(exDic).forEach(key => {
      text = this.replaceAll(text, key, exDic[key]);
    });

    // replace the splitter flags
    this._config.globalSplitters.forEach(key => {
      const item = `${key}${splitFlag}`;
      text = this.replaceSplitJoin(text, key, item);
    });

    // reverse the exceptions for exDic
    Object.keys(exRev).forEach(key => {
      text = this.replaceAll(text, key, exRev[key]);
    });

    // SHOULD HAVE AS TEXT THE PARA WITH ### BUT WITHOUT ANY EXCEPTION CODES
    // because we appended the ### to the whitespace, the sentence-splitting symbol ###
    // will be deleted in the split() method, and the original splitter string will be
    // preserved at the end of each sentence
    let sentList = text.split(splitFlag);
    sentList = sentList.map( item => item.trim())

    console.log('\r\nTurn this wall of text\r\n...........................')
    console.log(text)
    console.log('.......into this array...............')
    console.log(sentList)
    console.log(`..................Done^^^ ${sentList.length} \r\n`)


    return sentList;
  }

  tokensFromParagraph(paragraph: spParagraph) {

    const text = paragraph.asString();
    const sentList = this.breakUpTextBlock(text);

    const tokens = sentList.map((item: string) => {
      return new spToken(item.trim());
    });

    return tokens;
  }

  joinSentences(paragraph: spParagraph, list: Array<string>) {
    let next = list[0];
    if (spToken.isSpecial(next, 0)) {
      this.createFootnotes(paragraph, list);
    } else {
      this.createFootnoteReference(paragraph, list);
    }
  }

  createFootnotes(paragraph: spParagraph, list: Array<string>) {
    let next = list[0];
    let isSpecial = spToken.isSpecial(next, 0);

    if (!isSpecial) {
      console.log(`this should start with superscript  ${next}`);
      console.log(list)
    }


    let text = next
    for (var i = 1, n = list.length; i < n; i++) {
      next = list[i]
      let isSpecial = spToken.isSpecial(next, 0);
      if (isSpecial) {
        var tok = new spToken(text.trim())
        var sentence = paragraph.createSentenceFromToken(tok);
        text = next;
      } else {
        text += next;
      }
    }
    var tok = new spToken(text.trim())
    var sentence = paragraph.createSentenceFromToken(tok);
  }

  createFootnoteReference(paragraph: spParagraph, list: Array<string>) {
    let next = list[0];
    let isSpecial = spToken.isSpecial(next, 0);

    if (isSpecial) {
      console.log(`this should NOT start with superscript  ${next}`);
      console.log(list)
    }

    let ref = new Array<string>();
    let text = next
    for (var i = 1, n = list.length; i < n; i++) {
      next = list[i]
      let isSpecial = spToken.isSpecial(next, 0);

      if (isSpecial) {
        ref.push(next.trim())
        text += next;
        var tok = new spToken(text.trim())
        var sentence = paragraph.createSentenceFromToken(tok);
        //sentence.footnoteRefs = ref

        text = "";
        ref = new Array<string>();
      } else {
        text += next;
      }
    }
    var tok = new spToken(text.trim())
    var sentence = paragraph.createSentenceFromToken(tok);
    //sentence.footnoteRefs = ref

  }

  deconstructParagraph(paragraph: spParagraph) {

    // treat the first 2 special
    // this paragraph has one large sentence, to start
    const tokens = this.tokensFromParagraph(paragraph);
    paragraph.clearAll();

    const token = tokens.length > 0 && tokens.shift();
    if (token && token.isNumber()) {
      const rest = tokens.length > 0 && tokens.shift();
      if (rest) {
        token.append(rest.text) //we are looking for  1. or 2.  to define a list
      }
    }

    if (token) {
      this.joinSentences(paragraph, token.createFootnoteList());
    }

    tokens.forEach((tok: { isNullOrWhiteSpace: () => any; createFootnoteList: () => string[]; }) => {
      if (!tok.isNullOrWhiteSpace()) {
        this.joinSentences(paragraph, tok.createFootnoteList());
      }
    });

    console.log('deconstruct')
  }

  //  https://www.vertex42.com/ExcelTips/unicode-symbols.html




  splitIntoLogicalStrings(rawtext: string): Array<string> {
    let raw = rawtext.split('\r\n\r\n');

    //you should now slice up this nased on starting with unicode amd ending with \r\n
    let data = new Array<string>();

    raw.forEach(str => {
      if (str == '') return;
      let text = this.replaceAll(str, ' \r\n', ' ');
      data.push(text);
    });

    return data;
  }

  readDocument(text: string): spDocument {
    const result = new spDocument();
    let section: spSection = new spSection('Opening');
    result.append(section);

    const data = this.splitIntoLogicalStrings(text);
    console.log(data)
    return this.readDocumentListWithoutSections(data)
  }

  readDocumentListWithoutSections(data: string[]): spDocument {
    const result = new spDocument();
    let section: spSection = new spSection('Opening');
    result.append(section);

    data.forEach(text => {

      // console.log('------------------------')
      // console.log(text)
      // console.log('------------------------')

      const token = new spToken(text);

      if (!token.isEmpty()) {
        //console.log(`create paragraph::: ${text}`)
        const sentence = new spSentence(token);
        const paragraph = new spParagraph(sentence);
        section.append(paragraph);
        //pars the sentence into smaller parts
        this.deconstructParagraph(paragraph);

      // } else if (text !== '') {
      //   console.log(`no section to place string ${text}`)
      //   const sec = new spSection('unknown', new spToken());
      //   const sent = new spSentence(token);
      //   const para = new spParagraph(sent);
      //   this.deconstructParagraph(para);
      //   sec.append(para);
      //   result.append(sec);
      }
    });

    result.caseNumber = result.getValue('Citation Nr:');
    return result;
  }

  readDocumentList(data: string[]): spDocument {
    const result = new spDocument();
    let section: spSection = new spSection('Opening');
    result.append(section);

    data.forEach(text => {

      // console.log('------------------------')
      // console.log(text)
      // console.log('------------------------')

      const token = new spToken(text);

      const sectionTag = token.findStandardSection(this);
      const attributeTag = token.findKeyAttribute(this);
      const tokenTag = token.replace('\r', '').replace('\n', '').replace('\t', '');

      if (sectionTag != null) {
        //console.log(`create a section ${text}`)
        section = new spSection(sectionTag, tokenTag);
        result.append(section);

      } else if (attributeTag != null) {
        //console.log(`attribute section ${text}`)
        section = new spSection('attributeSection', tokenTag, true);
        result.append(section);

        const dict = this.attributeDictionary(token.text);
        Object.keys(dict).forEach(key => {
          result.assert(key, dict[key]);
        });

      } else if (section && !token.isEmpty()) {
        //console.log(`create paragraph::: ${text}`)
        const sentence = new spSentence(token);
        const paragraph = new spParagraph(sentence);
        section.append(paragraph);
        //pars the sentence into smaller parts
        this.deconstructParagraph(paragraph);

      } else if (text !== '') {
        console.log(`no section to place string ${text}`)
        const sec = new spSection('unknown', new spToken());
        const sent = new spSentence(token);
        const para = new spParagraph(sent);
        this.deconstructParagraph(para);
        sec.append(para);
        result.append(sec);
      }
    });

    result.caseNumber = result.getValue('Citation Nr:');
    return result;
  }

  extractNumbers(text: string) {
    if (!text) { return undefined; }

    let result = '';
    for (const ch of text) {
      if (ch >= '0' && ch <= '9') {
        result += ch;
      }
    }
    return result;
  }

  // parseRawText(text: string, fileName: string) {
  //   const document = this.readDocument(text);
  //   return this.parseDocument(document,fileName);
  // }

  // parseTextArray(data: string[], fileName: string) {
  //   const document = this.readDocumentListWithoutSections(data);
  //   return this.parseDocument(document,fileName);
  // }

  // parseDocument(document:spDocument, fileName: string){
  //   var path = require('path'); // added to get filename
  //   fileName = path.parse(fileName).name; // added to get filename
    
  //   const sentences: any = [];
  //   const justNumbers = fileName || this.extractNumbers(fileName);
  //   const caseNumber = document.caseNumber || justNumbers || '__NOCASE__';

  //   let p = 0;
  //   let s = 0;
  //   document.sections.forEach((sect: { title: any; sectionType: any; paragraphs: any[]; }) => {
  //     const title = sect.title;
  //     const sectionType = sect.sectionType;

  //     p++;
  //     s = 1;
  //     const obj = {
  //       sentID: `${caseNumber}P${p}S${s}`,
  //       text: title && title.asString(),
  //       isSection: false,
  //       sectionType,
  //     };

  //     if ( Tools.isEmpty(sectionType) ){
  //       console.log('SectionType',sectionType)
  //     }

  //     if (title && !title.isEmpty()) {
  //       sentences.push(obj);
  //     }

  //     sect.paragraphs.forEach((prag: { sentences: any[]; }) => {

  //       p++;
  //       s = 1;
  //       prag.sentences.forEach((sent: { asString: () => any; }) => {
  //         let obj: any = {
  //           sentID: `${caseNumber}P${p}S${s}`,
  //           text: sent.asString(),
  //           isSection: false,
  //           sectionType
  //         };

  //         //console.log(JSON.stringify(obj,undefined,3))
  //         if (obj.text.length > 0) {
  //           sentences.push(obj);
  //           s++;
  //         }
  //       });
  //     });
  //   });

  //   return {
  //     fileName,
  //     caseNumber,
  //     sentences
  //   };

  // }


}
