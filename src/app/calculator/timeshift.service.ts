import { Injectable } from '@angular/core';
import { RulesService } from '../loader/rules.service';
import { ChartValue } from '../models/charts';
import { PowerByName } from '../models/powerbyname';

@Injectable({
  providedIn: 'root'
})
export class TimeshiftService {
  original;
  modified;
  constructor() {}

  timeshift(data) {
    const originalByName: PowerByName = this.getPowerByName(data.power);
    const modifiedByName: PowerByName = this.getPowerByName(data.loadshifted);
    const takeover = {};
    for (let i = 0; i < data.power[0].values.length; i++) {
      data.rules.timeshift.from.forEach(from => {
        const original = originalByName[from].values[i];
        const modified = modifiedByName[from].values[i];
        let harvest = original.y - modified.y;
        if (takeover[from]) {
          harvest += takeover[from];
        }
        data.rules.timeshift.to.forEach(to => {
          if (modifiedByName[to] && harvest > 0) {
            harvest += this.releaseSavedEnergy(harvest, modifiedByName[to].values[i], modifiedByName[from].values[i], data.installed[from]);
          }
        });
        if (!takeover[from]) {
          takeover[from] = 0;
        }
        takeover[from] = harvest;
      });
    }
  }

  releaseSavedEnergy(harvest, modifiedTo, modifiedFrom, installed) {
    const oldToY = modifiedTo.y;
    let available = harvest;
    if (available > modifiedTo.y) {
      available = modifiedTo.y;
    }
    if (available > (installed / 1000 - modifiedFrom.y)) {
      available = installed / 1000 - modifiedFrom.y;
    }
    modifiedTo.y = modifiedTo.y - available;
    modifiedFrom.y = modifiedFrom.y + available;
    const delta = modifiedTo.y - oldToY;
    return delta;
  }

  /* helper */
  getPowerByName(power) {
    const powerByName = {};
    power.forEach(element => {
      powerByName[element.key] = element;
    });
    return powerByName;
  }
}