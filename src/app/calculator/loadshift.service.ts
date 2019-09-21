import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';
import { Data } from '../models/data';
import { Chart, ChartValue } from '../models/charts';
import { State } from '../models/state';

@Injectable({
  providedIn: 'root'
})
export class LoadshiftService {
  available = {};
  constructor(private eventService: EventService) {}
  loadshift(data: Data) {
    const state: State = this.eventService.getState();
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    // tslint:disable-next-line:forin
    for (const c in data.power) {
      const chart: Chart = data.power[c];
      this.available = {};
      if (chart.key !== 'Leistung [MW]') {
        const factor: number = this.makeFaktor(data.installed, state, chart.key);
        if (factor !== 1) {
          chart.values.forEach((item, i) => {
            const targetItem: ChartValue = data.loadshifted[c].values[i];
            targetItem.y = item.y * factor;
            const delta: number = targetItem.y - item.y;
            this.passEnergy(chart.key, delta, i, data);
          });
        }
      }
    }
    return data;
  }

  passEnergy(key, delta, i, data) {
    const year: number = new Date(data.power[0].values[i].x).getFullYear();
    data.rules.loadShift.to.forEach(to => {
      data.loadshifted.forEach(chart => {
        if (chart.key === to) {
          let max: number = data.installed[year][to] / 1000;
          if (isNaN(max)) {
            max = 0;
          }
          let origY = 0;
          // for finnland
          try {
            origY = chart.values[i].y;
          } catch (e) {
            origY = 0;
          }
          let min = 0;
          switch (chart.key) {
            case 'Hydro Pumped up':
              min = -data.installed[year]['Hydro Pumped Storage'] / 1000;
              break;
            case 'Curtailment':
              min = -99999999999999999;
              //        console.log(rest);
              break;
          }
          let thisdelta = 0;  // for finland bug
          if (chart.values[i]) {
            chart.values[i].y -= delta; // (delta + available[to]);
            if (chart.values[i].y < min) {
              chart.values[i].y = min;
            }
            thisdelta = origY - chart.values[i].y;
            if (thisdelta < 0) {
              thisdelta = 0;
            }
          }
          delta -= thisdelta;
        }
      });

    });
  }

  makeFaktor(installed, state, key) {
    const year = state.date.substring(0, 4);
    let selected = null;
    let latest = null;
    let factor = 1;

    // tslint:disable-next-line:forin
    for (const yr in installed) {
      if (!selected) {
        selected = yr;
      }
      if (year > parseInt(selected, 10)) {
        selected = yr;
      }
      latest = yr;
    }
    if (!isNaN(state.mutate[key])) {
      if (installed[latest]) {
        const now = installed[latest][key] || 1;
        const past = installed[selected][key] || 1;
        factor = (now + state.mutate[key] * 1000) / past;
      }
    }
    return factor;
  }
}
