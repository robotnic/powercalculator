import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PowerService } from './power.service';
import { InstalledService } from './installed.service';
import { ConfigService } from './config.service';
import { RulesService } from './rules.service';
import { EventService } from '../eventhandler.service';

@Injectable({
  providedIn: 'root'
})
export class Loader {
  currentDate;
  currentCountry;
  currentTimetype;
  data;
  constructor(
    private powerService: PowerService,
    private eventHandler: EventService,
    private installedService: InstalledService,
    private configService: ConfigService,
    private rulesService: RulesService
  ) { }
  power() {
    return new Observable((observer) => {
      // observable execution
      this.load().subscribe(data => {
        observer.next(data);
      });
    });
  }
  year() {

  }
  load() {
    return new Observable(observer => {
      if (this.data) {
        observer.next(this.data);
      }
      this.eventHandler.stateChange().subscribe(() => {
        const state = this.eventHandler.getState();
        console.log('STATE', state, this.currentDate, this.currentCountry);
        if (this.currentDate !== state.date || this.currentCountry !== state.country || this.currentTimetype !== state.timetype) {
          this.currentDate = state.date;
          this.currentCountry = state.country;
          this.currentTimetype = state.timetype;
          const promises = [
            this.powerService.charts(),
            this.installedService.installed(),
            this.configService.config(),
            this.rulesService.rules(),
          ];
          Promise.all(promises).then(data => {
            this.data = {
              power: data[0],
              installed: data[1],
              config: data[2],
              rules: data[3],
              meta: {
                date: this.currentDate,
                country: this.currentCountry
              },
              loadshifted: null
            };
            console.log('have all data', this.data);
            if (this.data.power) {
              observer.next(this.data);
            }
          });
        } else {
          observer.next(this.data);
        }

      });
    });
  }
}
