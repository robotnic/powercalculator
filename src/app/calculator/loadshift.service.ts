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
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    this.getPowerByName(data.loadshifted);
    const state: State = this.eventService.getState();
    const year = state.date.substring(0, 4);

    /* Iterate over rules.json and values */
    data.rules.loadshift.from.forEach(from => {
      const faktor: number = this.makeFaktor(data.installed, state, from);
      for (let i = 0; i < data.power[0].values.length; i++) {  // loop over time
        let harvest: number = this.harvestPower(from, i, faktor);
        data.rules.loadshift.to.forEach(to => {
          if (harvest > 0) {
            const delta = this.movePower(harvest, data.installed[year][to], to, i);
            harvest += delta;
          }
        });
      }
    });
  }

  /*
  Based on rules.json and user input the new generated power is calculated.
  The harvest can be used to reduct coal, gas, ...
  */
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

  /*
  The new added power replaces CO2 intensive electricity generation
  */
  movePower(harvest, installed, to, i) {
    let delta = 0;
    if (this.powerByName[to]) {
      const min = this.getMin(installed, to);
      const value = this.powerByName[to].values[i];
      const oldY = value.y;

      let useable = harvest;
      if (useable > value.y - min) {
        useable = value.y - min;
      }
      value.y -= useable;
      delta = value.y - oldY;
    }
    return delta;
  }

  /*
  minimum is a negativ value für pumps,...
  */
  getMin(installed, to) {
      // add power2gas, batteries here, ...
      let minimum = 0;
      if (to === 'Hydro Pumped Storage') {
        minimum = -installed / 1000;
      }
      if (to === 'Curtailment') {
        minimum = -99999999999999999;
      }
      return minimum;
  }
  /* helper */
  getPowerByName(power) {
    this.powerByName = {};
    power.forEach(element => {
      this.powerByName[element.key] = element;
    });
  }
  /*
  if already 1 GWp PV is installed, we assume that if we add 1 more GWp the output is doubled.
  In this example, the faktor would be 2.
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
