import { Component, OnInit } from '@angular/core';
import { Toast, EmitterService } from '../shared/emitter.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { AuthenticationService } from './authentication.service';
import { TeamsService } from '../models/teams.service';
import { environment } from '@environments/environment';
import { TagService } from '@app/models/tag.service';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {

  localLogin: boolean = environment.localLogin;

  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tagService: TagService,
    private tService: TeamsService,
    private aService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (this.aService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (this.localLogin) {
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required]
      });
    }



    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.localLogin) {
      const user = this.aService.localLogin(this.loginForm.value.username);
      Toast.success(`Hello, ${user.username}`, `let's get started`);
      this.router.navigate([this.returnUrl]);

      //add code to only set to true if you have the right passowrd
      this.tagService.isPowerUser = true;
      EmitterService.broadcastCommand(this, "PowerUser");
      if ( this.tagService.isPowerUser ) {
        Toast.warning(`You are a power user ${user.username}`, `you have the power to modify the original text`);
      }
      return;
    }

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.aService.login(this.loginForm.value, () => this.loading = false).subscribe(
        user => {
          if ( user ) {
            Toast.success(`Hello, ${user.fullName()}`, 'welcome back');
            this.aService.getIsUserAdmin$(user).subscribe(_ => {
              this.router.navigate([this.returnUrl]);
            });

            // lets get the current team to display as well
            this.tService.getActiveTeamFor$(user.email).subscribe();
          }
        });
  }
}
