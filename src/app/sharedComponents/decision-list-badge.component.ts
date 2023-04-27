import { Component, OnInit, Input } from '@angular/core';

import { LegalCaseService } from '../models/legal-case.service';
import { LaSentence } from '../models';

@Component({
  selector: 'app-decision-list-badge',
  templateUrl: './decision-list-badge.component.html'
})
export class DecisionListBadgeComponent implements OnInit {
  @Input() sentence: LaSentence;


  constructor(private lService: LegalCaseService) {}

  ngOnInit() {
  }

  getDecisionBadges() {
    const keys = this.sentence ? this.sentence.getDecisionKeys() : [];
    if ( keys.length > 0 ) {
      const decisions = this.lService.resolveDecisionKeys(keys);
      return decisions.map(item => {
        return item.sentTag();
      });
    }

    return keys;
  }

}
