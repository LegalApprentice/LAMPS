import { Component, OnInit, Input } from '@angular/core';

import { LibraryService } from '../models/library.service';
import { LaCaseDirectoryItem } from '../models';

@Component({
  selector: 'app-item-history',
  templateUrl: './item-history.component.html',
  styleUrls: ['./item-history.component.scss']
})
export class ItemHistoryComponent implements OnInit {
  @Input() root: LaCaseDirectoryItem;

  sub: any;
  history: Array<LaCaseDirectoryItem>;

  constructor(private lService: LibraryService) { }

  ngOnInit() {
    this.doShowHistory();
  }

  doShowHistory() {
    // const folder = this.root.workspace;
    // const filename = this.root.filename;
    // const s1 = this.lService.caseHistory$(folder, filename).subscribe(list => {
    //   this.history = list.filter(item => item.openedFileName !== filename);
    //   s1.unsubscribe();
    // });
  }
}
