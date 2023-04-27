import { Tools } from '@app/shared';
import { LaAtom } from '../shared/la-atom';
import { LaSentence  } from './la-sentence';
import { IGroupRef, ITagsAndNotes, LaUserTag} from './la-tags';



export class LaParagraph extends LaAtom implements ITagsAndNotes, IGroupRef {

  get myType(): string {
    return `LaParagraph`;
  }
  groupIDs:string;

  paraID: string;
  caseNumber: string;
  paragraphNumber: string;
  histogram: any = undefined;
  renumId: number;
  unchangedSince: string;  

  notes: string;
  userTags: Array<LaUserTag>;
  isItemOfInterest: boolean;
  isBookmark: boolean;
  author:string;
  
  private sentenceLookup: { [name: string]: LaSentence } = {};
  sentences: Array<LaSentence> = new Array<LaSentence>();

  constructor(properties?: any) {
    super(properties);

    this.renumId = parseInt(this.paragraphNumber);

    //must override values set in super
    if ( properties?.userTags) {
      this.userTags = new Array<LaUserTag>();
      properties?.userTags?.forEach(item => {
        const newTag = new LaUserTag(item)
        newTag.applyJSON(item);
        this.addUserTag(newTag)
      });
    }

    if ( properties?.sentences) {
      this.sentenceLookup = {};
      this.sentences = new Array<LaSentence>();
      properties.sentences.forEach(item => {
        this.addSentence(new LaSentence(item))
      })
    }

    if ( !this.isItemOfInterest ) {
      this.isItemOfInterest = false;
    }

  }

  public static paragraphRef(para:LaParagraph, id:number=undefined){
    const no = id ? id : (para.paragraphNumber || 0)
    const key = `${para.caseNumber}P${no}`;
    return key;
  }

  addGroupID(groupID: string): string {
    if (!this.groupIDs) {
      this.groupIDs = groupID
    } else {
      this.groupIDs = `${this.groupIDs};${groupID}`
    }
    return groupID;
  }

  removeGroupID(groupID: string): string {
    if (this.groupIDs) {
      const split = this.groupIDs.split(';')
      const index = split.indexOf(groupID);
      if (index > -1) {
        split.splice(index, 1);
        this.groupIDs = split.join(';')
      }
    }
    return groupID;
  }

  clearGroupIDs() {
    this.groupIDs = null
  }

  getSummary():string{
    return ""
  }

  createTagDisplayRecord(){
    const item = this;
    const data = {
      object : item,
      objectID: item.paraID,
      rhetClass: 'Paragraph',
      caseNumber: item.caseNumber,
      paragraphNumber: item.paragraphNumber,
      sentenceNumber: 0, 
      notes: item.notes,
      text: ''
    };
    return data
  }

  isImmutable() {
    return !Tools.isEmpty(this.unchangedSince);
  }

  showImmutable(){
    if ( this.isImmutable()) {
      return this.unchangedSince;
    }
    return '';
  }

  markAsImmutable() {
    this.isItemOfInterest = false;
    this.unchangedSince = Tools.getNowIsoDate();
    return this;
  }

  computeID(): LaParagraph {
    this.paraID = `${this.caseNumber}${this.paraTag()}`;
    return this;
  }

  anchorTag(): string {
    return `${this.caseNumber}${this.paraTag()}`;
  }

  paraTag(): string {
    return `P${this.paragraphNumber || 0}`;
  }


  get label() {
    return this.paraTag();
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

  asJson() {
    const result = {
      paraID: this.paraID,
      groupIDs: this.groupIDs,
      caseNumber: this.caseNumber,
      paragraphNumber: this.paragraphNumber,
      notes: this.notes,
      unchangedSince: this.unchangedSince,
      isItemOfInterest: this.isItemOfInterest,
      userTags: this.userTags,
      sentences: this.sentences,
      sentIDList: this.sentences.map( item => item.sentID)
    }
    if ( this.isImmutable()) {
      delete result.sentIDList
    } else {
      delete result.sentences
    }
    return result;
  }

  addUserTag(tag:LaUserTag){
    if ( !this.userTags) {
      this.userTags = new Array<LaUserTag>()
    }
    this.userTags.push(tag)
    return tag;
  }

  removeUserTag(tag:LaUserTag){
    if ( this.userTags) {
      const index = this.userTags.indexOf(tag)
      if (index > -1) {
        this.userTags.splice(index, 1);
      }
    }
    return tag;
  }

  clearSentences() {
    this.sentences = new Array<LaSentence>();
    this.sentenceLookup = {};
    this.histogram = undefined;
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



  isCompleteArgument(): number {
    const dict = this.sentenceHistogram();
    if ( this.isReasoningArgument() === 0 ) { return 0; }
    if ( this.isEvidenceArgument() === 0 ) { return 0; }
    return this.isFinding();
  }

  isFinding(): number {
    const dict = this.sentenceHistogram();
    return dict.FindingSentence ? 1000 : 0;
  }

  isReasoningArgument(): number {
    const dict = this.sentenceHistogram();
    if ( !this.isFinding() ) { return 0; }
    if ( dict.ReasoningSentence ) {
      return 1100;
    }
    return 0;
  }

  isEvidenceArgument(): number {
    const dict = this.sentenceHistogram();
    if ( !this.isFinding() ) { return 0; }
    if ( dict.EvidenceSentence ) {
      return 1010;
    }
    return 0;
  }

  isLoneSentence(): number {
    const dict = this.sentenceHistogram();
    if ( Object.keys(dict).length === 1 && dict.Sentence ) {
      return -1000;
    }
    return 0;
  }

  completeArgumentScore() {
    const dict = this.sentenceHistogram();
    let score = dict.EvidenceSentence;
    score += dict.ReasoningSentence;

    return score;
  }

  get pointValue() {
    const complete = this.isCompleteArgument();
    const reasoned = this.isReasoningArgument();
    const evidence = this.isEvidenceArgument();
    const finding = this.isFinding();
    const lone = this.isLoneSentence();
    const count = this.weightedCount / 10;
    const total = complete + reasoned + evidence + finding + lone + count;
    return total;
  }

  get weightedCount() {
    let total = 0;
    const dict = this.sentenceHistogram();
    for (const [key, value] of Object.entries(dict)) {
      total += value;
    }
    return total;
  }

  compareScore(other: LaParagraph): number {
    const score = this.pointValue - other.pointValue;
    return score;
  }

  getGroupID(): string {
    return this.groupIDs || '';
  }

  compareGroupID(other: LaParagraph): number {
    if ( this.getGroupID() == other.getGroupID() ) {
      return 0
    }
    return  this.getGroupID() > other.getGroupID() ? 1 : -1;
  }



  get score() {
    const total = this.pointValue;
    const count = this.weightedCount;

    return `${total}::${count}`;
  }

  sentenceHistogram(): { [key: string]: number; } {
    if ( this.histogram != undefined) {
      return this.histogram;
    }
    this.histogram = {};
    this.sentences.forEach(item => {
      const rhetClass = item.readRhetClass()
      if ( !this.histogram[rhetClass]) {
        this.histogram[rhetClass] = 0;
      }
      this.histogram[rhetClass] += 1;
    });
    return this.histogram;
  }

  computeStats() {

    const hist: any = this.sentenceHistogram();

    let list: Array<any> = new Array<any>();
    Object.keys(hist).forEach(key => {
      list.push({
        name: key,
        value: hist[key]
      });
    });

    list = list.sort((a, b) => b.value - a.value);
    return list;
  }

  firstSentence() {
    return this.sentences[0];
  }

  lastSentence() {
    return this.sentences[this.sentences.length - 1];
  }

  isSection(): boolean {
    if (this.hasSentences()) {
      return this.firstSentence().isSection;
    }
    return false;
  }

  hasSentences() {
    return this.sortSentences && this.sentences.length > 0;
  }

  addSentence(sentence: LaSentence) {
    this.sentences.push(sentence);
    const num = sentence.sentenceNumber;
    this.sentenceLookup[num] = sentence;
    this.histogram = undefined;
    sentence.paragraphNumber = this.paragraphNumber
    return sentence;
  }

  deleteSentence(sentence: LaSentence) {
    const index = this.sentences.indexOf(sentence);
    if (index != -1) {
      this.sentences.splice(index, 1);
    }

    this.renumSentences();
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
