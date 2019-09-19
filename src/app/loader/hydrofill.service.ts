import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { resolve } from 'url';
import { reject } from 'q';


@Injectable({
  providedIn: 'root'
})
export class HydrofillService {
  cache = null;
  currentUrl;
  constructor(private http: HttpClient, private eventService: EventService) {}

  hydrofill(year, country) {
    return new Promise((resolve, reject) => {
      const url = '/api/filllevel/' + country + '/' + year;
      console.log(url, this.currentUrl, this.cache);
      if (this.currentUrl === url && this.cache) {
        console.log('cache hit');
        resolve(this.cache);
      } else {
        this.currentUrl = url;
        this.eventService.setState('loading', 'hydrofill');
        return this.http.get(url).toPromise().then(
          data => {
            this.eventService.setState('loaded', 'hydrofill');
            this.cache = data;
            resolve(data);
          }, e => {
            this.eventService.setState('notloaded', 'hydrofill');
            reject(e);
          }
        );
      }
    });
  }
}
