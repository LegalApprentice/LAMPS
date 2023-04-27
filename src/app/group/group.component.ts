import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LegalPadService } from '@app/models/legal-pad.service';
import { LaGroup } from '@app/models/la-group';
import { TagService } from '@app/models/tag.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit, OnDestroy {
  sub: any;
  currentGroup:LaGroup = null;

  constructor(
    private tagService: TagService,
    private pService: LegalPadService) { }


  getModelCoreInfo() {
    return this.pService.getModelCoreInfo();
  }

  applyFilter(e: Event, group:LaGroup) {
    this.currentGroup = group;
  }

  get isModelOpen() {
    return this.pService.legalModel();
  }

  ngOnInit() {
    this.sub = this.pService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
    });

    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }


  onRefreshDisplay() {
  }

  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }

  getGroups() {
    const list = this.pService.getGroups()
    return list;
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }
}
