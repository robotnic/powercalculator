import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  data;
  constructor(private http: HttpClient) {}
  config() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const url = '/assets/config.json';
        this.http.get(url).toPromise().then(data => {
          this.data = data;
          resolve(data);
        });
      }
    });
  }
}
