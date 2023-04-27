import { Component, OnInit } from '@angular/core';
import { LaFootnote } from '@app/models';
import { LegalCaseService } from '@app/models/legal-case.service';
import { OpenPage, TagService } from '@app/models/tag.service';
import { EmitterService } from '@app/shared';

@Component({
  selector: 'app-footnotes',
  templateUrl: './footnotes.component.html',
  styleUrls: ['./footnotes.component.scss']
})
export class FootnotesComponent implements OnInit {
  sub: any;
  constructor(
    private tagService: TagService,
    private cService: LegalCaseService) {
  }

  get isModelOpen() {
    return this.cService.legalModel();
  }

  
  isPowerUser() {
    return this.tagService.isPowerUser;
  }

  onRefreshDisplay() {

  }

  ngOnInit(): void {
    this.tagService.openPage = OpenPage.Footnote;
    this.sub = this.cService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
    });

    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }

  ngOnDestroy() {
    this.tagService.openPage = OpenPage.None;
    this.sub && this.sub.unsubscribe();
  }

  getModelCoreInfo() {
    return this.cService.getModelCoreInfo();
  }

  getFootnotes(): Array<LaFootnote> {
    return this.cService.getFootnotes();
  }

  doToggleCanEditText() {
    this.tagService.doToggleCanEditText();
  }

  doToggleLabel() {
    this.tagService.doToggleLabel();
  }

  doToggleColors() {
    this.tagService.doToggleColors();
  }

  doToggleCanJoinText() {
    this.tagService.doToggleCanJoinText();
  }

  doToggleCanSplitText() {
    this.tagService.doToggleCanSplitText();
  }

  doToggleCanQuickSplitText() {
    this.tagService.doToggleCanQuickSplitText();
  }

  doToggleCanDeleteText() {
    this.tagService.doToggleCanDeleteText();
  }

  doToggleInsertSentence() {
    this.tagService.doToggleInsertSentence();
  }

  doToggleSentenceSelection() {
    this.tagService.doToggleSentenceSelection();
  }

  doToggleSectionEdit() {
    this.tagService.doToggleSectionEdit();
  }

}
