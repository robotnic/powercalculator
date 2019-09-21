import { Injectable } from '@angular/core';
import { NormalizeService } from './normalize.service';
import { LoadshiftService } from './loadshift.service';
import { TimeshiftService } from './timeshift.service';
import { StorageService } from './storage.service';
import { ImportexportService } from './importexport.service';
import { EventService } from '../eventhandler.service';
import { SummaryService } from './summary.service';
import { Data } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class Calculator {
  data: Data;
  constructor(
    private normalizeService: NormalizeService,
    private loadshiftService: LoadshiftService,
    private timeshiftService: TimeshiftService,
    private storageService: StorageService,
    private importexportService: ImportexportService,
    private eventService: EventService,
    private summaryService: SummaryService
  ) {}

  mutate() {
    return new Promise(resolve => {
      this.calculate().then(data => {
        resolve(this.decorate(data));
      });
    });
  }
  async init(data) {
    this.normalizeService.normalize(data);
    await this.unlock('calcing', 'normalize');
    this.importexportService.calc(data);
    await this.unlock('calced', 'normalize');
    this.data = data;
  }
  async calculate() {
    const data = this.data;
    await this.unlock('calcing', 'loadshift');
    this.loadshiftService.loadshift(data);
    await this.unlock('calced', 'loadshift');

    await this.unlock('calcing', 'timeshift');
    this.timeshiftService.timeshift(data);
    await this.unlock('calced', 'timeshift');

    await this.unlock('calcing', 'pump');
    this.storageService.addStorage(data);
    await this.unlock('calced', 'pump');

    await this.unlock('calcing', 'sum');
    this.summaryService.calcSummary(data);
    await this.unlock('calced', 'sum');

    await this.unlock('calcing', 'render');
    return data;
  }

  unlock(name, value) {
    this.eventService.setState(name, value);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 0);
    });
  }

  decorate(data) {
    console.log(data);
    data.loadshifted.forEach(chart => {
      chart.yAxis = 1;
      if (chart.originalKey === 'hydrofill' || chart.originalKey === 'hydrofillclone') {
        chart.yAxis = 2;
      }
      chart.originalKey = chart.key;
      if (data.config[chart.key]) {
        chart.color = data.config[chart.key].color;
      }
    });
    return data;
  }
}
