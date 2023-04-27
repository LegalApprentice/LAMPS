import { Component, OnInit, Input } from '@angular/core';
import { LaSentence, LaParagraph, LaTagable } from '@app/models';
import { LaGroup, LaStrongReference } from '@app/models/la-group';

@Component({
  selector: 'app-selected-item',
  templateUrl: './selected-item.component.html'
})
export class SelectedItemComponent implements OnInit {
  @Input() context: LaTagable;

  constructor() { }

  ngOnInit(): void {
  }

  //https://alligator.io/typescript/instanceof-guard/


  isSentence(){
    const result =  this.context instanceof LaSentence;
    return result;
  }

  isParagraph(){
    const result =  this.context instanceof LaParagraph;
    return result;
  }

  isReference(){
    const result =  this.context instanceof LaStrongReference;
    return result;
  }

  isGroup(){
    const result =  this.context instanceof LaGroup;
    return result;
  }

}
