
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChange, ViewChildren, QueryList } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Vdir, LogonMethod } from './vdir';
import { VdirsService } from './vdirs.service';

import { NotificationService } from '../../notification/notification.service';
import { DiffUtil } from '../../utils/diff';
import { SortPipe } from '../../common/sort.pipe';
import { EqualValidator } from '../../common/validators';
import { NavigatorComponent } from '../websites/navigator.component';
import { ApiFile } from '../../files/file';

import { WebSite } from '../websites/site';
import { WebApp } from '../webapps/webapp';

@Component({
    selector: 'vdir',
    template: `
        <div *ngIf="model" class="row grid-item" [class.background-editing]="_editing">
            <div class="actions">
                <button class="no-border no-editing" title="编辑" [class.inactive]="readonly" (click)="onEdit()">
                    <i class="fa fa-pencil color-active"></i>
                </button>
                <button [disabled]="!isValid()" class="no-border editing" title="确认" (click)="onSave()">
                    <i class="fa fa-check color-active"></i>
                </button>
                <button class="no-border editing" title="取消" (click)="onCancel()">
                    <i class="fa fa-times red"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="删除" [class.inactive]="readonly" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>

            <div *ngIf="!_editing">
                <div class="col-xs-8 col-sm-4 col-lg-3" [class.v-align]="!model.identity.username">
                    <div class="name">
                        <span>{{model.path}}</span>
                        <small>{{model.identity.username}}</small>
                    </div>
                </div>
                <div class="col-xs-12 col-sm-4 v-align">
                    <span>{{model.physical_path}}</span>
                </div>
                <div *ngIf="model.website && model.webapp" class='hidden-xs col-sm-2 col-md-3 col-lg-4 overflow-visible'>
                    <div class="v-align hidden-xs"></div>
                    <navigator [model]="model.website.bindings" [path]="getNavPath()" [right]="true"></navigator>
                </div>
            </div>

            <div *ngIf="_editing">                
                <fieldset class="col-xs-8 col-sm-4 col-lg-3">
                    <label>Path</label>
                    <input class="form-control" type="text" (ngModelChange)="model.path=$event" [ngModel]="model.path" throttle required />
                </fieldset>
                <fieldset class="col-xs-12 overflow">
                    <label class="block">物理路径</label>
                    <button title="选择目录" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                    <div class="fill">
                        <input type="text" class="form-control block" [(ngModel)]="model.physical_path" throttle required />
                    </div>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="model.physical_path" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <div class="col-xs-12">
                    <fieldset>
                        <label>自定义身份</label>
                        <switch class="block" #customIdentity="switchVal" [model]="model.identity.username" (modelChange)="onUseCustomIdentity($event)">{{model.identity.username ? "启用" : "禁用"}}</switch>
                    </fieldset>
                    <div *ngIf="customIdentity.model">
                        <div class="row">
                            <fieldset class="col-sm-4 col-xs-12">
                                <label>用户名</label>
                                <input class="form-control" type="text" [(ngModel)]="model.identity.username" throttle />
                                <span>{{model.username}}</span>
                            </fieldset>
                        </div>
                        <div class="row">
                            <fieldset class="col-sm-4 col-xs-12">
                                <label>密码</label>
                                <input class="form-control" type="password" [(ngModel)]="_password" (modelChanged)="_confirm=''"/>
                            </fieldset>
                            <fieldset *ngIf="!!_password" class="col-sm-4 col-xs-12">
                                <label>再次确认密码</label>
                                <input class="form-control" type="password" [(ngModel)]="_confirm" (modelChanged)="onConfirmPassword" [validateEqual]="_password" />
                            </fieldset>
                        </div>
                        <fieldset>
                            <label>登陆方法</label>
                            <enum [(model)]="model.identity.logon_method">
                                <field name="明文登陆" value="network_cleartext"></field>
                                <field name="网络" value="network"></field>
                                <field name="交互式" value="interactive"></field>
                                <field name="批处理" value="batch"></field>
                            </enum>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }

        .grid-item:not(.background-editing) [class*="col-"] {
            padding-left: 0;
        }

        >>> [hidden] {
            display: none !important;
        }

        .name span:first-of-type {            
            font-size: 16px;
        }

        .name small {
            font-size: 12px;
        }

        div.h-align {
            min-height: 1px;
            display:inline-block;
        }

        .v-align {
            padding-top: 5px;
        }

        .overflow {
            overflow: visible !important;
        }
    `]
})
export class VdirListItem implements OnInit, OnChanges {
    @Input() model: Vdir;
    @Input() readonly: boolean;

    private _editing: boolean;
    private _editable: boolean = true;
    private _original: Vdir;

    // Password dialog
    private _password: string;
    private _confirm: string;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() leave: EventEmitter<any> = new EventEmitter();

    constructor(private _service: VdirsService) {
    }

    ngOnInit() {
        this.resetOriginal(this.model);

        if (!this.model.id) {
            this._editing = true;
        }
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.resetOriginal(this.model);
        }
    }

    private onSave() {
        let preExisting = !!this.model.id
        if (preExisting) {
            this._service.update(this.model)
                .then(vdir => {
                    this.resetOriginal(vdir);
                });
        }
        else {
            //
            // Create new
            if (!this.isValid()) {
                return;
            }
            this._service.create(this.model);
        }
        this._editing = false;
        this.leave.emit(this.model);
    }

    private onEdit() {
        this._editing = true;
        this.edit.emit(this.model);
    }

    private onDelete() {
        if (confirm("你确认要删除虚拟目录?\n路径: " + this.model.path.replace("/", "") + "?")) {
            this._service.delete(this.model);
        }
    }

    private onCancel() {
        if (this._editing) {
            this.discardChanges();
            this._editing = false;
        }
        this.leave.emit(this.model);
    }

    private onUseCustomIdentity(val: boolean) {
        if (val) {
            this.model.identity.username = this._original.identity.username;
        }
        else {
            this.model.identity.username = "";
            this.model.identity.password = "";
        }
    }

    private onConfirmPassword(value: string) {
        if (this._password == this._confirm) {
            this.model.identity.password = this._confirm;
        }
    }

    private discardChanges() {
        if (!this.model.id) {
            return;
        }

        let keys = Object.keys(this._original);
        for (var key of keys) {
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }
    }

    private isValid() {
        return this.model.path
            && this.model.physical_path
            && (this._password === this._confirm);
    }

    private resetOriginal(vdir) {
        this._original = JSON.parse(JSON.stringify(vdir));
    }

    private getNavPath() {
        var appPath = this.model.webapp.path;
        if (appPath === "/") {
            appPath = "";
        }
        return appPath + this.model.path;
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.model.physical_path = event[0].physical_path;
        }
    }
}


@Component({
    selector: 'vdir-list',
    template: `
        <button class="create" (click)="onCreate()"><i class="fa fa-plus color-active"></i><span>创建虚拟目录</span></button>
        <div class="container-fluid" [hidden]="!_vdirs || _vdirs.length < 1">
            <div class="row hidden-xs border-active grid-list-header">
                <label class="col-sm-4 col-lg-3" [ngClass]="sortStyle('path')" (click)="sort('path')">路径</label>
                <label class="col-sm-4 col-md-7" [ngClass]="sortStyle('physical_path')" (click)="sort('physical_path')">物理路径</label>
            </div>
        </div>
        <ul class="grid-list container-fluid" *ngIf="_vdirs">
            <li *ngIf="_new">
                <vdir [model]="_new" (leave)="onLeave()"></vdir>
            </li>
            <li *ngFor="let vdir of _vdirs | orderby: _orderBy: _orderByAsc; let i = index;">
                <vdir [model]="vdir" 
                      [readonly]="_editing && _editing != vdir"
                      (edit)="onEdit($event)"
                      (leave)="onLeave()"></vdir>
            </li>
        </ul>
    `,
    styles: [`
        [class*="col-"] {
            padding-left: 0;
        }
    `]
})
export class VdirListComponent implements OnInit {
    @Input() website: WebSite;
    @Input() webapp: WebApp;

    private _vdirs: Array<any>;
    private _new: Vdir;
    private _editing: Vdir = null;
    private _orderBy: string;
    private _orderByAsc: boolean;

    @ViewChildren(VdirListItem) vdirItems: QueryList<VdirListItem>;

    constructor(private _service: VdirsService,
                private _notificationService: NotificationService) {
        this.sort("path");
    }

    ngOnInit() {
        this.activate();
    }

    activate() {
        if (this._vdirs) {
            return;
        }
        if (this.website) {
            //
            // Load by WebSite
            this._service.getBySite(this.website).then(_ => {
                this._service.vdirs.subscribe(vdirs => {
                    this._vdirs = [];
                    vdirs.forEach(v => {
                        if (v.website.id == this.website.id
                            && !this.isRootVdir(v)
                            && !this.isNonSiteVdir(v)) {
                            this._vdirs.push(v);
                        }
                    });
                });
            });
        }
        if (this.webapp) {
            //
            // Load by WebApp
            this._service.getByApp(this.webapp).then(_ => {
                this._service.vdirs.subscribe(vdirs => {
                    this._vdirs = [];
                    vdirs.forEach(v => {
                        if (v.webapp.id == this.webapp.id && v.path != '/') {
                            this._vdirs.push(v);
                        }
                    });
                });
            });
        }
    }

    private onEdit(vdir: Vdir) {
        this._editing = vdir;
    }

    private onLeave() {
        this._new = null;
        this._editing = null;
    }

    private isRootVdir(vdir: Vdir) {
        return vdir.path === "/";
    }

    private isNonSiteVdir(vdir: Vdir) {
        return vdir.webapp.path !== "/";
    }

    private onCreate() {
        if (this._new) {
            return;
        }

        let newVdir = new Vdir();
        newVdir.physical_path = "";
        newVdir.path = "";
        newVdir.identity = {
            username: "",
            logon_method: LogonMethod.NetworkCleartext,
            password: ""
        };

        if (this.website) {
            newVdir.website = this.website;
        }
        else {
            newVdir.webapp = this.webapp;
        }
        this._new = newVdir;
        this._editing = this._new;
    }

    private sort(field: string) {
        this._orderByAsc = (field == this._orderBy) ? !this._orderByAsc : true;
        this._orderBy = field;
    }

    private sortStyle(field: string): any {
        if (this._orderBy == field) {
            return {
                "orderby": true,
                "desc": !this._orderByAsc
            };
        }

        return {};
    }
}
