import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';

@Injectable({
  providedIn: 'root'
})
export class LoadshiftService {

  constructor(private eventService: EventService) {}
  loadshift(data) {
    const state = this.eventService.getState();
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    data.power.forEach((chart, c) => {
      if (chart.key !== 'Leistung [MW]') {
        const factor = this.makeFaktor(data.installed, state, chart.key);
        if (factor !== 1) {
          chart.values.forEach((item, i) => {
            const targetItem = data.loadshifted[c].values[i];
            targetItem.y = item.y * factor;
            const delta = targetItem.y - item.y;
            this.passEnergy(chart.key, delta, i, data);
          });
        }
      }
    });
    return data;
  }

  passEnergy(key, delta, i, data) {
    if (data.rules.loadShift.from.indexOf(key) !== -1) {
      //      console.log(key, delta, i, data.rules.loadShift);
      data.rules.loadShift.to.forEach(to => {
        data.loadshifted.forEach(chart => {
          if (chart.key === to) {
            const toItem = chart.values[i];
            if (toItem && !isNaN(toItem.y)) {
              if (chart.key === 'Hydro Pumped up') {
                const year = new Date(toItem.x).getFullYear();
                //console.log(toItem.y, delta, data.installed[year]['Hydro Pumped Storage']);
                let installed = 0;
                try {
                  installed = data.installed[year]['Hydro Pumped Storage'] / 1000;
                } catch (e) {}
                if (delta > (installed - toItem.y)) {
                  console.log(installed, delta, toItem.y);
                  delta -= installed - toItem.y;
                  toItem.y = -installed;
                  toItem.y = -3;
                } else {
                  toItem.y -= delta;
                  delta = 0;
                }
              } else {
                if (delta > toItem.y) {
                  delta -= toItem.y;
                  toItem.y = 0;
                } else {
                  toItem.y -= delta;
                  delta = 0;
                }
              }
            }
          }
        });
      });
    }
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