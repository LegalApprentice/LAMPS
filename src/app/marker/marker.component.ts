import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { EmitterService, Toast } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';
import { Router, ActivatedRoute } from '@angular/router';

import { LaLegalCase, LaParagraph, LaStats } from '../models';
import { environment } from '@environments/environment';
import { LegalPadService } from '@app/models/legal-pad.service';
import { Tools } from '@app/shared';
import { LegalSearchService } from '@app/models/legal-search.service';
import { TagService } from '@app/models/tag.service';

//track_changes
// https://www.angularjswiki.com/angular/angular-material-icons-list-mat-icon-list/#mat-icon-list-category-file
@Component({
  selector: 'app-marker',
  templateUrl: './marker.component.html'
})
export class MarkerComponent implements OnInit, OnDestroy {

  @Input() userCanEdit = false;

  banner = ' take notes and add tags while you are reading'

  // do not show attribute count in read only mode

  sub: any;
  filter = 'All';

  constructor(
    private route: ActivatedRoute,
    private tagService: TagService,
    private eService: LegalSearchService,
    private cService: LegalCaseService,
    private pService: LegalPadService) {


    if (this.cService.defaultModelRefId.length > 0) {
      Toast.info(`caseID  ${this.cService.defaultModelRefId}`, 'loading case...')
      this.loadCaseFromSearch(this.cService.defaultModelRefId)
    }
  }
  get canShareNotes() {
    return (environment.isLegalMarker ) && this.cService.hasModel();
  }

  loadCaseFromSearch(caseID:string){
    Toast.info( `caseID  ${caseID}`, 'loading from Search...')
    this.eService.findCase$(caseID).subscribe(data => {
      const result = data[0];
      if ( result ) {
        this.cService.createLegalModel<LaLegalCase>(LaLegalCase, result._source)
        EmitterService.broadcastCommand(this, 'RefreshDisplay');
      } else {
        Toast.warning(`caseID ${caseID} not found in search`)
      }
    })
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

  doAutomaticLabel() {
    this.cService.broadcastMakeDocumentPrediction();
    EmitterService.broadcastCommand(this, 'RefreshDisplay');;
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

  doToggleSectionEdit() {
    this.tagService.doToggleSectionEdit();
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

  doToggleCanMoveSentenceDown() {
    this.tagService.doToggleCanMoveSentenceDown();
  }

  doGoToPreviousBookmark() {
    this.cService.gotoPreviousBookmark();
  }
  doGoToNextBookmark() {
    this.cService.gotoNextBookmark();
  }

  doClearBookmarks() {
    this.cService.clearBookmarks();
  }



  doToggleSentenceSelection() {
    this.tagService.doToggleSentenceSelection();
  }

  applyFilter(e: Event, stat:LaStats) {
    this.filter = stat.filter
  }


  getParagraphs():Array<LaParagraph> {
    return this.cService.getParagraphs();
  }

  getFilteredSentences() {
    const filtered =  this.cService.getFilteredSentenceList(this.filter);
    //remove all the footnotes in this view
    //const result = filtered.filter( item => Tools.isEmpty(item.footnoteId));
    return filtered;
  }


  isSentenceFilter() {
    return Tools.matches(this.filter,'Sentence');
  }

  HasNoSentenceFilter() {
    return Tools.matches(this.filter,'All');
  }


  get isModelOpen() {
    return this.cService.legalModel();
  }

  btnClass(){
    return { 'btn reader-btn bg-light ': true }
  }


  //class="btn bg-light"
  //style="padding-top: 0px; padding-left: 10px"

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

  getModelCoreInfo() {
    return this.cService?.getModelCoreInfo();
  }

  onGoToBookmark(id:string) {
    this.filter = 'All';
    this.onRefreshDisplay();
  }

  onRefreshDisplay() {
    this.cService.computeLaStats();

    // if (environment.isLegalMarker) {
    //   this.banner = 'limited version created for single users - select Marker menu option to edit this document';
    // }
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }
}
