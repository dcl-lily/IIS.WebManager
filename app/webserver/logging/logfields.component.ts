
import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';

import {Logging, LogFelds, CustomLogField, CustomLogFieldSourceType} from './logging'



@Component({
    selector: 'logfields',
    template: `
        <div class="row flags">
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.date" (modelChanged)="onModelChanged()">日期</checkbox2>
                <checkbox2 [(model)]="model.time" (modelChanged)="onModelChanged()">时间</checkbox2>
                <checkbox2 [(model)]="model.time_taken" (modelChanged)="onModelChanged()">执行时间</checkbox2>
            </div>
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.method" (modelChanged)="onModelChanged()">HTTP方法</checkbox2>
                <checkbox2 [(model)]="model.http_status" (modelChanged)="onModelChanged()">HTTP状态</checkbox2>
                <checkbox2 [(model)]="model.http_sub_status" (modelChanged)="onModelChanged()">HTTP子状态</checkbox2>
                <checkbox2 [(model)]="model.win_32_status" (modelChanged)="onModelChanged()">Win32状态</checkbox2>
                <checkbox2 [(model)]="model.uri_stem" (modelChanged)="onModelChanged()">源URI</checkbox2>
                <checkbox2 [(model)]="model.uri_query" (modelChanged)="onModelChanged()">URI查询</checkbox2>
                <checkbox2 [(model)]="model.referer" (modelChanged)="onModelChanged()">刷新</checkbox2>
                <checkbox2 [(model)]="model.cookie" (modelChanged)="onModelChanged()">Cookies</checkbox2>
                <checkbox2 [(model)]="model.protocol_version" (modelChanged)="onModelChanged()">协议版本</checkbox2>
                <checkbox2 [(model)]="model.bytes_sent" (modelChanged)="onModelChanged()">发送字节数</checkbox2>
                <checkbox2 [(model)]="model.bytes_recv" (modelChanged)="onModelChanged()">接受字节数</checkbox2>
            </div>
            <div class="col-lg-2 col-md-4">
                <checkbox2 [(model)]="model.client_ip" (modelChanged)="onModelChanged()">客户端地址</checkbox2>
                <checkbox2 [(model)]="model.username" (modelChanged)="onModelChanged()">用户名</checkbox2>
                <checkbox2 [(model)]="model.user_agent" (modelChanged)="onModelChanged()">用户代理</checkbox2>
                <checkbox2 [(model)]="model.server_ip" (modelChanged)="onModelChanged()">服务器地址</checkbox2>
                <checkbox2 [(model)]="model.server_port" (modelChanged)="onModelChanged()">服务器端口</checkbox2>
                <checkbox2 [(model)]="model.host" (modelChanged)="onModelChanged()">主机名</checkbox2>
                <checkbox2 [(model)]="model.site_name" (modelChanged)="onModelChanged()">站点名</checkbox2>
                <checkbox2 [(model)]="model.computer_name" (modelChanged)="onModelChanged()">服务器名称</checkbox2>
            </div>
        </div>
    `,
    styles: [`
    `]
})
export class LogFieldsComponent {
    @Input() model: LogFelds;
    @Output() modelChange: any = new EventEmitter();

    onModelChanged() {
        this.modelChange.emit(this.model);
    }
}




@Component({
    selector: 'customfields',
    template: `
    <button class="create" [class.inactive]="_editing != -1" (click)="add()"><i class="fa fa-plus color-active"></i>添加自定义字段</button>
    

    <div class="row hidden-xs border-active grid-list-header" [hidden]="fields.length == 0">
        <label class="col-sm-3 col-lg-2">读位置</label>
        <label class="col-sm-3 col-lg-4">字段名称</label>
        <label class="col-sm-6">日志</label>
    </div>
    <ul class="grid-list">
        <li *ngFor="let field of fields; let i = index;" class="row border-color grid-item" [class.background-editing]="i === _editing">
            <div class="actions">
                <button class="no-border no-editing" title="编辑" [class.inactive]="_editing != -1" (click)="edit(i)" >
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button [disabled]="!isValidCustomField(field)" class="no-border editing" title="确认" (click)="save(i)">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="取消" (click)="discardChanges(i)">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" title="Delete" *ngIf="!field.isNew" [class.inactive]="_editing !== -1 && _editing !== i" (click)="delete(i)">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>
            <div class="col-xs-8 col-sm-3 col-lg-2">
                <fieldset>
                    <label class="visible-xs">读取来源</label>
                    <label *ngIf="i === _editing" class="hidden-xs">读物来源</label>
                    <span *ngIf="i !== _editing">{{sourceTypeName(field.source_type)}}</span>
                    <select *ngIf="i === _editing" [(ngModel)]="field.source_type" class="form-control">
                        <option value="request_header">请求头部信息</option>
                        <option value="response_header">响应头部信息</option>
                        <option value="server_variable">服务器变量</option>
                    </select>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
                </div>
            </div>
            <div class="col-xs-12 col-sm-3 col-lg-4">
                <fieldset>
                    <label class="visible-xs">字段名称</label>
                    <label *ngIf="i === _editing" class="hidden-xs">字段名称</label>
                    <span *ngIf="i !== _editing">{{field.source_name}}</span>
                    <input *ngIf="i === _editing" [(ngModel)]="field.source_name" throttle class="form-control" type="text" required/>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
                </div>
            </div>
            <div class="col-xs-12 col-sm-3 col-md-4">
                <fieldset>
                    <label class="visible-xs">日志</label>
                    <label *ngIf="i === _editing" class="hidden-xs">日志</label>
                    <span *ngIf="i !== _editing">{{field.field_name}}</span>
                    <input *ngIf="i === _editing" required [(ngModel)]="field.field_name" throttle class="form-control" type="text" required/>
                </fieldset>
                <div *ngIf="i !== _editing">
                    <br class="visible-xs" />
                </div>
            </div>
        </li>
    </ul>
   `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
    `]
})
export class CustomFieldsComponent implements OnInit {
    @Input() model: Array<CustomLogField>;
    @Output() modelChange: any = new EventEmitter();

    fields: Array<CustomLogField>;
    originalFields: Array<CustomLogField>;
    _editing: number;

    ngOnInit() {
        this.reset();
    }

    onModelChanged() {
        this.fields = this.fields.filter((f) => {
            return this.isValidCustomField(f);
        });

        this.model = this.fields;
        this.modelChange.emit(this.model);

        this.reset();
    }

    onChanged(index: number) {

        let field = this.fields[index];

        var logAsSpecified = !!field.field_name;

        if (field.source_name && !logAsSpecified) {
            field.field_name = field.source_name;
        }

        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    }

    add() {

        if (this._editing >= 0) {
            this.discardChanges(this._editing);
        }

        let field = new CustomLogField();
        field.field_name = field.source_name = null;
        (<any>field).isNew = true;

        this.fields.splice(0, 0, field);

        this._editing = 0;
    }

    delete(index: number) {
        var field = this.fields[index];
        this.fields.splice(index, 1);
        this.originalFields.splice(index, 1);

        this._editing = -1;

        if (this.isValidCustomField(field)) {
            this.onModelChanged();
        }
    }

    edit(index: number) {
        let editField = this.fields[index];
        
        if (editField) {
            this.discardChanges(index);
        }

        this._editing = index;
    }

    save(index: number) {

        let field = this.fields[index];

        if (!this.isValidCustomField(field)) {
            return;
        }

        if (this.originalFields.length < this.fields.length) {
            // Add newly created field
            let copy = JSON.parse(JSON.stringify(field));
            this.originalFields.splice(copy, 0, field);
        }

        this._editing = -1;
        (<any>field).isNew = false;
        this.onModelChanged();
    }

    discardChanges(index: number) {
        
        if (this.originalFields.length < this.fields.length) {
            this.fields.splice(index, 1);
        }
        else {
            this.fields[index] = JSON.parse(JSON.stringify(this.originalFields[index]));
        }

        this._editing = -1;
    }

    sourceTypeName(sourceType: CustomLogFieldSourceType) {
        switch (sourceType) {
            case CustomLogFieldSourceType.RequestHeader:
                return "请求头部信息";
            case CustomLogFieldSourceType.ResponseHeader:
                return "响应头部信息";
            case CustomLogFieldSourceType.ServerVariable:
                return "服务器变量";
            default:
                return "位置";
        }
    }

    private reset() {
        this.fields = this.model.slice(0);
        this.originalFields = this.model.slice(0);
        this._editing = -1;
    }

    private isValidCustomField(field: CustomLogField): boolean {
        return !!field.source_type && !!field.source_name && !!field.field_name;
    }
}
