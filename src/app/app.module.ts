import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';

// https://medium.com/letsboot/quick-start-with-angular-material-and-flex-layout-1b065aa1476c
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './login';
import { RegisterComponent } from './login';
import { JwtInterceptor, ErrorInterceptor } from './login';

import { EditorComponent } from './editor/editor.component';
import { SentenceComponent } from './sharedComponents/sentence.component';
import { ParagraphsComponent } from './paragraphs/paragraphs.component';

import { DecisionComponent } from './decision/decision.component';
import { DecisionItemComponent } from './decision/decision-item.component';
import { ParagraphComponent } from './sharedComponents/paragraph.component';


import { NoteComponent } from './sharedComponents/note.component';
import { LabelComponent } from './editor/label.component';
import { SentenceEditComponent } from './sharedComponents/sentence-edit.component';
import { LabelerComponent } from './editor/labeler.component';

import { SentencetypePipe, LastUpdatePipe, ShortGuidPipe } from './sharedComponents/sentencetype.pipe';

import { PhraseContextComponent } from './sharedComponents/phrase-context.component';
import { ArgumentComponent } from './argument/argument.component';
import { TagpadComponent } from './notesandtags/tagpad.component';
import { AssociationComponent } from './decision/association.component';
import { SentenceListBadgeComponent } from './sharedComponents/sentence-list-badge.component';
import { SentenceBadgeComponent } from './sharedComponents/sentence-badge.component';
import { DecisionListBadgeComponent } from './sharedComponents/decision-list-badge.component';
import { LibraryComponent } from './library/library.component';
import { MarkerComponent } from './marker/marker.component';
import { ViewerComponent } from './viewer/viewer.component';
import { DirectoryItemComponent } from './library/directory-item.component';
import { CaseTitleComponent } from './sharedComponents/case-title.component';
import { FilenameComponent } from './sharedComponents/filename.component';
import { ItemHistoryComponent } from './library/item-history.component';

import { TeamsComponent } from './teams/teams.component';
import { TeamMemberComponent } from './teams/team-member.component';
import { TeamComponent } from './teams/team.component';
import { CreateTeamComponent } from './teams/create-team.component';
import { CreateTeamMemberComponent } from './teams/create-team-member.component';
import { TeamMemberDisplayComponent } from './teams/team-member-display.component';
import { WorkspaceComponent } from './library/workspace.component';
import { DirectoryGridComponent } from './library/directory-grid.component';
import { UsersComponent } from './teams/users.component';
import { UserComponent } from './teams/user.component';
import { SectionBadgeComponent } from './sharedComponents/section-badge.component';
import { AssociationEditorComponent } from './editor/association-editor/association-editor.component';


import { AppInitService } from './app-init.service';
import { HttpPayloadService } from './shared/httpPayload.service';

import { NotepadComponent } from './notesandtags/notepad.component';
import { GroupComponent } from './group/group.component';
import { SelectionsComponent } from './selections/selections.component';
import { ImmutableComponent } from './selections/immutable.component';
import { TagsComponent } from './sharedComponents/tags.component';
import { TagEditorComponent } from './sharedComponents/tag-editor.component';
import { GroupDetailsComponent } from './group/group-details.component';
import { StrongReferenceComponent } from './group/strong-reference.component';


import { SearchAndRenderComponent } from './search/search-and-render.component';
import { SearchAdvancedComponent } from './search/search-advanced.component';
import { SearchResultsComponent } from './search/search-results.component';


import { NotesAndTagsComponent } from './notesandtags/notesandtags.component';
import { SelectedItemComponent } from './notesandtags/selected-item.component';
import { ItemSetComponent } from './search/item-set.component';
import { ItemViewComponent } from './search/item-view.component';

import { DragDropModule } from '@angular/cdk/drag-drop';


import { GroupingComponent } from './group/grouping.component';
import { CreateGroupComponent } from './group/create-group.component';
import { FootnoteLinkComponent } from './sharedComponents/footnote-link.component';
import { FootnotesComponent } from './footnotes/footnotes.component';
import { BookmarkComponent } from './sharedComponents/bookmark.component';
import { GroupBadgeComponent } from './sharedComponents/group-badge.component';
import { PluginComponent } from './plugin/plugin.component';
import { FootnoteComponent } from './footnotes/footnote.component';
import { WebConverterComponent } from './case-converter/web-converter.component';
import { CaseConverterComponent } from './case-converter/case-converter.component';
import { FileConverterComponent } from './case-converter/file-converter.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    EditorComponent,
    SentenceComponent,
    DecisionComponent,
    DecisionItemComponent,
    ParagraphComponent,
    ParagraphsComponent,

    LabelComponent,
    SentenceEditComponent,
    NoteComponent,
    LabelerComponent,
    SentencetypePipe,

    LastUpdatePipe,
    ShortGuidPipe,

    PhraseContextComponent,
    ArgumentComponent,
    TagpadComponent,
    AssociationComponent,
    SentenceBadgeComponent,
    SentenceListBadgeComponent,
    DecisionListBadgeComponent,
    LibraryComponent,
    MarkerComponent,
    ViewerComponent,
    DirectoryItemComponent,
    CaseTitleComponent,
    FilenameComponent,
    ItemHistoryComponent,

    TeamsComponent,
    TeamMemberComponent,
    TeamComponent,
    CreateTeamComponent,
    CreateTeamMemberComponent,
    TeamMemberDisplayComponent,
    WorkspaceComponent,
    DirectoryGridComponent,
    UsersComponent,
    UserComponent,
    SectionBadgeComponent,
    AssociationEditorComponent,
    NotepadComponent,
    GroupComponent,
    SelectionsComponent,
    ImmutableComponent,
    TagsComponent,
    TagEditorComponent,
    GroupDetailsComponent,
    StrongReferenceComponent,

    SearchAndRenderComponent,
    SearchAdvancedComponent,
    SearchResultsComponent,

    NotesAndTagsComponent,
    SelectedItemComponent,
    ItemSetComponent,
    ItemViewComponent,

    GroupingComponent,
    CreateGroupComponent,
    FootnoteLinkComponent,
    FootnotesComponent,
    BookmarkComponent,
    GroupBadgeComponent,
    PluginComponent,
    FootnoteComponent,
    WebConverterComponent,
    CaseConverterComponent,
    FileConverterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    DragDropModule,
    FontAwesomeModule,
    MatCardModule,
    MatGridListModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatFormFieldModule,
    TextareaAutosizeModule,
    MatInputModule,
    MatExpansionModule,
    MatStepperModule,
    AgGridModule.withComponents([
    ]),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),

    AppRoutingModule
  ],
  providers: [
    Title,
    AppInitService,
    HttpPayloadService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
