import { LaAtom } from "@app/shared";
import { LaSentence } from ".";

// {
//   "text": "7 Id. 172:6-8. ",
//   "id": 7,
//   "caseNumber": "4:20-cv-05640",
//   "noteID": "4:20-cv-05640N7"
// },




export class LaFootnote extends LaAtom {
  caseNumber: string;
  noteID!: string;
  footnoteNumber: string;
  footnoteID: string  

  sectionType!: string;
  sentID!: string;

  private sentenceLookup: { [name: string]: LaSentence } = {};
  sentences: Array<LaSentence>;

  get myType(): string {
    return `LaFootnote`;
  }

  constructor(properties?: any) {
    super(properties);

    if ( properties?.sectionType) {
      this.sectionType = properties?.sectionType
    }
    if (properties?.text ) {
      this.footnoteNumber = `${properties.id}`
      //const ref = properties.noteID.replace(this.caseNumber,'');
      this.footnoteID = `FN${this.footnoteNumber}`

      this.sentences = new Array<LaSentence>();
      const note = new LaSentence({
        caseNumber: this.caseNumber,
        text: properties?.text,  
        sectionType: this.footnoteID,
        sentenceNumber: '1'
      });

      this.addSentence(note);
    }

    if (properties?.sentences ) {
      this.sentences = new Array<LaSentence>();
      properties.sentences.forEach( item => {
        const note = new LaSentence(item);
        this.addSentence(note);
      })
    }
  }

  computeID(): LaFootnote {
    this.noteID = `${this.caseNumber}FN${this.footnoteNumber}`;
    return this;
}

  addSentence(sentence: LaSentence) {
    this.sentences.push(sentence);
    const num = sentence.sentenceNumber;
    this.sentenceLookup[num] = sentence;
    sentence.paragraphNumber = this.footnoteNumber;
    this.sortSentences()
    return sentence;
  }

  deleteSentence(sentence: LaSentence) {
    const index = this.sentences.indexOf(sentence);
    if (index != -1) {
      this.sentences.splice(index, 1);
    }
    this.renumSentences();
  }

  getSectionBadges() {
    const list: Array<any> = new Array<any>();

    if (this.sectionType) {
      list.push(this.sectionType);
    } else {
      list.push('No Section Assignment')
    }
    return list;
  }
  footnoteText() {
    let text = '';
    this.sentences.forEach( note => {
      text = `${text} ${note.text}`
    })
    return text;
  }

  SetSectionTypeAndStatus(name: string) {
    this.sectionType = name;
  }

  asJson() {
    const result = {
      footnoteID: this.footnoteID,
      sectionType: this.sectionType,
      caseNumber: this.caseNumber,
      footnoteNumber: this.footnoteNumber,
      sentences: this.sentences,
    }
    return result;
  }


  resolveSentence(ref: string): LaSentence {
    const found = this.sentenceLookup[ref];
    return found;
  }

  getNextSentence(previous: LaSentence): LaSentence {
    const key = `${previous.renumId + 1}`;
    const next = this.resolveSentence(key);
    return next;
  }

  sortSentences() {
    this.sentences = this.sentences.sort((a, b) => {
      return a.renumId - b.renumId;
    });

    const first = this.sentences[0];
    const last = this.sentences[this.sentences.length - 1];

    this.sentences.forEach(item => {
      item.computeID();
      item.isFirst = item === first ? true : false;
      item.isLast = item === last ? true : false;;
    });

    return this.sentences;
  }

  renumSentences() {
    this.sortSentences();
    this.sentenceLookup = {};

    let id = 1;
    this.sentences.forEach(item => {
      item.renumberTo(id)
      const num = item.sentenceNumber;
      this.sentenceLookup[num] = item;
      id++;
    });
    
    return this.sentences;
  }

}