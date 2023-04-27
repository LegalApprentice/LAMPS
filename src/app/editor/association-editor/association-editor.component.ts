import { Component, OnInit, Input } from '@angular/core';
import { LegalCaseService } from '@app/models/legal-case.service';
//import { Tools } from '../shared/shared';

import { LaSentence } from '../../models';
import { EmitterService } from '../../shared/emitter.service';


@Component({
  selector: 'app-association-editor',
  templateUrl: './association-editor.component.html'
})
export class AssociationEditorComponent implements OnInit {
  sub: any;
  @Input() sentence: LaSentence;

  constructor(private cService: LegalCaseService) {
  }

  ngOnInit(): void {

    this.sub = this.cService.getCurrentModel$().subscribe(model => {
    });

    EmitterService.registerCommand(this, 'CloseAll', this.doClose);
     EmitterService.processCommands(this);
  }

  doClose(e:Event) {
    EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
    });
  }

  doAssociation(sentence) {
    // if (this.decision.hasSentence(sentence)) {
    //   this.decision.removeSentence(sentence);
    //   sentence.removeDecision(this.decision);
    // } else {
    //   // this.decision.addSentence(sentence);
    //   // sentence.addDecision(this.decision);
    // }
    this.cService.markAsDirty();
  }

  associationClass(sentence) {
    return 'badge-success'; //this.decision.hasSentence(sentence) && 'badge-success';
  }

  // getItemsOfInterest() {
  //   return this.cService.getSentencesOfInterest();
  // }

}
