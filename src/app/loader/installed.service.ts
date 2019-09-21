import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';
import { reject } from 'q';
import { Installed } from '../models/installed';

@Injectable({
  providedIn: 'root'
})

export class InstalledService {
  cache: Installed;
  currentUrl: string;
  constructor(private http: HttpClient, private eventService: EventService) {}
  installed() {
    return new Promise((resolve) => {
      const country: string = this.eventService.getState().country;
      const url: string = '/api/installed/' + country;
      if (this.cache && url === this.currentUrl) {
        resolve(this.cache);
      } else {
        this.eventService.setState('loading', 'installed');
        this.http.get(url).toPromise().then((data: Installed) => {
          this.eventService.setState('loaded', 'installed');
          this.cache = data;
          resolve(data);
        }, e => {
          this.eventService.setState('failed', 'installed');
          reject(e);
        });
        this.currentUrl = url;
      }
    });
  }
}