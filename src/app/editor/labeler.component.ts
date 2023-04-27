import { Component, OnInit, Input } from '@angular/core';

import { LaSentence } from '../models';
import { EmitterService, Toast } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';
import { environment } from '@environments/environment';

import { LaEnrichment, LaEnrichmentSet, LaPrediction } from '../models/la-enrichment';
import { AuthenticationService } from '@app/login';
import { Tools } from '@app/shared';

@Component({
  selector: 'app-labeler',
  templateUrl: './labeler.component.html'
})
export class LabelerComponent implements OnInit {
  @Input() sentence: LaSentence;

  enrichedSet: LaEnrichmentSet

  constructor(
    private cService: LegalCaseService,
    private authService: AuthenticationService) {
    }

  ngOnInit() {
    if ( this.sentence.hasEnrichmentSet()) {
      this.enrichedSet = new LaEnrichmentSet(this.sentence.enrichmentSet);
      this.enrichedSet.mergeDefaults(environment.defaultPredictions)
    } else {
      this.enrichedSet = new LaEnrichmentSet(environment.defaultPredictions);
    }
    this.enrichedSet.setSentence(this.sentence);

    EmitterService.registerCommand(this, "RefreshPrediction", this.onRefreshPrediction);
    EmitterService.processCommands(this);
  }

  onRefreshPrediction() {
    this.enrichedSet = new LaEnrichmentSet(this.sentence.enrichmentSet);
    this.enrichedSet.setSentence(this.sentence);
  }

  // https://javascript.info/selection-range

  getRange() {
    if (window.getSelection) {
      const obj = window.getSelection().getRangeAt(0);
      return obj;
    }
  }

  queryPrediction(list:LaEnrichment) {
    list.extractFromSentence();
    this.cService.broadcastMakeSentencePrediction(this.sentence);
    //Toast.info('MakeSentencePrediction', this.sentence.sentTag());
    EmitterService.broadcastCommand(this, 'RefreshDisplay');;
  }

  confirmPrediction(list:LaEnrichment, obj:LaPrediction) {
    if ( this.sentence.isImmutable()) return;

    const user = this.authService.currentUserValue;

    if ( !Tools.matches(list.classification,obj.label)) {
      list.applyPredictionToSentence(obj,user);
    } else if ( Tools.matches("Sentence",obj.label)) {
      list.applyPredictionToSentence(obj,user);
    } else {
      //apply to every sentences predicted to be this type above this threshold
      const label = obj.label
      const threshold = obj.prediction
      const category = list.category
      list.applyPredictionToSentence(obj,user);
      this.cService.applyPredictionForAll(category,label,threshold,user);
    }

    //all this is a special case fo ruleID
    if ( Tools.matches(list.category,'ruleID') ) {
      const key = obj.label;
      const sentence = this.sentence;
      const decision = this.cService.findDecisionByKey(key);

      if ( sentence.hasDecisionRuleID(key)) {
        sentence.removeDecisionRuleID(key);
        decision?.removeSentenceID(sentence.sentID);
      } else {
        sentence.addDecisionRuleID(key);
        decision?.addSentenceID(sentence.sentID);      
      }
    }

    this.cService.markAsDirty();
    this.cService.resetStats();
    //force close when selected
    EmitterService.broadcastCommand(this, 'CloseAll');
    EmitterService.broadcastCommand(this, 'RefreshDisplay');
  }

  getEnrichmentSet(): Array<LaEnrichment> {
    return this.enrichedSet.filteredEnrichments();
  }

  getSelectedText() {
    let text = this.sentence.text;
    if (window.getSelection) {
      text = window.getSelection().toString();
    }
    return text !== '' ? text : this.sentence.text;
  }



}
