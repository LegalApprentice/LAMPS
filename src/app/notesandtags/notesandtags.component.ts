import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LaTagable } from '@app/models';
import { TagService } from '@app/models/tag.service';
import { EmitterService, Toast, Tools } from '@app/shared';



@Component({
  selector: 'app-notesandtags',
  templateUrl: './notesandtags.component.html'
})
export class NotesAndTagsComponent implements OnInit {
  @Input() selectedItem: LaTagable;


  constructor(
    private router: Router,
    private tagService: TagService) { }

  ngOnInit(): void {

    EmitterService.registerCommand(this, 'GridSelectionChanged', this.onGridSelectionChanged);
    EmitterService.processCommands(this);
  }

  onGridSelectionChanged(item: any) {
    if (item == this.selectedItem) {
      this.selectedItem = null;
    } else {
      this.selectedItem = item;
    }
  }

  isPowerUser() {
    return this.selectedItem && this.tagService.isPowerUser;
  }

  hasNotes() {
    return Tools.isNotEmpty(this.selectedItem?.notes)
  }

  hasTags() {
    return Tools.isNotEmpty(this.selectedItem?.userTags)
  }

  doClose(e: Event) {
    this.selectedItem = null;
    Toast.info("inspector closed")
  }

  doJumpToMarker(e: Event) {
    this.tagService.setCurrentAnchorTag('')
    const tag = this.selectedItem?.anchorTag();
    if (tag) {
      setTimeout(() => {
        Toast.info(tag, "anchorTag")
        EmitterService.broadcastCommand(this, 'JumpToAnchor', tag);
      }, 500);
      this.router.navigate(['/marker']);
    } else {
      Toast.info("Cannot find anchorTag")
    }
  }

  doJumpToEditor(e: Event) {
    this.tagService.setCurrentAnchorTag('')
    const tag = this.selectedItem?.anchorTag();
    if (tag) {
      setTimeout(() => {
        Toast.info(tag, "anchorTag")
        EmitterService.broadcastCommand(this, 'JumpToAnchor', tag);
      }, 500);
      this.router.navigate(['/editor']);
    } else {
      Toast.info("Cannot find anchorTag")
    }
  }

  doExportTags(e: Event) {
    EmitterService.broadcastCommand(this, "ExportTagsCSV")
  }

  doExportNotes(e: Event) {
    EmitterService.broadcastCommand(this, "ExportNotesCSV")
  }


}
