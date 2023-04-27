import { Component, OnInit, Input } from '@angular/core';

import { EditOp, LaSentence } from '../models';
import { EmitterService, Toast } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';
import { OpenPage, TagService } from '@app/models/tag.service';
import { spConfig } from '@app/parser/sp-config';
import { spSentence } from '@app/parser/sp-sentence';
import { spParser, spToken } from '@app/parser';


export enum FromSide { FromLeft, FromRight }

@Component({
  selector: 'app-sentence-edit',
  templateUrl: './sentence-edit.component.html'
})
export class SentenceEditComponent implements OnInit {
  @Input() context: LaSentence;
  @Input() editMode: EditOp = EditOp.None;
  canExecute = false

  targets: LaSentence[] = new Array<LaSentence>();
  tokenList: spSentence;
  parser: spParser;


  splittext: string = ''
  original: string = '';
  fromSide: FromSide = FromSide.FromLeft;
  previous: LaSentence;
  sentence1: LaSentence;
  sentence2: LaSentence;


  constructor(
    private tService: TagService,
    private cService: LegalCaseService) {

    const config = new spConfig()
    this.parser = new spParser(config);
  }

  isFootnotePage() {
    return this.tService.openPage == OpenPage.Footnote;
  }

  ngOnInit() {

    this.original = this.context.text;
    this.sentence1 = null;
    this.sentence2 = null;

    //always make copies so you can confirm and undo
    if (this.isJoinMode()) {
      const s1 = this.isFootnotePage() ? this.cService.getPreviousFootnote(this.context) : this.cService.getPreviousSentence(this.context)
      const s2 = this.context;
      this.sentence1 = new LaSentence(s1);
      this.sentence2 = new LaSentence(s2);
      this.previous = s1;
      this.targets = [this.sentence1, this.sentence2];
    }

    if (this.isTokenizeMode()) {

      this.parser.setBuffer(this.context.text)
      this.tokenList = this.parser.readSentenceToLastToken();
      this.targets = this.tokenList.asSentenceList(this.context);
      //console.log(this.tokenList)
    }


    if (this.isSplitMode()) {
      const s1 = this.context;
      this.sentence1 = new LaSentence(s1);
      this.sentence2 = new LaSentence(s1);
      this.sentence2.sentenceNumber = `${this.sentence1.renumId + 1}`;
      this.sentence2.text = ''
      this.targets = [this.sentence1, this.sentence2];
    }

    if (this.isDeleteMode()) {
      const s1 = this.context;
      this.sentence1 = new LaSentence(s1);
      this.sentence2 = new LaSentence(s1);
      this.sentence2.text = ''
      this.targets = [this.sentence1, this.sentence2];
    }

    if (this.isEditMode()) {
      const s1 = this.context;
      this.sentence1 = new LaSentence(s1);
      this.targets = [this.sentence1];
    }

    if (this.isInsertParagraphMode()) {
      const s1 = this.context;
      this.sentence1 = new LaSentence(s1);
      this.sentence1.text = "FIRST SENTENCE OF A NEW PARAGRAPH"
      const newNum = parseInt(s1.paragraphNumber) + .5
      this.sentence1.paragraphNumber = `${newNum}`;
      this.sentence1.sentenceNumber = '1'
      this.sentence1.computeID()
      this.targets = [this.sentence1];
    }

    if (this.isInsertSentenceMode()) {
      const s1 = this.context;
      this.sentence1 = new LaSentence(s1);
      const newNum = parseInt(s1.sentenceNumber) + .5
      this.sentence1.text = "INSERTED NEW SENTENCE IN THIS PARAGRAPH"
      this.sentence1.sentenceNumber = `${newNum}`;
      this.sentence1.computeID()
      this.targets = [this.sentence1];
    }


    if (this.isFootnoteMode()) {
      const s1 = this.context;
      const f1 = this.cService.findFootnotes(s1)
      this.sentence1 = new LaSentence(s1);
      this.targets = [this.sentence1];
    }

    this.tService.clearPostEdit();

    this.onRefreshSelected()

    EmitterService.registerCommand(this, 'RefreshSelected', this.onRefreshSelected);
    EmitterService.processCommands(this);
  }

  isJoinMode() {
    return this.editMode == EditOp.Join;
  }

  isTokenizeMode() {
    return this.editMode == EditOp.Tokenize;
  }


  isSplitMode() {
    return this.editMode == EditOp.Split;
  }

  isDeleteMode() {
    return this.editMode == EditOp.Delete;
  }

  isEditMode() {
    return this.editMode == EditOp.Edit;
  }

  isFootnoteMode() {
    return this.editMode == EditOp.Footnote;
  }

  isInsertParagraphMode() {
    return this.editMode == EditOp.InsertPara;
  }

  isInsertSentenceMode() {
    return this.editMode == EditOp.InsertSent;
  }



  canEditText() {
    return this.isEditMode() || this.isInsertParagraphMode() || this.isInsertSentenceMode() || this.isFootnoteMode();
  }

  mode() {
    if (this.isJoinMode()) {
      return 'Join Sentences';
    }
    if (this.isTokenizeMode()) {
      return 'Quick Split';
    }
    if (this.isSplitMode()) {
      return 'Split Sentences';
    }
    if (this.isDeleteMode()) {
      return 'Split / Delete Fragments';
    }
    if (this.isEditMode()) {
      return 'Edit Sentence Text';
    }
    if (this.isInsertSentenceMode()) {
      return 'Insert Sentence / New Text';
    }
    if (this.isInsertParagraphMode()) {
      return 'Insert Paragraph / New Text';
    }
    if (this.isFootnoteMode()) {
      return 'Edit / Delete Footnote';
    }
    return 'unknown mode';
  }

  changedTargets() {
    return this.targets;
  }

  getButtonClass(token:spToken) {
    if ( this.parser.isEndOfSentence(token) ) {
      return 'btn-success'
    }
    return '';
  }

  doSplitAtToken(token:spToken){
    this.canExecute = false;
    token.isTerminator = !token.isTerminator
    this.targets = this.tokenList.asSentenceList(this.context);
  }

  onJoinChange(ev?: Event) {
    this.canExecute = false;
    this.sentence1.text = this.previous.text;
    const spaceOnly = "             ".substring(0, this.splittext.length)
    this.sentence2.text = `${spaceOnly}${this.original}`
    this.splittext = spaceOnly;
  }

  onSplitChange(ev?: Event) {
    this.canExecute = false;
    let all = this.sentence1.text + this.sentence2.text;
    let len = this.splittext.length;
    let index = all.indexOf(this.splittext);

    if (len > 0 && index != -1) {
      if (this.fromSide == FromSide.FromLeft) {
        this.sentence1.text = all.substring(0, index)
        this.sentence2.text = all.substring(index)
      }
      if (this.fromSide == FromSide.FromRight) {
        const loc = index + len;
        this.sentence1.text = all.substring(0, loc)
        this.sentence2.text = all.substring(loc)
      }

    } else {
      this.sentence1.text = all;
      this.sentence2.text = '';
    }
  }

  onDeleteChange(ev?: Event) {
    this.canExecute = false;
    let all = this.sentence1.text + this.sentence2.text;
    let len = this.splittext.length;
    let index = all.indexOf(this.splittext);
    if (len > 0 && index != -1) {
      const loc = index + len;
      this.sentence1.text = all.substring(0, loc)
      this.sentence2.text = all.substring(loc)
    } else {
      this.sentence1.text = all;
      this.sentence2.text = ''
    }
  }

  doToggleDelete(obj: LaSentence) {
    this.canExecute = false;
    obj.toggleDeleted()
  }

  icon(obj: LaSentence) {
    return obj.IsDeleted() ? `delete_forever` : `delete_outline`;
  }

  onRefreshSelected() {
  }

  doClose(event?: Event) {
    event?.preventDefault();
    EmitterService.broadcastCommand(this, 'CloseAll');
    if (this.canExecute) {
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
  }

  doCancel() {
    this.canExecute = false
    this.tService.clearPostEdit();
    this.doClose();
  }

  doFromLeft() {
    this.canExecute = false;
    this.fromSide = FromSide.FromLeft;
    this.onSplitChange();
  }

  doFromRight() {
    this.canExecute = false;
    this.fromSide = FromSide.FromRight;
    this.onSplitChange();
  }

  doPreJoin() {
    this.tService.clearPostEdit();
    const result = this.sentence1.mergeTextFromSentence(this.sentence2, this.splittext);
    this.sentence2.text = '';
    this.tService.addPostEdit(result);
    this.targets = [result]
  }

  doJoinSentence() {
    this.tService.clearPostEdit();
    const s1 = this.cService.getPreviousSentence(this.context)
    const s2 = this.context;

    const result = this.cService.joinSentence(s1, s2, this.splittext);
    this.tService.addPostEdit(result);
  }

  doJoinFootnote() {
    this.tService.clearPostEdit();
    const s1 = this.cService.getPreviousFootnote(this.context)
    const s2 = this.context;

    const result = this.cService.joinFootnote(s1, s2, this.splittext);
    this.tService.addPostEdit(result);
  }

  doPreSplit() {
    this.tService.clearPostEdit();
    this.sentence1.text = this.sentence1.text.trim()
    this.tService.addPostEdit(this.sentence1);
    this.sentence2.text = this.sentence2.text.trim()
    this.tService.addPostEdit(this.sentence2);
  }

  doSplitSentence() {
    this.tService.clearPostEdit();
    const first = this.sentence1.text.trim()
    const last = this.sentence2.text.trim()
    if (last.length == 0) return;

    const result = this.cService.splitSentence(this.context, [first, last]);
    if (result) {
      const id = this.context.sentenceNumber;  //should not change
      const s1 = result.resolveSentence(id);
      const s2 = result.getNextSentence(s1);

      this.tService.addPostEdit(s1);
      this.tService.addPostEdit(s2);
      EmitterService.broadcastCommand(this, 'RefreshDisplay');
    }
  }


  doSplitFootnote() {
    this.tService.clearPostEdit();
    const first = this.sentence1.text.trim()
    const last = this.sentence2.text.trim()
    if (last.length == 0) return;

    const result = this.cService.splitFootnote(this.context, [first, last]);
    if (result) {
      const id = this.context.sentenceNumber;  //should not change
      const s1 = result.resolveSentence(id);
      const s2 = result.getNextSentence(s1);

      this.tService.addPostEdit(s1);
      this.tService.addPostEdit(s2);
      EmitterService.broadcastCommand(this, 'RefreshDisplay');
    }
  }


  doPreDelete() {
    this.tService.clearPostEdit();

    this.sentence1.text = this.sentence1.text.trim();
    this.sentence2.text = this.sentence2.text.trim();

    this.tService.addPostEdit(this.sentence2);
    this.tService.addPostEdit(this.sentence1);
  }

  doDelete() {
    this.tService.clearPostEdit();

    const d1 = this.sentence1.IsEmptyOrDeleted()
    if (!d1 && this.sentence2.IsEmpty()) {
      Toast.success("No Changes")
      return;
    }

    const d2 = this.sentence2.IsEmptyOrDeleted()
    if (!d1 && !d2) {
      Toast.success("No Changes")
      return;
    }


    if (!d1 && d2) {
      this.context.text = this.sentence1.text;
      this.tService.addPostEdit(this.context);
      //Toast.info("Second is Deleted", this.sentence2.text)
      if (!this.sentence2.IsEmpty()) {
        this.cService.parkSentence(this.sentence2);
        Toast.warning("Sentence is removed", this.sentence2.text)
      }
    }

    if (d1 && !d2) {
      this.context.text = this.sentence2.text;
      this.tService.addPostEdit(this.context);
      //Toast.info("First is Deleted", this.sentence1.text)
      if (!this.sentence2.IsEmpty()) {
        this.cService.parkSentence(this.sentence1);
        Toast.warning("Sentence is removed", this.sentence1.text)
      }
    }

    if (d1 && d2) {
      this.cService.deleteSentence(this.context);
      //can I put this somewhere else in the model
      this.cService.parkSentence(this.context);
      Toast.warning("Sentence is removed", this.context.text)
    }

    EmitterService.broadcastCommand(this, 'RefreshDisplay');
  }

  doPreEdit() {
    this.tService.clearPostEdit();
    this.sentence1.text = this.sentence1.text.trim();
    this.tService.addPostEdit(this.sentence1);
  }

  doEdit() {
    this.tService.clearPostEdit();
    this.context.text = this.sentence1.text;
    this.tService.addPostEdit(this.context);
  }

  doPreInsertSentence() {
    this.tService.clearPostEdit();
    this.tService.addPostEdit(this.sentence1);
  }

  doInsertSentence() {
    const para = this.cService.findParagraph(this.context)
    para.addSentence(this.sentence1)
    para.renumSentences();
    this.tService.clearPostEdit();
    this.tService.addPostEdit(this.sentence1);
  }

  doPreInsertParagraph() {
    this.tService.clearPostEdit();
    this.tService.addPostEdit(this.sentence1);
  }

  doInsertParagraph() {
    this.cService.insertSentence(this.sentence1)
    this.cService.reorderParagraphs();
    this.tService.clearPostEdit();
    this.tService.addPostEdit(this.sentence1);
  }

  doPreFootnote() {
    this.tService.clearPostEdit();
    this.sentence1.text = this.sentence1.text.trim();
    this.tService.addPostEdit(this.sentence1);
  }

  doFootnote() {
    this.tService.clearPostEdit();
    this.context.text = this.sentence1.text;
    this.tService.addPostEdit(this.context);
  }

  doPreTokenize() {
    this.tService.clearPostEdit();
    this.tService.addPostEdit(this.context);
  }

  doTokenizeSentence() {
    this.tService.clearPostEdit();
    const list = this.tokenList.asSentenceList(this.context).map( item => item.text);

    const result = this.cService.splitSentence(this.context, list);
    if (result) {
      const id = this.context.sentenceNumber;  //should not change
      let s1 = result.resolveSentence(id);
      this.tService.addPostEdit(s1);

      for(let i=1; i<list.length; i++) {
        s1 = result.getNextSentence(s1);
        this.tService.addPostEdit(s1);
      }

      EmitterService.broadcastCommand(this, 'RefreshDisplay');
    }
  }

  doTokenizeFootnote() {
    this.tService.clearPostEdit();
    const list = this.tokenList.asSentenceList(this.context).map( item => item.text);

    const result = this.cService.splitFootnote(this.context, list);
    if (result) {
      const id = this.context.sentenceNumber;  //should not change
      let s1 = result.resolveSentence(id);
      this.tService.addPostEdit(s1);

      for(let i=1; i<list.length; i++) {
        s1 = result.getNextSentence(s1);
        this.tService.addPostEdit(s1);
      }

      EmitterService.broadcastCommand(this, 'RefreshDisplay');
    }
  }


  doApply() {
    this.canExecute = !this.canExecute

    if (this.isJoinMode()) {
      this.doPreJoin();
    }

    if (this.isSplitMode()) {
      this.doPreSplit();
    }

    if (this.isTokenizeMode()) {
      this.doPreTokenize();
    }

    if (this.isDeleteMode()) {
      this.doPreDelete();
    }

    if (this.isEditMode()) {
      this.doPreEdit();
    }

    if (this.isInsertSentenceMode()) {
      this.doPreInsertSentence();
    }

    if (this.isInsertParagraphMode()) {
      this.doPreInsertParagraph();
    }

    if (this.isFootnoteMode()) {
      this.doPreFootnote();
    }
  }



  doExecute() {
    if (this.isJoinMode()) {
      if (this.isFootnotePage()) {
        this.doJoinFootnote();
      } else {
        this.doJoinSentence();
      }
    }

    if (this.isSplitMode()) {
      if (this.isFootnotePage()) {
        this.doSplitFootnote();
      } else {
        this.doSplitSentence();
      }
    }

    if (this.isTokenizeMode()) {
      if (this.isFootnotePage()) {
        this.doTokenizeFootnote();
      } else {
        this.doTokenizeSentence();
      }
    }

    if (this.isDeleteMode()) {
      this.doDelete();
    }

    if (this.isEditMode()) {
      this.doEdit();
    }

    if (this.isInsertSentenceMode()) {
      this.doInsertSentence();
    }

    if (this.isInsertParagraphMode()) {
      this.doInsertParagraph();
    }

    if (this.isFootnoteMode()) {
      this.doFootnote();
    }
  }

  doExecuteAndClose() {
    try {
      this.doExecute()
    } catch (ex) {
      Toast.error(ex.message)
    }
    this.doClose();
  }
}
