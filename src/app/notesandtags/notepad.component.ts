import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';
import { LegalPadService } from '../models/legal-pad.service';

import { LaSentence, LaParagraph, LaLegalCase } from '../models';

import { GridOptions, GridApi, ColumnApi } from 'ag-grid-community';

import { LaGroup, LaStrongReference } from '@app/models/la-group';
import { IUserNotes } from '@app/models/la-tags';
import { Tools } from '@app/shared';
import { LaLegalPad,  } from '@app/models/la-legalPad';
import { LaLegalSearch } from '@app/models/la-legalSearch';
import { LegalSearchService } from '@app/models/legal-search.service';


@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.component.html'
})
export class NotepadComponent implements OnInit, OnDestroy {
  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;


  rowData = [
  ];

  gridOptions: GridOptions = {
  };

  rowSelection = 'single';
  defaultColumnDefs = {
    sortable: true,
    filter: true,
    resizeable: true
  };


  columnDefs = [
    { headerName: 'Class', field: 'rhetClass', width: 100 },
    { headerName: 'ID', field: 'objectID', width: 100 },
    { headerName: 'NOTES', field: 'notes' }
  ];

  isEmpty() {
    return this.rowData.length == 0
  }

  get legalPad(): LaLegalPad {
    return this.pService.legalModel();
  }

  get legalCase(): LaLegalCase {
    return this.cService.legalModel();
  }

  get legalSearch(): LaLegalSearch {
    return this.sService.legalModel();
  }

  constructor(
    private cService: LegalCaseService,
    private sService: LegalSearchService,
    private pService: LegalPadService) {

    
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.sizeColumnsToFit();
  }

  onExport() {
    //http://54.222.217.254/javascript-grid-export/

    const name = this.cService.shortFilename;
    const param = {
      fileName: `Notes`
    };
    this.gridApi.exportDataAsCsv(param);
  }

  fillRowData(list: Array<IUserNotes>) {
    list.forEach(item => {
      if (Tools.isNotEmpty(item.notes)) {
        const data = item.createTagDisplayRecord();
        this.rowData.push(data);
      }
    });
  }



  composeDataSet(components: Array<Array<IUserNotes>>) {
    this.rowData = [];

    components.forEach(item => {
      this.fillRowData(item);
    })
  };

  getGroups() {
    const list: Array<LaGroup> = [];
    this.legalPad?.getGroups().forEach((obj) => {
      list.push(obj)
    })

    this.legalCase?.getGroups().forEach((obj) => {
      list.push(obj)
    })

    this.legalSearch?.getGroups().forEach((obj) => {
      list.push(obj)
    })
    return list;
  }

  getParagraphs() {
    const list: Array<LaParagraph> = [];
    this.legalPad?.getParagraphs().forEach((obj) => {
      list.push(obj)
    })

    this.legalCase?.getParagraphs().forEach((obj) => {
      list.push(obj)
    })

    this.legalSearch?.getParagraphs().forEach((obj) => {
      list.push(obj)
    })
    return list;
  }

  getSentences() {
    const list: Array<LaSentence> = [];
    this.legalPad?.getSentences().forEach((obj) => {
      list.push(obj)
    })

    this.legalCase?.getSentences().forEach((obj) => {
      list.push(obj)
    })

    this.legalSearch?.getSentences().forEach((obj) => {
      list.push(obj)
    })

    return list;
  }

  getReference() {
    const list: Array<LaStrongReference> = [];

    this.getGroups().forEach(item => {
      list.concat(item.members);
    })

    return list;
  }

  ngOnInit() {

    this.onRefreshDisplay()

    EmitterService.registerCommand(this, 'ExportNotesCSV', this.onExport);
    EmitterService.registerCommand(this, 'NoteRemoved', this.onRefreshDisplay);
    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }

  onRefreshDisplay() {
    this.composeDataSet([this.getSentences(), this.getParagraphs(), this.getGroups(), this.getReference()]);
  }

  ngOnDestroy() {
  }

  onSelectionChanged(e: Event) {
    const selectedRows = this.gridApi.getSelectedRows();
    const item = selectedRows[0];

    EmitterService.broadcastCommand(this, 'GridSelectionChanged', item?.object);
  }



  doExport() {
    const filename = this.cService.getModelName()
    const params = {
      skipHeader: false,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: false,
      filename: filename + '.csv',
      columnSeparator: ','
    };

    this.gridApi.exportDataAsCsv(params);
  }

}
