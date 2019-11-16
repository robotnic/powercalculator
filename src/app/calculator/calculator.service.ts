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
  originalData: Data;
  calcId = null;
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
    return new Promise((resolve, reject) => {
      this.calcId = Math.random();
      this.calculate(this.calcId).then(data => {
        resolve(data);
      }, e => {
        reject();
      });
    });
  }
  async init(data) {
    this.calcId = Math.random();
    try {
      await this.unlock({ 'message.calcing': 'fix' }, this.calcId);
      this.fixchartsService.fix(data);
      await this.unlock({ 'message.calced': 'fix', 'message.calcing': 'normalize' }, this.calcId);
      this.normalizeService.normalize(data);
      await this.unlock({ 'message.calced': 'normalize', 'message.calcing': 'importexport' }, this.calcId);
      this.importexportService.calc(data);
      await this.unlock({ 'message.calced': 'importexport', 'message.calcing': 'hydro' }, this.calcId);
      this.storageService.calcHydrofill(data);
      await this.unlock({ 'message.calced': 'hydro', 'message.calcing': 'decorate' }, this.calcId);
      this.decorate(data);
      await this.unlock({ 'message.calced': 'decorate' }, this.calcId);
      this.originalData = data;
    } catch (e) {
      console.error('init error', e);
    }
  }

  async calculate(calcId) {
    const data = JSON.parse(JSON.stringify(this.originalData));
    this.data = data;
    data.loadshifted = JSON.parse(JSON.stringify(data.power));
    await this.unlock({ 'message.calcing': 'transport' }, calcId);
    this.transportService.add(data);
    await this.unlock({ 'message.calcing': 'loadshift', 'message.calced': 'transport' }, calcId);
    this.loadshiftService.loadshift(data);
    await this.unlock({ 'message.calced': 'loadshift', 'message.calcing': 'timeshift' }, calcId);
    this.timeshiftService.timeshift(data);
    await this.unlock({ 'message.calced': 'timeshift', 'message.calcing': 'pump' }, calcId);
    this.storageService.addStorage(data);
    await this.unlock({ 'message.calced': 'pump', 'message.calcing': 'sum' }, calcId);
    this.summaryService.calcSummary(data);
    await this.unlock({ 'message.calced': 'sum', 'message.calcing': 'render' }, calcId);
    this.chartvisibilityService.set(data);
    return data;
  }

  unlock(obj, calcId) {
    let stopcalc2 = false;
    if (this.calcId !== calcId) {
      stopcalc2 = true;
    }
    if (!stopcalc2) {
      // tslint:disable-next-line:forin
      for (const name in obj) {
        this.eventService.setState(name, obj[name]);
      }
    }
    return new Promise((resolve, reject) => {
      if (stopcalc2) {
        reject('stopcalc');
      } else {
        setTimeout(() => resolve(), 0);
      }
    });
  }

  decorate(data) {
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