import { Injectable } from '@angular/core';
import { RulesService } from '../loader/rules.service';

@Injectable({
  providedIn: 'root'
})
export class TimeshiftService {

  constructor(private rulesService: RulesService) {}

  timeshift(data) {
    console.log('timeshift', data);
    const chartByName = {};
    const powerByName = {};

    data.power.forEach(chart => {
      powerByName[chart.originalKey] = chart;
    });
    data.loadshifted.forEach(chart => {
      chartByName[chart.originalKey] = chart;
    });
    console.log('rules', data.rules.timeShift);
    data.rules.timeShift.from.forEach(from => {
      if (chartByName[from]) {
        let sum = 0;
        chartByName[from].values.forEach((value, i) => {
          const a = powerByName[from].values[i].y;
          const b = value.y;
          const d = a - b;
          sum += d;
          if (sum) {
            data.rules.timeShift.to.forEach(to => {
              if (chartByName[to]) {
                //console.log(from, '---->', to, sum);
                const val = chartByName[to].values[i];
                const old = val.y;
                if (sum < val.y) {
                  val.y -= sum;
                  sum = 0;
                  //console.log(val.y);
                } else {
                  sum -= val.y;
                  val.y = 0;
                }
                const delta = val.y - old;
                if (delta) {
                  //console.log('tut sich was', delta, chartByName);
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