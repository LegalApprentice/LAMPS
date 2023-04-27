import { Component, OnInit, Input } from '@angular/core';
import { LaSentence } from '../models';
import { EmitterService } from '../shared/emitter.service';
import { LegalCaseService } from '../models/legal-case.service';



@Component({
  selector: 'app-label',
  templateUrl: './label.component.html'
})
export class LabelComponent implements OnInit {
  @Input() sentence: LaSentence;
  

  constructor(
    private cService: LegalCaseService) {
    }

  ngOnInit() {
   
    this.onRefreshSelected()

    EmitterService.registerCommand(this, 'RefreshSelected', this.onRefreshSelected);
    EmitterService.processCommands(this);

  }

  isImmutable() {
    return this.sentence.isImmutable();
  }


  onRefreshSelected() {
  }

  doClose(e:Event) {
    EmitterService.broadcastCommand(this, 'CloseAll');
  }


}
