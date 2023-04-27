import { Component, OnInit, Input } from '@angular/core';
import { LegalCaseService } from '../models/legal-case.service';
import { LegalPadService } from '../models/legal-pad.service';
import { Tools } from '../shared';

import { EditOp, LaSentence } from '../models';
import { EmitterService, Toast } from '../shared/emitter.service';
import { TagService } from '@app/models/tag.service';


@Component({
  selector: 'app-sentence',
  templateUrl: './sentence.component.html'
})
export class SentenceComponent implements OnInit {
  EditOp = EditOp;
  readyToLabel = false;
  readyToEditText = false

  editMode: EditOp = EditOp.None;

  showNotes = false;
  showTags = false;
  showContext = false;
  @Input() showSelect = false;

  markedForDelete = false
  @Input() userCanAddNotesAndTags = false;
  @Input() userCanEdit = true;
  @Input() userCanDelete = false;
  @Input() showImmutable: boolean = true;

  @Input() sentence: LaSentence;
  @Input() renderLikePage: boolean;
  @Input() fullSendID: boolean = false
  @Input() filter = 'All';




  constructor(
    private tService: TagService,
    private cService: LegalCaseService,
    private pService: LegalPadService) {
  }

  ngOnInit() {
    EmitterService.registerCommand(this, 'CloseAll', this.doClose);
    EmitterService.registerCommand(this, 'CloseNote', this.doCloseNote);
    EmitterService.registerCommand(this, 'CloseTags', this.doCloseTags);
    EmitterService.processCommands(this);
  }

  innerTextMarkup() {
    if (this.tService.isPostEdit(this.sentence) && !this.sentence.IsDeleted()) {
      return this.sentence.postEditMarkup(this.sentence.text);
    }
    return this.sentence.textMarkup(this.sentence.isItemOfInterest)
  }

  ColorClass() {
    if (this.tService.hideColors) {
      return ''
    }
    return this.sentence.getRhetClass()
  }

  RhetColorClass() {
    return this.sentence.getRhetClass()
  }

  canShowPolarity() {
    return this.sentence.isFindingSentence() && this.userCanEdit;
  }

  getIsSentenceOfInterest() {
    return this.sentence.isItemOfInterest;
  }

  setIsSentenceOfInterest(value: boolean) {
    this.sentence.isItemOfInterest = value;
  }

  canShowImmutable() {
    return this.showImmutable && this.sentence.isImmutable()
  }

  isSentenceFilter() {
    return Tools.matches(this.filter, 'Sentence');
  }

  isSentenceOrAllFilter() {
    return this.isSentenceFilter() || Tools.matches(this.filter, 'All');
  }

  isNotSentenceOrAllFilter() {
    return !this.isSentenceFilter() && !Tools.matches(this.filter, 'All');
  }

  doCloseNote() {
    this.showNotes = false;
  }

  doClose(e: Event) {
    this.readyToLabel = false;
    this.readyToEditText = false;
    this.showNotes = false;
    this.showTags = false;
  }
  canEdit() {
    return this.userCanEdit;
  }
  canDelete() {
    return this.sentence.isImmutable() && this.userCanDelete;
  }
  canEditSection() {
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return false;
    return this.tService.canEditSection;
  }

  canSelectSentence() {
    if (this.showSelect ) return true;
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return false;
    return this.tService.canSelectSentence;
  }

  setCurrentAnchorTag(tag: string) {
    this.tService.setCurrentAnchorTag(tag)
  }


  doToggleMarkedForDelete() {
    this.markedForDelete = !this.markedForDelete;
  }

  isMarkedForDelete() {
    return this.markedForDelete;
  }

  doDelete() {
    if (!this.markedForDelete) {
      this.doToggleMarkedForDelete()
      return
    }
    this.pService.removeSentence(this.sentence)
  }

  hasNotes(): boolean {
    return Tools.isEmpty(this.sentence.notes) === false;
  }

  private isSentenceNotFirst() {
    return !this.sentence.isFirst;
  }

  private isSentenceNotLast() {
    return !this.sentence.isLast;
  }



  // private isSentenceInside(){
  //   return !this.sentence.isFirst && !this.sentence.isLast
  // }
  // private isSentenceOutside(){
  //   return this.sentence.isFirst || this.sentence.isLast
  // }

  canDoMoveSentenceUp(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canMoveSentenceUp && this.sentence.isFirst;
  }

  canDoMoveSentenceDown(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canMoveSentenceDown && this.sentence.isLast;
  }

  canDoSplitParagraph(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canSplitParagraph && this.isSentenceNotLast();
  }

  canDoInsertParagraph(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canInsertParagraph && this.sentence.isLast;
  }

  canDoInsertSentence(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canInsertSentence;
  }

  canDoEditFootnote(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canEditFootnote && this.sentence.hasFootnoteReference();
  }

  canDoMoveSentenceForward(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canMoveSentenceForward && this.isSentenceNotFirst();
  }

  canDoMoveSentenceBackward(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canMoveSentenceBackward && this.isSentenceNotLast();
  }

  canDoJoinText(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canJoinText && this.isSentenceNotFirst();
  }

  canDoSplitText(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canSplitText;
  }

  canDoQuickSplitText(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canQuickSplitText;
  }

  canDoEditText(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canEditText;
  }

  canDoDeleteText(): boolean {
    return this.userCanAddNotesAndTags && this.tService.canDeleteText;
  }


  doSplitParagraph() {
    this.cService.doSplitParagraphOn(this.sentence);
  }

  doMoveSentenceUp() {
    const para = this.cService.getPreviousParagraph(this.sentence);
    if (para) {
      this.cService.appendSentenceToParagraph(this.sentence, para);
    }
  }

  doMoveSentenceDown() {
    const para = this.cService.getNextParagraph(this.sentence);
    if (para) {
      this.cService.prependSentenceToParagraph(this.sentence, para);

    }
  }

  doMoveSentenceForward() {
    this.cService.moveSentenceForward(this.sentence);
  }

  doMoveSentenceBackward() {
    this.cService.moveSentenceBackward(this.sentence);
  }

  canAddNotes(): boolean {
    return (this.userCanAddNotesAndTags || this.userCanEdit) && this.tService.canAddNotes;
  }

  doAddNote() {
    if (this.sentence.isImmutable()) return;
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return;

    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  doOpenNote() {
    if (this.sentence.isImmutable()) return;
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return;

    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  doAddTags() {
    if (this.sentence.isImmutable()) return;
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return;

    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }

  canShowProbability() {
    return this.tService.canLabel && this.sentence.readProbabilityValue() >= 0.0;
  }
  tagToolTips() {
    const items = this.sentence.userTags.map(item => item.tagName)
    return JSON.stringify(items)
  }

  hasTags(): boolean {
    return Tools.isEmpty(this.sentence.userTags) === false;
  }

  canAddTags(): boolean {
    return (this.userCanAddNotesAndTags || this.userCanEdit) && this.tService.canAddTags;
  }


  doOpenTags() {
    if (this.sentence.isImmutable()) return;
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return;

    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }

  doCloseTags() {
    this.showTags = false;
  }

  doToggleItemOfInterest() {
    if (!(this.userCanAddNotesAndTags || this.userCanEdit)) return;

    this.setIsSentenceOfInterest(!this.getIsSentenceOfInterest());
  }

  hasItemOfInterest(): boolean {
    return this.getIsSentenceOfInterest()
  }

  doToggleContext() {
    //maybe we can always show context
    //if ( this.sentence.isImmutable()) return;
    //if ( !this.userCanEdit) return;
    this.showContext = !this.showContext;
  }

  doOpenClassification() {
    //if ( this.sentence.isImmutable()) return;
    if (!(this.tService.canLabel || this.userCanEdit)) return;

    if (this.sentence?.isSection) {
      return;
    }

    if (this.readyToLabel) {
      // skip for now this.doClose()
      this.readyToLabel = false;
    } else {
      this.readyToLabel = true;
      EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
        this.readyToLabel = true;
      });
    }
  }

  doOpenTextEditor(editMode: EditOp = EditOp.None) {
    //if ( this.sentence.isImmutable()) return;
    if (!(this.tService.canSplitText || this.userCanEdit)) return;

    this.editMode = editMode;

    if (this.readyToEditText) {
      // skip for now this.doClose()
      this.readyToEditText = false;
    } else {
      this.readyToEditText = true;
      EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
        this.readyToEditText = true;
      });
    }
  }

  doOpenQuickSplit() {
    //if ( this.sentence.isImmutable()) return;
    if (!(this.tService.canQuickSplitText || this.userCanEdit)) return;


    if (this.readyToEditText) {
      // skip for now this.doClose()
      this.readyToEditText = false;
    } else {
      this.readyToEditText = true;
      EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
        this.readyToEditText = true;
      });
    }
  }

  isReadyToLabel() {
    return this.readyToLabel;
  }

  isReadyToEditText() {
    return this.readyToEditText;
  }

  sentenceTag() {
    if (this.fullSendID) {
      return this.sentence?.fullSentTag();
    }
    return this.sentence?.sentTag();
  }

}
