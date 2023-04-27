import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'Short'
})
export class SentencetypePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    if ( value === 'Sentence') { return 'Other'; }
    value = value.replace('Sentence', '');
    return value;
  }

}

@Pipe({ name: 'lastupdate' })
export class LastUpdatePipe implements PipeTransform {
  transform(date: string): string {
    const result = date.split('T')[1]
    return result;
  }
}

@Pipe({ name: 'shortguid' })
export class ShortGuidPipe implements PipeTransform {
  transform(guid: string): string {
    const result = guid.split('-')[4]
    return result;
  }
}