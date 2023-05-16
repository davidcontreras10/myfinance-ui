import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyAmount'
})
export class CurrencyAmountPipe implements PipeTransform {

  constructor() { }

  transform(value?: number | null, currency?: string | null): string | null {
    if (value) {
      return `${currency}${this.formatNumber(value)}`;
    }

    return null;
  }

  private formatNumber(number: number): string {
    return number.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
}
