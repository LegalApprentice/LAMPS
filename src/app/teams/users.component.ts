import { Component, OnInit, Input } from '@angular/core';

import { LaUser } from '../models';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @Input() list: Array<LaUser>;

  constructor() { }

  ngOnInit() {
  }

}
