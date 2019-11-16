import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TablecalcService {

  constructor() { }
  calcTables(data) {
    console.log('----------- make tables ----------');
    console.log(data);
    return {};
  }
}
