import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportexportService {

  constructor() {}
  calc(data) {
    console.log('----------import export--------');
    //    const sum = JSON.parse(JSON.stringify(data.power[0]));
    const sum = this.chartClone(data.power[0], 'sum');
    sum.color = 'white';
    sum.type = 'line';
    const imp = this.chartClone(data.power[0], 'Import');
    const exp = this.chartClone(data.power[0], 'Export');
    /*
    const import = this.chartClone(data.power[0], 'import');
    const export = this.chartClone(data.power[0], 'export');
    */
    sum.values.forEach((value, i) => {
      value.y = 0;
      data.power.forEach(chart => {
        if (chart.key !== 'Leistung [MW]') {
          value.y -= chart.values[i].y;
        } else {
          if (chart.values[i]) {
            value.y += chart.values[i].y;
          }
        }
      });
    });
    console.log('hallo summe', sum);
    //data.power.push(sum);
    data.power.push(imp);
    data.power.push(exp);
    console.log('DATATATA', data);
    sum.values.forEach((value, i) => {
      if (value.y > 0) {
       imp.values[i].y = value.y;
      } else {
       exp.values[i].y = value.y;
      }
    });
  }
  chartClone(template, name) {
    const sum = JSON.parse(JSON.stringify(template));
//    sum.type = 'line';
    sum.key = name;
    sum.originalKey = name;
    sum.values.forEach((value) => {
      value.y = 0;
    });
    return sum;
  }
}