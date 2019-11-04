import { Component, OnInit } from '@angular/core';
import { Loader } from 'src/app/loader/loader.service';
import { Calculator } from 'src/app/calculator/calculator.service';
import { EventService } from 'src/app/eventhandler.service';
import * as moment from 'moment';
import { Data } from 'src/app/models/data';
import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey-diagram';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less']
})
export class EnergyComponent implements OnInit {
  data: Data;
  constructor(
    private loader: Loader,
    private calculator: Calculator,
    private eventService: EventService
  ) {}

  ngOnInit() {
    this.loader.power().subscribe((original: Data) => {
      this.calculator.mutate().then((modified: Data) => {
        this.data = modified;
        const sankey = this.makeSum(modified);
        this.addEV(sankey);
        sankey.order = this.makeOrder(sankey.links);
        this.draw(sankey);
        this.eventService.setState('message.calced', 'render');
        this.eventService.setState('message.calcing', '');
      });
    });
  }

  addEV(sankey) {
    let fossilTransport = 0;
    const state = this.eventService.getState();
    const ev = state.mutate.Transport / 100;
    sankey.links.forEach(link => {
      if (link.target === 'Road') {
        if ((link.source === 'Motor Gasoline (w/o bio)') || (link.source === 'Gas/Diesel Oil (w/o bio)')) {
          fossilTransport += link.value * ev;
          link.value = link.value * (1 - ev);
        }
      }
    });
    const evTransport = {
      source: 'Electricity',
      target: 'Road',
      value: fossilTransport / 2,
      color: 'gold',
      type: 'electricity'
    };
    sankey.links.push(evTransport);
  }

  draw(energy) {
    const layout = d3Sankey.sankey().extent([
      [170, 10],
      [840, 580]
    ]);
    const diagram = d3Sankey.sankeyDiagram()
    .linkColor(function(d) { return d.color; })
    .linkTitle(function(d) {
      let title = d.source.title;
      title += ' → ';
      title += d.target.title;
      title += ' ' + Math.round(d.value ) + ' GWh';
      return title;
    });

    //d3.json('assets/energy.json', function(energy) {
      layout.ordering(energy.order);
      d3.select('#sankey')
        .datum(layout(energy))
        .call(diagram);

    //});
  }

  makeSum(data) {
    //console.log('sum', data.sum);
    //console.log('consumption', data.consumption);
    const sankey = {
      nodes: [],
      links: [],
      order: []
    };
    sankey.links = this.makeLinksConsumption(data);
    sankey.links = this.makeLinks(data).concat(sankey.links);
    sankey.nodes = this.makeNodesConsumption(sankey.links);
    //sankey.rankSet = this.makeRankSet(sankey.links);
    //sankey.order = this.makeOrder(sankey.links);
    return sankey;
  }

  makeRankSet(links) {
    const start = {
      type: 'start',
      nodes: []
    };
    const middle = {
      type: 'middle',
      nodes: ['Electricity']
    };

    const end = {
      type: 'end',
      nodes: []
    };
    const rankset = [start, middle, end];
    links.forEach(link => {
      if (link.source !== 'Electricity') {
        start.nodes.push(link.source);
      }
      if (link.target !== 'Electricity') {
        end.nodes.push(link.target);
      }
    });
    return rankset;
  }

  makeOrder(links) {
    const start = [];
    const middle = ['Electricity'];
    const end = [];
    links.forEach(link => {
      if (link.source !== 'Electricity') {
        start.push(link.source);
      }
      if (link.target !== 'Electricity') {
        end.push(link.target);
      }
    });
    return [[start], [middle], [end]];
  }

  makeNodes(data) {
    const nodes = [];
    // tslint:disable-next-line:forin
    for (const s in data.sum) {
      const node = {
        id: s,
        title: s
      };
      nodes.push(node);
    }
    return nodes;
  }
  makeLinks(data) {
    const links = [];
    // tslint:disable-next-line:forin
    for (const s in data.sum) {
      const link = {
        source: s,
        target: 'Electricity',
        value: data.sum[s].modified,
        color: data.config[s].color,
        type: 'electricity'
      };
      if (s !== 'Leistung [MW]') {
        links.push(link);
      }
    }
    return links;
  }

  makeNodesConsumption(links) {
    let names = [];
    const nodes = [];
    // tslint:disable-next-line:forin
    links.forEach(link => {
      if (names.indexOf(link.source) === -1) {
        names.push(link.source);
      }
      if (names.indexOf(link.target) === -1) {
        names.push(link.target);
      }
    });
    names.forEach(name => {
      nodes.push({
        id: name,
        title: name
      });
    });
    return nodes;
  }
  makeLinksConsumption(data) {
    const state = this.eventService.getState();
    let factor = 1;
    switch (state.navigate.timetype) {
      case 'day':
        factor = 365 ;
        break;
      case 'week':
        factor = 365 / 7;
        break;
      case 'month':
        factor = 12;
        break;
      case 'year':
        factor = 1;
        break;
    }
    console.log('factor', factor, state.navigate.timetype);
    const links = [];
    // tslint:disable-next-line:forin
    for (const s in data.consumption) {
      for (const t in data.consumption[s]) {
      let color = 'red';
      if (data.config[t]) {
        color = data.config[t].color;
      }
      // tslint:disable-next-line:forin
        const link = {
          source: t,
          target: s,
          value: data.consumption[s][t] / factor,
          color: color,
          type: 'not electricity'
        };
        if (link.value < 0)  {
          link.source = s;
          link.target = t;
          link.value = -link.value;
        }
        if (Math.abs(link.value) > 1000 / factor) {
          links.push(link);
        }
      }
    }
    return links;
  }
}
