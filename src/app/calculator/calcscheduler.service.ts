import { Injectable } from '@angular/core';
import { NormalizeService } from './normalize.service';
import { LoadshiftService } from './loadshift.service';
import { TimeshiftService } from './timeshift.service';
import { StorageService } from './storage.service';
import { ImportexportService } from './importexport.service';
import { EventService } from '../eventhandler.service';
import { SummaryService } from './summary.service';
import { ChartvisibilityService } from './chartvisibility.service';
import { TransportService } from './transport.service';
import { FixchartsService } from './fixcharts.service';
import { VisualizeService } from './visualize.service';
import { Data } from '../models/data';

@Injectable({
  providedIn: 'root'
})
export class CalcschedulerService {
  rules = {
    init: ['fix', 'normalize', 'importexport', 'hydro', 'decorate'],
    calc: ['transport', 'loadshift', 'timeshift', 'pump', 'summary', 'render']
  };

  calcStack = [];
  processTimeout = null;
  data: Data;
  resolve: (value ? : unknown) => void;
  reject: (reason?: any) => void;


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
    private fixchartsService: FixchartsService,
    private visualizeService: VisualizeService
  ) {}

  init(data) {
    return new Promise((resolve, reject) => {
      this.schedule('init', data).then((initdata: Data) => {
        const state = this.eventService.getState();
        this.data = initdata;
        this.mutate().then(mutdata => {
          resolve(mutdata);
        }, error => {
          reject();
        });
      });
      //resolve(data);
    });
  }
  mutate() {
    const data = JSON.parse(JSON.stringify(this.data));
    return new Promise((resolve, reject) => {
      data.loadshifted = JSON.parse(JSON.stringify(data.power));
      this.schedule('calc', data).then(() => {
        resolve(data);
      }, error => {
        console.log(error);
        reject(error);
      });
    });

  }
  schedule(type, data) {
      if (this.reject) {
        try {
        this.reject('stopcalc');
        } catch (e) {
          console.log('soso');
        }
      }
    return new Promise((resolve, reject) => {
      this.reject = reject;
      this.calcStack.length = 0;
      clearTimeout(this.processTimeout);
      this.rules[type].forEach(calctype => {
        this.calcStack.push(calctype);
      });
      this.process(data).then(() => {
        this.reject = null;
        resolve(data);
      });
    });
  }

  process(data) {
    return new Promise((resolve, reject) => {
      if (this.calcStack.length > 0) {
        const calctype = this.calcStack.shift();
        this.eventService.setState('calcing', calctype);
        this.run(calctype, data);
        this.processTimeout = setTimeout(() => {
          this.process(data).then(() => {
            resolve(data);
          });
        }, 0);
      } else {
        this.eventService.setState('calcing', '');
        resolve(data);
      }
    });
  }

  run(name, data) {
    switch (name) {
      case 'fix':
        this.fixchartsService.fix(data);
        break;
      case 'normalize':
        this.normalizeService.normalize(data);
        break;
      case 'importexport':
        this.importexportService.calc(data);
        break;
      case 'hydro':
        this.storageService.calcHydrofill(data);
        break;
      case 'decorate':
        this.visualizeService.decorate(data);
        break;
      case 'transport':
        this.transportService.add(data);
        break;
      case 'loadshift':
        this.loadshiftService.loadshift(data);
        break;
      case 'timeshift':
        this.timeshiftService.timeshift(data);
        break;
      case 'pump':
        this.storageService.addStorage(data);
        break;
      case 'summary':
        this.summaryService.calcSummary(data);
        break;
      case 'render':
        this.chartvisibilityService.set(data);
        break;
      default:
        console.log('unknown calc ', name);
    }
  }
}