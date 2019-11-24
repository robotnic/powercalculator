import { Component, OnInit, ViewChild } from '@angular/core';
import { Loader } from 'src/app/loader/loader.service';
import { MatSort } from '@angular/material';

import * as moment from 'moment';
import { Calculator } from 'src/app/calculator/calculator.service';
import { EventService } from 'src/app/eventhandler.service';
import { Data } from 'src/app/models/data';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.less']
})
export class TablesComponent implements OnInit  {
  total = {};
  tables = {};
  date;
  previousdate;
  country;
  meta;
  timetype;
  data;
  dataSource;
  math = Math;
  tabletype = 'energy';

  constructor(
    private loader: Loader,
    private calculator: Calculator,
    private eventService: EventService
  ) {}

  ngOnInit() {
    console.log('inittable');
    this.loader.power().subscribe((original: Data) => {
      console.log('original', original);
      this.date = moment(original.meta.date, 'YYYYMMDD').format('YYYY/MM/DD');
      this.meta = original.meta;
      this.country = original.meta.country;
      this.timetype = original.meta.timetype;
      this.calculator.mutate().then((modified: Data) => {
        this.data = modified;
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
        this.previousdate = modified.meta.date;
      });
    });
  }
}