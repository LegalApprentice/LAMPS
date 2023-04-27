import { LaAtom } from '@app/shared';
import { LaGroup, LaStrongReference } from './la-group';
import { LaParagraph } from './la-paragraph';
import { LaSentence } from './la-sentence';


export * from './la-command';
export * from './la-sentence';
export * from './la-footnote';
export * from './la-decisionNode';
export * from './la-stats';
export * from './la-plugin';
export * from './la-paragraph';
export * from './la-legalCase';
export * from './la-user';
export * from './la-teams';
export * from './la-caseDirectoryItem';

export * from './la-query';
export * from './la-search-result';


export type LaResolvable = LaSentence | LaParagraph | LaGroup;
export type LaTagable = LaResolvable | LaStrongReference;

export class Health extends LaAtom {
    status: string;
    message: string;
  
    constructor(props?: any) {
      super(props)
      this.override(props);
    }
  }