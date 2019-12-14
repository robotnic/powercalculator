import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisualizeService {

  constructor() { }

  decorate(data) {
    data.power.forEach(chart => {
      chart.yAxis = 1;
      if (chart.originalKey === 'hydrofill' || chart.originalKey === 'hydrofillclone') {
        chart.yAxis = 2;
      }
      chart.originalKey = chart.key;
      if (data.config[chart.key]) {
        chart.color = data.config[chart.key].color;
      }
    });
    return data;
  }
}
