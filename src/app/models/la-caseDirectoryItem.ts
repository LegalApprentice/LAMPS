import { LaAtom } from '../shared/la-atom';
import { Tools } from '../shared/foTools';

// export const CASEPATTERN = 'case-{name}-{version}';
// export const NOTEPATTERN = 'notes-{name}-{version}';
// export const SEARCHPATTERN = 'search-{name}-{version}';

export class LaFilename extends LaAtom {

  pre: string;
  name: string;
  version: string;
  extension: string;

  constructor(properties?: any) {
    super(properties);
    this.extension = this.extension || ".json";
    this.version = this.version || "0000";
  }

  public getFilename() {
    return `${this.pre}-${this.name}-${this.version}${this.extension}`;
  }

  public getName() {
    return this.name;
  }

  public asFile(data: any): File {
    return new File([data], this.getFilename());
  }

  public computeFromTemplate(format: string) {
    const result = Tools.applyTemplate(format, this);
    return `${result}${this.extension}`;
  }

  syncronise(filename: string) {
    const nameonly = filename.replace(this.extension,'')
    const list = nameonly.split('-');
    
    if ( list.length == 3 ) {
      this.pre = list[0];
      this.name = list[1];
      this.version = list[2];
    }
    if ( list.length == 2 ) {
      this.pre = list[0];
      this.name = list[1];
      this.version = this.version || "0000";
    }
  }

  incrementVersion() {
    const ver = parseInt(this.version) + 1;
    const padded = this.padLeft(ver, '0', 4)
    this.version = `${padded}`
    return this;
  }

  padLeft(text: any, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr((size * -1), size);
  }

}

export class LaCaseCoreInfo extends LaAtom {

  guidKey: string;
  lastChange: string;

  pre: string;
  version: string;
  name: string;
  extension: string;

  openedFileName: string;
  prevFileName: string;
  nextFileName: string;

  title: string;
  description: string;
  keywords: string;
  metadata: any;
  notes: string;
  owner: string;
  source: string;
  workspace: string;

  constructor(properties?: any) {
    super(properties);
    this.workspace = this.workspace || 'local'
    if ( !this.source ) {
      this.source = this.owner;
    }
  }

  public asFilename(pre?: string): LaFilename {
    return new LaFilename({
      pre: pre || this.pre || 'case',
      name: this.name,
      version: this.version,
      extension: this.extension
    })
  }

  public getFilename() {
    return `${this.pre}-${this.name}-${this.version}${this.extension}`;
  }

}

export class LaCaseDirectoryItem extends LaCaseCoreInfo {
  uri: string;

  constructor(properties?: any) {
    super(properties);
  }



  caseCompare(other: LaCaseDirectoryItem): number {
    if (this.workspace == other.workspace) {
      if (this.openedFileName == other.openedFileName) {
        return 0;
      }
      return this.openedFileName < other.openedFileName ? 1 : -1;
    }
    return this.workspace < other.workspace ? 1 : -1;
  }
}

export class LaUploadedCase extends LaCaseDirectoryItem {
  data: string;

  constructor(properties?: any) {
    super(properties);
  }
}

export class LaDownloadedCase extends LaCaseDirectoryItem {
  uri: string;
  data: string;

  constructor(properties?: any) {
    super(properties);
  }
}

