
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {Logging} from './logging'


@Component({
    selector: 'rollover',
    template: `
        <fieldset>
            <label>日志截断周期</label>
            <enum [(model)]="model.period" (modelChanged)="onModelChanged()">
                <field name="小时" value="hourly"></field>
                <field name="天" value="daily"></field>
                <field name="周" value="weekly"></field>
                <field name="月" value="monthly"></field>
            </enum>
            <fieldset class="inline-block">
                <checkbox2 [(model)]="!model.use_local_time" (modelChanged)="onModelChanged()">美国时间</checkbox2>
            </fieldset>
        </fieldset>
        <fieldset>
            <label>当日志大小超过以下大小时截断日志 <span class="units">(KB)</span></label>
            <input [(ngModel)]="rollover_truncate_size" (modelChanged)="updateTruncateSize()" throttle type="number" class="form-control" min="1" step="1" required />
        </fieldset>
    `
})
export class RolloverComponent implements OnInit {
    @Input() model: any;
    @Output() modelChange: any = new EventEmitter();

    rollover_truncate_size: number;

    ngOnInit() {
        this.rollover_truncate_size = (this.model.truncate_size / 1000) | 0;
    }

    onModelChanged() {
        this.modelChange.emit(this.model);
    }

    updateTruncateSize() {
        this.model.truncate_size = this.rollover_truncate_size * 1000;
        this.onModelChanged();
    }
}
