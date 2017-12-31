﻿import { Component, OnDestroy, ViewChild } from '@angular/core';

import { BaseChartDirective } from 'ng2-charts';

import { Humanizer } from '../../common/primitives';
import { MonitoringService } from './monitoring.service';
import { MonitoringComponent } from './monitoring.component';
import { ServerSnapshot } from './server-snapshot';

@Component({
    selector: 'requests-chart',
    template: `
        <div class="row chart-info" *ngIf="_snapshot">
            <div class="col-xs-4">
                <div>
                    <label>
                        总共请求数
                    </label>
                    <tooltip>
                        重服务重启后一直累加的请求数.
                    </tooltip>
                </div>
                {{formatNumber(_snapshot.requests.total)}}
            </div>
            <div class="col-xs-4">
                <label class="block">
                    每秒请求数
                </label>
                {{formatNumber(_snapshot.requests.per_sec)}}
            </div>
            <div class="col-xs-4">
                <div>
                    <label>
                        活动请求数
                    </label>
                    <tooltip>
                        当前正在处理的请求总数.
                    </tooltip>
                </div>
                {{formatNumber(_snapshot.requests.active)}}
            </div>
            <div class="clearfix visible-xs-block"></div>
        </div>
        <div class="block">
            <canvas #chart='base-chart' baseChart width="600" height="200"
                        [datasets]="_data"
                        [labels]="_labels"
                        [options]="_options"
                        [colors]="_colors"
                        [legend]="true"
                        [chartType]="'line'"></canvas>
        </div>
    `,
    styleUrls: [
        'app/webserver/monitoring/monitoring.css'
    ]
})
export class RequestsChart implements OnDestroy {

    private _subscriptionId: number = null;
    private _length = 20;
    private _snapshot: ServerSnapshot = null;
    private formatNumber = Humanizer.number;

    private _options: any = {
        responsive: true,
        legend: {
            position: 'bottom'
        },
        scales: {
            yAxes: [
                {
                    ticks: {
                        min: 0,
                        // Create labels
                        callback: function (value, index, values) {
                            // float values less than five causing y axis scale label clipping https://github.com/chartjs/Chart.js/issues/729
                            if (value > 0 && values[0] < 6) {
                                return value.toFixed(1);
                            }

                            return value;
                        }
                    }
                }
            ],
            xAxes: [
                {
                    gridLines: {
                        display: false
                    }
                }
            ]
        },
        elements: {
            line: {
                tension: 0,
                fill: false
            }
        }
    };

    private _colors: Array<any> = MonitoringComponent.DefaultColors;

    private _rpsValues: Array<number> = [];
    private _activeRequestsValues: Array<number> = [];
    private _labels: Array<string> = [];

    @ViewChild('chart') private _rpsChart: BaseChartDirective;

    private _data: Array<any> = [
        { data: this._rpsValues, label: '每秒请求数' },
        { data: this._activeRequestsValues, label: '活跃请求数' }
    ];

    constructor(private _svc: MonitoringService) {

        for (let i = 0; i < this._length; i++) {
            this._labels.push('');
        }

        this.activate();
    }

    public activate() {
        this._subscriptionId = this._svc.subscribe(snapshot => this.consumeSnapshot(snapshot));
    }

    public deactivate() {
        this._svc.unsubscribe(this._subscriptionId);
    }

    public ngOnDestroy() {
        this.deactivate();
    }

    private consumeSnapshot(snapshot: ServerSnapshot) {

        this._snapshot = snapshot;

        //
        // Rps
        this._rpsValues.push(snapshot.requests.per_sec);

        if (this._rpsValues.length > this._length) {
            this._rpsValues.shift();
        }

        //
        // Active Requests
        this._activeRequestsValues.push(snapshot.requests.active);

        if (this._activeRequestsValues.length > this._length) {
            this._activeRequestsValues.shift();
        }

        //
        // Update graphs
        if (this._rpsChart && this._rpsChart.chart) {
            this._rpsChart.chart.update();
        }
    }
}
