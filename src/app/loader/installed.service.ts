import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { reject } from 'q';

@Injectable({
  providedIn: 'root'
})

export class InstalledService {
  data;
  constructor(private http: HttpClient, private eventService: EventService) {}
  installed() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const country = this.eventService.getState().country;
        const url = '/api/installed/' + country;
        this.eventService.setState('loading', 'installed');
        this.http.get(url).toPromise().then(data => {
          this.eventService.setState('loaded', 'installed');
          resolve(data);
        }, e => {
          this.eventService.setState('failed', 'installed');
          reject(e);
        });
      }
    });
  }
}