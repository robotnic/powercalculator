import { Injectable } from '@angular/core';
import { RulesService } from '../loader/rules.service';

@Injectable({
  providedIn: 'root'
})
export class TimeshiftService {

  constructor(private rulesService: RulesService) {}

  timeshift(data) {
    const chartByName = {};
    const powerByName = {};

    const year = data.meta.date.substring(0, 4);
    const installed = data.installed[year];
    installed['Hydro Pumped up'] = -installed['Hydro Pumped Storage'];
    installed['Hydro Pumped down'] = installed['Hydro Pumped Storage'];

    data.power.forEach(chart => {
      powerByName[chart.originalKey] = chart;
    });

    data.loadshifted.forEach(chart => {
      chartByName[chart.originalKey] = chart;
    });

    data.rules.timeShift.from.forEach(from => {
 //     console.log('installed', from,  installed[from]);
      let min = 0;
      let max = installed[from] / 1000;
      if (from === 'Hydro Pumped up') {
        max = 0;
        min = installed[from] / 1000;
      }
      if (chartByName[from]) {
        let sum = 0;
        chartByName[from].values.forEach((value, i) => {
          const a = powerByName[from].values[i].y;
          const b = value.y;
          const d = a - b;
          sum += d;
//          console.log('from', from, Math.round(sum), max);
          let available = sum;
          max += value.y;
          if (sum > max) {
            available = max;
          }
          if (available < 0) {
            available = 0;
          }
          if (available) {
            // console.log('sa', sum, available, max);
            data.rules.timeShift.to.forEach(to => {
              if (chartByName[to]) {
                const val = chartByName[to].values[i];
                const old = val.y;
                if (available < val.y) {
                  val.y -= available;
                  sum -= available;
                } else {
                  sum -= val.y;
                  val.y = 0;
                }
                const delta = val.y - old;
                if (delta) {
                  chartByName[from].values[i].y -= delta;
                }
              }
            });
          }
        });
      }
    });
  }
}