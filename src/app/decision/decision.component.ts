import { Component, OnInit, OnDestroy } from '@angular/core';

import { LegalCaseService } from '../models/legal-case.service';

@Component({
  selector: 'app-decision',
  templateUrl: './decision.component.html',
  styleUrls: ['./decision.component.css']
})
export class DecisionComponent implements OnInit, OnDestroy {
  sub: any;

  constructor(private cService: LegalCaseService) {}

  ngOnInit() {
    this.sub = this.cService.getCurrentModel$().subscribe(data => {
    });
  }

  ngOnDestroy() {
    this.sub && this.sub.unsubscribe();
  }

}
