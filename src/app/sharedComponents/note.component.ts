
import { Component, OnInit, Input } from '@angular/core';
import { EmitterService } from '@app/shared';
import { LaTagable } from '../models';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html'
})
export class NoteComponent implements OnInit {
  @Input() context: LaTagable;
  isDirty = false

  constructor() {
  }

  doClose(event: Event) {
    event?.preventDefault();
    EmitterService.broadcastCommand(this, 'CloseNote');
    if (this.isDirty) {
      EmitterService.broadcastCommand(this, 'SetDirty');
    }
  }

  doRemove(event: Event) {
    this.isDirty = true
    this.context.notes = '';
    EmitterService.broadcastCommand(this, 'NoteRemoved');
    this.doClose(event)
  }

  onChange(ev: Event) {
    this.isDirty = true
  }

  noteSource() {
    return this.context
  }

  noteKey(): string {
    return this.context.getSummary();
  }

  ngOnInit() {
  }
}
