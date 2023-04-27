import { Component, OnInit, OnDestroy } from '@angular/core';
import { EmitterService } from '../shared/emitter.service';

import { LegalCaseService } from '../models/legal-case.service';

import { LaLegalCase, LaParagraph, LaSentence } from '../models';

import { GridOptions, GridApi, ColumnApi } from 'ag-grid-community';
import { LegalPadService } from '@app/models/legal-pad.service';
import { IUserTags } from '@app/models/la-tags';
import { LaGroup, LaStrongReference } from '@app/models/la-group';
import { Tools } from '@app/shared';
import { LaLegalPad } from '@app/models/la-legalPad';
import { LaLegalSearch } from '@app/models/la-legalSearch';
import { LegalSearchService } from '@app/models/legal-search.service';


@Component({
  selector: 'app-tagpad',
  templateUrl: './tagpad.component.html'
})
export class TagpadComponent implements OnInit, OnDestroy {
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
    { headerName: 'Sentence Type', field: 'rhetClass' },
    { headerName: 'TAG', field: 'TagGroup' },
    { headerName: 'ID', field: 'sentID' },
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
      fileName: `Tags`
    };
    this.gridApi.exportDataAsCsv(param);
  }

  fillRowData(list: Array<IUserTags>, foundCols: any) {
    list.forEach(item => {
      item.userTags?.forEach(tag => {
        if (Tools.isNotEmpty(tag)) {
          const data = item.createTagDisplayRecord();
          tag.extendRecord(data, foundCols);
          this.rowData.push(data);
        }
      });
    });
  }

  composeDataSet(components: Array<Array<IUserTags>>) {

    this.rowData = [];
    let foundCols = {}

    components.forEach(item => {
      this.fillRowData(item, foundCols);
    })

    Object.keys(foundCols).forEach(key => {
      this.columnDefs.push(
        { headerName: key, field: key }
      )
    })
  }

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

    EmitterService.registerCommand(this, 'ExportTagsCSV', this.onExport);

    EmitterService.registerCommand(this, 'RefreshDisplay', this.onRefreshDisplay);
    EmitterService.processCommands(this);
  }

  onRefreshDisplay() {
    this.composeDataSet([this.getSentences(), this.getParagraphs(), this.getGroups(), this.getReference()]);
  }

  ngOnDestroy() {
  }

  // https://www.ag-grid.com/angular-grid/
  // https://medium.com/ag-grid/get-started-with-angular-grid-in-5-minutes-83bbb14fac93



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
