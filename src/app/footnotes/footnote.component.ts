import { Component, Input, OnInit } from '@angular/core';
import { LaFootnote } from '@app/models';
import { LegalCaseService } from '@app/models/legal-case.service';
import { TagService } from '@app/models/tag.service';

@Component({
  selector: 'app-footnote',
  templateUrl: './footnote.component.html'
})
export class FootnoteComponent implements OnInit {
  @Input() footnote: LaFootnote;

  constructor(
    private tagService: TagService,
    private cService: LegalCaseService) {
  }



  ngOnInit(): void {
  }

  getSectionBadges(){
    return this.footnote?.getSectionBadges();
  }

  getFilteredSentences(){
    return this.footnote?.sentences
  }

}
