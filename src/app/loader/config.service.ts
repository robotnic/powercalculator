import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { Config } from '../models/config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  cache: Config;
  constructor(private http: HttpClient, private eventService: EventService) {}
  config() {
    return new Promise((resolve) => {
      if (this.cache) {
        resolve(this.cache);
      } else {
        const url = '/assets/config.json';
        this.eventService.setState('loading', 'config');
        this.http.get(url).toPromise().then((data: Config) => {
          this.cache = data;
          this.eventService.setState('loaded', 'config');
          resolve(data);
        });
      }
    });
  }
}
