import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { DirectoryBrowsingService } from './directory-browsing.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
    template: `
        <loading *ngIf="_service.status == 'unknown' && !_service.error"></loading>
        <error [error]="_service.error"></error>
        <switch class="install" *ngIf="_service.webserverScope && _service.status != 'unknown'" #s
                [auto]="false"
                [model]="_service.status == 'started' || _service.status == 'starting'" 
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'"
                (modelChanged)="install(!s.model)">
                    <span *ngIf="!isPending()">{{s.model ? "启用" : "禁用"}}</span>
                    <span *ngIf="isPending()" class="loading"></span>
        </switch>
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">不允许目录浏览. 如需打开请点击 <a [routerLink]="['/webserver/directory-browsing']">这里</a></span>
        <override-mode class="pull-right" *ngIf="feature" [scope]="feature.scope" [metadata]="feature.metadata" (revert)="onRevert()" (modelChanged)="onModelChanged()"></override-mode>
        <div *ngIf="feature">
            <fieldset>
                <label *ngIf="!feature.scope">默认站点</label>
                <switch class="block" [disabled]="_locked" [(model)]="feature.enabled" (modelChanged)="onModelChanged()">{{feature.enabled ? "启用" : "禁用"}}</switch>
            </fieldset>
            <div [hidden]="!feature.enabled && feature.scope">
                <fieldset>
                    <label>目录属性</label>
                    <ul class="allowed-attributes">
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.date" (modelChanged)="onModelChanged()">日期</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.time" (modelChanged)="onModelChanged()">时间</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.size" (modelChanged)="onModelChanged()">大小</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.extension" (modelChanged)="onModelChanged()">扩展</checkbox2>
                        </li>
                        <li class="checkbox">
                            <checkbox2 [disabled]="_locked" [(model)]="feature.allowed_attributes.long_date" (modelChanged)="onModelChanged()">长日期</checkbox2>
                        </li>
                    </ul>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .allowed-attributes li {
            padding:10px;
            padding-left: 0px;
            position:relative;
        }
    `]
})
export class DirectoryBrowsingComponent implements OnInit, OnDestroy {
    id: string;
    feature: any;

    private _locked: boolean;
    private _original: any;
    private _error: any;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: DirectoryBrowsingService,
                private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.directoryBrowsing.subscribe(feature => {
            this.setFeature(feature);
        }));
        this._service.init(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private onModelChanged() {
        var changes = DiffUtil.diff(this._original, this.feature);
        if (Object.keys(changes).length > 0) {
            this._service.update(changes);
        }
    }

    private onRevert() {
        this._service.revert();
    }

    private setFeature(feature) {
        if (feature) {
            this._locked = feature.metadata.is_locked ? true : null;
        }

        this.feature = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    private install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("关闭目录浏览", '你确认要关闭这个服务器的目录浏览功能?.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
