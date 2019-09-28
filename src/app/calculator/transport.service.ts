import { Injectable } from '@angular/core';
import { EventService } from '../eventhandler.service';
import { Data } from '../models/data';
import { PowerByName } from '../models/powerbyname';

@Injectable({
  providedIn: 'root'
})
export class TransportService {

  constructor(private eventService: EventService) {}
  add(data: Data) {
    const state = this.eventService.getState();
    const transport = state.mutate.Transport / 100;
    console.log('consumption', data.consumption.Road);
    const diesel = data.consumption.Road['Gas/Diesel Oil (w/o bio)'];
    const benzin = data.consumption.Road['Motor Gasoline (w/o bio)'];
    const everageFossilPower = (diesel + benzin) / 365 / 24;
    const originalByName = this.getPowerByName(data.power);
    const modifiedByName = this.getPowerByName(data.loadshifted);
    modifiedByName['Transport'].values.forEach((item, i) => {
      const p = everageFossilPower / 4 * transport;
      item.y = p;
      modifiedByName['Leistung [MW]'].values[i].y = originalByName['Leistung [MW]'].values[i].y + p;
    });

  }
  /* helper */
  getPowerByName(power) {
    const powerByName: PowerByName = {};
    power.forEach(element => {
      powerByName[element.originalKey] = element;
    });
    return powerByName;
  }
}