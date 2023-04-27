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
  selector: 'app-viewer',
  templateUrl: './viewer.component.html'
})
export class ViewerComponent implements OnInit, OnDestroy {

  @Input() userCanEdit = false;

  banner = ' you must logged-in edit this document (so your changes can be saved)'

  //banner = ' you must be registered and logged-in to edit this document'
  // do not show attribute count in read only mode

  sub: any;
  filter = 'All';

  constructor(
    private route: ActivatedRoute,
    private tagService: TagService,
    private eService: LegalSearchService,
    private cService: LegalCaseService) {



    if ( this.cService.defaultModelRefId.length > 0) {
        Toast.info(`caseID  ${this.cService.defaultModelRefId}`, 'loading case...')
      this.loadCaseFromSearch(this.cService.defaultModelRefId)
     }
  }
  get canShareNotes() {
    return (environment.isLegalMarker  ) && this.cService.hasModel();
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

  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }



  applyFilter(e: Event, stat:LaStats) {
    this.filter = stat.filter
  }


  getParagraphs():Array<LaParagraph> {
    return this.cService.getParagraphs();
  }

  getFilteredSentences() {
    return this.cService.getFilteredSentenceList(this.filter);
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

  ngOnInit() {
    this.sub = this.cService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
      this.tagService.gotoCurrentAnchorTag();
    });


    //EmitterService.broadcastCommand(this, 'IsLegalMarker');
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
