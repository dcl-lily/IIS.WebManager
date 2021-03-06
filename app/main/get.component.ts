﻿declare var SETTINGS: any;

import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/toPromise';

import { ApiConnection } from '../connect/api-connection'
import { HttpConnection } from '../connect/httpconnection'
import { ConnectService } from '../connect/connect.service';


@Component({
    template: `
        <div class="center">
            <div *ngIf='!_inProgress'>
                <h1>欢迎使用IIS UI管理中文版</h1>
                <p>
                    开始管理你的IIS服务.
                    <br/>
                    <a href="https://blogs.iis.net/adminapi">更多帮助(英文)</a>
                    <br/>
                    <a href="https://www.qnjslm.com/?s=iis">关于我发表的一些博客</a>
                </p>
                <p>
                    <a class="bttn background-active" [attr.href]="DOWNLOAD_URL" (click)="download($event)">
                        下载IIS管理工具
                    </a>
                    <small class='block'>
                        最新Windows 64位版本 {{SETUP_VERSION}}
                    </small>
                </p>
            </div>
            <div *ngIf='_inProgress'>
                <h1>开始</h1>
                <p>
                    请保存文件，并进行安装.<br/>
                    安装可以参考我的博客文档https://www.qnjslm.com/ITHelp/629.html
                    <br/>
                    如果你是安装在本地的那么这个页面在安装完成后会自动跳转,否者请点击跳过.
                </p>
                <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
                <p><small class='block color-active'>{{_status}}</small></p>
            </div>
            <div class="skip">
                <button class="bordered" (click)="skip()">跳过</button>
            </div>
        </div>
    `,
    styles: [`
        .center {
            text-align: center;
        }

        h1 {
            margin-bottom: 50px;
            font-size: 300%;
        }

        button {
          width: 100px;  
        }

        p {
            padding-top: 20px;
            padding-bottom: 20px;
        }

        small {
            padding-top: 5px;
        }

        .bttn {
            padding-top: 8px;
            padding-bottom: 8px;
        }

        .collapse-heading {
            border: none;
        }

        h2 {
            font-size: 16px;
        }

        .skip {
            margin-top: 50px;
        }
    `]
})
export class GetComponent implements OnDestroy {
    private DOWNLOAD_URL: string = SETTINGS.api_download_url;
    private SETUP_VERSION: string = SETTINGS.api_setup_version;
    private static STATUS_MSG: string[] = [
        'Checking on your progress',
        'Searching for Microsoft IIS Administration',
        'Just a moment',
        'It takes a bit longer',
        'Trying to establish connection'
    ];

    private _inProgress: boolean;
    private _pingTimeoutId: number;
    private _client: HttpConnection;
    private _status: string;
    private _activeConnection: ApiConnection;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _http: Http,
                private _service: ConnectService,
                private _router: Router) {

        this._client = new HttpConnection(_http);

        this._subscriptions.push(this._service.active.subscribe(connection => this._activeConnection = connection));
    }

    public ngOnDestroy(): void {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private download(e: Event): void {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }

        this._inProgress = true;
        this._status = GetComponent.STATUS_MSG[0];
        this.ping();
    }

    private skip() {
        if (this._activeConnection) {
            this._router.navigate(["/"]);
            return;
        }

        this._status = GetComponent.STATUS_MSG[0];
        this.finish();
    }

    private ping(i: number = 1) {
        if (i % 4 == 0) {
            var index = Math.floor(i / 4) - 1;
            this._status = GetComponent.STATUS_MSG[index % GetComponent.STATUS_MSG.length];
        }

        let conn = new ApiConnection("localhost");

        this._client.get(conn, "/api").toPromise()
            .catch(e => {
                if (e.status == 403) {
                    // The Access Token isn't specified, it's OK
                    this.finish();
                }
                else {
                    if (this._inProgress) {
                        this._pingTimeoutId = setTimeout(() => this.ping(i + 1), 2000);
                    }
                }
            })
    }

    private finish() {
        clearTimeout(this._pingTimeoutId);

        this._inProgress = false;

        let conn = new ApiConnection("");

        this._service.edit(conn);
    }
}
