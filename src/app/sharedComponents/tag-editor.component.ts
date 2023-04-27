import { Component, Input, OnInit } from '@angular/core';
import { LaParagraph, LaSentence } from '@app/models';
import { LaUserTag } from '@app/models/la-tags';
import { LegalCaseService } from '@app/models/legal-case.service';
import { EmitterService } from '@app/shared';

@Component({
  selector: 'app-tag-editor',
  templateUrl: './tag-editor.component.html'
})
export class TagEditorComponent implements OnInit {
  @Input() context: LaSentence | LaParagraph;
  @Input() userTag: LaUserTag

  constructor(
    private cService: LegalCaseService) {
  }

  ngOnInit(): void {
  }

  get title() {
    return this.userTag.tagName
  }

  tagElements():Array<LaUserTag>{
    if (this.userTag.isTagGroup) {
      return this.userTag.userTagList()
    }
    return [this.userTag]
  }

  readTag(item:LaUserTag) {
    if (window.getSelection) {
      const text = window.getSelection().toString();
      item.tagValue = text;
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
  }

  doDeleteTag(item:LaUserTag) {
    this.context.removeUserTag(item);
    EmitterService.broadcastCommand(this, 'SetDirty');
  }

  
  selectTagValue(tag:LaUserTag, value: string): void {
    tag.tagValue = value;
    EmitterService.broadcastCommand(this, 'SetDirty');
  }

}
