import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConvertService } from '@app/models/legal-convert.service';
import { LaAtom, Toast, Tools } from '@app/shared';
import { saveAs } from 'file-saver-es';

@Component({
  selector: 'app-file-converter',
  templateUrl: './file-converter.component.html',
  styleUrls: ['./file-converter.component.scss']
})
export class FileConverterComponent implements OnInit, OnDestroy {
  result: string = '';
  title: string = 'localfile';
  ext: string = ''
  text: string = ''
  convertForm: FormGroup;


  constructor(
    private cService: ConvertService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.convertForm = this.formBuilder.group({
      caseno: ['']
    });
  }

  ngOnDestroy() {
    this.convertForm = null;
  }

  inputText() {
    return this.text;
  }

  get f() {
    return this.convertForm.controls;
  }

  convertedResult() {

    if (Tools.matches(this.ext, '.json')) {
      return JSON.stringify(this.result, undefined, 3);
    }
    return this.result;
  }

  onFileOpen(e: any) {
    const file = e.target.files[0];
    this.readAndRestoreFile(file);
  }

  readAndRestoreFile(file: File) {
    const reader = new FileReader();
    reader.onerror = event => {
      Toast.error('fail...', JSON.stringify(event.target));
    };
    reader.onload = () => {
      this.text = reader.result as string;
    };

    this.result = "";
    this.title = file.name.split('.')[0];
    this.convertForm = this.formBuilder.group({
      caseno: [this.title]
    });
    reader.readAsText(file);
  }

  // doCovertHTMLToText() {
  //   this.cService.postConvertFromHTML$(this.text).subscribe(payload => {
  //     this.title = payload[0];
  //     this.result = payload[1];
  //     this.ext = '.txt';
  //     Toast.success(`converted from ${this.ext}`, this.title);
  //   })
  // }


  doCovertTextToLSJson() {

    this.title = this.f.caseno.value;
    this.cService.postConvertFromText$(this.title, this.text).subscribe(payload => {
      const title = payload[0];
      this.result = payload[1];
      this.ext = '.json';
      Toast.success(`converted to ${this.ext}`, this.title);
    })
  }

  doClear(){}

  doSave() {
    let blob: Blob;
    let data: string = '';
  
    const filename = `${this.title}${this.ext}`;
    if (Tools.matches(this.ext, '.html')) {
      data = this.result;
      blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    }
    if (Tools.matches(this.ext, '.txt')) {
      data = this.result;
      blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    }
    if (Tools.matches(this.ext, '.json')) {
      data = JSON.stringify(this.result);
      blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    }
    saveAs(blob, filename);
    Toast.info('saved', filename)
  }

}
