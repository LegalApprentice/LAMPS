import { Component, OnInit, Input } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LibraryService } from '../models/library.service';
import { AuthenticationService } from '../login/authentication.service';

import { LaCaseDirectoryItem, LaTeam } from '../models';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class WorkspaceComponent implements OnInit {
  @Input() team: LaTeam;
  list: Array<LaCaseDirectoryItem>;

  constructor(
    private lService: LibraryService,
    private aService: AuthenticationService) {

    EmitterService.registerCommand(this, 'Saved', this.doRefreshCases);
    EmitterService.processCommands(this);
  }

  public doRefreshCases() {
    const workspace = this.team.workspace;
    const s1 = this.lService.getCasesInWorkspace$(workspace).subscribe({
      next: (data: LaCaseDirectoryItem[]) => {
          this.list = data;
          s1.unsubscribe();
      },
      error: (e)=> console.log(e),
      complete: ()=> console.log('complete')
  });
  }

  ngOnInit() {
    this.doRefreshCases();
  }

}
