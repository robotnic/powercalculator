import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rules } from '../models/rules';

@Injectable({
  providedIn: 'root'
})
export class RulesService {
  data: Rules;
  constructor(private http: HttpClient) {}
  rules() {
    return new Promise((resolve) => {
      if (this.data) {
        resolve(this.data);
      } else {
        const url = '/assets/rules.json';
        this.http.get(url).toPromise().then((data: Rules) => {
          console.log('rules', data);
          this.data = data;
          resolve(data);
        });
      }
    });
  }
}
