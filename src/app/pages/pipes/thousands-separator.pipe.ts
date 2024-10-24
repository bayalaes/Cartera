import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousandsSeparator'
})
export class ThousandsSeparatorPipe implements PipeTransform {
  transform(value: number | string): string {
    if (typeof value === 'number') {
      return value.toLocaleString('es-CO');
    } else if (typeof value === 'string') {
      const numberValue = parseFloat(value);
      return isNaN(numberValue) ? value : numberValue.toLocaleString('es-CO');
    }
    return '';
  }
}