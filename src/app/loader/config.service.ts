import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  data;
  constructor(private http: HttpClient, private eventService: EventService) {}
  config() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const url = '/assets/config.json';
        this.eventService.setState('loading', 'config');
        this.http.get(url).toPromise().then(data => {
          this.data = data;
          this.eventService.setState('loaded', 'config');
          resolve(data);
        });
      }
    });
  }
}
