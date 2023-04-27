import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConvertService } from '@app/models/legal-convert.service';
import { LaAtom, Toast, Tools } from '@app/shared';
import { saveAs } from 'file-saver-es';

const urls = [
  "https://www.nycourts.gov/Reporter/3dseries/2006/2006_03920.htm",
  "https://nycourts.gov/reporter/3dseries/2012/2012_08670.htm",
  "https://www.nycourts.gov/reporter/3dseries/2015/2015_07694.htm",
  "https://www.nycourts.gov/reporter/3dseries/2018/2018_02118.htm",
  "https://nycourts.gov/reporter/3dseries/2020/2020_04816.htm",
  "https://www.nycourts.gov/reporter/3dseries/2021/2021_04949.htm",  //walls
  "https://www.nycourts.gov/reporter/3dseries/2005/2005_02955.htm",
  "https://www.nycourts.gov/Reporter/3dseries/2006/2006_01135.htm",
  "https://nycourts.gov/reporter/3dseries/2013/2013_04562.htm",
  "https://www.nycourts.gov/reporter/3dseries/2014/2014_00197.htm",
  "https://www.nycourts.gov/reporter/archives/p_debour.htm",
  "https://www.nycourts.gov/Reporter/3dseries/2006/2006_01249.htm"
]

// 2015, Nonni                
// https://www.nycourts.gov/reporter/3dseries/2015/2015_08081.htm

export class ConvertSpec extends LaAtom {
  url: string;


  constructor(properties?: any) {
    super(properties);
  }

  setToEmpty() {
    this.url = "https://nycourts.gov/reporter/3dseries/2020/2020_04810.htm" //to many /r/n ?
    this.url = "https://nycourts.gov/reporter/3dseries/2020/2020_04816.htm" //get the footnotes right

    this.url = "https://www.nycourts.gov/reporter/3dseries/2011/2011_06183.htm" // is People v. Bowden,

    this.url = "https://www.nycourts.gov/reporter/3dseries/2015/2015_08081.htm" // is Nonni

    return this;
  }
}

@Component({
  selector: 'app-web-converter',
  templateUrl: './web-converter.component.html',
  styleUrls: ['./web-converter.component.scss']
})
export class WebConverterComponent implements OnInit, OnDestroy {
  result: any = {};
  title: string = '';
  ext: string = ''

  convertForm: FormGroup;
  convertInfo: ConvertSpec;

  constructor(
    private cService: ConvertService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.convertInfo = new ConvertSpec();
    this.convertInfo.setToEmpty();

    this.resetconvertInfo(this.convertInfo)
  }

  convertedResult() {

    if (Tools.matches(this.ext, '.json')) {
      return JSON.stringify(this.result,undefined,3);
    }
    return this.result;
  }

  ngOnDestroy() {
    this.convertForm = null;
    this.convertInfo = null;
  }

  resetconvertInfo(convertInfo: ConvertSpec) {
    this.convertForm = this.formBuilder.group({
      url: [convertInfo.url]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      this.resetconvertInfo(change.currentValue);
    }
  }




  // convenience getter for easy access to form fields
  get f() {
    return this.convertForm.controls;
  }

  doCovertToHTML() {
    const result = {
      url: this.f.url.value
    };
    if (this.convertForm.invalid) {
      return;
    }

    this.convertInfo.override(result);
    console.log(this.convertInfo.url);

    this.cService.postConvertToHTML$(this.convertInfo.url).subscribe(payload => {
      this.title = payload[0];
      this.result = payload[1];
      this.ext = '.html';
      Toast.success(`converted to ${this.ext}`, this.convertInfo.url);
    })
  }

  doCovertToText() {
    const result = {
      url: this.f.url.value
    };
    if (this.convertForm.invalid) {
      return;
    }

    this.convertInfo.override(result);
    console.log(this.convertInfo.url);

    this.cService.postConvertToText$(this.convertInfo.url).subscribe(payload => {
      this.title = payload[0];
      this.result = payload[1];
      this.ext = '.txt';
      Toast.success(`converted to ${this.ext}`, this.convertInfo.url);
    })
  }

  doCovertToLSJson() {
    const result = {
      url: this.f.url.value
    };
    if (this.convertForm.invalid) {
      return;
    }

    this.convertInfo.override(result);
    console.log(this.convertInfo.url)


    this.cService.postConvertToLSJson$(this.convertInfo.url).subscribe(payload => {
      this.title = payload[0];
      this.result = payload[1];
      this.ext = '.json';
      Toast.success(`converted to ${this.ext}`, this.convertInfo.url);
    })
  }



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
