import { Component, OnInit, Input } from '@angular/core';

import { EmitterService, Toast, Tools } from '@app/shared';
import { environment } from '@environments/environment';

import { LaSentence, LaParagraph } from '../models';

import { LegalPadService } from '@app/models/legal-pad.service';
import { LegalSearchService } from '@app/models/legal-search.service';
import { LegalCaseService } from '../models/legal-case.service';
import { TagService } from '@app/models/tag.service';

export type modelService = LegalPadService | LegalSearchService | LegalCaseService;

@Component({
  selector: 'app-phrasecontext',
  templateUrl: './phrase-context.component.html'
})
export class PhraseContextComponent implements OnInit {
  showNotes = false;
  showTags = false;
  markedForDelete = false;

  @Input() userCanEdit = true;
  @Input() userCanDelete = false;
  @Input() showImmutable: boolean = true;

  @Input() sentence: LaSentence;
  @Input() context: LaParagraph;

  selectionFlag:string = ''

  constructor(
    private tagService: TagService,
    private eService: LegalSearchService, 
    private cService: LegalCaseService, 
    private pService: LegalPadService) 
    { }

    defaultService():modelService {
      if (environment.isLegalSearch) {
        return this.eService;
      }
      const service = environment.isLegalPad ? this.pService : this.cService;
      return service;
    }

  ngOnInit() {
    if (this.sentence) {

      var service = this.defaultService();
      this.context = service.findParagraph(this.sentence);

      if ( !this.context ) {
        const key = this.sentence.paraIDTag();
        Toast.info(`pulling from search`,`lookup ${key}`)
        this.eService.queryForParagraph(this.sentence, (found) => {
          service.establishParagraph(found)
          this.context = found;
        })
      }

    }

    //or pull paragraph from search service

    EmitterService.registerCommand(this, 'CloseAll', this.doClose);
    EmitterService.registerCommand(this, 'CloseNote', this.doCloseNote);
    EmitterService.registerCommand(this, 'CloseTags', this.doCloseTags);
    EmitterService.processCommands(this);
  }
  
  canEdit() {
    return this.userCanEdit;
  }
  canDelete() {
    return this.sentence.isImmutable() &&  this.userCanDelete;
  }

  doToggleMarkedForDelete(){
    this.markedForDelete = !this.markedForDelete;
  }

  isMarkedForDelete(){
    return this.markedForDelete;
  }

  doDelete(){
    if ( !this.markedForDelete) {
      this.doToggleMarkedForDelete()
      return
    }
    this.pService.removeParagraph(this.context)
  }

  
  canShowImmutable() {
    return this.showImmutable &&  this.context.isImmutable()
  }

  doClose(e:Event) {
    this.showNotes = false;
    this.showTags = false;
  }

  hasNotes():boolean {
    return Tools.isEmpty(this.context.notes) === false;
  }

  canAddNotes():boolean {
    return this.userCanEdit && this.tagService.canAddNotes;
  }

  doAddNote() {
    if ( this.context.isImmutable()) return;
    if ( !this.userCanEdit) return;

    if ( this.showNotes ) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  doOpenNote() {
    if ( this.context.isImmutable()) return;
    if ( !this.userCanEdit) return;

    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }



  doCloseNote() {
    this.showNotes = false;
  }

  doAddTags() {
    if ( this.context.isImmutable()) return;
    if ( !this.userCanEdit) return;

    if ( this.showTags ) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }

  tagToolTips() {
    const items = this.context.userTags.map(item => item.tagName)
    return JSON.stringify(items)
  }

  hasTags():boolean {
    return Tools.isEmpty(this.context.userTags) === false;
  }

  canAddTags():boolean {
    return this.userCanEdit && this.tagService.canAddTags;
  }


  doOpenTags() {
    if ( this.context.isImmutable()) return;
    if ( !this.userCanEdit) return;

    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }
  
  doCloseTags() {
    this.showTags = false;
  }

  getSentences() {
    return this.context?.sentences
  }

  selectionClass() {
    this.selectionFlag = ''
    if (this.context?.isItemOfInterest ) {
      this.selectionFlag = `${this.context.label} IS SELECTED`
      return 'item-of-interest-style'
    }
  }

  doToggleParagraphOfInterest() {
    if (this.context ) {
      this.context.isItemOfInterest = !this.context.isItemOfInterest
    }
  }


}
