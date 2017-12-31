
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {ApplicationPool, ProcessModel, ProcessOrphaning} from './app-pool';



@Component({
    selector: 'process-model',
    template: `
        <fieldset>
            <label>进程位数</label>
            <enum [(model)]="model.enable_32bit_win64" (modelChanged)="onModelChanged()">
                <field name="32 bit" value="true"></field>
                <field name="64 bit" value="false"></field>
            </enum>
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>Web Garden</label>
                <switch class="block" [model]="model.process_model.max_processes > 1" (modelChange)="onWebGarden($event)">
                    {{model.process_model.max_processes > 1 ? "启用" : "禁用"}}
                </switch>
            </fieldset>
            <fieldset class="inline-block" *ngIf="model.process_model.max_processes > 1">
                <label>最大进程</label>
                <div class="validation-container">
                    <input class="form-control" type="number" [(ngModel)]="model.process_model.max_processes" throttle (modelChanged)="onModelChanged()" />
                </div>
            </fieldset>
        </div>
        <div>
            <fieldset class="inline-block">
                <label>超时时间<span class="units">(min)</span></label>
                <div class="validation-container">
                    <input class="form-control" type="number" [(ngModel)]="model.process_model.idle_timeout" throttle (modelChanged)="onModelChanged()" />
                </div>
            </fieldset>
            <fieldset class="inline-block" *ngIf='model.process_model.idle_timeout_action'>
                <label>活跃时间</label>
                <enum [(model)]="model.process_model.idle_timeout_action" (modelChanged)="onModelChanged()">
                    <field name="结束" value="Terminate"></field>
                    <field name="延迟" value="Suspend"></field>
                </enum>
            </fieldset>
        </div>
        <fieldset>
            <label>启用时间 <span class="units">(s)</span></label>
            <div class="validation-container">
                <input class="form-control" type="number" [(ngModel)]="model.process_model.startup_time_limit" throttle (modelChanged)="onModelChanged()" />
            </div>
        </fieldset>
        <fieldset>
            <label>停止时间<span class="units">(s)</span></label>
            <div class="validation-container">
                <input class="form-control" type="number" [(ngModel)]="model.process_model.shutdown_time_limit" throttle (modelChanged)="onModelChanged()" />
            </div>
        </fieldset>
        <div>
            <fieldset class="inline-block">
                <label>健康监控</label>
                <switch class="block" [(model)]="model.process_model.pinging_enabled" (modelChanged)="onModelChanged()">
                    {{model.process_model.pinging_enabled ? "启用" : "禁用"}}
                </switch>
            </fieldset>
            <div *ngIf="model.process_model.pinging_enabled" class="inline-block">
                <fieldset class="inline-block">
                    <label>Ping检查监控<span class="units">(s)</span></label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="model.process_model.ping_interval" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
                <fieldset class="inline-block">
                    <label>最大的相应时间<span class="units">(s)</span></label>
                    <div class="validation-container">
                        <input class="form-control" type="number" [(ngModel)]="model.process_model.ping_response_time" throttle (modelChanged)="onModelChanged()" />
                    </div>
                </fieldset>
            </div>
        </div>
    `
})
export class ProcessModelComponent {
    @Input()
    model: ApplicationPool;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onWebGarden(value: boolean) {
        if (!value) {
            this.model.process_model.max_processes = 1;
        }
        else {
            this.model.process_model.max_processes = 2;
        }

        this.onModelChanged();
    }
}


@Component({
    selector: 'process-orphaning',
    template: `            
        <fieldset>
            <label>独立进程</label>
            <switch class="block" [(model)]="model.enabled" (modelChanged)="onModelChanged()">
                {{model.enabled ? "启用" : "停用"}}
            </switch>
        </fieldset>
        <div *ngIf="model.enabled">
            <fieldset>
                <label>启用路径</label>
                <input class="form-control path" type="text" [(ngModel)]="model.orphan_action_exe" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <fieldset>
                <label>启用参数</label>
                <input class="form-control path" type="text" [(ngModel)]="model.orphan_action_params" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
        </div>
    `
})
export class ProcessOrphaningComponent {
    @Input()
    model: ProcessOrphaning;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }
}
