import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FixchartsService {

  constructor() {}
  fix(data) {
    this.removeEmpty(data);
    this.removeUncomplete(data);
  }

  removeUncomplete(data) {
    console.log(data.power);
    try {
      let l = 0;
      data.power.forEach(item => {
        if (l < item.values.length) {
          l = item.values.length;
        }
      });
      data.power = data.power.filter(item => {
        return item.values.length === l;
      });
    } catch (e) {
      console.log(e);
    }
  }

  removeEmpty(data) {
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
    data.power = data.power.filter(chart => {
      return emptyCharts.indexOf(chart.key) === -1;
    });
  }
}