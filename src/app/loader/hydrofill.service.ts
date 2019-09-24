import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { Chart } from '../models/charts';


@Injectable({
  providedIn: 'root'
})
export class HydrofillService {
  cache: Chart;
  currentUrl: string;
  constructor(private http: HttpClient, private eventService: EventService) {}

  hydrofill(year, country) {
    return new Promise<Chart>((resolve, reject) => {
      const url: string = '/api/filllevel/' + country + '/' + year;
      console.log(url, this.currentUrl, this.cache);
      if (this.currentUrl === url && this.cache) {
        resolve(this.cache);
      } else {
        this.currentUrl = url;
        this.eventService.setState('message.loading', 'hydrofill');
        return this.http.get(url).toPromise().then(
          (data: Chart) => {
            this.eventService.setState('message.loaded', 'hydrofill');
            this.cache = data;
            resolve(data);
          }, e => {
            this.eventService.setState('message.notloaded', 'hydrofill');
            reject(e);
          }
        );
      }
    });
  }
}
