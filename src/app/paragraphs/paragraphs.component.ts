import { Component, OnInit } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';

import { LegalPadService } from '@app/models/legal-pad.service';
import { TagService } from '@app/models/tag.service';


// For now, I suggest we start sorting paragraphs as follows (displaying higher-scoring paragraphs at the top of list on the tab):
// Any paragraph considered (for now) as containing an argument must contain:
//     at least one Finding Sentence and at least one Reasoning Sentence or Evidence Sentence.
// Any paragraph that contains all three sentence types is presumptively the highest scoring type of paragraph.
// Among paragraphs that contain all three types of sentence, any paragraph is scored higher if
//     it has more Reasoning Sentences or more Evidence Sentences.
// Among paragraphs that contain only two types (a Finding plus only one other type),
//     then paragraphs with Reasoning Sentences have a higher score than paragraphs with only Evidence Sentences. Also,
//     paragraphs score higher if they have more instances of a type.
// Let's see what that looks like. Note also that eventually we will do this scoring at the attribution level, not sentence level,
//     and the rank order will be even more granular. But we don't have attribution data for Reasoning Sentences yet.

// While we work on this, continue displaying all the paragraphs in a decision, but just rank order them using the scoring above. Then we can see what is being left out of the ordering scorer.
@Component({
  selector: 'app-paragraphs',
  templateUrl: './paragraphs.component.html'
})
export class ParagraphsComponent implements OnInit {
  sub: any;

  constructor(
    private tagService: TagService,
    private cService: LegalCaseService,
    private pService: LegalPadService
  )
  { }

  get isModelOpen() {
    return this.cService.legalModel();
  }

  ngOnInit() {
    this.sub = this.cService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
    });

    EmitterService.registerCommand(this, "RefreshDisplay", this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }

  getSortedParagraphs() {
    const list = this.cService.getParagraphs().filter(item => item != null);
    list.sort((a, b) => b.compareScore(a));
    return list;
  }



  onRefreshDisplay() {
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }

  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }

}
