import { Component, OnInit } from '@angular/core';
import { LegalPadService } from '../models/legal-pad.service';
import { EmitterService } from '../shared';
import { LegalCaseService } from '../models/legal-case.service';

@Component({
  selector: 'app-immutable',
  templateUrl: './immutable.component.html'
})
export class ImmutableComponent implements OnInit {
  sub: any;

  constructor(
    private cService: LegalCaseService,
    private pService: LegalPadService) { }

  get isModelOpen() {
    return this.pService.legalModel();
  }

  ngOnInit(): void {
    this.sub = this.pService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
    });

    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }



  getModelCoreInfo() {
    return this.pService?.getModelCoreInfo();
  }



  get paragraphCount() {
    return this.getParagraphs().length
  }

  getParagraphs() {
    let result = this.pService?.getParagraphs();
    result?.sort((a, b) => a.compareGroupID(b));
    return result ? result : [];
  }

  get sentenceCount() {
    return this.getSentences().length
  }

  getSentences() {
    let result = this.pService?.getSentences();
    result?.sort((a, b) => a.compareGroupID(b));
    return result ? result : [];
  }


  onRefreshDisplay() {

  }



  doClearAll(e: Event) {
    this.getSentences().forEach((obj) => {
      obj.isItemOfInterest = false
    })

    this.getParagraphs().forEach((obj) => {
      obj.isItemOfInterest = false
    })
  }


}
