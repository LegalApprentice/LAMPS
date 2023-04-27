import { Component, OnInit, Input } from '@angular/core';
import { LegalCaseService } from '../models/legal-case.service';
import { LaSentence } from '../models';

@Component({
  selector: 'app-footnotelink',
  templateUrl: './footnote-link.component.html'
})
export class FootnoteLinkComponent implements OnInit {
  showReference: boolean = true
  @Input() sentence: LaSentence;

  constructor(
    private cService: LegalCaseService,
  ) { }

  ngOnInit(): void {
    this.showReference = this.sentence.footnoteRefs ? true : false;
  }

  footnoteRef() {
    return this.sentence.footnoteRefs;
  }

  footnoteIDs() {
    var keys = Object.keys(this.footnoteRef());
    return keys
  }

  footnoteToolTips(key:string): string {
    const value = `FN${key}`
    return this.cService.getFootnoteText([value])
  }

}
