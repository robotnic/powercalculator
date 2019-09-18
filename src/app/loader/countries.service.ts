import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';


@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  data;
  constructor(private http: HttpClient, private eventService: EventService) {}
  countries() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const url = '/assets/countries.json';
        this.eventService.setState('loading', 'countries');
        this.http.get(url).toPromise().then(data => {
          this.eventService.setState('loaded', 'countries');
          resolve(data);
        });
      }
    });
  }
}
