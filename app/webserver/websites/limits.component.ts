
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgModel} from '@angular/forms';

import {UInt32} from '../../common/primitives';
import {Limits} from './site';


@Component({
    selector: 'limits',
    template: `
        <fieldset>
            <label>连接超时时间 <span class="units">(秒)</span></label>
            <input class="form-control" type="number" required [(ngModel)]="model.connection_timeout" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>网络连接限制</label>
                <switch class="block" [model]="hasBandwidthLimit()" (modelChange)="onBandwidth($event)">{{hasBandwidthLimit() ? "启用" : "禁用"}}</switch>
            </fieldset>
            <fieldset *ngIf="hasBandwidthLimit()" class="inline-block">
                <label>带宽 <span class="units">(字节/秒)</span></label>
                <input class="form-control" type="number" required [(ngModel)]="model.max_bandwidth" (modelChanged)="onModelChanged()" throttle />
            </fieldset>
        </div>
        <div>
            <fieldset class="inline-block">
                <label>客户端连接</label>
                <switch class="block" [model]="hasConnectionsLimit()" (modelChange)="onConnectionsLimit($event)">{{hasConnectionsLimit() ? "启用" : "禁用"}}</switch>
            </fieldset>

            <fieldset *ngIf="hasConnectionsLimit()" class="inline-block">
                <label>最大连接数</label>
                <input class="form-control" type="number" required [(ngModel)]="model.max_connections" (modelChanged)="onModelChanged()" throttle />
            </fieldset>
        </div>
        <fieldset>
            <label>最大URL</label>
            <input class="form-control" type="number" required [(ngModel)]="model.max_url_segments" (modelChanged)="onModelChanged()" throttle/>
        </fieldset>
    `,
    styles: [`
    `
    ]
})
export class LimitsComponent {
    @Input() model: Limits;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onBandwidth(value: boolean) {
        if (!value) {
            this.model.max_bandwidth = UInt32.Max;
        }
        else {
            this.model.max_bandwidth = 10 * 1000 * 1024; // 10MB/s
        }

        this.onModelChanged();
    }

    onConnectionsLimit(value: boolean) {
        if (!value) {
            this.model.max_connections = UInt32.Max;
        }
        else {
            this.model.max_connections = 1000000;
        }

        this.onModelChanged();
    }

    hasBandwidthLimit(): boolean {
        return this.model.max_bandwidth < UInt32.Max;
    }

    hasConnectionsLimit(): boolean {
        return this.model.max_connections < UInt32.Max;
    }
}
