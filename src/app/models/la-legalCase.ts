import { Tools } from '@app/shared';
import { LaLegalModel } from './la-legalModel';



export class LaLegalCase  extends LaLegalModel {
  
  // public isType(name:string): boolean {
  //   return Tools.matches(`LaLegalCase`,name);
  // }
  // get myType(): string {
  //   return `LaLegalCase`;
  // }

 constructor(properties?: any) {
    super(properties);
    this.lampsType = "LegalCase";
  }

}
