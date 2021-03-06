import { Component, OnInit, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material';


@Component({
  selector: 'app-electrictable',
  templateUrl: './electrictable.component.html',
  styleUrls: ['./electrictable.component.less']
})
export class ElectrictableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatSort) sort: MatSort;
  @Input() data: any;
  @Input() tabletype: string;

  display = {
    'energy': ['key', 'original', 'modified', 'deltaEnergy'],
    'co2': ['key', 'originalCo2', 'modifiedCo2', 'co2perMWh', 'deltaCo2'],
    'money': ['key', 'moneyPerMWh', 'originalMoney', 'modifiedMoney', 'deltaMoney']
  };
  displayedColumns = this.display.energy;
  total = {};
  dataSource;
  math = Math;
//  tabletype = 'energy';

  constructor() {}

  ngOnChanges() {
    if (this.data.sum) {
      let sum = this.data.sum.electricity.items;
      sum = sum.filter(item => {
        return item.key !== 'Leistung [MW]';
      });
      this.total = this.data.sum.electricity.totals;
      this.dataSource = new MatTableDataSource(sum);
      this.sortBy('deltaMoney');
      this.dataSource.sort = this.sort;
    }
    this.displayedColumns = this.display[this.tabletype];
  }
  sortBy(type) {
    this.dataSource.data.sort((a: any, b: any) => {
      if (a[type] === b[type]) {
        return 0;
      }
      if (Math.abs(a[type]) > Math.abs(b[type])) {
        return -1;
      } else {
        return 1;
      }
    });
  }
  getTotal(name) {
    return this.total[name] || '0';
  }
  changeTableType(event) {
    this.displayedColumns = this.display[event.value];
  }
  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.sort = this.sort;
    }
  }

}