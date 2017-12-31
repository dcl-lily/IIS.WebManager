﻿
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Cpu, ProcessorAction} from './app-pool';


@Component({
    selector: 'cpu',
    template: `            
        <fieldset>
            <label>CPU限制</label>
            <switch class="block" [model]="model.limit != 0" (modelChange)="onLimitCpu($event)">
                {{model.limit != 0 ? "启用" : "停用"}}
            </switch>
        </fieldset>

        <div *ngIf="model.limit != 0">
            <fieldset class='inline-block'>
                <label>CPU利用率%</label>
                <input class="form-control" type="number" [ngModel]="model.limit / 1000" (ngModelChange)="onCpuLimit($event)" min="1" max="100" step="any" required throttle />
            </fieldset>
            <fieldset class='inline-block' *ngIf="!isThrottled()">
                <label>Interval <span class="units">(min)</span></label>
                <input class="form-control" type="number" [(ngModel)]="model.limit_interval" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>

        <div *ngIf="model.limit != 0">
            <fieldset class='inline-block'>
                <label>CPU节能</label>
                <switch class="block" [model]="isThrottled()" (modelChange)="onThrottled($event)">
                    {{isThrottled() ? "启用" : "停止"}}
                </switch>
            </fieldset>

            <fieldset class='inline-block' *ngIf='isThrottled()'>
                <label>在负载</label>
                <switch class="block" [model]="model.action == 'ThrottleUnderLoad'" (modelChange)="onThrottleUnderLoad($event)">
                    {{model.action == 'ThrottleUnderLoad' ? "启用" : "停用"}}
                </switch>
            </fieldset>

            <fieldset>
                <label>杀掉W3WP进程</label>
                <switch class="block" [model]="model.action == 'KillW3wp'" (modelChange)="onKillProcess($event)">
                    {{model.action == 'KillW3wp' ? "是" : "否"}}
                </switch>
            </fieldset>
        </div>

        <fieldset class='inline-block'>
            <label>CPU亲和力</label>
            <switch class="block" [(model)]="model.processor_affinity_enabled" (modelChanged)="onModelChanged()">
                {{model.processor_affinity_enabled ? "是" : "否"}}
            </switch>
        </fieldset>
        <div *ngIf="model.processor_affinity_enabled" class='inline-block'>
            <fieldset class='inline-block'>
                <label>32位亲和力</label>
                <input class="form-control" type="text" [(ngModel)]="model.processor_affinity_mask32" (modelChanged)="onModelChanged()" required pattern="0[xX][0-9a-fA-F]+" throttle />
            </fieldset>
            <fieldset class='inline-block'>
                <label>64位亲和力</label>
                <input class="form-control" type="text" [(ngModel)]="model.processor_affinity_mask64" (modelChanged)="onModelChanged()" required pattern="0[xX][0-9a-fA-F]+" throttle />
            </fieldset>
        </div>
    `
})
export class CpuComponent {
    @Input()
    model: Cpu;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onLimitCpu(value: boolean) {
        if (value) {
            this.model.limit = 100000
        }
        else {
            this.model.limit = 0;
        }

        this.onModelChanged();
    }

    onThrottled(value: boolean) {
        if (value) {
            this.model.action = ProcessorAction.Throttle;
        }
        else {
            this.model.action = ProcessorAction.NoAction;
        }

        this.onModelChanged();
    }

    onThrottleUnderLoad(value: boolean) {
        if (value) {
            this.model.action = ProcessorAction.ThrottleUnderLoad;
        }
        else {
            this.model.action = ProcessorAction.Throttle;
        }

        this.onModelChanged();
    }

    onKillProcess(value: boolean) {
        if (value) {
            this.model.action = ProcessorAction.KillW3wp;
        }
        else {
            this.model.action = ProcessorAction.NoAction;
        }

        this.onModelChanged();
    }

    onCpuLimit(value: number) {
        if (value > 100 || value <= 0) {
            return;
        }

        this.model.limit = value * 1000;
        this.onModelChanged();
    }

    isThrottled(): boolean {
        return this.model.action == ProcessorAction.Throttle || this.model.action == ProcessorAction.ThrottleUnderLoad;
    }
}
