import { Component, OnInit, Input } from '@angular/core';
import { LaUser } from '@app/models';

import { AuthenticationService } from '../login/authentication.service';
import { EmitterService } from '../shared/emitter.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Input() user: LaUser;
  confirmDelete = false;

  constructor(
   private aService: AuthenticationService) {
  }

  ngOnInit() {
    if (this.user) {
      const s = this.aService.getIsUserAdmin$(this.user).subscribe(_ => {
        EmitterService.broadcastCommand(this, 'ReplaceUser', [this.user]);
        s.unsubscribe();
      });
    }
  }

  isAdmin() {
    return this.user && this.user.isAdmin();
  }

  doRemoveMember() {
    this.confirmDelete = !this.confirmDelete;
  }

  deleteText() {
    return this.confirmDelete ? 'Save' : 'Delete';
  }

  doDeleteMember() {
    this.confirmDelete = !this.confirmDelete;
  }

  doConfirmDelete() {
    this.confirmDelete = false;
    const s = this.aService.getDeleteUser$(this.user).subscribe(_ => {
      EmitterService.broadcastCommand(this, 'RemoveUser', [this.user]);
      s.unsubscribe();
      this.user = undefined;
    });
  }
}
