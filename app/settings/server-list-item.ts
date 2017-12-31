import { Component, OnInit, OnDestroy, Output, Input, Inject, ViewChild, ElementRef, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../common/selector';
import { ApiConnection } from '../connect/api-connection';
import { ConnectService } from '../connect/connect.service';
import { NotificationService } from '../notification/notification.service';

@Component({
    selector: 'server',
    template: `
        <div *ngIf="model" class="grid-item row" [class.background-editing]="_editing" (dblclick)="onDblClick($event)">
            <div *ngIf="!_editing" class="actions">
                <div class="selector-wrapper">
                    <button title="More" (click)="openSelector($event)" (dblclick)="prevent($event)" [class.background-active]="(_selector && _selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="go" title="Connect" (click)="onConnect()">连接</button></li>
                            <li><button class="edit" title="Edit" (click)="onEdit()">编辑</button></li>
                            <li><button class="delete" title="Delete" (click)="onDelete()">删除</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <div class="actions" *ngIf="_editing">
                <button class="no-border ok" title="Ok" [disabled]="!isValid || null" (click)="onSave()"></button>
                <button class="no-border cancel" title="Cancel" (click)="onCancel()"></button>
            </div>
            <div *ngIf="!_editing">
                <div class="col-xs-10 col-sm-4 v-align">
                    <a title="Connect" href="#" class="color-normal hover-color-active" [class.active]="_active === model" (click)="onConnect($event)">{{connName()}}</a>
                </div>     
                <div class="hidden-xs col-sm-6 v-align">
                    {{model.url}}
                </div>
            </div>
            <div *ngIf="_editing" class="name">
                <fieldset>
                    <label>显示名字</label>
                    <input type="text" class="form-control block" [(ngModel)]="model.displayName"/>
                </fieldset>
                <fieldset>
                    <label class="inline-block">服务URL</label>
                    <tooltip>
                           IIS服务器的URL，默认端口是 55539.
                    </tooltip>
                    <input type="text" placeholder="ex. contoso.com" class="form-control block" #urlField [ngModel]="model.url" (ngModelChange)="setUrl($event)" required throttle/>
                </fieldset>
                <fieldset>
                    <label class="inline-block">访问Token</label>
                    <tooltip>
                       Token是访问IIS管理的凭据
                    </tooltip>
                    <input type="text" autocomplete="off" #tokenField
                        class="form-control block"
                        [ngModel]="''"
                        (ngModelChange)="setAccessToken($event)"
                        [attr.placeholder]="!model.accessToken ? null : '******************************'" 
                        [attr.required]="!model.accessToken || null"/>
                    <a class="right" [attr.disabled]="!tokenLink() ? true : null" (click)="gotoAccessToken($event)" [attr.href]="tokenLink()">快速获取Token</a>
                </fieldset>
                <fieldset>
                    <checkbox2 [(model)]="model.persist"><b>记住这个IIS</b></checkbox2>
                    <tooltip>
                        请在自己信任的主机上选择记住，平均默认会保存在本地
                    </tooltip>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        a {
            display: inline;
            background: transparent;
        }

        .row {
            margin: 0px;
        }

        .v-align {
            padding-top: 6px;
        }

        .selector-wrapper {
            position: relative;
        }

        selector {
            position:absolute;
            right:0;
            top: 32px;
        }

        selector button {
            min-width: 125px;
            width: 100%;
        }
        
        .name {
            padding: 0 15px;
        }

        tooltip {
            margin-left: 5px;
        }

        a.active {
            font-weight: bold;            
        }
    `]
})
export class ServerListItem implements OnInit, OnDestroy {
    @Input() public model: ApiConnection;
    @Output() public leave: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;
    private _original: ApiConnection;
    private _active: ApiConnection;
    private _new: boolean;
    @ViewChild(Selector) private _selector: Selector;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _svc: ConnectService, private _notificationService: NotificationService) {
        this._subscriptions.push(_svc.active.subscribe(con => {
            this._active = con;
        }));
    }

    public ngOnInit() {
        if (!this.model.accessToken) {
            this._new = true;
            this.onEdit();
        }
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private prevent(e: Event) {
        e.preventDefault();
    }

    private openSelector(e: Event) {
        this._selector.toggle();
    }

    private onEdit() {
        if (this._selector) {
            this._selector.close();
        }

        this._original = this.model;
        this.model = ApiConnection.clone(this.model);
        this._editing = true;
    }

    private onDblClick(e: Event) {
        if (e.defaultPrevented) {
            return;
        }

        if (!this._editing) {
            this.onConnect();
        }
    }

    private onConnect(e: Event = null) {
        if (e) {
            e.preventDefault();
        }

        this._svc.connect(this.model);
    }

    private onDelete() {
        this._notificationService.confirm("删除服务器", "你确定要删除这个服务器: " + this.model.displayName)
            .then(result => result && this._svc.delete(this.model));
    }

    private onCancel() {
        this.discardChanges();
        this._editing = false;
        this.leave.next();
    }

    private onSave() {
        if (!this.model.displayName) {
            this.model.displayName = this.model.hostname();
        }

        this._svc.save(this.model);
        this._editing = false;
        this.model = this._original;
        this._original = null;
        this.leave.next();
    }

    private tokenLink() {
        if (this.model.url) {
            return this.model.url + "/security/tokens";
        }

        return null;
    }

    private connName(): string {
        return this.model.displayName || this.model.hostname();
    }

    private setAccessToken(value: string) {
        this.model.accessToken = value;
    }

    private setUrl(url: string) {
        this.model.url = "";

        if (this.model.displayName == 'Local IIS') {
            this.model.displayName = url;
        }

        setTimeout(_ => {
            this.model.url = url;
        });
    }

    private gotoAccessToken(evt) {
        evt.preventDefault();
        window.open(this.tokenLink());
    }

    private get isValid(): boolean {
        return !!this.model.url && !!this.model.accessToken;
    }

    private discardChanges() {
        this.model = this._original;
    }
}
