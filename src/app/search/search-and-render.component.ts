import { Component, OnInit, OnDestroy } from '@angular/core';



import { LegalSearchService } from '../models/legal-search.service';
import { LaQuery, LaSearchResult, TOPIC_AdvancedQuery } from '../models';
import { Toast, PubSub } from '../shared';


@Component({
  selector: 'app-search-and-render',
  templateUrl: './search-and-render.component.html'
})
export class SearchAndRenderComponent implements OnInit, OnDestroy {

  searchResults: Array<LaSearchResult>;
  noResultsFound:string = ''



  constructor(
    private sService: LegalSearchService) { }

  ngOnInit(): void {

    PubSub.Sub(TOPIC_AdvancedQuery, (data) => {
      const query: LaQuery = data[0] as LaQuery;
      this.doAdvancedSearch(query);
    });
  }

  ngOnDestroy(): void {
    PubSub.Unsub(TOPIC_AdvancedQuery);
  }



  doAdvancedSearch(query: LaQuery) {
    this.searchResults = [];
    this.noResultsFound = '';

    const display = query.simplify();

    const q = JSON.stringify(display, undefined, 3);

    var subject = this.sService.advancedQuery$(query)
    subject.subscribe({
      next: (data) => {
        const count = data.length;
        this.searchResults = data;
        this.noResultsFound = count == 0 ? `No Results for query: \r\n${q}`: ''
        this.sService.createCaseOfSearchResults(data);
        console.log(data[0])
        
        if ( count == 0 ) {
          Toast.error(`${count} results found`);
        } else {
          Toast.success(`${count} results found`);
        }
      },
      error: e => Toast.error(e),
      complete:  () => {
      }
    });
  }

}
