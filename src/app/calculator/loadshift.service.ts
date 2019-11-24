import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';
import { Data } from '../models/data';
import { Chart, ChartValue } from '../models/charts';
import { State } from '../models/state';
import { PowerByName } from '../models/powerbyname';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class LoadshiftService {
  available = {};
  powerByName: PowerByName = {};
  constructor(private eventService: EventService) {}

  loadshift(data: Data) {
    data.power = JSON.parse(JSON.stringify(data.power));
    // data.loadshifted = JSON.parse(JSON.stringify(data.power));
    
    this.getPowerByName(data.loadshifted);
    const state = this.eventService.getState();
    const year = state.navigate.date.substring(0, 4);

    /* Iterate over rules.json and values */
    data.rules.loadshift.from.forEach(from => {
      let totalharvest = 0;
      const faktor: number = this.makeFaktor(data.installed, state, from);
      for (let i = 0; i < data.power[0].values.length; i++) {  // loop over time
        let harvest: number = this.harvestPower(from, i, faktor);
        data.rules.loadshift.to.forEach(to => {
          if (harvest > 0) {
            const delta = this.movePower(harvest, data.installed[year][to], to, i, totalharvest);
            harvest += delta;
            if (to === 'Hydro Pumped Storage') {
              totalharvest -= delta;
            }
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
  movePower(harvest, installed, to, i, totalharvest) {
    const totalEnergy = 2000;
    let delta = 0;
    let useable = harvest;
    if (this.powerByName[to]) {
      if (this.powerByName['hydrofill']) {
        if (to === 'Hydro Pumped Storage') {
          const hydrofill = this.powerByName['hydrofill'].values[i];
          const untilfull = totalEnergy - hydrofill.y / 1000 - totalharvest;
          if (untilfull < 0) {
            useable = 0;
          }
          /*
          if (harvest > 0.0001 && untilfull < 0) {
            console.log('hydrofill', i, hydrofill.y / 1000, harvest, totalharvest, untilfull);
          }
          */
        }
      }
      const min = this.getMin(installed, to);
      const value = this.powerByName[to].values[i];
      const oldY = value.y;

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
      if (to === 'Power2Gas') {
        const state = this.eventService.getState();
        minimum = -state.mutate.Power2Gas;
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
    const year = state.navigate.date.substring(0, 4);
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
