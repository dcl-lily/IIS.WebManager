
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {RapidFailProtection, LoadBalancerCapabilities} from './app-pool';


@Component({
    selector: 'rapid-fail-protection',
    template: `            
        <div>
            <fieldset>
                <switch class="block" [(model)]="model.enabled" (modelChanged)="onModelChanged()">
                    {{model.enabled ? "是" : "否"}}
                </switch>
            </fieldset>
        </div>
        <div *ngIf="model.enabled">
            <fieldset class='inline-block'>
                <label>最大崩溃数</label>
                <input class="form-control" type="number" [(ngModel)]="model.max_crashes" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <fieldset class='inline-block'>
                <label>复位后<span class="units">(min)</span></label>
                <input class="form-control" type="number" [(ngModel)]="model.interval" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <fieldset>
                <label>恢复动作</label>
                <enum [(model)]="model.load_balancer_capabilities" (modelChanged)="onModelChanged()">
                    <field name="服务不可用" value="HttpLevel"></field>
                    <field name="重置连接" value="TcpLevel"></field>
                </enum>
            </fieldset>
            <fieldset>
                <label>停止动作</label>
                <switch class="block" [model]="model.auto_shutdown_exe" (modelChange)="onAutoShutdownExe($event)">
                    {{model.auto_shutdown_exe ? "是" : "否"}}
                </switch>
            </fieldset>
            <div *ngIf='model.auto_shutdown_exe'>
                <fieldset>
                    <label>启动路径</label>
                    <input class="form-control path" type="text" [(ngModel)]="model.auto_shutdown_exe" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset>
                    <label>启动参数</label>
                    <input class="form-control path" type="text" [(ngModel)]="model.auto_shutdown_params" throttle (modelChanged)="onModelChanged()" />
                </fieldset>
            </div>
        </div>
    `
})
export class RapidFailProtectionComponent {
    @Input()
    model: RapidFailProtection;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onAutoShutdownExe(value: boolean) {
        if (!value) {
            this.model.auto_shutdown_exe = "";
            this.model.auto_shutdown_params = "";
        }
        else {
            this.model.auto_shutdown_exe = " ";
            this.model.auto_shutdown_params = " ";
        }

        this.onModelChanged();
    }
}
