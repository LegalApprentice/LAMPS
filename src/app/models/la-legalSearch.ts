import { LaLegalModel } from './la-legalModel';
export class LaLegalSearch extends LaLegalModel {

  // public isType(name:string): boolean {
  //   return Tools.matches(`LaLegalSearch`,name);
  // }
  // get myType(): string {
  //   return `LaLegalSearch`;
  // }

  constructor(properties?: any) {
    super(properties);
    this.lampsType = "LegalSearch";
  }

}
