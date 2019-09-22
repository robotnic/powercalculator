import { Injectable } from '@angular/core';
import { RulesService } from '../loader/rules.service';
import { ChartValue } from '../models/charts';

@Injectable({
  providedIn: 'root'
})
export class TimeshiftService {

  constructor() {}

  timeshift(data) {
    const chartByName = {};
    const powerByName = {};

    const year = data.meta.date.substring(0, 4);
    const installed = data.installed[year];

    data.power.forEach(chart => {
      powerByName[chart.originalKey] = chart;
    });

    data.loadshifted.forEach(chart => {
      chartByName[chart.originalKey] = chart;
    });

    data.rules.timeshift.from.forEach(from => {
 //     console.log('installed', from,  installed[from]);
      let min = 0;
      let max = installed[from] / 1000;
      if (from === 'Hydro Pumped Storage') {
        min = installed[from] / 1000;
      }
      if (chartByName[from]) {
        let sum = 0;
        chartByName[from].values.forEach((value, i) => {
          const a: number = powerByName[from].values[i].y;
          const b: number = value.y;
          const d: number = a - b;
          sum += d ;
//          console.log('from', from, Math.round(sum), max);
          let available: number = sum;
          max += value.y;
          if (sum > max) {
            available = max;
          }
          if (available < 0) {
            available = 0;
          }
          if (available) {
            data.rules.timeshift.to.forEach(to => {
              if (chartByName[to]) {
                const val: ChartValue = chartByName[to].values[i];
                if (val) {  // for finland bug
                  const old: number = val.y;
                  if (available < val.y) {
                    val.y -= available;
                    sum -= available;
                  } else {
                    sum -= val.y;
                    val.y = 0;
                  }
                  const delta: number = val.y - old;
                  if (delta) {
                    chartByName[from].values[i].y -= delta;
                  }
                }
              }
            });
          }
        });
      }
    });
  }
}