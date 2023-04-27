import { Component, OnInit, Input } from '@angular/core';
import { LaunchMarkerUILocator, LaunchServiceLocator } from '@app/shared/service-locator';
import { DocumentHubService } from '@app/sharedComponents/documentHub.service';

import { LaSearchResult } from '../models';


@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html'
})
export class ItemViewComponent implements OnInit {
  @Input() item: LaSearchResult;

  constructor(private hubService: DocumentHubService) { }

  ngOnInit(): void {
  }

  // doLaunchLegalMarker(e: any) {
  //   const caseID = this.item.caseNumber;

  //   const serviceOptions = new LaunchMarkerUILocator({
  //     serviceKey: 'LegalMarkerLink$',
  //     endpoint: `/case/${caseID}`
  //   });
  //   serviceOptions.open();

  //   this.hubService.doOpenCase(caseID)
  // }



}
