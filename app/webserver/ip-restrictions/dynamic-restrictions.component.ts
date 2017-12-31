
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {IpRestrictions} from './ip-restrictions'

@Component({
    selector: 'dynamic-restrictions',
    template: `
        <div class="block">
            <fieldset class="inline-block">
                <label>限制并发请求</label>
                <switch class="block" [(model)]="model.deny_by_concurrent_requests.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_concurrent_requests.enabled ? "启用" : "禁用"}}</switch>
            </fieldset>
            <fieldset class="inline-block" *ngIf="model.deny_by_concurrent_requests.enabled">
                <label>最大的连接数</label>
                <input class="form-control" type="number" required [(ngModel)]="model.deny_by_concurrent_requests.max_concurrent_requests" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>

        <div class="block">
            <fieldset class="inline-block">
                <label>限制请求速度</label>
                <switch class="block" [(model)]="model.deny_by_request_rate.enabled" (modelChanged)="onModelChanged()">{{model.deny_by_request_rate.enabled ? "启用" : "禁用"}}</switch>
            </fieldset>
            <fieldset class="inline-block">
                <fieldset class="inline-block" *ngIf="model.deny_by_request_rate.enabled">
                    <label>最大请求速度</label>
                    <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.max_requests" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset class="inline-block" *ngIf="model.deny_by_request_rate.enabled">
                    <label>时间间隔<span class="units"> (ms)</span></label>
                    <input class="form-control" type="number" required [(ngModel)]="model.deny_by_request_rate.time_period" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </fieldset>
        </div>

        <fieldset>
            <label>只记录拒绝日志</label>
            <switch class="block" [(model)]="model.logging_only_mode" (modelChanged)="onModelChanged()">{{model.logging_only_mode ? "启用" : "禁用"}}</switch>
        </fieldset>
    `,
    styles: [`
        .block > .inline-block:first-of-type {
            width: 250px;
        } 
    `]
})
export class DynamicRestrictionsComponent {
    @Input() model: IpRestrictions;
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}
