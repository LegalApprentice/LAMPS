
import { LaAtom } from './la-atom';
import { environment } from '../../environments/environment';
import { Tools } from './foTools';
import { Toast } from './emitter.service';


export interface IServiceOptions {
  serviceKey: string;
  endpoint: string;
  baseURL: string;
  baseURLAPI: string;

  getUrl(): string;
  getAPIUrl(): string;
}



export class ServiceLocator extends LaAtom implements IServiceOptions {
  baseURL: string = environment.baseURL;
  baseURLAPI: string = environment.baseURLAPI;

  serviceKey: string; // update config-local and config when you add a new service
  endpoint: string;


  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.baseURLAPI}${this.endpoint}`;
    return encodeURI(url);
  }
}

export class SearchServiceLocator extends ServiceLocator {
  baseURL: string = environment.searchURL;
  baseURLAPI: string = environment.searchURLAPI;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.baseURLAPI}${this.endpoint}`;
    return encodeURI(url);
  }
}

export class HubServiceLocator extends ServiceLocator {
  baseURL: string = environment.hubURL;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    return encodeURI(url);
  }
}

export class LaunchServiceLocator extends ServiceLocator {
  baseURL: string = environment.launchServerURL;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    if ( this.endpoint.indexOf('.azurecontainer.io') > 0) {
      return encodeURI(this.endpoint);
    }
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;

    return encodeURI(url);
  }

  open() {
    const url = this.getUrl();
    window.open(url, "_blank");
  }
}


export class LaunchMarkerUILocator extends ServiceLocator {
  baseURL: string = environment.launchMarkerEndpoint;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    if ( this.endpoint.indexOf('.azurecontainer.io') > 0) {
      return encodeURI(this.endpoint);
    }
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;

    return encodeURI(url);
  }

  open() {
    const url = this.getUrl();
    Toast.info('opening', url)
    window.open(url, "_blank");
  }
}

export class LaunchPadUILocator extends ServiceLocator {
  baseURL: string = environment.launchPadEndpoint;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    if ( this.endpoint.indexOf('.azurecontainer.io') > 0) {
      return encodeURI(this.endpoint);
    }
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;

    return encodeURI(url);
  }

  open() {
    const url = this.getUrl();
    window.open(url, "_blank");
  }
}

export class LaunchSearchUILocator extends ServiceLocator {
  baseURL: string = environment.launchSearchEndpoint;

  constructor(properties?: any) {
    super();
    this.override(properties);
  }

  public getUrl(): string {
    const longPath = `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;
    if ( this.endpoint.indexOf('.azurecontainer.io') > 0) {
      return encodeURI(this.endpoint);
    }
    return encodeURI(url);
  }

  public getAPIUrl(): string {
    const longPath =  `${this.baseURL}`;
    const url = `${longPath}${this.endpoint}`;

    return encodeURI(url);
  }

  open() {
    const url = this.getUrl();
    window.open(url, "_blank");
  }
}

export class LibraryServiceLocator extends ServiceLocator {
  constructor(properties?: any) {
    super();
    this.override(properties);
  }
}
export class TeamServiceLocator extends ServiceLocator {
  constructor(properties?: any) {
    super();
    this.override(properties);
  }
}
