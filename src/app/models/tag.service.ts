import { Injectable } from '@angular/core';
import { LaTagDefinitions } from './la-tags';

import { environment } from '../../environments/environment';

import { EmitterService, Toast, Tools } from '../shared';
import { saveAs } from 'file-saver-es';
import { LaSentence } from './la-sentence';

export enum OpenPage { Editor, Marker, Viewer, Selection, Notes, Search, Login, Footnote, None }

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private _currentTag:string = '';

  public canAddNotes: boolean = false;
  public canAddTags: boolean = false;
  public canLabel: boolean = false;
  public canJoinText: boolean = false;
  public canSplitText: boolean = false;
  public canQuickSplitText: boolean = false;
  public canDeleteText: boolean = false;
  public canEditText:boolean = false;
  public canMoveSentenceForward: boolean = false;
  public canMoveSentenceBackward: boolean = false;
  public canMoveSentenceUp: boolean = false;
  public canMoveSentenceDown: boolean = false;
  public canSplitParagraph: boolean = false;
  public canSelectSentence: boolean = false;
  public canEditSection: boolean = false;
  public canInsertSentence: boolean = false;;
  public canInsertParagraph: boolean = false;;
  public canEditFootnote: boolean = false;;
  public hideColors: boolean = false;
  public isPowerUser: boolean = false;

  public tagDefinitions: LaTagDefinitions = new LaTagDefinitions();
  protected postEditLookup: { [name: string]: LaSentence } = {};
  public openPage: OpenPage = OpenPage.None



  constructor() {
    this.loadTagDefinitions(environment.defaultTags)
    this.loadTagDefinitions(environment.userTags)
  }

  setCurrentAnchorTag(tag:string) {
    this._currentTag = tag;
  }

  gotoCurrentAnchorTag() {
    if ( Tools.isNotEmpty(this._currentTag)) {
      EmitterService.broadcastCommand(this, 'GoToBookmark;JumpToAnchor', this._currentTag);
      this._currentTag = ''
    }
  }

  addPostEdit(obj:LaSentence){
    this.postEditLookup[obj.sentID] = obj;
  }

  isPostEdit(obj:LaSentence){
    return this.postEditLookup[obj.sentID] ? true : false;
  }

  clearPostEdit(){
    this.postEditLookup = {}
  }

  doToggleColors() {
    this.hideColors = !this.hideColors;
    this.gotoCurrentAnchorTag();
  }

  doToggleNotes() {
    this.canAddNotes = !this.canAddNotes;
    this.gotoCurrentAnchorTag();
  }

  doToggleTags() {
    this.canAddTags = !this.canAddTags;
    this.gotoCurrentAnchorTag();
  }

  doToggleLabel() {
    this.canLabel = !this.canLabel;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanJoinText() {
    this.canJoinText = !this.canJoinText;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanSplitText() {
    this.canSplitText = !this.canSplitText;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanQuickSplitText() {
    this.canQuickSplitText = !this.canQuickSplitText;
    //this.canSelectSentence = this.canQuickSplitText;
    this.gotoCurrentAnchorTag();
  }


  doToggleCanDeleteText() {
    this.canDeleteText = !this.canDeleteText;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanEditText() {
    this.canEditText = !this.canEditText;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanSplitParagraph() {
    this.canSplitParagraph = !this.canSplitParagraph;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanMoveSentenceForward() {
    this.canMoveSentenceForward = !this.canMoveSentenceForward;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanMoveSentenceBackward() {
    this.canMoveSentenceBackward = !this.canMoveSentenceBackward;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanMoveSentenceUp() {
    this.canMoveSentenceUp = !this.canMoveSentenceUp;
    this.gotoCurrentAnchorTag();
  }

  doToggleCanMoveSentenceDown() {
    this.canMoveSentenceDown = !this.canMoveSentenceDown;
    this.gotoCurrentAnchorTag();
  }

  doToggleSectionEdit() {
    this.canEditSection = !this.canEditSection;
    this.gotoCurrentAnchorTag();
  }

  doToggleSentenceSelection() {
    this.canSelectSentence = !this.canSelectSentence;
    this.gotoCurrentAnchorTag();
  }

  doToggleInsertParagraph() {
    this.canInsertParagraph = !this.canInsertParagraph;
    //this.canSelectSentence = this.canInsertParagraph;
    this.gotoCurrentAnchorTag();
  }

  doToggleInsertSentence() {
    this.canInsertSentence = !this.canInsertSentence;
    //this.canSelectSentence = this.canInsertSentence;
    this.gotoCurrentAnchorTag();
  }

  doToggleEditFootnote() {
    this.canEditFootnote = !this.canEditFootnote;
    this.gotoCurrentAnchorTag();
  }

  loadTagDefinitions(tagSet:any) {
    Object.keys(tagSet).forEach(key => {
      const value = tagSet[key] as string;
      this.tagDefinitions.establishTag(key, value);
    })
  }

  tagList() {
    return this.tagDefinitions.tagList;
  }

  attribution() {
    let result = this.tagDefinitions.findTag("attribution")
    if ( !result) {
      result = this.tagDefinitions.establishTag("attribution", "type:[Finding,Evidence,LegalRule,Reasoning,Citation];cue;subject;object")
    }
    return result;
  }
 
  saveTagsAs(filename: string) {

    try {
      const model = this.tagDefinitions.toJson()
      const data = JSON.stringify(model,undefined,3)
  
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
  
      Toast.success('Tags Saved!',filename);
    } catch (ex) {
      Toast.error(filename, ex.message);
    }
  }

  loadFile(file: File) {
    const reader = new FileReader();
    reader.onerror = event => {
      Toast.error('fail...', JSON.stringify(event.target));
    };
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);

      this.tagDefinitions.fromJson(data)

      Toast.success('loading!', file.name);
    };

    reader.readAsText(file);
  }

}
