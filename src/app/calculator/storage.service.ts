import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {}
  addStorage(data) {
    this.calcHydrofill(data);
    this.addPumped(data);
    return data;
  }
  calcHydrofill(data) {
    console.log('calchydrofill', data.hydrofill);
    const chart = JSON.parse(JSON.stringify(data.power[0]));
    chart.key = 'hydrofill';
    chart.originalKey = 'hydrofill';
    chart.type = 'line';
    chart.values.forEach((item, i) => {
      item.y = this.interpolateValues(item.x, data.hydrofill.values);
      /*
      if (data.hydrofill.values[i]) {
        item.y = data.hydrofill.values[i].y;
      }
      */
    });
    data.loadshifted.push(chart);
    const clone = JSON.parse(JSON.stringify(chart));
    clone.key = 'hydrofillclone';
    clone.originalKey = 'hydrofillclone';
    data.loadshifted.push(clone);
  }
  interpolateValues(time, values) {
    let result = 0;
    for (const v = 0; v < values.length; v++) {
      const value = values[v];
      result = value.y;
      if (value.x > time) {
        break;
      }
    }
    return result;
  }
  addPumped(data) {
    let hydrofillclone = null;
    data.loadshifted.forEach((chart, i) => {
      if (chart.originalKey === 'hydrofillclone') {
        hydrofillclone = chart;
      }
    });
    const types = ['Hydro Pumped up', 'Hydro Pumped down', 'Hydro Water Reservoir'];
    types.forEach(type => {
      data.power.forEach((chart, i) => {
        if (chart.key === type) {
          console.log('addPumped', type);
          let total = 0;
          chart.values.forEach((item, v) => {
            const original = item.y;
            const modified = data.loadshifted[i].values[v].y;
            const delta = original - modified;
            if (delta ) {
              total += delta;
            }
            hydrofillclone.values[v].y += total * 1000 / 4;
          });
        }
      });
    })
    console.log('addpumped', data);

  }
}