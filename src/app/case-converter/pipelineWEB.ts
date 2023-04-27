import { LaCaseCoreInfo, LaFootnote, LaSentence } from "@app/models";
import { LaConfig } from "@app/models/LaConfig";
import { spSentence, spToken, spCase,spPage, spParagraph, spParser } from "@app/parser";

import { Tools } from "@app/shared";

import globalExceptions from './configuration/bva-english/global-exceptions.json';
import globalSplitters from './configuration/bva-english/global-splitters.json';
import keyAttributes from './configuration/bva-english/key-attributes.json';
import standardSections from './configuration/bva-english/standard-sections.json';
import treeRoot from './configuration/bva-english/DecisionTree.json'


export class TextExtraction {
  url: string;
  title: string = '';
  table!: Array<String>;
  cleanSourceHTML: string = '';
  caseNumber: string = '';

  config: LaConfig = new LaConfig({
    treeRoot,
    globalExceptions,
    globalSplitters,
    keyAttributes,
    standardSections

  });


  constructor(url: string='') {
    this.url = url;
  }






  private replaceSplitJoin(text: string, x: string, y: string) {
    const temp = text.split(x);
    const result = temp.join(y);
    return result;
  }



  public FromTextToLSJson(text:string): string {

    //create a array by splitting at line breaks
    const list = text.split('\r\n');

    const result = this.processTextArray(list);
    return result;
  }



  public makeInfo(table: string[]): LaCaseCoreInfo {
    const path = this.url.split('/').reverse();
    const name = path[0]

    this.caseNumber = name.replace('.htm', '')

    let info = new LaCaseCoreInfo({
      guidKey: Tools.generateUUID(),
      name: this.caseNumber,
      extension: '.json',
      version: '0000',
      source: this.url,
      title: table[0],
      description: `${table[1]}, ${table[2]}`,
      keywords: table[5],
      notes: `${table[3]}, ${table[4]}`,
      lastChange: Tools.getNowIsoDate()
    });
    return info;
  }

  // public saveFile(filename:string, text: string, ext: string) {
  //   fs.writeFileSync(filename, text, { encoding: "utf8", flag: "w" });
  // }


  private extractFootnotes(notes: string[]): string[] {
    let started = false;
    const footnotes = new Array<string>();
    notes.forEach(item => {
      const found = item.indexOf('Footnote') > 0;
      //console.log(item)
      if (found) {
        started = true;
        footnotes.push(item)
      } else if (started) {
        let last = footnotes.pop();
        last = `${last} ${item}`;
        footnotes.push(last);
      }
    })
    return footnotes;
  }

  private processTextArray(buffer: string[]): any {

    //sort into document and footnotes
    const document: Array<string> = new Array<string>();
    const notes: Array<string> = new Array<string>();

    let saveasnotes = false;
    buffer.forEach(item => {
      const text = item.trim();
      if (text.length == 0) return;

      const parser = new spParser(this.config)
      parser.setBuffer(item);
      const source = parser.readSentenceToLastToken();
      //source.modifyFootnoteTokens();  no footnotes in BVA Cases
      const newtext = source.asString();

      if (saveasnotes) {
        notes.push(newtext)
      } else {
        document.push(newtext)
      }

      if (text.startsWith("FOOTNOTES")) {
        saveasnotes = true;
        document.pop()
      }
    })

    const footnotes = this.extractFootnotes(notes);

    let info = this.makeInfo(document);
    let legalCase = this.buildLegalCase(this.caseNumber, document, footnotes);


    const lsJson = legalCase.computeModel(info);
     return lsJson;
  }




  buildLegalCase(casenumber: string, rawText: string[], rawFootnotes: string[]): spCase {


    //...............................................................................Create footnote section
    const parser = new spParser(this.config);

    //now let create json for the footnotes

    const footnotes: Array<LaFootnote> = new Array<LaFootnote>();
    for (var j = 0; j < rawFootnotes.length; j++) {
      let item = rawFootnotes[j];

      parser.setBuffer(item);
      const source = parser.readSentenceToLastToken();
      const id = source.findFootnoteRefNumber();


      //add code to turn split text block here

      const footnote = new LaFootnote({
        id: id,
        footnoteNumber: `${id}`,
        caseNumber: casenumber
      })
      footnotes.push(footnote.computeID())


      const parts = parser.breakUpTextBlock(item)
      for (let i = 0; i < parts.length; i++) {
        const sentence = parts[i]
        const tail = new LaSentence({
          text: parts[i],
          caseNumber: casenumber,
          sectionType: footnote.footnoteID,
          sentenceNumber: `${i + 1}`,
          paragraphNumber: '1',
        });
        footnote.addSentence(tail);
      }
    }

    //...............................................................................Extract paragraphs from pages


    let page = new spPage()
    page.text = rawText.join('\r\n');

    const paragraphs: Array<spParagraph> = new Array<spParagraph>();
    let iPara = 0;

    const list = page.createParagraphs();

    list.forEach(item => {
      item.id = `${++iPara}`;

      item.parseGroupsIntoSets(parser)
      paragraphs.push(item)
    })


    //...............................................................................Create micro documents for each paragraph


    let currentSection = "";
    const sentences: Array<spSentence> = new Array<spSentence>();
    let paraCounter = 0;
    for (var i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const sets = paragraph.sets
      paraCounter++;
      let sentCounter = 1;

      sets.forEach((text: string, index: number) => {
        const tok = new spToken(text);
        const sent = new spSentence(tok)
        const sectionType = parser.isSectionText(text); // this look section to start within the first 10 char

        sent.isSection = sectionType != null ? true : false;
        if (sent.isSection) {
          currentSection = sectionType

          if (index > 0) {
            paraCounter++;
            sentCounter = 1;
          }
        }

        sent.sectionType = currentSection;
        sent.id = `P${paraCounter}S${sentCounter++}`;
        sentences.push(sent);

      });

    }



    //...............................................................................Extract sentences from paragraphs
    const legalCase = new spCase(parser, casenumber, sentences, footnotes, this.cleanSourceHTML);
    return legalCase;
  }
}








