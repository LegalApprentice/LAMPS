import { LaSentence } from '.';
import { LaLegalModel } from './la-legalModel';
export class LaLegalPad extends LaLegalModel {

  constructor(properties?: any) {
    super(properties);
    this.lampsType = "LegalPad";
  }

  //if these sentence has a group you must preserve the group name
  establishSentence(sentence: LaSentence): LaLegalModel {
    sentence.computeID();
    const found = this.resolveSentence(sentence.sentID);
    if (found) {
      this.removeSentence(found)
    }
    this.sentenceLookup[sentence.sentID] = sentence;
    this.sentences.push(sentence);
    if ( found && found.groupIDs ) {
      sentence.addGroupID(found.groupIDs)
    }
    return this;
  }

}
