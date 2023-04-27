import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamsComponent } from './teams/teams.component';
import { EditorComponent } from './editor/editor.component';
import { MarkerComponent } from './marker/marker.component';
import { LibraryComponent } from './library/library.component';

import { TagpadComponent } from './notesandtags/tagpad.component';
import { DecisionComponent } from './decision/decision.component';
import { ArgumentComponent } from './argument/argument.component';


import { LoginComponent, RegisterComponent, AuthGuard } from './login';
import { GroupComponent } from './group/group.component';

import { SelectionsComponent } from './selections/selections.component';
import { ImmutableComponent } from './selections/immutable.component';
import { ParagraphsComponent } from './paragraphs/paragraphs.component';

import { SearchAndRenderComponent } from './search/search-and-render.component';
import { NotesAndTagsComponent } from './notesandtags/notesandtags.component';
import { GroupingComponent } from './group/grouping.component';
import { ViewerComponent } from './viewer/viewer.component';
import { FootnotesComponent } from './footnotes/footnotes.component';
import { PluginComponent } from './plugin/plugin.component';
import { CaseConverterComponent } from './case-converter/case-converter.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'plugins', component: PluginComponent },
  { path: 'teams', component: TeamsComponent, canActivate: [AuthGuard] },
  { path: 'library', component: LibraryComponent, canActivate: [AuthGuard] },

  { path: 'case/:caseid', component: MarkerComponent },
  { path: 'viewer', component: ViewerComponent },
  { path: 'marker', component: MarkerComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'paragraphs', component: ParagraphsComponent },
  { path: 'footnotes', component: FootnotesComponent },
  { path: 'notestags', component: NotesAndTagsComponent },
  { path: 'original', component: ImmutableComponent },

  { path: 'tags', component: TagpadComponent },
  { path: 'arguments', component: ArgumentComponent },
  { path: 'groups', component: GroupComponent },
  { path: 'selections', component: SelectionsComponent },
  { path: 'decision', component: DecisionComponent },

  { path: 'search', component: SearchAndRenderComponent },
  { path: 'grouping', component: GroupingComponent },

  { path: 'convert', component: CaseConverterComponent },
]




@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
