import { Injectable } from '@angular/core';
import { Injector } from '@angular/core';
import { Toast, EmitterService } from '../shared/emitter.service';

import { LibraryService } from './library.service';
import { AuthenticationService } from '../login/authentication.service';
import { TeamsService } from './teams.service';

import { ReplaySubject, Subject } from 'rxjs';
import { HttpPayloadService } from '@app/shared/httpPayload.service';

import { Constructable, Tools } from '../shared';
import { saveAs } from 'file-saver-es';
import { LaSentence, LaStats, LaParagraph, LaUser, LaResolvable, LaFilename, LaFootnote, Health } from '.';

import { environment } from '../../environments/environment';

import { LaLegalModel } from './la-legalModel';
import { DocumentHubService } from '@app/sharedComponents/documentHub.service';

import { CreateGroupSpec, LaGroup, LaStrongReference } from './la-group';



export interface ILegalService {
    serverConnected: boolean;
    isConnected():boolean;
    isPingSucessful():boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LegalModelService implements ILegalService {

  private isModelDirty = false;
  public isPingSuccess = false;

  public serverConnected: boolean = false;

  public defaultModelRefId: string = ''
  public selectedText = '';
  public modelStats: { [name: string]: LaStats } = {};
  public modelStatsList: Array<LaStats>;


  public currentBookmark = '';
  private saveCountdown = 30;
  private saveInterval: any;

  protected currentFilename: LaFilename;
  protected currentLegalModel: LaLegalModel;
  protected modelStream$: ReplaySubject<LaLegalModel>;

  protected libraryService;
  protected authService;
  protected teamService;
  protected hubService;
  protected payloadService;

  constructor(injector: Injector) {
    setTimeout(() => {
      this.payloadService = injector.get(HttpPayloadService);
      this.libraryService = injector.get(LibraryService);
      this.authService = injector.get(AuthenticationService);
      this.teamService = injector.get(TeamsService);
      this.hubService = injector.get(DocumentHubService);
    }, 0.01);
  }

  isPingSucessful():boolean{
    return this.isPingSuccess;
  }

  pingServer$(): Subject<boolean> {
    const localSubject = new Subject<boolean>();
    // const serviceOptions = new HubServiceLocator({
    //   serviceKey: 'pingServer$',
    //   endpoint: `/api/Health`
    // });

    //var service = new HttpPayloadService(new HttpClient())
    //const httpSubject = service.get$(Health, serviceOptions);

    setTimeout(() => {
      this.isPingSuccess = true;
      localSubject.next(true);
    }, 100);
    // httpSubject.subscribe({
    //   next: (result) => {
    //     if (result.hasError) {
    //       localSubject.error(result.message);
    //     } else {
    //       this.isPingSuccess = true;
    //       localSubject.next(true);
    //     }
    //   },
    //   error: (error) => localSubject.error(error),
    //   complete: () => console.info('complete')
    // });

    return localSubject;
  }

  public isConnected():boolean {
    return this.serverConnected;
  }

  varifyConnection(successFn: () => void, failureFn: () => void) {
    this.pingServer$().subscribe({
      next: (success: boolean) => {
        this.serverConnected = success;
        successFn();
      },
      error: (error) => {
        this.serverConnected = error;
        failureFn();
      }
    });
  }
  
  filename(): string {
    return this.currentFilename?.getFilename();
  }

  get shortFilename(): string {
    return this.currentFilename?.getName();
  }

  LaFilename(): LaFilename {
    if (!this.currentFilename) {
      this.extractLaFilename();
    }
    return this.currentFilename;
  }

  extractLaFilename(): LaFilename {
    if (this.currentLegalModel) {
      this.currentFilename = this.currentLegalModel.extractLaFilename()
    } else {
      this.currentFilename = new LaFilename();
    }
    return this.currentFilename;
  }



  getFootnoteText(footnoteRefs: string[]): string {
    return this.legalModel()?.getFootnoteText(footnoteRefs);
  }

  clearBookmarks() {
    this.currentBookmark = ''
    this.legalModel().clearBookmarks()
  }

  gotoNextBookmark(target?: string) {
    const marks = this.legalModel().getBookmarks();
    if (Tools.isEmpty(marks)) return;

    const found = marks.indexOf(this.currentBookmark);
    if (target) {
      this.currentBookmark = target;
    } else {
      if (found != -1) {
        this.currentBookmark = marks[found + 1]
      }
      if (!this.currentBookmark) {
        this.currentBookmark = marks[marks.length - 1];
      }
    }

    EmitterService.broadcastCommand(this, 'GoToBookmark;JumpToAnchor', this.currentBookmark);
  }

  gotoPreviousBookmark(target?: string) {
    const marks = this.legalModel().getBookmarks();
    if (Tools.isEmpty(marks)) return;

    const found = marks.indexOf(this.currentBookmark);
    if (target) {
      this.currentBookmark = target;
    } else {
      if (found >= 1) {
        this.currentBookmark = marks[found - 1]
      }
      if (!this.currentBookmark) {
        this.currentBookmark = marks[0];
      }
    }

    EmitterService.broadcastCommand(this, 'GoToBookmark;JumpToAnchor', this.currentBookmark);
  }

  pluginList() {
    return this.hubService.pluginList();
  }

  getUniqueSection() {
    const dict = {
      "Dissent": "",
      "Court": "",
      "Concur": "",
    }
    this.legalModel().getSentences().forEach(item => {
      const section = item.GetSectionType();
      dict[section] = section
    })
    let list = Object.keys(dict).sort();
    return list
  }

  public getCurrentModel$(): ReplaySubject<LaLegalModel> {
    Toast.error("getCurrentModel$, should not be called")
    return this.modelStream$;
  }

  legalModel() {
    return this.currentLegalModel;
  }

  hasLegalModel() {
    return this.currentLegalModel ? true : false;
  }

  getModelName() {
    return this.currentLegalModel?.getModelName();
  }

  getSentencesOfInterest(): Array<LaSentence> {
    return this.currentLegalModel?.getSentencesOfInterest()
  }

  getParagraphsOfInterest(): Array<LaParagraph> {
    return this.currentLegalModel?.getParagraphsOfInterest()
  }



  isParagraph(ref: LaStrongReference) {
    return Tools.matches(ref.referenceType, 'LaParagraph');
  }

  isSentence(ref: LaStrongReference) {
    return Tools.matches(ref.referenceType, 'LaSentence');
  }

  isGroup(ref: LaStrongReference) {
    return Tools.matches(ref.referenceType, 'LaGroup');
  }

  resolve(ref: LaStrongReference): LaResolvable {
    let obj: LaResolvable = undefined;
    if (this.isParagraph(ref)) {
      obj = this.currentLegalModel?.resolveParagraph(ref.referenceID);
    }
    else if (this.isSentence(ref)) {
      obj = this.currentLegalModel?.resolveSentence(ref.referenceID);
    }
    else if (this.isGroup(ref)) {
      obj = this.currentLegalModel?.resolveGroup(ref.referenceID);
    }
    return obj;
  }
  public stopEvents() {
    this.hubService.doStop(() => {
      Toast.error('Service stopped');
    });
  }

  clearCountdown() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    this.saveCountdown = 0;
  }

  resetCountdown() {
    this.clearCountdown();
    this.saveCountdown = 30;
    const funct = this.checkStatus;
    const context = this;
    this.saveInterval = setInterval(function () {
      funct(context);
    }, 1000);
  }



  checkStatus(context) {
    context.saveCountdown -= 1;
    if (context.saveCountdown <= 0) {
      clearInterval(context.saveInterval);
      context.onAutoSaveAs();
    }
    return context.saveCountdown;
  }

  broadcastMakeDocumentPrediction() {
    //sent this out to have associated AI make predictions
    const model = this.currentLegalModel;
    const sentences = model.getSentences().filter(item => item.isImmutable() == false);
    sentences.forEach(sentence => {
      //if ( sentence.hasNoPrediction() ) {
        const item = new LaSentence(sentence);
        this.hubService.broadcastTopicPayload('MakeDocumentPrediction', item);
      ///}
    });

  }

  broadcastMakeSentencePrediction(sentence: LaSentence) {
    //sent this out to have associated AI make predictions
    const item = new LaSentence(sentence);
    this.hubService.broadcastTopicPayload('MakeSentencePrediction', item);
  }

  public applyPredictionForAll(category: string, label: string, threshold: number, user: LaUser) {
    const model = this.currentLegalModel;
    const sentences = model.getSentences().filter(item => item.isImmutable() == false);

    sentences.forEach(item => {
      //get the enriched value for this sentence
      if (item.hasPredictedClass(label)) {
        const prediction = item.readProbabilityValue(category);
        if (prediction >= threshold) {
          item.writeLabel(category, label, user?.email);
          item.writeProbability(category, prediction, user?.email);
        }
      }
    });
    this.markAsDirty();
  }

  public autoSaveCountdown(): number {
    return this.saveCountdown;
  }

  get currentUsername() {
    const user = this.authService.currentUserValue;
    return user ? user.username : 'unknown';
  }

  public isDirty() {
    return this.isModelDirty;
  }

  public markAsDirty() {
    if (!this.currentLegalModel) {
      this.isModelDirty = false;
      return
    }

    if (!this.isModelDirty) {
      this.resetCountdown();
    }
    this.isModelDirty = true;
  }

  public markAsSaved() {
    this.clearCountdown();
    this.isModelDirty = false;
  }

  establishParagraph(paragraph: LaParagraph) {
    return this.currentLegalModel?.establishParagraph(paragraph);
  }

  findParagraph(sentence: LaSentence): LaParagraph {
    const key = sentence.paraIDTag();
    const paragraph = this.currentLegalModel?.resolveParagraph(key);

    return paragraph;
  }



  resolveSentenceKeys(list) {
    if (this.hasModel()) {
      return this.currentLegalModel.resolveSentenceKeys(list);
    }
    return [];
  }

  parkSentence(sentence: LaSentence): LaLegalModel {
    this.markAsDirty();
    return this.currentLegalModel?.parkSentence(sentence);
  }

  removeSentence(sentence: LaSentence): LaLegalModel {
    this.markAsDirty();
    return this.currentLegalModel?.removeSentence(sentence);
  }

  removeParagraph(paragraph: LaParagraph): LaLegalModel {
    this.markAsDirty();
    return this.currentLegalModel?.removeParagraph(paragraph);
  }

  reorderParagraphs() {
    this.markAsDirty();
    this.currentLegalModel?.reorderParagraphs();
  }

  removeGroup(group: LaGroup): LaLegalModel {
    this.markAsDirty();
    return this.currentLegalModel?.removeGroup(group);
  }

  createGroup(groupInfo: CreateGroupSpec) {
    this.markAsDirty();
    return this.currentLegalModel?.createGroupFromSpec(groupInfo);
  }

  onFileOpen(file: File) {
    try {
      Toast.info('opening...', file.name);
      this.readAndRestoreFile(file);
    } catch (ex) {
      Toast.error(ex.message)
    }
  }

  onFileSave() {
    try {
      if (this.currentLegalModel) {
        this.saveCurrentModel();
        Toast.info('saving...', this.filename());
      }
    } catch (ex) {
      Toast.error(ex.message)
    }
  }

  onSetDirty() {
    this.markAsDirty();
  }

  onAutoSaveAs() {
    try {
      if (this.isDirty() && this.currentLegalModel) {
        this.saveCurrentModel();
        Toast.info('auto saving...', this.filename());
      }
    } catch (ex) {
      Toast.error(ex.message)
    }
  }

  readAndRestoreFile(file: File) {
    Toast.error("cannot call an abstract function")
  }


  fillModelFromJson(model: LaLegalModel, data: any) {
    //look for notes and tags
    if (data.paragraphs?.length > 0) {
      data.paragraphs.forEach(item => {
        const para = new LaParagraph(item)
        model.establishParagraph(para)
      });
    }

    if (data.sentences?.length > 0) {
      data.sentences.forEach(item => {
        const sent = new LaSentence(item)
        model.establishSentence(sent);
        //this will break it right
        //sent.modifyTextAndHideFootnotes()
      });
    }

    if (data.footnotes?.length > 0) {
      data.footnotes.forEach(item => {
        const note = new LaFootnote(item)
        model.establishFootnote(note)
      });
    }

    if (data.groups?.length > 0) {
      data.groups.forEach(item => {
        const group = new LaGroup(item)
        model.establishGroup(group)
      });
    }

    return model;
  }


  createLegalModel<T extends LaLegalModel>(type: Constructable<T>, data: any): LaLegalModel {
    this.resetStats();

    const model = new type({
      caseNumber: data.docID || data.caseNumber || "Unknown",
      preprocessed: data.preprocessed || []
    });


    model.createCaseCoreInfo(data.caseInfo);

    this.fillModelFromJson(model, data)
    this.markAsSaved();
    return this.finalizeLoadModel(model, data)
  }

  finalizeLoadModel(model: LaLegalModel, data: any) {
    this.currentLegalModel = model;
    this.currentFilename = this.extractLaFilename();
    return this.currentLegalModel;
  }

  hasModel() {
    return this.currentLegalModel ? true : false;
  }

  getModelCoreInfo() {
    return this.currentLegalModel?.getModelCoreInfo();
  }


  getParagraphs(): Array<LaParagraph> {
    return this.currentLegalModel?.getParagraphs();
  }

  getSentences(): Array<LaSentence> {
    return this.currentLegalModel?.getSentences();
  }

  getFootnotes(): Array<LaFootnote> {
    return this.currentLegalModel?.getFootnotes();
  }

  getGroups(): Array<LaGroup> {
    return this.currentLegalModel?.getGroups();

  }

  getFilteredSentenceList(key: string) {
    if (Tools.matches('all', key) && this.hasModel()) {
      return this.currentLegalModel.getSentences();
    }

    this.computeLaStats();
    if (this.modelStats[key]) {
      const list = this.modelStats[key].getMembers();
      list.sort((a, b) => b.compare(a));
      return list;
    }
    return []
  }

  resetStats() {
    this.modelStats = {}
    this.modelStatsList = null
  }

  findFootnotes(sent:LaSentence): Array<LaFootnote> {
    return this.currentLegalModel?.findFootnotes(sent) || [];
  }

  sentenceRhetClasses() {
    const data = environment.defaultPredictions;
    const items = data.rhetClass.predictions;

    const roles = {
      'All': 0.0,
      ...items
    }
    return Object.keys(roles);
  }

  getSentenceRoles(): string[] {
    return this.sentenceRhetClasses().slice();
  }

  computeLaStats() {
    if (this.modelStatsList?.length > 0) {
      return this.modelStatsList;
    }

    this.modelStats = {}
    this.modelStatsList = new Array<LaStats>();
    if (this.currentLegalModel) {

      this.sentenceRhetClasses().forEach(filter => {
        const obj = new LaStats({ filter: filter, name: filter });
        this.modelStatsList.push(obj);
        this.modelStats[filter] = obj;
      });

      const allStats: LaStats = this.modelStats['All']
      allStats.perserveOrder = true

      const sentences = this.currentLegalModel.getSentences();
      sentences && sentences.forEach(item => {
        allStats.addMember(item);
        const filter = item.readRhetClass();
        const target = this.modelStats[filter]
        if (target) {
          target.addMember(item);
        }
      });

      Tools.forEachKeyValue(this.modelStats, (key, value) => {
        value.sortMembers()
      })

    }

    return this.modelStatsList;
  }

  saveCurrentModel() {
    if (!this.currentLegalModel) {
      Toast.error("lsJson model is empty", "no document is currently open")
      return;
    }

    const user = this.authService.currentUserValue;
    const workspace = this.teamService.currentWorkspace;

    //update the model with filename here 
    this.currentFilename.incrementVersion()
    this.currentLegalModel.updateFilename(this.currentFilename)

    const model = this.currentLegalModel.asUploadedCase(user, workspace);
    const blob = new Blob([model.data], { type: 'text/plain;charset=utf-8' });


    saveAs(blob, this.currentLegalModel.filename);
    this.markAsSaved();
    EmitterService.broadcastCommand(this, 'Saved', this.currentLegalModel.filename);
  }



}


