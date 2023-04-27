import { Injectable, Injector } from '@angular/core';
import { Toast, EmitterService } from '../shared/emitter.service';


import { ReplaySubject } from 'rxjs';

import { Tools } from '../shared';
import { LaSentence, LaLegalCase, LaDecisionNode, LaDecisionRoot, LaParagraph, LaFilename, LaEnrichmentSet } from './';

import { environment } from '../../environments/environment';
import { LegalModelService } from './legal-model.service';
import { LaLegalModel } from './la-legalModel';
import { PluginPayload, TopicPayload } from '@app/sharedComponents/documentHub.service';
import { LaFootnote } from './la-footnote';



@Injectable({
  providedIn: 'root'
})
export class LegalCaseService extends LegalModelService {




  constructor(injector: Injector) {
    super(injector)

    EmitterService.registerCommand(this, 'FileOpenCase', this.onFileOpen);
    EmitterService.registerCommand(this, 'FileSaveCase', this.onFileSave);
    EmitterService.registerCommand(this, 'AutoSaveCaseAs', this.onAutoSaveAs);

    EmitterService.registerCommand(this, 'SetDirty', this.onSetDirty);
    EmitterService.processCommands(this);
  }

  public getCurrentModel$(): ReplaySubject<LaLegalModel> {
    if (this.modelStream$ == null) {
      this.modelStream$ = new ReplaySubject<LaLegalModel>(1);
    }
    return this.modelStream$;
  }



  public startEvents() {

    this.hubService.TopicPayload$().subscribe((result) => {
      this.receiveTopicPayload(result);
    });

    this.hubService.Plugin$().subscribe((result) => {
      EmitterService.broadcastCommand(this, 'RefreshPlugins', result);
    });
  }



  receiveTopicPayload(data: TopicPayload) {

    if (Tools.matches(data.topic, 'SentencePrediction')) {
      const sentID = data.payload.sentID;
      const text = data.payload.text;
      const sentence = this.currentLegalModel?.resolveSentence(sentID);
      if (sentence) {
        let predict = new LaEnrichmentSet({ rhetClass: data.payload.class });
        sentence.enrichmentSet = predict;
        //sentence.applyEnrichmentSet(predict);
        Toast.success(`asserting prediction...`, `${sentID}`);
      } else {
        //Toast.error(`Prediction for...`, `${sentID}  Not Found`);
      }
      EmitterService.broadcastCommand(this, 'RefreshPrediction');
    }

    if (Tools.matches(data.topic, 'DocumentPrediction')) {
      const sentID = data.payload.sentID;
      //const text = data.payload.text;
      const sentence = this.currentLegalModel?.resolveSentence(sentID);
      if (sentence) {
        let predict = new LaEnrichmentSet({ rhetClass: data.payload.class });
        sentence.enrichmentSet = predict; //this will just color the choice
        
        EmitterService.broadcastCommand(this, 'FindAnchor', sentence.anchorTag());
        sentence.applyEnrichmentSet(predict);  //this will force selection of best option
        //Toast.success(`asserting prediction...`, `${sentID} case-service`);
        this.computeLaStats();
      } else {
        //Toast.error(`Prediction for...`, `${sentID}  Not Found`);
      }
      EmitterService.broadcastCommand(this, 'RefreshPrediction');
    }


  }

  get polarityRoles() {
    const data = environment.defaultPredictions;
    const items = data.polarity.predictions;

    const roles = {
      //'All': 0.0,
      ...items
    }
    return Object.keys(roles);
  }

  getPolarityValues(): string[] {
    const roles = this.polarityRoles.slice();
    return roles;
  }


  doSplitParagraphOn(next: LaSentence): LaParagraph {
    const paragraph = this.currentLegalModel?.doSplitParagraphOn(next);
    return paragraph;
  }



  getPreviousParagraph(next: LaSentence): LaParagraph {
    const previous = this.currentLegalModel?.getPreviousParagraph(next);
    return previous;
  }

  getNextParagraph(previous: LaSentence): LaParagraph {
    const next = this.currentLegalModel?.getNextParagraph(previous);
    return next;
  }


  setParagraphSection(para:LaParagraph, name:string, isSection:boolean){
    para.sentences.forEach(sent => {
      this.setSentenceSection(sent, name, sent.isFirst && isSection)
    })

  }

  setSentenceSection(sent:LaSentence, name:string, isSection:boolean){
    sent.SetSectionTypeAndStatus(name,isSection);
    this.findFootnotes(sent).forEach(item => {
      item.SetSectionTypeAndStatus(name);
    })
  }

  getPreviousSentence(next: LaSentence): LaSentence {
    const previous = this.currentLegalModel?.getPreviousSentence(next);
    return previous;
  }

  getPreviousFootnote( next: LaSentence): LaSentence {
    const footnoteID = next.GetSectionType();
    const previous = this.currentLegalModel?.getPreviousFootnote(footnoteID, next);
    return previous;
  }

  getNextSentence(previous: LaSentence): LaSentence {
    const next = this.currentLegalModel?.getNextSentence(previous);
    return next;
  }

  deleteSentence(obj: LaSentence) {
    this.markAsDirty();
    this.currentLegalModel.deleteSentence(obj);
  }

  joinSentence(obj1: LaSentence, obj2: LaSentence, merge: string): LaSentence {
    const result = obj1.mergeTextFromSentence(obj2, merge);
    this.currentLegalModel.deleteSentence(obj2);
    this.markAsDirty();
    return result;
  }

  joinFootnote(obj1: LaSentence, obj2: LaSentence, merge: string): LaSentence {
    const result = obj1.mergeTextFromSentence(obj2, merge);
    this.currentLegalModel.deleteFootnoteSentence(obj2);
    this.markAsDirty();
    return result;
  }

  splitSentence(sentence: LaSentence, list: string[]): LaParagraph {
    const paragraph = this.currentLegalModel.splitSentence(sentence, list);
    paragraph && this.markAsDirty()
    return paragraph;
  }

  splitFootnote(sentence: LaSentence, list: string[]): LaFootnote {
    const footnote = this.currentLegalModel.splitFootnote(sentence, list);
    footnote && this.markAsDirty()
    return footnote;
  }


  appendSentenceToParagraph(sent: LaSentence, para: LaParagraph) {
    //write code to renumber 
    const current = this.currentLegalModel.resolveParagraph(sent.paraID);
    if (current == para) {
      Toast.error("Cannot add sentence to same paragraph")
      return
    }
    current.deleteSentence(sent)
    para.addSentence(sent);
    sent.renumId = 10000
    para.renumSentences();
    this.currentLegalModel.reorderParagraphs();
    this.markAsDirty();
    //Toast.info(para.lastSentence().text)
  }

  prependSentenceToParagraph(sent: LaSentence, para: LaParagraph) {
    //write code to renumber 
    const current = this.currentLegalModel.resolveParagraph(sent.paraID);
    if (current == para) {
      Toast.error("Cannot add sentence to same paragraph")
      return
    }
    current.deleteSentence(sent)
    para.addSentence(sent);
    sent.renumId = .1
    para.renumSentences();
    this.currentLegalModel.reorderParagraphs();
    this.markAsDirty();
    //Toast.info(para.lastSentence().text)
  }

  moveSentenceForward(sent: LaSentence) {
    //write code to renumber 
    const current = this.currentLegalModel.resolveParagraph(sent.paraID);
    sent.renumId -= 1.1
    current.renumSentences();
    this.markAsDirty();
    //Toast.info(para.lastSentence().text)
  }

  moveSentenceBackward(sent: LaSentence) {
    //write code to renumber 
    const current = this.currentLegalModel.resolveParagraph(sent.paraID);
    sent.renumId += 1.1
    current.renumSentences();
    this.markAsDirty();
    //Toast.info(para.lastSentence().text)
  }




  normalizeModel() {
    this.currentLegalModel?.normalizeModel();
  }

  insertSentence(sent: LaSentence): boolean {
    if (this.currentLegalModel) {
      this.currentLegalModel.establishSentence(sent)
      this.currentLegalModel.normalizeModel();
      return true;
    }
    return false;
  }

  finalizeLoadModel(model: LaLegalModel, data: any) {
    model.setText(data.text);
    model.normalizeModel();

    if (data.ruleTree) {
      const root = this.processDecisionRoot(data.ruleTree);
      model.attachDecisionRoot(root);
    }
    return super.finalizeLoadModel(model, data);
  }

  extractLaFilename(): LaFilename {
    if (this.currentLegalModel) {
      this.currentFilename = this.currentLegalModel.extractLaFilename()
      this.currentFilename.pre = 'case'
    }
    return this.currentFilename;
  }

  readAndRestoreFile(file: File) {
    const reader = new FileReader();
    reader.onerror = event => {
      Toast.error('fail...', JSON.stringify(event.target));
    };
    reader.onload = () => {

      const data = JSON.parse(reader.result as string);
      const model = this.createLegalModel<LaLegalCase>(LaLegalCase, data);
      this.currentFilename = this.extractLaFilename();
      this.currentFilename.syncronise(file.name);
    };

    reader.readAsText(file);
  }




  processDecisionRoot(node) {
    const tree = new LaDecisionRoot(node);
    if (node.nodes) {
      const list = Tools.isArray(node.nodes) ? node.nodes : [node.nodes];
      list.forEach(item => {
        this.processDecisionNodes(item, tree);
      });
    }
    return tree;
  }

  private processDecisionNodes(node, parent: LaDecisionNode) {
    const child = new LaDecisionNode(node);
    parent.addChild(child);

    if (node.nodes) {
      const list = Tools.isArray(node.nodes) ? node.nodes : [node.nodes];
      list.forEach(item => {
        this.processDecisionNodes(item, child);
      });
    }
    return child;
  }




  resolveDecisionKeys(list: Array<string>): Array<LaDecisionNode> {
    if (this.hasModel()) {
      return this.currentLegalModel.resolveDecisionKeys(list);
    }
    return [];
  }

  findDecisionByKey(key: string): LaDecisionNode {
    const result = this.resolveDecisionKeys([key])

    return Tools.isEmpty(result) ? undefined : result[0];
  }




}
