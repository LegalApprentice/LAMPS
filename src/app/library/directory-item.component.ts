import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { LegalCaseService } from '../models/legal-case.service';
import { LaCaseDirectoryItem } from '../models';

@Component({
  selector: 'app-directory-item',
  templateUrl: './directory-item.component.html',
  styleUrls: ['./directory-item.component.scss']
})
export class DirectoryItemComponent implements OnInit {
  @Input() item: LaCaseDirectoryItem;
  @Input() showWorkspace = false;

  constructor(
    private cService: LegalCaseService,
    private router: Router) {}

  ngOnInit() {
  }

  doLoadItem(obj: LaCaseDirectoryItem) {
    // this.cService.onOpenFileFromServer(obj);
    // this.router.navigate(['/reader']);
  }
}
