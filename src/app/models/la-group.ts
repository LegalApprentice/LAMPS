import { LaAtom } from '../shared/la-atom';

import { Tools } from '@app/shared';
import { LaUserTag, ITagsAndNotes, IGroupRef } from './la-tags';
import { LaSentence } from './la-sentence';
import { LaParagraph } from './la-paragraph';
import { LaResolvable } from '.';

export class CreateGroupSpec extends LaAtom {
  groupIDs: string;
  title: string;
  description: string;
  category: string;

  constructor(properties?: any) {
    super(properties);
  }

  setToEmpty() {
    let group = Tools.getNowIsoDate().split('.')[0]
    group = Tools.replaceAll(group,'-', '');
    group = Tools.replaceAll(group,':', '')

    this.groupIDs = `G${group}`
    this.title = '';
    this.description = '';
    this.category = '';
    return this;
  }
}

export class LaMemberProxy extends LaAtom {
  member: LaResolvable;
  children: LaMemberProxy[];
  referenceType: string;

  text: string;
  rhetClass: string;

  constructor(properties?: any) {
    super(properties);

    if (!this.children) {
      this.children = new Array<LaMemberProxy>();
    }
  }


  shortText():string {
    const max = 200;
    if ( this.text.length < max) {
      return this.text;
    }
    const short = this.text.substring(0,max);
    return `${short}......`;
  }

  getGroupID(): string {
    return this.member?.groupIDs || 'UNGROUPED';
  }

  addGroupID(groupID: string) {
    this.member.addGroupID(groupID);
  }

  removeGroupID(groupID: string) {
    this.member.removeGroupID(groupID)
  }

  clearGroupID() {
    this.member.clearGroupIDs()
  }

  compareGroupID(other: LaMemberProxy): number {
    if ( this.getGroupID() == other.getGroupID() ) {
      return 0
    }
    return  this.getGroupID() > other.getGroupID() ? 1 : -1;
  }




  isGroup() {
    return Tools.matches(this.referenceType, 'LaGroup');
  }

  isSentence() {
    return Tools.matches(this.referenceType, 'LaSentence');
  }

  isParagraph() {
    return Tools.matches(this.referenceType, 'LaParagraph');
  }


  memberCount() {
    const group = this.member as LaGroup;
    return group.memberCount();
  }

  addChild(child: LaMemberProxy) {
    this.children.push(child);
  }

  canShowPolarity(): boolean {
    const sent = this.member as LaSentence;
    return sent?.isFindingSentence ? sent.isFindingSentence() : false;
  }

  polarityColor() {
    const sent = this.member as LaSentence;
    return sent?.polarityColor();
  }

  sentTag() {
    const sent = this.member as LaSentence;
    return sent?.sentTag();
  }

  processGroup() {
    const group = this.member as LaGroup;
    group.clearMembers();
    this.children.forEach(item => {
      if ( item.isSentence()){
        const sent = item.member as LaSentence;
        sent.isItemOfInterest = false;
        group.establishSentence(sent);
      }
    })
  }
}



export class LaStrongReference extends LaAtom implements ITagsAndNotes {
  referenceID: string;
  referenceType: string;


  notes: string;
  userTags: Array<LaUserTag>
  isItemOfInterest: boolean;
  author: string;

  constructor(properties?: any) {
    super(properties);

    if (!this.isItemOfInterest) {
      this.isItemOfInterest = false;
    }

    //must override values set in super
    if (properties?.userTags) {
      this.userTags = new Array<LaUserTag>();
      properties?.userTags?.forEach(item => {
        const newTag = new LaUserTag(item)
        newTag.applyJSON(item);
        this.addUserTag(newTag)
      });
    }

  }

  getSummary(): string {
    return this.author;
  }
  anchorTag(): string{
    return ''
  }

  addUserTag(tag: LaUserTag): LaUserTag {
    if (!this.userTags) {
      this.userTags = new Array<LaUserTag>()
    }
    this.userTags.push(tag)
    return tag;
  }

  removeUserTag(tag: LaUserTag): LaUserTag {
    if (this.userTags) {
      const index = this.userTags.indexOf(tag)
      if (index > -1) {
        this.userTags.splice(index, 1);
      }
    }
    return tag;
  }

  createTagDisplayRecord() {
    const item = this;
    const data = {
      object: item,
      objectID: item.referenceID,
      rhetClass: 'Reference',
      sentenceNumber: 0,
      notes: item.notes,
      text: ''
    };
    return data
  }

  asJson() {
    const result = {
      referenceID: this.referenceID,
      referenceType: this.referenceType,
      notes: this.notes,
      userTags: this.userTags,
    };
    return result;
  }
}

export class LaGroup extends LaAtom implements ITagsAndNotes {

  get myType(): string {
    return `LaGroup`;
  }

  groupIDs: string;

  title: string;
  description: string;
  category: string;
  createdOn: string;

  notes: string;
  userTags: Array<LaUserTag>;
  isItemOfInterest: boolean;
  isBookmark: boolean;
  unchangedSince: string;
  author: string;

  members: Array<LaStrongReference> = new Array<LaStrongReference>();

  constructor(properties?: any) {
    super(properties);
    this.createdOn = Tools.getNowIsoDate();

    properties?.members?.forEach(item => {
      const ref = new LaStrongReference(item)
      this.members.push(ref);
    });

    if (!this.isItemOfInterest) {
      this.isItemOfInterest = false;
    }

    //must override values set in super
    if (properties?.userTags) {
      this.userTags = new Array<LaUserTag>();
      properties?.userTags?.forEach(item => {
        const newTag = new LaUserTag(item)
        newTag.applyJSON(item);
        this.addUserTag(newTag)
      });
    }

  }

  getGroupID(): string {
    return this.groupIDs || '';
  }

  compareGroupID(other: LaGroup): number {
    if ( this.getGroupID() == other.getGroupID() ) {
      return 0
    }
    return  this.getGroupID() > other.getGroupID() ? 1 : -1;
  }

  createTagDisplayRecord() {
    const item = this;
    const data = {
      object: item,
      objectID: item.title,
      rhetClass: 'Group',
      sentenceNumber: 0,
      notes: item.notes,
      text: ''
    };
    return data
  }

  getSummary(): string {
    return this.title;
  }

  anchorTag(): string {
    return this.getGroupID();
  }

  addGroupID(groupID: string): string {
    if (!this.groupIDs) {
      this.groupIDs = groupID
    } else {
      this.groupIDs = `${this.groupIDs};${groupID}`
    }
    return groupID;
  }

  removeGroupID(groupID: string): string {
    if (this.groupIDs) {
      const split = this.groupIDs.split(';')
      const index = split.indexOf(groupID);
      if (index > -1) {
        split.splice(index, 1);
        this.groupIDs = split.join(';')
      }
    }
    return groupID;
  }

  clearGroupIDs() {
    this.groupIDs = null
  }

  clearMembers(): Array<LaStrongReference> {
    this.members = new Array<LaStrongReference>();
    return this.members;
  }

  memberCount() {
    return this.getMembers().length;
  }

  getMembers(): Array<LaStrongReference> {
    return this.members || [];
  }

  addUserTag(tag: LaUserTag): LaUserTag {
    if (!this.userTags) {
      this.userTags = new Array<LaUserTag>()
    }
    this.userTags.push(tag)
    return tag;
  }

  removeUserTag(tag: LaUserTag): LaUserTag {
    if (this.userTags) {
      const index = this.userTags.indexOf(tag)
      if (index > -1) {
        this.userTags.splice(index, 1);
      }
    }
    return tag;
  }

  isImmutable(): boolean {
    return !Tools.isEmpty(this.unchangedSince);
  }

  showImmutable(): string {
    if (this.isImmutable()) {
      return this.unchangedSince;
    }
    return '';
  }

  markAsImmutable() {
    this.isItemOfInterest = false;
    this.unchangedSince = Tools.getNowIsoDate();
    return this;
  }

  establishParagraph(obj: LaParagraph) {
    const found = this.members.find(item => item.referenceID == obj.paraID);
    if (found) return;

    obj.addGroupID(this.groupIDs);
    const ref = new LaStrongReference({
      referenceID: obj.paraID,
      referenceType: obj.myType,
    })
    this.members.push(ref);
  }


  establishSentence(obj: LaSentence) {
    const found = this.members.find(item => item.referenceID == obj.sentID);
    if (found) return;

    obj.addGroupID(this.groupIDs);
    const ref = new LaStrongReference({
      referenceID: obj.sentID,
      referenceType: obj.myType,
    })
    this.members.push(ref);
  }

  asJson() {

    const members = this.getMembers().map(child => {
      //console.log(child)
      return child.asJson()
    });

    const result = {
      groupIDs: this.groupIDs,
      title: this.title,
      description: this.description,
      category: this.category,
      createdOn: this.createdOn,
      notes: this.notes,
      userTags: this.userTags,
      members: this.members,
    };
    return result;
  }

}

