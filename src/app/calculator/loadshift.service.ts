import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';
import { Data } from '../models/data';
import { Chart, ChartValue } from '../models/charts';
import { State } from '../models/state';
import { PowerByName } from '../models/powerbyname';

@Injectable({
  providedIn: 'root'
})
export class LoadshiftService {
  available = {};
  powerByName: PowerByName = {};
  constructor(private eventService: EventService) {}

  loadshift(data: Data) {
    console.log('installed', data.installed);
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    console.log('rules in loadshift', data.rules.loadshift);
    this.getPowerByName(data.loadshifted);
    const state: State = this.eventService.getState();
    const year = state.date.substring(0, 4);
    data.rules.loadshift.from.forEach(from => {
      let savings = 0;
      const faktor: number = this.makeFaktor(data.installed, state, from);
      for (let i = 0; i < data.power[0].values.length; i++) {
        let harvest: number = this.harvestPower(from, i, faktor);
        data.rules.loadshift.to.forEach(to => {
          if (harvest > 0) {
            harvest = this.movePower(harvest, savings, data.installed[year][to], to, i);
          }
        });
        savings += harvest;
        if (harvest > 0) {
          console.log(from, harvest, 'wegschmeissen');
        }
      }
    });
  }

  harvestPower(from, i, faktor) {
    let harvest = 0;
    if (this.powerByName[from]) {
      const fromValue = this.powerByName[from].values[i];
      const oldFromY = fromValue.y;
      fromValue.y = fromValue.y * faktor;
      harvest = fromValue.y - oldFromY;
    }
    return harvest;
  }
  movePower(harvest, savings, installed, to, i) {
    let delta = 0;
    if (this.powerByName[to]) {
      let min = 0;
      let max = installed / 1000;
      if (to === 'Hydro Pumped Storage') {
        min = -installed / 1000;
      }
      if (to === 'Curtailment') {
        min = -99999999999999999;
        max = 0;
      }
      //onsole.log('minmax', min, max);
      const value = this.powerByName[to].values[i];
      const oldY = value.y;
      let takeCapacity = value.y - min;
      if (takeCapacity > max - min) {
        takeCapacity = max - min;
      }
      if (takeCapacity > harvest) {
        takeCapacity = harvest;
      }
      value.y -= takeCapacity;
      /*
      if (takeCapacity > value.y) {
        value.y = 0;
      } else {
        value.y -= takeCapacity;
      }
      */
      delta = value.y - oldY;
    }
    return harvest + delta;
  }
  /*
    movePower(installed, from, to, i) {
      const state: State = this.eventService.getState();
      const faktor: number = this.makeFaktor(installed, state, from);

      if (faktor !== 1) {
        if (i === 12) {
          console.log('movepoer', from, to, faktor);
        }
        this.movePowerFaktor(from, to, faktor, i);
      }

    }

    movePowerFaktor(from, to, faktor, i) {
      const fromValue = this.powerByName[from].values[i];
      const oldFromY = fromValue.y;
      fromValue.y = fromValue.y + zauberformel();

      const toValues = this.powerByName[to].values[i];

    }
    */

  getPowerByName(power) {
    this.powerByName = {};
    power.forEach(element => {
      this.powerByName[element.key] = element;
    });
  }

  /*
  loadshift(data: Data) {
    const state: State = this.eventService.getState();
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    // tslint:disable-next-line:forin
    for (const c in data.power) {  // loop over charts
      const chart: Chart = data.power[c];
      this.available = {};
      if (chart.key !== 'Leistung [MW]') {
        const factor: number = this.makeFaktor(data.installed, state, chart.key);
        if (factor !== 1) {
          chart.values.forEach((item, i) => {  // loop over time
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
  */

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