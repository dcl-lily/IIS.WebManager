import { Component, OnInit } from '@angular/core';

import { Status } from '../../common/status';
import { NotificationService } from '../../notification/notification.service';
import { UrlRewriteService } from './service/url-rewrite.service';

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
        <span *ngIf="_service.status == 'stopped' && !_service.webserverScope">URL地址重写模块没有安装. 如需要安装请点击 <a [routerLink]="['/webserver/url-rewrite']">这里</a></span>
        <div *ngIf="_service.status == 'started'">
            <tabs>
                <tab [name]="'入站规则'">
                    <inbound-rules></inbound-rules>
                </tab>
                <tab [name]="'出战规则'">
                    <outbound-rules></outbound-rules>
                </tab>
                <tab [name]="'服务器变量'">
                    <server-variables></server-variables>
                </tab>
                <tab [name]="'重写地图'">
                    <rewrite-maps></rewrite-maps>
                </tab>
                <tab [name]="'供应商'">
                    <providers></providers>
                </tab>
            </tabs>
        </div>
    `,
    styles: [`
        .install {
            margin-bottom: 45px;
        }
    `]
})
export class UrlRewriteComponent implements OnInit {
    public id: string;

    constructor(private _service: UrlRewriteService,
        private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._service.initialize(this.id);
    }

    private isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }

    public install(val: boolean) {
        if (val) {
            return this._service.install();
        }
        else {
            this._notificationService.confirm("卸载URL重写模块", '你将卸载服务器的URL地址重写模块.')
                .then(confirmed => {
                    if (confirmed) {
                        this._service.uninstall();
                    }
                });
        }
    }
}
