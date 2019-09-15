import { Injectable } from '@angular/core';
import { NormalizeService } from './normalize.service';
import { LoadshiftService } from './loadshift.service';
import { TimeshiftService } from './timeshift.service';
import { StorageService } from './storage.service';
import { ImportexportService } from './importexport.service';

@Injectable({
  providedIn: 'root'
})
export class Calculator {

  constructor(
    private normalizeService: NormalizeService,
    private loadshiftService: LoadshiftService,
    private timeshiftService: TimeshiftService,
    private storageService: StorageService,
    private importexportService: ImportexportService
  ) { }

  mutate(data) {
    const newdata = this.calculate(data);
    return this.decorate(newdata);
  }

  calculate(data) {
    console.log('calculate', data);
    data = this.normalizeService.normalize(data);
    this.importexportService.calc(data);
    console.log('normalized', data);
    this.loadshiftService.loadshift(data);
    this.timeshiftService.timeshift(data);
    this.storageService.addStorage(data);
    /*
    normalize
    addpower
    timeshift
    */
    return data;
  }

  normalize(data) {

  }
  loadshift(data) {

  }
  timeshift(data) {

  }


  decorate(data) {
    data.loadshifted.forEach(chart => {
      chart.yAxis = 1;
      if (chart.originalKey === 'hydrofill' || chart.originalKey === 'hydrofillclone') {
        chart.yAxis = 2;
      }
      console.log('yAxis', chart.yAxis)
      chart.originalKey = chart.key;
      if (data.config[chart.key]) {
        chart.color = data.config[chart.key].color;
      }
    });
    return data.loadshifted;
  }
}
