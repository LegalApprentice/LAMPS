import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { LaResolvable, LaSentence } from '@app/models';
import { CreateGroupSpec, LaGroup, LaMemberProxy, LaStrongReference } from '@app/models/la-group';
import { LegalPadService } from '@app/models/legal-pad.service';
import { TagService } from '@app/models/tag.service';
import { EmitterService, Toast } from '@app/shared';

//https://material.angular.io/cdk/drag-drop/overview
//https://material.angular.io/cdk/tree/overview
//https://medium.com/briebug-blog/angular-implementing-drag-and-drop-in-a-material-tree-f96b9fe40f81



@Component({
  selector: 'app-grouping',
  templateUrl: './grouping.component.html',
  styleUrls: ['./grouping.component.scss']
})
export class GroupingComponent implements OnInit {
  sub: any;
  showCreateGroup: boolean = false;

  private _groupedList: LaMemberProxy[];
  private _ungroupedList: LaMemberProxy[];

  constructor(
    private tagService: TagService,
    private pService: LegalPadService) { 

      this._groupedList = new Array<LaMemberProxy>();
      this._ungroupedList = new Array<LaMemberProxy>();
    }


  ngOnInit() {
    this.sub = this.pService.getCurrentModel$().subscribe(model => {
      this.onRefreshDisplay();
    });

    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.registerCommand(this, 'CloseCreateGroup', this.onCloseCreateGroup);
    EmitterService.registerCommand(this, 'CreateGroup', this.onCreateGroup);


    EmitterService.processCommands(this);
  }

  onRefreshDisplay() {
    this.rebuildUngroupedProxy();
    this.rebuildGroupedProxy();
  }

  doToggleShowCreateGroup() {
    this.showCreateGroup = !this.showCreateGroup;
  }

  onDropFromUngroup(event: CdkDragDrop<any>) {
    const current = event.container.data as LaMemberProxy[]
    const previous = event.previousContainer.data as LaMemberProxy[];

    const source = previous[event.previousIndex];
    const target = current[event.currentIndex];

    if (event.previousContainer === event.container) {
      if ( !source.isGroup()) {
        Toast.info(`Sorting..`)
        moveItemInArray(current, event.previousIndex, event.currentIndex);
        this.executeRegrouping(current);
      }
    } else {
      if ( !source.isGroup()) {
        Toast.info(`Ungrouping..`)
        transferArrayItem(previous, current, event.previousIndex, event.currentIndex);
        this.doMarkItemsSelected(previous, false)
        this.executeRegrouping(previous);
        this.doMarkItemsSelected(current, true);
      }
    }

    this.onRefreshDisplay();
  }

  onDropFromGroup(event: CdkDragDrop<any>) {
    const current = event.container.data  as LaMemberProxy[]
    const previous = event.previousContainer.data  as LaMemberProxy[]
    
    const source = previous[event.previousIndex];
    const target = current[event.currentIndex];

    if (event.previousContainer === event.container) {
      if ( !source.isGroup()) {
        Toast.info(`Regrouping..`)
        moveItemInArray(current,event.previousIndex,event.currentIndex);
        source.clearGroupID();
        this.executeRegrouping(current);
      }
    } else {
      if ( !source.isGroup()) {
        Toast.info(`Grouping..`)
        transferArrayItem(previous,current,event.previousIndex,event.currentIndex);
        this.doMarkItemsSelected(current, false);
        this.executeRegrouping(current);
        this.doMarkItemsSelected(previous, true);
      }
    }

    this.onRefreshDisplay();
  }



  executeRegrouping(list: LaMemberProxy[]) {
    let root: LaMemberProxy = null;
    let groups = new Array<LaMemberProxy>();
    list?.forEach(item => {
      if (item.isGroup()) {
        root = item;
        groups.push(root);
      } else if (root && item.isSentence()) {
        root.addChild(item);
      } else if (item.isSentence()) {
        this.doMarkItemsSelected([item], true)
      }
    })
    groups.forEach(item => {
      item.processGroup();
    })

    this.rebuildGroupedProxy();
    this.rebuildUngroupedProxy();
    EmitterService.broadcastCommand(this, 'SetDirty');
  }

  doMarkItemsSelected(list: LaMemberProxy[], value: boolean) {
    list.forEach(item => {
      const sentence = item.member as LaSentence;
      if (sentence) {
        sentence.isItemOfInterest = value
      }
    })
  }

  doToggleOfInterest(item: LaMemberProxy) {
    const sentence = item.member as LaSentence;
    if (sentence) {
      sentence.isItemOfInterest = !sentence.isItemOfInterest
      this.rebuildUngroupedProxy();
    }
  }

  resolveStrongReference(ref: LaStrongReference): LaResolvable {
    const obj: LaResolvable = this.pService.resolve(ref);
    return obj;
  }

  toSentenceProxy(item: LaSentence) {
    if (!item) {
      console.log("null value sent to toSentenceProxy")
      return
    }
    const member = new LaMemberProxy({
      member: item,
      text: item.text,
      referenceType: "LaSentence",
      rhetClass: item.readRhetClass()
    })
    return member
  }

  toGroupProxy(item: LaGroup) {
    if (!item) {
      console.log("null value sent to toGroupProxy")
      return
    }
    const member = new LaMemberProxy({
      member: item,
      text: `${item.title}`,
      referenceType: "LaGroup",
      rhetClass: 'Sentence'
    })
    return member
  }

  rebuildUngroupedProxy() {
    if (!this.isModelOpen) return;

    this._ungroupedList = new Array<LaMemberProxy>();
    this.pService.getSentences().filter(item => item.isItemOfInterest).forEach(item => {
      const member = this.toSentenceProxy(item);
      member.clearGroupID();
      member && this._ungroupedList.push(member);
    });
  }

  UngroupedList() {
    return this._ungroupedList;
  }

  rebuildGroupedProxy() {
    if (!this.isModelOpen) return;

    this._groupedList = new Array<LaMemberProxy>();

    this.pService.getGroups().forEach(group => {
      const member = this.toGroupProxy(group)
      this._groupedList.push(member);
      group.getMembers().forEach(ref => {
        const found = this.pService.resolve(ref);
        const member = this.toSentenceProxy(found as LaSentence)
        member && this._groupedList.push(member);
      })
    });
  }

  GroupedList() {
    return this._groupedList;
  }

  get isModelOpen() {
    return this.pService.legalModel();
  }



  onCloseCreateGroup() {
    this.showCreateGroup = false;
  }

  onCreateGroup(groupInfo: CreateGroupSpec) {
    this.pService?.createGroup(groupInfo);
    this.showCreateGroup = false;
    this.onRefreshDisplay();
  }





  doToggleNotes() {
    this.tagService.doToggleNotes();
  }

  doToggleTags() {
    this.tagService.doToggleTags();
  }
}
