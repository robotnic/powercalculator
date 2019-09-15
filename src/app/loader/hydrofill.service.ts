import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HydrofillService {

  constructor(private http: HttpClient) {}

  hydrofill(year, country) {
    console.log(year);
    const url = '/api/filllevel/' + country + '/' + year;
    console.log(url);
    return this.http.get(url).toPromise();
  }
}
