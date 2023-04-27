import { Component, OnInit, Input } from '@angular/core';

import { LaSentence, LaDecisionNode } from '../models';
import { EmitterService } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';


@Component({
  selector: 'app-association',
  templateUrl: './association.component.html',
  styleUrls: ['./association.component.css']
})
export class AssociationComponent implements OnInit {
  @Input() decision: LaDecisionNode;

  sub: any;


  constructor(
    private cService: LegalCaseService) {
  }

  ngOnInit() {
    this.sub = this.cService.getCurrentModel$().subscribe(model => {

    });

    //EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    //EmitterService.processCommands(this);
  }

  doClose(e:Event) {
    EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
    });
  }

  doAssociation(sentence) {
    if (this.decision.hasSentence(sentence)) {
      this.decision.removeSentence(sentence);
      sentence.removeDecision(this.decision);
    } else {
      this.decision.addSentence(sentence);
      sentence.addDecision(this.decision);
    }
    this.cService.markAsDirty();
  }


  associationClass(sentence) {
    return this.decision.hasSentence(sentence) && 'badge-success';
  }

  getFindingSentences():Array<LaSentence> {
    return this.cService.getSentences().filter(item => item.isFindingSentence());
  }

  doStipulateTRUE() {
    this.decision.setStipulation(true);
  }

  doStipulateUNDECIDED() {
    this.decision.setStipulation(undefined);
  }

  doStipulateFALSE() {
    this.decision.setStipulation(false);
  }

  doStipulateCLEAR() {
    this.decision.setStipulation(undefined);
  }

}
