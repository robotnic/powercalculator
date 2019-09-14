import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  data;
  constructor(private http: HttpClient) {}
  countries() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const url = '/assets/countries.json';
        this.http.get(url).toPromise().then(data => {
          resolve(data);
        });
      }
    });
  }
}
