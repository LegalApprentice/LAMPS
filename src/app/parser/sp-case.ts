import { spParser, spSentence } from '.';
import { LaLegalCase, LaSentence } from '../models';
import { LaFootnote } from '../models/la-footnote';

export class spCase {

  parser: spParser;
  caseNumber = '';
  footnotes: Array<LaFootnote>;
  spSentList: Array<spSentence>;
  sentences: Array<LaSentence> = new Array<LaSentence>();
  text:string = '';


  constructor(parser: spParser, caseNumber: string, spSentList: Array<spSentence>, footnotes: Array<LaFootnote>, text:string='') {
    this.parser = parser;
    this.caseNumber = caseNumber;
    this.footnotes = footnotes;
    this.spSentList = spSentList;
    this.text = text;

    //console.log('footnotes', this.footnotes)
  }

  computeModel(info?: any): any {

    let sectionType = ""
    this.spSentList.forEach(item => {

      if (item.isSection) {
        sectionType = item.sectionType
        //console.log('sectionType=',sectionType)
      }



      //do not create sentences that are only footnotes
      const result = item.asString()

      const sent = new LaSentence({
        sentID: `${this.caseNumber}${item.id}`,
        text: result,
        isSection: item.isSection,
        sectionType: sectionType,
        footnoteRefs: item.getFootnoteRefs(this.caseNumber),
      });
      this.sentences.push(sent);


          //...............................................................................Inject footnoot references

      this.footnotes.forEach( footnote => {
        const key = footnote.footnoteID;
        item.tokens.forEach(tok => {
          if (tok.contains(key)) {
            tok.replace(key, `{{${footnote.footnoteNumber}}}`);
            footnote.sectionType = sectionType;
            footnote.sentID = sent.sentID
          }
        });
      });

    })

    return this.asLSJson(info)
  }

  asLSJson(data?:any) {

    const currentLegalCase = new LaLegalCase({
      caseNumber: this.caseNumber,
      name: this.caseNumber,
    });

    return {
      caseNumber: this.caseNumber,
      caseInfo: currentLegalCase.createCaseCoreInfo(data),
      sentences: this.sentences.map( item => item.asJson()),
      footnotes: this.footnotes.map( item => item.asJson()),
      text: this.text
    }

  }
}