import { Injectable } from '@angular/core';
import { Chart } from '../models/charts';
import { EventService } from '../eventhandler.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConsumptionService {
  currentUrl;
  cache;
  constructor(private eventService: EventService, private http: HttpClient) { }
  load() {
    //const url = '/api/consumption/Austria/2016';
    return new Promise<Chart>((resolve, reject) => {
      const state = this.eventService.getState();
      const url: string = '/api/consumption/' + state.navigate.country + '/2016';
      if (this.currentUrl === url && this.cache) {
        resolve(this.cache);
      } else {
        this.currentUrl = url;
        this.eventService.setState('message.loading', 'consumption');
        return this.http.get(url).toPromise().then(
          (data: Chart) => {
            this.eventService.setState('message.loaded', 'consumption');
            this.cache = data;
            resolve(data);
          }, e => {
            this.eventService.setState('message.notloaded', 'consumption');
            reject(e);
          }
        );
      }
    });
  }
}
