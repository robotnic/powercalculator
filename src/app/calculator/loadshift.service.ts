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
      const faktor: number = this.makeFaktor(data.installed, state, from);
      for (let i = 0; i < data.power[0].values.length; i++) {
        let harvest: number = this.harvestPower(from, i, faktor);
        data.rules.loadshift.to.forEach(to => {
          if (harvest > 0) {
            harvest = this.movePower(harvest, data.installed[year][to], to, i);
          }
        });
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
  movePower(harvest, installed, to, i) {
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
      delta = value.y - oldY;
    }
    return harvest + delta;
  }
  getPowerByName(power) {
    this.powerByName = {};
    power.forEach(element => {
      this.powerByName[element.key] = element;
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