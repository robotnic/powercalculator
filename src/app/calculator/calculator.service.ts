import { Injectable } from '@angular/core';
import { NormalizeService } from './normalize.service';
import { LoadshiftService } from './loadshift.service';
import { TimeshiftService } from './timeshift.service';
import { StorageService } from './storage.service';
import { ImportexportService } from './importexport.service';
import { EventService } from '../eventhandler.service';
import { SummaryService } from './summary.service';
import { FixchartsService } from './fixcharts.service';
import { ChartvisibilityService } from './chartvisibility.service';
import { TransportService } from './transport.service';
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
    private summaryService: SummaryService,
    private chartvisibilityService: ChartvisibilityService,
    private transportService: TransportService,
    private fixchartsService: FixchartsService
  ) {}

  mutate() {
    return new Promise(resolve => {
      this.calculate().then(data => {
        resolve(data);
      });
    });
  }
  async init(data) {
    await this.unlock({ 'message.calcing': 'fix' });
    this.fixchartsService.fix(data);
    await this.unlock({ 'message.calced': 'fix' });

    await this.unlock({ 'message.calcing': 'normalize' });
    this.normalizeService.normalize(data);
    await this.unlock({ 'message.calced': 'normalize' });

    await this.unlock({ 'message.calcing': 'importexport' });
    this.importexportService.calc(data);
    await this.unlock({ 'message.calced': 'importexport' });

    await this.unlock({ 'message.calcing': 'hydro' });
    this.storageService.calcHydrofill(data);
    await this.unlock({ 'message.calced': 'hydro' });
    await this.unlock({ 'message.calcing': 'decorate' });
    this.decorate(data);
    await this.unlock({ 'message.calced': 'decorate' });
    this.data = data;
  }

  async calculate() {
    const data = this.data;
    data.loadshifted = JSON.parse(JSON.stringify(data.power));

    await this.unlock({ 'message.calcing': 'loadshift' });
    this.transportService.add(data);
    this.loadshiftService.loadshift(data);
    await this.unlock({ 'message.calced': 'loadshift', 'message.calcing': 'timeshift' });
    this.timeshiftService.timeshift(data);
    await this.unlock({ 'message.calced': 'timeshift', 'message.calcing': 'pump' });
    this.storageService.addStorage(data);
    await this.unlock({ 'message.calced': 'pump', 'message.calcing': 'sum' });
    this.summaryService.calcSummary(data);
    await this.unlock({ 'message.calced': 'sum', 'message.calcing': 'render' });
    this.chartvisibilityService.set(data);
    return data;
  }

  unlock(obj) {
    // tslint:disable-next-line:forin
    for (const name in obj) {
      this.eventService.setState(name, obj[name]);
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 0);
    });
  }

  decorate(data) {
    console.log(data);
    data.power.forEach(chart => {
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
