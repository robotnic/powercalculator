import { Injectable } from '@angular/core';
import { Chart } from '../models/charts';
import { Data } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class ImportexportService {

  constructor() {}
  calc(data: Data) {
    console.log('----------import export--------', data);
    //    const sum = JSON.parse(JSON.stringify(data.power[0]));
    const sum: Chart = this.chartClone(data.power[0], 'sum');
    sum.color = 'white';
    sum.type = 'line';
    const imp: Chart = this.chartClone(data.power[0], 'Import');
    const exp: Chart = this.chartClone(data.power[0], 'Export');
      data.power.push(imp);
      data.power.push(exp);
    sum.values.forEach((value, i) => {
      value.y = 0;
      // tslint:disable-next-line:forin
      for (const key in data.power) {
        const chart: Chart = data.power[key];
        if (chart.key !== 'Leistung [MW]') {
          if (chart.values[i]) {
            value.y -= chart.values[i].y;
          }
        } else {
          if (chart.values[i]) {
            value.y += chart.values[i].y;
          }
        }
      }
      sum.values.forEach((item, ii) => {
        if (item.y > 0) {
          imp.values[ii].y = item.y;
        } else {
          exp.values[ii].y = item.y;
        }
      });
    });
  }
  chartClone(template, name) {
    const sum: Chart = JSON.parse(JSON.stringify(template));
    sum.key = name;
    sum.originalKey = name;
    sum.values.forEach((value) => {
      value.y = 0;
    });
    return sum;
  }
}