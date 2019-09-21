import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FixchartsService {

  constructor() { }
  fix(data) {
    console.log('fix', data);
    const emptyCharts = [];
    data.power.forEach(chart => {
      let found = false;
      chart.values.forEach(item => {
        if (item.y) {
          found = true;
        }
      });
      if (!found) {
        emptyCharts.push(chart.key);
      }
    });
    console.log('emptyCharts', emptyCharts);
    data.power = data.power.filter(chart => {
      return emptyCharts.indexOf(chart.key) === -1;
    });
  }
}
