import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../eventhandler.service';

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
        this.http.get(url).toPromise().then(data => {
          resolve(data);
        });
      }
    });
  }
}