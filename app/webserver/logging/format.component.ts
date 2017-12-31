
import {Component, Input, Output, EventEmitter} from '@angular/core';

import {Logging} from './logging'


@Component({
    selector: 'format',
    template: `
        <fieldset>
            <label>格式</label>
            <enum [disabled]="!model.log_per_site && model.website" [(model)]="model.log_file_format" (modelChanged)="onModelChanged()">
                <field name="W3C" value="w3c"></field>
                <field [hidden]="!model.log_per_site" name="NCSA" value="ncsa"></field>
                <field [hidden]="!model.log_per_site" name="IIS" value="iis"></field>
                <field [hidden]="!model.log_per_site" name="自定义" value="custom"></field>
                <field [hidden]="model.log_per_site"  name="二进制" value="binary"></field>
            </enum>
        </fieldset>

        <fieldset *ngIf="model.log_per_site && model.log_file_format == 'w3c' && model.log_target" class="flags">
            <label>日志写位置</label>
            <checkbox2 [(model)]="model.log_target.file" (modelChanged)="onModelChanged()">日志文件</checkbox2>
            <checkbox2 [(model)]="model.log_target.etw" (modelChanged)="onModelChanged()">写入Windows事件日志</checkbox2>
        </fieldset>

        <fieldset>
            <label>编码</label>
            <enum [disabled]="model.website" [(model)]="model.log_file_encoding" (modelChanged)="onModelChanged()">
                <field name="UTF-8" value="utf-8"></field>
                <field name="ANSI" value="ansi"></field>
            </enum>
        </fieldset>
    `
})
export class FormatComponent {
    @Input() model: Logging;
    @Input() 
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}
