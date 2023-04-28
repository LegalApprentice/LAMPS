import { LaAtom } from '../shared/la-atom';
import { LaParagraph } from './la-paragraph';
import { LaSentence } from './la-sentence';
import { LaUser } from './la-user';

import { LaDecisionNode, LaDecisionRoot } from './la-decisionNode';
import { LaUploadedCase, LaCaseCoreInfo } from './la-caseDirectoryItem';

import { Toast, Tools } from '../shared';
import { CreateGroupSpec, LaGroup } from './la-group';
import { LaFilename } from '.';
import { LaFootnote } from './la-footnote';


export class LaLegalModel extends LaAtom {


  protected lampsType: string

  protected modelCoreInfo: LaCaseCoreInfo;
  protected preprocessed: any;

  protected caseNumber: string;
  protected author: string = ''
  protected text = '';

  protected modelInfo: any;  //this is the prediction info

  protected groupLookup: { [name: string]: LaGroup } = {};
  protected groups: Array<LaGroup> = new Array<LaGroup>();

  protected paragraphLookup: { [name: string]: LaParagraph } = {};
  protected paragraphs: Array<LaParagraph> = new Array<LaParagraph>();

  protected sentenceLookup: { [name: string]: LaSentence } = {};
  protected sentences: Array<LaSentence> = new Array<LaSentence>();

  protected decisionLookup: { [name: string]: LaDecisionRoot } = {};
  protected decisionRoot: LaDecisionRoot;

  protected footnoteLookup: { [name: string]: LaFootnote } = {};
  protected footnotes: Array<LaFootnote> = new Array<LaFootnote>();

  protected parking: Array<LaSentence> = new Array<LaSentence>();

  setText(text: string) {
    this.text = text;
    return this;
  }


  constructor(properties?: any) {
    super(properties);
    this.lampsType = "LegalModel";

    if (properties?.caseInfo) {
      this.modelCoreInfo = new LaCaseCoreInfo(properties.caseInfo);
    }
  }

  get filename(): string {
    return this.modelCoreInfo.asFilename().getFilename()
  }

  updateFilename(data: LaFilename) {
    this.modelCoreInfo.override(data)
  }


  getModelName(): string {
    return this.caseNumber
  }

  clearBookmarks() {
    this.getSentences().forEach(item => item.isBookmark = false)
  }

  getBookmarks(): Array<string> {
    const list = this.getSentences().filter(item => item.isBookmark == true);
    return list.map(item => item.anchorTag())
  }

  getParagraphs(): Array<LaParagraph> {
    const list = this.paragraphs;
    return list;
  }


  getSentences(): Array<LaSentence> {
    const list = this.sentences;
    return list;
  }


  findFootnotes(sent: LaSentence): Array<LaFootnote> {
    const result = new Array<LaFootnote>();
    if (sent.footnoteRefs) {
      Object.keys(sent.footnoteRefs).forEach(key => {
        result.push(this.footnoteLookup[key])
      })
    }
    return result;
  }



  getFootnoteText(footnoteRefs: string[]): string {
    let result = "";
    footnoteRefs.forEach(key => {
      const text = this.footnoteLookup[key]?.footnoteText();
      result += `${text} \n`
    })
    return result;
  }

  getFootnotes(): Array<LaFootnote> {
    const list = this.footnotes;
    return list;
  }



  getGroups(): Array<LaGroup> {
    const list = this.groups;
    return list;
  }


  createCaseCoreInfo(props: any) {
    const data = {
      guidKey: Tools.generateUUID(),
      name: this.caseNumber,
      extension: '.json',
      version: '0000',
      owner: '',
      source: props?.source ? props?.source : '',
      keywords: '',
      metadata: {},
      lastChange: this.getDateTime()
    };
    this.modelCoreInfo = new LaCaseCoreInfo({ ...data, ...props });
    if (Tools.matches(this.modelCoreInfo.source, this.modelCoreInfo.owner)) {
      this.modelCoreInfo.owner = '';
    }
    return this.modelCoreInfo;
  }

  extractLaFilename(): LaFilename {
    const result = new LaFilename();

    if (this.modelCoreInfo) {
      result.override({
        pre: this.modelCoreInfo.pre,
        name: this.modelCoreInfo.name,
        version: this.modelCoreInfo.version,
        extension: this.modelCoreInfo.extension,
      })
    }
    return result;
  }

  mergeModelCoreInfo(info: LaCaseCoreInfo): LaCaseCoreInfo {
    this.getModelCoreInfo().override(info);
    return this.modelCoreInfo;
  }

  getSentencesOfInterest(): Array<LaSentence> {
    return this.getSentences().filter(item => item.isItemOfInterest);
  }

  getParagraphsOfInterest(): Array<LaParagraph> {
    return this.getParagraphs().filter(item => item.isItemOfInterest);
  }



  findParagraph(sentence: LaSentence): LaParagraph {
    const key = sentence.paraIDTag();
    const paragraph = this.resolveParagraph(key);

    return paragraph;
  }

  doSplitParagraphOn(next: LaSentence): LaParagraph {
    const id = parseInt(next.paragraphNumber);
    const key = `${next.caseNumber}P${id}`;
    const current = this.resolveParagraph(key);

    const sentenceNumber = next.sentenceNumber;
    return current;
  }

  getPreviousParagraph(next: LaSentence): LaParagraph {
    const id = parseInt(next.paragraphNumber) - 1;
    const key = `${next.caseNumber}P${id}`;
    const previous = this.resolveParagraph(key);
    return previous;
  }

  getNextParagraph(previous: LaSentence): LaParagraph {
    const id = parseInt(previous.paragraphNumber) + 1;
    const key = `${previous.caseNumber}P${id}`;
    const next = this.resolveParagraph(key);
    return next;
  }

  getPreviousSentence(next: LaSentence): LaSentence {
    const id = next.renumId - 1;
    const key = LaSentence.sentenceRef(next, id);
    const previous = this.resolveSentence(key);
    return previous;
  }

  getPreviousFootnote(footnoteID: string, next: LaSentence): LaSentence {
    const id = `${next.renumId - 1}`;
    const footnote = this.resolveFootnote(footnoteID);
    const previous = footnote.resolveSentence(id);
    return previous;
  }

  getNextSentence(previous: LaSentence): LaSentence {
    const id = previous.renumId + 1;
    const key = LaSentence.sentenceRef(previous, id);
    const next = this.resolveSentence(key);
    return next;
  }

  parkSentence(sentence: LaSentence): LaLegalModel {
    this.parking.push(sentence);
    return this;
  }

  removeSentence(sentence: LaSentence): LaLegalModel {
    delete this.sentenceLookup[sentence.sentID];
    const list = this.sentences.filter(item => item.sentID != sentence.sentID);
    this.sentences = list;
    return this;
  }

  establishSentence(sentence: LaSentence): LaLegalModel {
    sentence.computeID();
    const found = this.resolveSentence(sentence.sentID);
    if (found) {
      this.removeSentence(found)
    }
    this.sentenceLookup[sentence.sentID] = sentence;
    this.sentences.push(sentence)
    if (found && found.groupIDs) {
      sentence.addGroupID(found.groupIDs)
    }
    return this;
  }

  establishFootnote(footnote: LaFootnote): LaLegalModel {
    this.footnoteLookup[footnote.footnoteID] = footnote;
    this.footnotes.push(footnote)
    return this;
  }

  removeParagraph(paragraph: LaParagraph): LaLegalModel {
    delete this.paragraphLookup[paragraph.paraID];
    const list = this.paragraphs.filter(item => item.paraID != paragraph.paraID);
    this.paragraphs = list;
    return this;
  }

  establishParagraph(paragraph: LaParagraph): LaLegalModel {
    paragraph.computeID();
    const found = this.resolveParagraph(paragraph.paraID);
    if (found) {
      this.removeParagraph(found)
    }
    paragraph.completeArgumentScore();
    this.paragraphLookup[paragraph.paraID] = paragraph;
    this.paragraphs.push(paragraph)
    if (found && found.groupIDs) {
      paragraph.addGroupID(found.groupIDs)
    }
    return this;
  }

  removeGroup(group: LaGroup): LaLegalModel {
    delete this.groupLookup[group.groupIDs];
    const list = this.groups.filter(item => item.groupIDs != group.groupIDs);
    this.groups = list;
    return this;
  }


  establishGroup(group: LaGroup): LaLegalModel {
    const found = this.resolveGroup(group.groupIDs);
    if (found) {
      this.removeGroup(found)
    }

    this.groupLookup[group.groupIDs] = group;
    this.groups.push(group);

    return this;
  }

  deleteSentence(sentence: LaSentence) {
    const paragraph = this.resolveParagraph(sentence.paraID);
    if (paragraph) {
      this.removeSentence(sentence)
      paragraph.deleteSentence(sentence);
      if (paragraph.sentences.length == 0) {
        this.removeParagraph(paragraph);
        this.reorderParagraphs();
      }

      paragraph.renumSentences()
      this.refreshSentences();
    }
  }

  splitSentence(sentence: LaSentence, list: string[]): LaParagraph {
    const paraID = sentence.paraID;
    const paragraph = this.paragraphLookup[paraID] as LaParagraph;
    if (paragraph) {
      sentence.text = list[0];
      for (let i = 1; i < list.length; i++) {
        const tail = new LaSentence(sentence);
        tail.sentenceNumber = `${sentence.sentenceNumber}.${i}`
        tail.renumId = sentence.renumId + i / 10;
        tail.text = list[i];
        this.establishSentence(tail);
        paragraph.addSentence(tail);
      }

      paragraph.renumSentences()
      this.refreshSentences();
    }

    return paragraph;
  }

  deleteFootnoteSentence(sentence: LaSentence) {
    const footnoteID = sentence.GetSectionType();
    const footnote = this.resolveFootnote(footnoteID);
    if (footnote) {
      footnote.deleteSentence(sentence);
    }
  }

  createGroupFromSpec(groupInfo: CreateGroupSpec) {
    let group = this.resolveGroup(groupInfo.groupIDs);
    if (group) {
      group.override(groupInfo);
    } else {
      group = new LaGroup(groupInfo);
      this.establishGroup(group)
    }
    return group;
  }



  splitText(text: string, subText: string) {
    const end = text.indexOf(subText);
    const first = text.substring(0, end);
    const last = text.substring(end);

    return { first, last };
  }



  splitFootnote(sentence: LaSentence, list: string[]): LaFootnote {
    const noteID = sentence.GetSectionType();
    const footnote = this.footnoteLookup[noteID] as LaFootnote;
    if (footnote) {
      sentence.text = list[0];
      for (let i = 1; i < list.length; i++) {
        const tail = new LaSentence(sentence);
        tail.sentenceNumber = `${sentence.sentenceNumber}.${i}`
        tail.renumId = sentence.renumId + i / 10;
        tail.text = list[i];
        this.establishSentence(tail);
        footnote.addSentence(tail);
      }

      footnote.renumSentences()
      this.refreshSentences();
    }

    return footnote;
  }

  reorderParagraphs() {
    const list = this.paragraphs.splice(0);
    this.paragraphs = [];
    this.paragraphLookup = {};
    let count = 1;
    list.forEach(item => {
      if (item.sentences.length > 0) {
        item.renumId = count;
        item.paragraphNumber = `${count}`;
        this.establishParagraph(item)
        item.sentences.forEach(sent => {
          sent.paragraphNumber = item.paragraphNumber;
          sent.computeID()
        })
        count += 1;
      }
    })
  }

  sortParagraphs(): Array<LaParagraph> {
    this.paragraphs = this.paragraphs?.sort((a, b) => {
      return a.renumId - b.renumId;
    });
    return this.paragraphs;
  }

  normalizeModel() {
    let lastSection = null
    const sentences = this.getSentences();
    sentences.forEach(item => {
      if (item.HasSection()) {
        lastSection = item.GetSectionType();
      } else {
        item.SetSectionTypeAndStatus(lastSection, item.isSection)
      }
      item.text = item.text ? item.text.trim() : '';
    });


    this.paragraphs?.forEach(paragraph => {
      paragraph.clearSentences();
    });

    sentences.forEach(sentence => {
      this.establishParagraphFromSentence(sentence)
    });

    this.sortParagraphs()?.forEach(item => {
      item.sortSentences();
    });

  }

  private refreshSentences() {
    const list = new Array<LaSentence>();
    this.getParagraphs().forEach(para => {
      para.sentences.forEach(sent => {
        list.push(sent);
      });
    });

    this.getParagraphs().forEach(para => {
      para.clearSentences();
    });

    list.forEach(sent => {
      this.establishParagraphFromSentence(sent);
    })
  }

  establishParagraphFromSentence(sentence: LaSentence) {
    sentence.computeID();
    let paragraph = this.resolveParagraph(sentence.paraID)
    if (!paragraph) {
      paragraph = new LaParagraph({
        caseNumber: sentence.caseNumber,
        paragraphNumber: sentence.paragraphNumber,
      });
      this.establishParagraph(paragraph);
    }
    paragraph.addSentence(sentence)
    return paragraph;
  }


  resolveParagraph(ref: string): LaParagraph {
    const found = this.paragraphLookup[ref];
    return found;
  }

  resolveSentence(ref: string): LaSentence {
    const found = this.sentenceLookup[ref];
    return found;
  }

  resolveFootnote(ref: string): LaFootnote {
    const found = this.footnoteLookup[ref];
    return found;
  }

  resolveGroup(ref: string): LaGroup {
    const found = this.groupLookup[ref];
    return found;
  }

  resolveSentenceKeys(list): Array<LaSentence> {
    const result = new Array<LaSentence>();
    list &&
      list.forEach(item => {
        const found = this.sentenceLookup[item];
        if (found) {
          result.push(found);
        }
      });
    return result;
  }

  resolveDecisionKeys(list): Array<LaDecisionNode> {
    const result = new Array<LaDecisionNode>();
    list &&
      list.forEach(item => {
        const found = this.decisionLookup[item];
        if (found) {
          result.push(found);
        }
      });
    return result;
  }

  attachDecisionRoot(root: LaDecisionRoot) {
    this.decisionLookup = {};
    this.attachDecision(root);
    this.decisionRoot = root;
  }

  private attachDecision(decision: LaDecisionNode) {
    this.decisionLookup[decision.ruleID] = decision;
    decision.subNodes &&
      decision.subNodes.forEach(item => {
        this.attachDecision(item);
      });
  }

  protected getDateTime() {
    return Tools.getNowIsoDate()
  }




  getModelCoreInfo() {
    if (!this.modelCoreInfo) {
      this.modelCoreInfo = this.createCaseCoreInfo({});
    }
    return this.modelCoreInfo;
  }



  asJson() {

    const result = {
      caseNumber: this.caseNumber,
      lampsType: this.lampsType,
      caseInfo: this.getModelCoreInfo(),
      modelInfo: this.modelInfo,
      groups: this.groups?.map(item => item.asJson()),
      sentences: this.sentences?.map(item => item.asJson()),
      paragraphs: this.paragraphs?.map(item => item.asJson()),
      footnotes: this.footnotes?.map(item => item.asJson()),

      ruleTree: this.decisionRoot?.asJson(),
      parking: this.parking,
      text: this.text,
      preprocessed: this.preprocessed,
    };

    return result;
  }

  asUploadedCase(user: LaUser, workspace: string): LaUploadedCase {

    this.modelCoreInfo.override({
      owner: user ? user.username : 'unknown',
      workspace: workspace ? workspace : 'development',
      lastChange: this.getDateTime()
    });

    const model = this.asJson();
    const uploadedCase = new LaUploadedCase(model.caseInfo);
    uploadedCase.data = JSON.stringify(model);

    return uploadedCase;
  }
}
