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
  data;
  constructor(
    private normalizeService: NormalizeService,
    private loadshiftService: LoadshiftService,
    private timeshiftService: TimeshiftService,
    private storageService: StorageService,
    private importexportService: ImportexportService
  ) { }

  mutate() {
    const newdata = this.calculate();
    return this.decorate(newdata);
  }
  init(data) {
    console.log('calculate', data);
    data = this.normalizeService.normalize(data);
    this.importexportService.calc(data);
    console.log('normalized', data);
    this.data = data;
  }
  calculate() {
    /*
    console.log('calculate', data);
    data = this.normalizeService.normalize(data);
    this.importexportService.calc(data);
    console.log('normalized', data);
    */
    const data = this.data;
    this.loadshiftService.loadshift(data);
    this.timeshiftService.timeshift(data);
    this.storageService.addStorage(data);
    return data;
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
