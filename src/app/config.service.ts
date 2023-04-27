import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Subject } from 'rxjs';

import { TagService } from './models/tag.service';
import { Tools } from './shared';
import { HubServiceLocator } from './shared/service-locator';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {


  configUrl: string;
  isLoadSuccess = false;
  isPingSuccess = false;

  constructor(
    private tagService: TagService,
    private httpService: HttpClient
  ) {
    const host = window.location.hostname;
    const port = window.location.port;
    this.configUrl = 'assets/config.json';
  }

  private getConfig$() {
    return this.httpService.get(this.configUrl);
  }

  loadConfiguration$(): Subject<boolean> {
    const localSubject = new Subject<boolean>();

    this.getConfig$().subscribe({
      next: (data) => {
        if (environment.production === false) {
          Object.keys(data).forEach((key) => {
            environment[key] = data[key];
          });
          environment.version += " (dev)";
        }
        this.tagService.loadTagDefinitions(environment.defaultTags)
        this.tagService.loadTagDefinitions(environment.userTags)

        this.isLoadSuccess = true;

        localSubject.next(this.isLoadSuccess);
      },
      error: (e) => localSubject.error(e),
      complete: () => console.info('complete')
    });

    // console.log(JSON.stringify(environment,undefined, 3))

    return localSubject;
  }

  private getHealth$() {
    const locate = new HubServiceLocator({
      serviceKey: 'pingServer$',
      endpoint: `/api/Health`
    });

    return this.httpService.get(locate.getAPIUrl());
  }

  pingServer$(): Subject<boolean> {
    const localSubject = new Subject<boolean>();


    this.getHealth$().subscribe({
      next: (data) => {
        Object.keys(data).forEach((key) => {
          environment[key] = data[key];
        });
        this.tagService.loadTagDefinitions(environment.defaultTags)
        this.tagService.loadTagDefinitions(environment.userTags)

        this.isPingSuccess = true;

        localSubject.next(this.isPingSuccess);
      },
      error: (e) => localSubject.error(e),
      complete: () => console.info('complete')
    });

    return localSubject;
  }


}
