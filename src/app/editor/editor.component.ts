import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Toast, EmitterService } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';
import { Router, ActivatedRoute } from '@angular/router';

import { LaStats, LaLegalCase, LaParagraph } from '../models';
import { environment } from '@environments/environment';
import { Tools } from '@app/shared';
import { LegalSearchService } from '@app/models/legal-search.service';
import { TagService } from '@app/models/tag.service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input() userCanEdit = true;

  sub: any;
  filter = 'All';

  constructor(
    private route: ActivatedRoute,
    private tagService: TagService,
    private eService: LegalSearchService,
    private cService: LegalCaseService) {


    if (this.cService.defaultModelRefId.length > 0) {
      Toast.info(`caseID  ${this.cService.defaultModelRefId}`, 'loading case...')
      this.loadCaseFromSearch(this.cService.defaultModelRefId)
    }
  }

  get canShareNotes() {
    return (environment.isLegalMarker ) && this.cService.hasModel();
  }


  getModelCoreInfo() {
    return this.cService.getModelCoreInfo();
  }


  loadCaseFromSearch(caseID: string) {
    Toast.info(`caseID  ${caseID}`, 'loading from Search...')
    this.eService.findCase$(caseID).subscribe(data => {
      const result = data[0];
      if (result) {
        this.cService.createLegalModel<LaLegalCase>(LaLegalCase, result._source)
        this.onRefreshDisplay();
      } else {
        Toast.warning(`caseID ${caseID} not found in search`)
      }
    })
  }

  applyFilter(e: Event, stat: LaStats) {
    this.filter = stat.filter
  }

  get getSentenceLaStats() {
    return this.cService.computeLaStats()
  }

  doToggleColors(){
    this.tagService.doToggleColors()
  }

  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }

  doToggleLabel() {
    this.tagService.doToggleLabel();
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

  doToggleCanEditText() {
    this.tagService.doToggleCanEditText();
  }

  doToggleCanMoveSentenceForward() {
    this.tagService.doToggleCanMoveSentenceForward();
  }

  doToggleCanMoveSentenceBackward() {
    this.tagService.doToggleCanMoveSentenceBackward();
  }

  doToggleCanMoveSentenceUp() {
    this.tagService.doToggleCanMoveSentenceUp();
  }

  doToggleCanSplitParagraph() {
    this.tagService.doToggleCanSplitParagraph();
  }

  doToggleCanMoveSentenceDown() {
    this.tagService.doToggleCanMoveSentenceDown();
  }

  doToggleSectionEdit() {
    this.tagService.doToggleSectionEdit();
  }

  doToggleInsertParagraph() {
    this.tagService.doToggleInsertParagraph();
  }

  doToggleInsertSentence() {
    this.tagService.doToggleInsertSentence();
  }

  doToggleEditFootnote() {
    this.tagService.doToggleEditFootnote();
  }

  doToggleSentenceSelection() {
    this.tagService.doToggleSentenceSelection();
  }


  btnClass(on:boolean = false){
    return { 'btn bg-light': true,
            'reader-on-btn': on,
            'reader-off-btn': !on }
  }

  getParagraphs(): Array<LaParagraph> {
    return this.cService.getParagraphs();
  }


  getFilteredSentences() {
    const filtered =  this.cService.getFilteredSentenceList(this.filter);
    //remove all the footnotes in this view
    //const result = filtered.filter( item => Tools.isEmpty(item.footnoteId));
    return filtered;
  }



  isSentenceFilter() {
    return Tools.matches(this.filter, 'Sentence');
  }

  HasNoSentenceFilter() {
    return Tools.matches(this.filter, 'All');
  }

  get isModelOpen() {
    return this.cService.legalModel();
  }

  ngOnInit() {
    this.sub = this.cService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
      this.tagService.gotoCurrentAnchorTag();
    });

    EmitterService.registerCommand(this, 'GoToBookmark', this.onGoToBookmark);
    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);

    ///#/case/case1800023
    var refID = this.route.snapshot.paramMap.get('caseid');
    if (refID != null) {
      this.cService.defaultModelRefId = refID;
      Toast.info(`caseID  ${this.cService.defaultModelRefId}`, 'loading case...')
      this.loadCaseFromSearch(this.cService.defaultModelRefId)
    }
  }


  onGoToBookmark(id:string) {
    this.filter = 'All';
    this.onRefreshDisplay();
  }

  onRefreshDisplay() {
    this.cService.computeLaStats();
  }



  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }
}
