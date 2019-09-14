import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeshiftService {

  constructor() { }

  timeshift(data) {
    return data;
  }
}
