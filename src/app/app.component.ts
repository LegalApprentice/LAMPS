import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Renderer2, RendererFactory2 } from '@angular/core';


import { ToastrService } from 'ngx-toastr';
import { EmitterService, Toast } from './shared/emitter.service';
import { LaunchMarkerUILocator, LaunchPadUILocator, LaunchSearchUILocator, LaunchServiceLocator } from './shared/service-locator';

import { LegalCaseService } from './models/legal-case.service';

import { AuthenticationService } from './login/authentication.service';
import { TeamsService } from './models/teams.service';

import { AppInitService } from './app-init.service';


import { environment } from '../environments/environment';
import { LaUser, LaTeam, LaCommand, MainMenu } from './models';
import { LegalPadService } from './models/legal-pad.service';
import { DocumentHubService } from './sharedComponents/documentHub.service';
import { LegalSearchService } from './models/legal-search.service';
import { MarkerComponent } from './marker/marker.component';
import { SearchAndRenderComponent } from './search/search-and-render.component';
import { ImmutableComponent } from './selections/immutable.component';
import { routes } from './app-routing.module';
import { Tools } from './shared';
import { TagService } from './models/tag.service';


// https://octoperf.com/blog/2019/08/22/kraken-angular-workspace-multi-application-project/#serving-production-images-with-haproxy
// https://medium.com/@jinalshah999/hosting-angular-application-on-azure-with-ci-cd-2afcb66d84bd


// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sticky_header


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'LA-MPS';
  version = environment.version;

  isLegalMarker = environment.isLegalMarker;
  isLegalPad = environment.isLegalPad;
  isLegalSearch = environment.isLegalSearch;
  tagline = '';
  hasConfig = false;


  isDisconnected = this.isLegalMarker;

  isMarker = this.isLegalMarker;
  isPad = this.isLegalPad;
  isSearch = this.isLegalSearch;



  _renderer: Renderer2;
  menuItems: Array<LaCommand> = new Array<LaCommand>();

  constructor(
    private route: ActivatedRoute,
    private appInitService: AppInitService,
    private tagService: TagService,
    private tService: TeamsService,
    private aService: AuthenticationService,
    private cService: LegalCaseService,
    private pService: LegalPadService,
    private eService: LegalSearchService,
    private hubService: DocumentHubService,
    private titleService: Title,

    private router: Router,
    rendererFactory: RendererFactory2,
    private toastr: ToastrService
  ) {
    this._renderer = rendererFactory.createRenderer('body', null);
  }

  // computeDefaultModelRefId() {
  //   const data = window.location.toString().split('/');
  //   const nameIndex = data.length-1;

  //   //  example http://localhost:4200/#viewer/jjjjjjjjjjjjj
  //   //http://localhost:4200/#viewer/2005_02955

  //   const name = data[nameIndex]
  //   const refID = name.replace('case','')

  //   Toast.info(`computeDefaultModelRefId  ${window.location.toString()}`, `${name} ${refID}`)

  //   if ( Tools.startsWith(name,"case")) {
  //     this.cService.defaultModelRefId = refID
  //   } else {
  //     this.cService.defaultModelRefId = ''
  //   }
  // }

  ngOnInit() {

    EmitterService.displayToast(this, this.openToast);

    this.appInitService.loadConfiguration(() => {
      this.appInitialized();
      if (!this.isDisconnected) {
        this.cService.varifyConnection(() => {
          this.appConnected();
        }, () => {
          Toast.error('Connection', 'DID NOT HAPPEN')
          this.appConnected();
        });
      }
    }, () => {
      Toast.error('Configuration', 'DID NOT HAPPEN')
    })

    EmitterService.registerCommand(this, 'FindAnchor', this.onFindAnchor);
    EmitterService.registerCommand(this, 'JumpToAnchor', this.onJumpToAnchor);
    EmitterService.registerCommand(this, "PowerUser", this.onPowerUser);

    EmitterService.registerCommand(this, 'ToggleFilenameOpen', this.doToggleFilenameOpen);
    EmitterService.registerCommand(this, 'ForceFileSave', this.onForceFileSave);
    EmitterService.processCommands(this);

    ///#/case/case1800023
    var refID = this.route.snapshot.paramMap.get('caseid');
    if (refID != null) {
      this.cService.defaultModelRefId = refID;
      Toast.info(`caseID  ${this.cService.defaultModelRefId}`, 'loading case...')
    }
  }

  doPing() {
    this.pService.sendPing()
  }

  doShowPlugins() {
  this.router.navigate(['/plugins']);
  }

  onPowerUser(){
    this.computeMainMenu();
  }

  onJumpToAnchor(id:string) {
    //Toast.success('JumpToAnchor')
    setTimeout(()=>{
      const yOffset = -200;
      const element = document.getElementById(id);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    },100)
  }

  onFindAnchor(id:string) {
   // setTimeout(()=>{
      const yOffset = -200;
      const element = document.getElementById(id);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    //},5)
  }

  labelForOpenButton() {
    if (this.isMarker ) {
      return 'Open Case';
    }
    if (this.isPad) {
      return 'Open Notes';
    }
    if (this.isSearch) {
      return 'Open Search';
    }
    return 'Open...'
  }


  labelForSaveButton() {
    if (this.isMarker) {
      return 'Save Case';
    }

    if (this.isPad) {
      return 'Save Notes';
    }

    if (this.isSearch) {
      return 'Save Search';
    }
    return 'Save...'
  }

  // doFind() {
  //   const id = `P:79S:1`
  //   document.getElementById(id)?.scrollIntoView();
  // }

  computeMainMenu() {

    if (this.isMarker ) {
      this.title = 'Legal Marker';
      this._renderer.removeClass(document.body, 'legalPadPage');
      this._renderer.removeClass(document.body, 'legalSearchPage');
      this._renderer.addClass(document.body, 'legalMarkerPage');
      const title = `LA-MPS: ${this.title}`
      this.titleService.setTitle(title);
    }


    if (this.isPad) {
      this.title = 'Legal Pad';
      this._renderer.removeClass(document.body, 'legalMarkerPage');
      this._renderer.removeClass(document.body, 'legalSearchPage');
      this._renderer.addClass(document.body, 'legalPadPage');
      const title = `LA-MPS: ${this.title}`
      this.titleService.setTitle(title);
    }

    if (this.isSearch) {
      this.title = 'Legal Search';
      this._renderer.removeClass(document.body, 'legalMarkerPage');
      this._renderer.removeClass(document.body, 'legalPadPage');
      this._renderer.addClass(document.body, 'legalSearchPage');
      const title = `LA-MPS: ${this.title}`
      this.titleService.setTitle(title);
    }

    //major sections
    // - sentcence classification and evaluation
    // - phrase identification and tagging
    // - argument mapping and line of reasoning

    //  Viewer
    //  Sentences
    //  Intra-Sentence  phrases / entities / tags
    //  crossSentence
    //  Sentence-Sets
    //  Documents
    //  Teams

    //collaberate with AI,  collaberation for Assembly

    if ( this.currentUser != null) {
      this.tagService.isPowerUser = true
    }

    MainMenu.clear();
    MainMenu.addCommand({ name: 'viewer' })
      .toolDetails(() => 'readonly colorized version of case')
      .existIf(() => this.isMarker);
    MainMenu.addCommand({ name: 'marker' })
      .toolDetails(() => 'colorized version, you can add notes and tags')
      .existIf(() => this.isMarker);
    MainMenu.addCommand({ name: 'editor' })
      .toolDetails(() => 'sentence classification and evaluation')
      .existIf(() => this.isMarker && this.tagService.isPowerUser);
    MainMenu.addCommand({ name: 'paragraphs' })
      .toolDetails(() => 'paragraphs of this case scored as arguments')
      .existIf(() => this.isMarker).divider(true)
    // MainMenu.addCommand({ name: 'footnotes' })
    //   .toolDetails(() => 'footnote list extracted from the document')
    //   .existIf(() => this.isMarker).divider(true)

    MainMenu.addCommand({ name: 'selections' })
      .toolDetails(() => 'currently selected items')
      .existIf(() => this.isMarker);
    MainMenu.addCommand({ name: 'notestags', label: 'Notes/Tags' })
      .toolDetails(() => 'table of notes and tags')
      .existIf(() => this.isMarker).divider(true)
    // MainMenu.addCommand({ name: 'decision' })
    //   .toolDetails(() => 'rule tree for this case')
    //   .existIf(() => false );





    MainMenu.addCommand({ name: 'original', })
      .toolDetails(() => 'original sentence / paragraph list captured from cases')
      .existIf(() => this.isPad)
    MainMenu.addCommand({ name: 'grouping' })
      .toolDetails(() => 'move ungrouped items into groups')
      .existIf(() => this.isPad);
    MainMenu.addCommand({ name: 'groups' })
      .toolDetails(() => 'groups of sentence that support arguments')
      .existIf(() => this.isPad).divider(true);
      MainMenu.addCommand({ name: 'notestags', label: 'Notes/Tags' })
      .toolDetails(() => 'table of notes and tags')
      .existIf(() => this.isPad).divider(true)



    MainMenu.addCommand({ name: 'search', })
      .toolDetails(() => 'search across legal cases and notes')
      .existIf(() => this.isSearch)
    MainMenu.addCommand({ name: 'selections' })
      .toolDetails(() => 'currently selected items')
      .existIf(() => this.isSearch).divider(true);
      MainMenu.addCommand({ name: 'notestags', label: 'Notes/Tags' })
      .toolDetails(() => 'table of notes and tags')
      .existIf(() => this.isSearch).divider(true)


    // MainMenu.addCommand({ name: 'teams' })
    //   .toolDetails(() => 'collaberate with people and join teams')
    //   .existIf(() => this.isMarker || this.isPad);
    // MainMenu.addCommand({ name: 'library' })
    //   .toolDetails(() => 'browse and edit all the documents in a workspace')
    //   .existIf(() => this.isMarker || this.isPad).divider(true);

    // MainMenu.addCommand({ name: 'convert', })
    //   .toolDetails(() => 'convert html to LSJson')
    //   .existIf(() => this.isMarker).divider(true)


    this.menuItems = MainMenu.getCommands().filter((item) => {
      return item.canExist && item.isVisible
    });
  }



  get currentUser(): LaUser {
    const user = this.aService.currentUserValue;
    return user ? user : null;
  }

  get currentTeam(): LaTeam {
    const team = this.tService.activeTeam;
    return team ? team : null;
  }

  doLogout() {
    this.aService.logout();
    this.navigateToFirstMenu();
  }

  defaultService() {
    if (this.isSearch) {
      return this.eService;
    }
    const service = this.isPad ? this.pService : this.cService;
    return service;
  }

  isDirty() {
    const service = this.defaultService();
    return service.isDirty() && this.autoSaveCountdown() > 0;
  }

  autoSaveCountdown() {
    const service = this.defaultService();
    return service.autoSaveCountdown();
  }



  applyAutoSave(e: Event) {
    let cmd = 'AutoSaveCaseAs';
    if (this.isPad) {
      cmd = 'AutoSaveNotesAs';
    }
    if (this.isSearch) {
      cmd = 'AutoSaveSearchAs';
    }
    EmitterService.broadcastCommand(this, cmd, this.filename);
  }

  onFileSave(e: any) {
    let cmd = 'FileSaveCase';
    if (this.isPad) {
      cmd = 'FileSaveNotes';
    }
    if (this.isSearch) {
      cmd = 'FileSaveSearch';
    }
    EmitterService.broadcastCommand(this, cmd, this.filename);
  }

  onOpenOrImport(file: File) {
    const name = file.name.toLowerCase();
    if (name.includes('.json')) {
      const service = this.defaultService();
      let cmd = 'FileOpenCase';
      if (this.isPad) {
        cmd = 'FileOpenNotes';
      }
      if (this.isSearch) {
        cmd = 'FileOpenSearch';
      }
      EmitterService.broadcastCommand(this, cmd, file);
    }
  }

  canPing() {
    return false; //Tools.isNotEmpty(environment.hubURL)
  }

  canLaunch() {
    return true; //Tools.isNotEmpty(environment.launchServerURL)
  }

  onLaunchLegalPad(e: any) {
    const serviceOptions = new LaunchPadUILocator({
      serviceKey: 'PadUI$',
      endpoint: `/legalpad/index.html`  //hard coded path to support opensource
    });
    serviceOptions.open();
  }

  onLaunchLegalSearch(e: any) {
    const serviceOptions = new LaunchSearchUILocator({
      serviceKey: 'SearchUI$',
      endpoint: `/legalsearch/index.html`  //hard coded path to support opensource
    });
    serviceOptions.open();
  }

  onLaunchLegalMarker(e: any) {
    const serviceOptions = new LaunchMarkerUILocator({
      serviceKey: 'MarkerUI$',
      endpoint: `/legalmarker/index.html`  //hard coded path to support opensource
    });
    serviceOptions.open();
  }

  navbarClass() {
    if (this.isLegalMarker || this.isMarker) {
      return { 'navbar-dark bg-dark': true };
    }
    if (this.isLegalPad || this.isPad) {
      return { 'navbar-light text-dark': true };
    }
    if (this.isLegalSearch || this.isSearch) {
      return { 'navbar-dark bg-secondary': true };
    }
    return { 'navbar-dark bg-primary': true }
  }


  navigateToFirstMenu(){
    const first = MainMenu.members[0];
    this.router.navigate([first.routerLink]);
  }


  onFileOpen(e: any) {

    this.navigateToFirstMenu();

    const file = e.target.files[0];
    this.onOpenOrImport(file);
  }

  isFilenameOpen = false;
  doToggleFilenameOpen() {
    this.isFilenameOpen = !this.isFilenameOpen;
  }

  onForceFileSave() {
    let cmd = 'FileSaveCase';
    if (this.isPad) {
      cmd = 'FileSaveNotes';
    }
    if (this.isSearch) {
      cmd = 'FileSaveSearch';
    }
    EmitterService.broadcastCommand(this, cmd, this.filename);
  }

  get filename() {
    const service = this.defaultService();
    return service.filename();
  }

  LaFilename() {
    const service = this.defaultService();
    return service.LaFilename();
  }


  openToast(type: string | number, title: any, message: any) {
    const options = {
      toastLife: 3000,
      showCloseButton: true,
      tapToDismiss: true,
      enableHTML: true,
      autoDismiss: false,
      dismiss: 'click',
      newestOnTop: true,
      positionClass: 'toast-bottom-right' //// "toast-bottom-left"  toast-top-full-width
    };

    setTimeout(_ => {
      this.toastr[type](title, message, options);
    }, 10);

    // this.toastrService.custom('<span style="color: red">Message in red.</span>', message,this.options);
    // $(".toast-bottom-right").attr("role", "dialog");
  }

  resetMenus() {
    if (this.isPad) {
      this.router.resetConfig([
        ...routes,
        { path: '', component: ImmutableComponent },
        { path: '**', redirectTo: 'original' }
      ]);
      this.router.navigate(['/original']);
    } else if (this.isSearch) {
      this.router.resetConfig([
        ...routes,
        { path: '', component: SearchAndRenderComponent },
        { path: '**', redirectTo: 'search' }
      ]);
      this.router.navigate(['/search']);
    } else {
      this.router.resetConfig([
        ...routes,
        { path: '', component: MarkerComponent },
        { path: '**', redirectTo: 'viewer' }
      ]);
      this.router.navigate(['/viewer']);
    }
  }

  appInitialized() {
    this.isLegalMarker = environment.isLegalMarker;
    this.isLegalPad = environment.isLegalPad;
    this.isLegalSearch = environment.isLegalSearch;

    this.isDisconnected = this.isLegalMarker;

    this.isMarker = this.isLegalMarker;
    this.isPad = this.isLegalPad;
    this.isSearch = this.isLegalSearch;


    this.resetMenus();

    if (this.isDisconnected) {
      this.finalizeConfiguration();
      if (this.appInitService.isLoaded()) {
        Toast.info(this.tagline, `${environment.baseURL} ${environment.baseURLAPI}`);
      } else {
        Toast.error(this.tagline, `${environment.baseURL} ${environment.baseURLAPI}`);
      }
    }

  }

  appConnected() {
    if (!this.isDisconnected) {
      if (this.cService.isConnected()) {
        this.tagline = 'Connected';
        Toast.info(this.tagline, `${environment.baseURL} ${environment.baseURLAPI}`);
      } else {
        this.tagline = '[Cannot Connect]';
        Toast.error(this.tagline, `${environment.baseURL} ${environment.baseURLAPI}`);
      }
      this.finalizeConfiguration();
    }

  }

  finalizeConfiguration() {
    this.hasConfig = true;

    if (this.isLegalMarker) {
      this.tagline = '(Marker)';
      Toast.warning(`Mode: ${this.tagline}`);
    }
    else if (this.isSearch) {
      this.tagline = '(Search)';
    }
    else if (this.isPad) {
      this.tagline = '(Notes)';
    }


    this.hubService.doStart(
      () => {
        this.pService.startEvents();
        this.cService.startEvents();
      },
      () => {
        Toast.error('SignalR server did not start');
      }
    )

    this.computeMainMenu();

    setTimeout(_ => {
      // this.aService.getIsUserAdmin$(this.currentUser).subscribe();
    }, 100);
  }

}



