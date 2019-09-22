import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }
  getPowerByName(power) {
    const powerByName = {};
    power.forEach(element => {
      powerByName[element.key] = element;
    });
    return powerByName;
  }
}
