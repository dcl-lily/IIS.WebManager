import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';

import { FilesService } from './files.service';
import { Location } from './location';

@Component({
    selector: 'edit-location',
    template: `
        <div>
            <fieldset class="name">
                <label>别名</label>
                <input [(ngModel)]="model.alias" class="form-control" type="text" autofocus>
            </fieldset>
            <fieldset class="path">
                <label>物理路径</label>
                <input [(ngModel)]="model.path" class="form-control" type="text">
            </fieldset>
            <fieldset>
                <label>权限</label>
                <div class="flags">
                    <checkbox2 [(model)]="_read">读</checkbox2>
                    <checkbox2 [(model)]="_write">写</checkbox2>
                </div>
            </fieldset>
            <p class="pull-right">
                <button class="ok" (click)="onOk()">{{model.id ? '确认' : '创建'}}</button>
                <button class="cancel" (click)="cancel.next()">取消</button>
            </p>
        </div>
    `
})
export class LocationEditComponent implements OnInit {

    private _read: boolean;
    private _write: boolean;

    @Input() public model: Location;

    @Output() public cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() public save: EventEmitter<any> = new EventEmitter<any>();

    constructor(@Inject("FilesService") private _svc: FilesService) {
    }

    public ngOnInit() {
        this._read = !!(this.model.claims && this.model.claims.find(c => c == "read"));
        this._write = !!(this.model.claims && this.model.claims.find(c => c == "write"));
    }

    private onOk() {

        if (this.model.alias) {

            this.model.claims = [];

            if (this._read) {
                this.model.claims.push("read");
            }

            if (this._write) {
                this.model.claims.push("write");
            }

            if (this.model.id) {
                this._svc.updateLocation(this.model, this.model);
            }

            this.save.next();
        }
    }
}
