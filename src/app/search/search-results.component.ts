import { Component, OnInit, Input } from '@angular/core';
import { LaSearchResult } from '../models';


@Component({
    selector: 'app-search-results',
    templateUrl: './search-results.component.html'
})
export class SearchResultsComponent implements OnInit {
    @Input() noResultsFound: string = ''
    @Input() searchResults: Array<LaSearchResult> = [];
    

    activeTab = 0;

    constructor() {}

    ngOnInit(): void {

    }

    get listViewLabel() {
        const total = this.searchResults ? this.searchResults.length : 0;
        if (total > 0) {
            return `List View (${total})`;
        } else {
            return 'List View';
        }
    }

    get itemViewLabel() {
        const total = this.searchResults ? this.searchResults.length : 0;
        if (total > 0) {
            return `Semantic View (${total})`;
        } else {
            return 'Semantic View';
        }
    }

    get cardViewLabel() {
        const total = this.searchResults ? this.searchResults.length : 0;
        if (total > 0) {
            return `Card View (${total})`;
        } else {
            return 'Card View';
        }
    }

    get documentViewLabel() {
        const total = this.searchResults ? this.searchResults.length : 0;
        if (total > 0) {
            return `Document View (${total})`;
        } else {
            return 'Document View';
        }
    }




}
