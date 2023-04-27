import { Injectable, Injector } from '@angular/core';
import { EmitterService, Toast, Tools } from '../shared';

import { ReplaySubject } from 'rxjs';

import { LaEnrichmentSet, LaFilename, LaSentence } from '.';
import { LaLegalPad } from './la-legalPad';

import { LaParagraph } from './la-paragraph';
import { LegalModelService } from './legal-model.service';
import { LaLegalModel } from './la-legalModel';
import { TopicPayload } from '@app/sharedComponents/documentHub.service';



@Injectable({
  providedIn: 'root'
})
export class LegalPadService extends LegalModelService {


  constructor(injector: Injector) {
    super(injector);

    EmitterService.registerCommand(this, 'FileOpenNotes', this.onFileOpen);
    EmitterService.registerCommand(this, 'FileSaveNotes', this.onFileSave);
    EmitterService.registerCommand(this, 'AutoSaveNotesAs', this.onAutoSaveAs);

    EmitterService.registerCommand(this, 'SetDirty', this.onSetDirty);
    EmitterService.processCommands(this);

    this.currentFilename = new LaFilename({
      pre: `note`,
      name: Tools.getNowIsoDate().split('.')[0],
    })

  }

  extractLaFilename(): LaFilename {
    if (this.currentLegalModel) {
      this.currentFilename = this.currentLegalModel.extractLaFilename()
      this.currentFilename.pre = 'note'
    }
    return this.currentFilename;
  }

  public getCurrentModel$(): ReplaySubject<LaLegalModel> {
    if (this.modelStream$ == null) {
      this.modelStream$ = new ReplaySubject<LaLegalModel>(1);
    }
    return this.modelStream$;
  }

  public startEvents() {
    this.hubService.Pong$().subscribe((result) => {
      Toast.success(result);
    });

    this.hubService.TopicPayload$().subscribe((result) => {
      this.receiveTopicPayload(result);
    });

  }




  readAndRestoreFile(file: File) {

    const reader = new FileReader();
    reader.onerror = event => {
      Toast.error('fail...', JSON.stringify(event.target));
    };
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);

      const model = this.createLegalModel<LaLegalPad>(LaLegalPad, data);
      this.currentFilename = this.extractLaFilename();
      this.currentFilename.syncronise(file.name);
      this.getCurrentModel$().next(model);

      Toast.success('Search loading!', model.filename);
    };

    reader.readAsText(file);
  }

  get summary(): any {
    return this.hubService.summary;
  }


  sendPing() {
    this.hubService.doPing();
  }

  broadcastAddSentenceToPad(sentence: LaSentence) {
    //anything send is now imutable it is easiest to add the date in the receiver
    const item = new LaSentence(sentence);
    item.markAsImmutable()
    this.hubService.broadcastTopicPayload('AddSentenceToPad', item);
  }

  broadcastAddParagraphToPad(paragraph: LaParagraph) {
    //anything send is now imutable it is easiest to add the date in the receiver
    //Copy is necessary because we are sending sentences
    const item = new LaParagraph(paragraph);
    item.sentences = paragraph.sentences.map(sent => {
      const copy = new LaSentence(sent);
      return copy.markAsImmutable()
    })
    this.hubService.broadcastTopicPayload('AddParagraphToPad', item);
  }


  receiveTopicPayload(data: TopicPayload) {

    if (!this.currentLegalModel) {
      const model = this.createLegalModel<LaLegalPad>(LaLegalPad, {});
      this.getCurrentModel$().next(model);
    }

    if (Tools.matches(data.topic, 'warning')) {
      Toast.warning(data.topic, data.payload);
    }

    if (Tools.matches(data.topic, 'info')) {
      Toast.info(data.topic, data.payload);
    }

    if (Tools.matches(data.topic, 'error')) {
      Toast.error(data.topic, data.payload);
    }

    if (Tools.matches(data.topic, 'AddSentenceToPad')) {
      const item = new LaSentence(data.payload);
      this.currentLegalModel?.establishSentence(item.markAsImmutable())
      Toast.success(`adding sentence...`, `${item.fullSentTag()}`);
    }

    if (Tools.matches(data.topic, 'AddParagraphToPad')) {
      const item = new LaParagraph(data.payload);
      this.currentLegalModel?.establishParagraph(item.markAsImmutable())
      Toast.success(`adding paragraph...`, `${item.computeID().paraID}`);
    }

    if (Tools.matches(data.topic, 'Prediction')) {
      const sentID = data.payload.sentID;
      
      const text = data.payload.text;
      const result = data.payload.class;
      const sentence = this.currentLegalModel?.resolveSentence(sentID);
      if (sentence) {
        let predict = new LaEnrichmentSet(result);
        sentence.applyEnrichmentSet(predict);

        EmitterService.broadcastCommand(this, 'FindAnchor', sentence.anchorTag());

        //Toast.success(`asserting prediction...`, `${sentID} pad-service`);
      } else {
        //Toast.error(`Prediction for...`, `${sentID}  Not Found`);
      }
    }


    EmitterService.broadcastCommand(this, 'RefreshDisplay');
  }


}
