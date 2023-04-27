import { Component, OnInit, Input } from '@angular/core';
import { LaResolvable } from '@app/models';
import { LaGroup, LaStrongReference } from '@app/models/la-group';
import { LegalCaseService } from '@app/models/legal-case.service';
import { LegalPadService } from '@app/models/legal-pad.service';
import { TagService } from '@app/models/tag.service';
import { EmitterService, Tools } from '../shared';





//  https://material.angular.io/components/card/overview

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html'
})
export class GroupDetailsComponent implements OnInit {
  @Input() group: LaGroup;
  isOpen = false;
  showNotes = false;
  showTags = false;

  constructor(
    private tService: TagService,
    private pService: LegalPadService,
    private cService: LegalCaseService) {
  }

  ngOnInit(): void {

    EmitterService.registerCommand(this, 'CloseNote', this.doCloseNote);
    EmitterService.registerCommand(this, 'CloseTags', this.doCloseTags);
    EmitterService.processCommands(this);
  }

  isPanelOpen() {
    return this.isOpen && this.group
  }

  doOpenPanel(event:Event) {
    event?.preventDefault();
    if (!this.group) return;
    this.isOpen = true;
  }

  doClosePanel(event:Event) {
    event?.preventDefault();
    this.isOpen = false;
  }
  hasNotes(): boolean {
    return Tools.isEmpty(this.group.notes) === false;
  }

  doCloseNote() {
    this.showNotes = false;
  }

  canAddNotes(): boolean {
    return this.tService.canAddNotes;
  }

  doAddNote(event:Event) {
    event?.preventDefault();
    if (this.group.isImmutable()) return;

    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }

  doOpenNote(event:Event) {
    event?.stopPropagation();
    event?.preventDefault();
    if (this.group.isImmutable()) return;

    if (this.showNotes) {
      this.showNotes = false;
    } else {
      this.showNotes = true
    }
  }



  doAddTags(event:Event) { 
    event?.stopPropagation();
    event?.preventDefault();
    if (this.group.isImmutable()) return;

    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }


  tagToolTips() {
    const items = this.group.userTags.map(item => item.tagName)
    return JSON.stringify(items)
  }

  hasTags(): boolean {
    return Tools.isEmpty(this.group.userTags) === false;
  }

  canAddTags(): boolean {
    return this.tService.canAddTags;
  }


  doOpenTags(event:Event) {
    event?.preventDefault();
    if (this.group.isImmutable()) return;

    if (this.showTags) {
      this.showTags = false;
    } else {
      this.showTags = true
    }
  }

  doCloseTags() {
    this.showTags = false;
  }

  getIsGroupOfInterest() {
    return this.group.isItemOfInterest;
  }

  setIsGroupOfInterest(value: boolean) {
    this.group.isItemOfInterest = value;
  }

  doToggleItemOfInterest() {
    this.setIsGroupOfInterest(!this.getIsGroupOfInterest());
  }

  //add code to resolve all strong references
  isParagraph(ref:LaStrongReference) {
    return Tools.matches(ref.referenceType, 'LaParagraph');
  }

  isSentence(ref:LaStrongReference) {
    return Tools.matches(ref.referenceType, 'LaSentence');
  }
  resolveStrongReference(ref: LaStrongReference): LaResolvable {
    const obj: LaResolvable = this.pService.resolve(ref);
    return obj;
  }

  resolveReferences(): Array<LaResolvable> {
    const list: Array<LaResolvable> = new Array<LaResolvable>();

    this.group.getMembers().forEach(item => {
      const found = this.resolveStrongReference(item)
      list.push(found);
    })
    return list;
  }


}
