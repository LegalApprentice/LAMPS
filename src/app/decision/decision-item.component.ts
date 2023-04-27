import { Component, OnInit, Input } from '@angular/core';
import { EmitterService, Toast } from '../shared';
import { LegalCaseService } from '@app/models/legal-case.service';

import { LaDecisionNode } from '../models';

@Component({
  selector: 'app-decision-item',
  templateUrl: './decision-item.component.html',
  styleUrls: ['./decision-item.component.css']
})
export class DecisionItemComponent implements OnInit {
  @Input() node: LaDecisionNode;
  selected = false;

  constructor(private cService: LegalCaseService) {
  }

  ngOnInit() {
    EmitterService.registerCommand(this, 'CloseAll', this.doClose);
    EmitterService.processCommands(this);

    this.node.calculateSentencePolarity = (idList:Array<String>) => {
      
      const found = this.cService.resolveSentenceKeys(idList);
      if ( found.length == 0 ){
        return ''
      }
      return found[0].readPolarity();
    }
  }

  hasNode(){
    return this.node ? true : false;
  }

  polarityColor() {
    return this.node.polarityColor;
  }

  isStipulated() {
    return this.node.stipulation != undefined;
  }

  stipulationClass() {
    return this.node.stipulationClass();
  }



  isSelected() {
    return this.selected;
  }

  doClose(e:Event) {
    this.selected = false;
  }

  doOpen() {
    if ( this.selected) {
      this.selected = false;
    } else {
      EmitterService.broadcastCommand(this, 'CloseAll', null, _ => {
        this.selected = true;
      });

      EmitterService.broadcastCommand(this, 'RefreshSelected');
    }
  }

}
