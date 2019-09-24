import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { Countries } from '../models/countries';


@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  cache: Countries;
  constructor(private http: HttpClient, private eventService: EventService) {}
  countries() {
    return new Promise((resolve) => {
      if (this.cache) {
        resolve(this.cache);
      } else {
        const url = '/assets/countries.json';
        this.eventService.setState('message.loading', 'countries');
        this.http.get(url).toPromise().then((data: Countries) => {
          this.eventService.setState('message.loading', null);
          this.eventService.setState('message.loaded', 'countries');
          this.cache = data;
          resolve(data);
        });
      }
    });
  }
}
