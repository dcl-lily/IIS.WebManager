import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

import {ClientCache} from './static-content'

@Component({
    selector: 'client-cache',
    template: `
        <fieldset>
            <label>E标签</label>
            <switch class="block" [disabled]="locked" [(model)]="model.set_e_tag" (modelChanged)="onModelChanged()">{{model.set_e_tag ? "启用" : "禁用"}}</switch>
        </fieldset>
        <fieldset>
            <label>缓存控制</label>
            <enum [disabled]="locked" [(model)]="model.control_mode" (modelChanged)="onModelChanged()">
                <field name="不设置" value="no_control"></field>
                <field name="禁用" value="disable_cache"></field>
                <field name="最大" value="use_max_age"></field>
                <field name="有效期" value="use_expires"></field>
            </enum>
        </fieldset>
        <fieldset [hidden]="model.control_mode !== 'use_max_age'">
            <label>最大 <span class="units"> (分钟)</span></label>
            <input class="form-control" type="number" [disabled]="locked" [(ngModel)]="model.max_age" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <fieldset [hidden]="model.control_mode !== 'use_expires'">
            <label>有效期时间</label>
            <input class="form-control path" type="text" [disabled]="locked" [(ngModel)]="model.http_expires" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
        <fieldset class="inline-block pull-left">
            <label>自定义缓存控制</label>
            <switch [(model)]="_useCustom" (modelChanged)="onCustom()">{{_useCustom ? "启用" : "禁用"}}</switch>
        </fieldset>
        <fieldset *ngIf="_useCustom" class="fill">
            <label>&nbsp;</label>
            <input class="form-control name" type="text" [disabled]="locked" [(ngModel)]="model.control_custom" (modelChanged)="onModelChanged()" throttle />
        </fieldset>
    `,
    styles: [`
        .name {
            min-width: 200px;
        }
    `]
})
export class ClientCacheComponent implements OnInit {
    @Input() model: ClientCache;
    @Input() locked: boolean;

    @Output() modelChange: any = new EventEmitter();

    private _useCustom: boolean;
    private _cacheCustom: string;

    public ngOnInit() {
        this._useCustom = !!this.model.control_custom;
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    private onCustom() {
        if (!this._useCustom) {
            this._cacheCustom = this.model.control_custom;
            this.model.control_custom = "";
            this.onModelChanged();
        }
    }
}
