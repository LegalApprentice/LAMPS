import { Component, OnInit, Input } from '@angular/core';

import { LegalCaseService } from '../models/legal-case.service';
import { LaDecisionNode } from '../models';


@Component({
  selector: 'app-sentence-list-badge',
  templateUrl: './sentence-list-badge.component.html'
})
export class SentenceListBadgeComponent implements OnInit {
  @Input() decision: LaDecisionNode;

  constructor(private service: LegalCaseService) {}

  ngOnInit() {
  }

  getSentenceBadges() {

    const keys = this.decision ? this.decision.getSentenceKeys() : [];
    if ( keys.length > 0 ) {
      const sentences = this.service.resolveSentenceKeys(keys);
      return sentences.map(item => {
        return item.sentTag();
      });
    }

    return keys;
  }

}
