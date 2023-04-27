import { Component, OnInit, Input } from '@angular/core';
import { TagService } from '@app/models/tag.service';
import { LaStrongReference } from '../models/la-group';
import { LegalCaseService } from '../models/legal-case.service';
import { LegalPadService } from '../models/legal-pad.service';
import { EmitterService, Tools } from '../shared';

@Component({
  selector: 'app-strong-reference',
  templateUrl: './strong-reference.component.html'
})
export class StrongReferenceComponent implements OnInit {
  @Input() reference: LaStrongReference

  showNotes = false;
  showTags = false;

  constructor(
    private tagService: TagService,
    private pService: LegalPadService,
    private cService: LegalCaseService) {
  }

  ngOnInit(): void {

    EmitterService.registerCommand(this, 'CloseNote', this.doCloseNote);
    EmitterService.registerCommand(this, 'CloseTags', this.doCloseTags);
    EmitterService.processCommands(this);
  }
  refType() {
    return this.reference.referenceType.replace('La', '')
  }

  refID() {
    return this.reference.referenceID
  }

  doCloseNote() {
    this.showNotes = false;
  }


  canAddNotes(): boolean {
    return this.tagService.canAddNotes;
  }

  doAddNote(event:Event) {
    event?.preventDefault();


    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  doOpenNote(event:Event) {
    event.stopPropagation();
    event?.preventDefault();


    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  hasNotes(): boolean {
    return Tools.isEmpty(this.reference.notes) === false;
  }

  doAddTags(event:Event) { 
    event.stopPropagation();
    event?.preventDefault();


    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }


  tagToolTips() {
    const items = this.reference.userTags.map(item => item.tagName)
    return JSON.stringify(items)
  }

  hasTags(): boolean {
    return Tools.isEmpty(this.reference.userTags) === false;
  }

  canAddTags(): boolean {
    return this.tagService.canAddTags;
  }


  doOpenTags(event:Event) {
    event?.preventDefault();


    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }

  doCloseTags() {
    this.showTags = false;
  }

}
