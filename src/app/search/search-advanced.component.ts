import { Component, OnInit } from '@angular/core';
import { EmitterService, Toast, Tools } from '../shared';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LaQuery, TOPIC_AdvancedQuery } from '../models';
import { LegalSearchService } from '@app/models/legal-search.service';
import { PubSub } from '@app/shared/foPubSub';



@Component({
  selector: 'app-search-advanced',
  templateUrl: './search-advanced.component.html'
})
export class SearchAdvancedComponent implements OnInit {
  searchForm: FormGroup;
  submitted = false;

  constructor(
    private sService: LegalSearchService,
    private formBuilder: FormBuilder) { }


  ngOnInit(): void {

    this.applyLastSearch();

    EmitterService.processCommands(this);
  }

  applyLastSearch(): void {

    const lastSearch = this.sService.lastSearch;

    this.searchForm = this.formBuilder.group({
      includeany: [lastSearch.includeany],
      includeall: [lastSearch.includeall],
      exactphrase: [lastSearch.exactphrase],
      excludeany: [lastSearch.excludeany],
      FindingSentence: [lastSearch.FindingSentence],
      EvidenceSentence: [lastSearch.EvidenceSentence],
      LegalRuleSentence: [lastSearch.LegalRuleSentence],
      ReasoningSentence: [lastSearch.ReasoningSentence],
      CitationSentence: [lastSearch.CitationSentence]
    });

  }

  get f() {
    return this.searchForm.controls;
  }

  doClear() {
    this.sService.lastSearch.clear();
    this.applyLastSearch();
    PubSub.Pub(TOPIC_AdvancedQuery, []);
  }

  doSearch() {
    this.submitted = true;
    const includeall = this.f.includeall.value;
    const includeany = this.f.includeany.value;
    const exactphrase = this.f.exactphrase.value;
    const excludeany = this.f.excludeany.value;

    const FindingSentence = this.f.FindingSentence.value;
    const EvidenceSentence = this.f.EvidenceSentence.value;
    const LegalRuleSentence = this.f.LegalRuleSentence.value;
    const ReasoningSentence = this.f.ReasoningSentence.value;
    const CitationSentence = this.f.CitationSentence.value;

    // stop here if form is invalid
    if (!this.searchForm.invalid) {

      const tagRule = [];
      const rhetRule = [];
      if (FindingSentence) {
        rhetRule.push('FindingSentence');
      }
      if (EvidenceSentence) {
        rhetRule.push('EvidenceSentence');
      }
      if (LegalRuleSentence) {
        rhetRule.push('LegalRuleSentence');
      }
      if (ReasoningSentence) {
        rhetRule.push('ReasoningSentence');
      }
      if (CitationSentence) {
        rhetRule.push('CitationSentence');
      }
      
      const query = new LaQuery({
        includeall: includeall ? includeall : "",
        includeany: includeany ? includeany : "",
        exactphrase: exactphrase ? exactphrase : "",
        excludeany: excludeany ? excludeany : "",
        classFilter: rhetRule,
        tagsFilter: tagRule,
      });

      const lastSearch = this.sService.lastSearch;
      lastSearch.includeany = query.includeany;
      lastSearch.includeall =  query.includeall;
      lastSearch.exactphrase =  query.exactphrase;
      lastSearch.excludeany =  query.excludeany;

      lastSearch.FindingSentence = FindingSentence;
      lastSearch.EvidenceSentence = EvidenceSentence;
      lastSearch.LegalRuleSentence =  LegalRuleSentence;
      lastSearch.ReasoningSentence =  ReasoningSentence;
      lastSearch.CitationSentence = CitationSentence;


      Toast.info(`Searching...`,JSON.stringify(query.simplify(), undefined, 3));
      PubSub.Pub(TOPIC_AdvancedQuery, [query]);
    }
  }
}
