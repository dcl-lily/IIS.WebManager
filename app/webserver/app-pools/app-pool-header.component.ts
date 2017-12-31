﻿import { Component, Input, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Selector } from '../../common/selector';
import { ApplicationPool } from './app-pool';
import { AppPoolsService } from './app-pools.service';


@Component({
    selector: 'app-pool-header',
    template: `
        <div class="feature-header" *ngIf="pool">
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="Actions" (click)="_selector.toggle()" [class.background-active]="(_selector && _selector.opened) || false"><i class="fa fa-caret-down"></i></button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="refresh" title="Recycle" [attr.disabled]="pool.status != 'started' ? true : null" (click)="onRecycle()">回收</button></li>
                            <li><button class="start" title="Start" [attr.disabled]="pool.status != 'stopped' ? true : null" (click)="onStart()">开始</button></li>
                            <li><button class="stop" title="Stop" [attr.disabled]="pool.status != 'started' ? true : null" (click)="onStop()">停止</button></li>
                            <li><button class="delete" title="Delete" (click)="onDelete()">删除</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <div class="feature-title">
                <h1 [ngClass]="pool.status">{{pool.name}}</h1>
                <span class="status" *ngIf="pool.status == 'stopped'">{{pool.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .selector-wrapper {
            position: relative;
        }

        .feature-title h1:before {
            content: "\\f085";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class AppPoolHeaderComponent {
    @Input() pool: ApplicationPool;
    @ViewChild(Selector) private _selector: Selector;

    constructor(@Inject("AppPoolsService") private _service: AppPoolsService,
                private _router: Router) {
    }

    onStart() {
        this._service.start(this.pool);
        this._selector.close();
    }

    onStop() {
        this._service.stop(this.pool);
        this._selector.close();
    }

    onDelete() {
        if (confirm("您确定要删除此应用程序池吗？ ?\n应用池名: " + this.pool.name)) {
            this._service.delete(this.pool)
                .then(() => {
                    this._router.navigate(["/WebServer"]);
                });
        }
        this._selector.close();
    }

    onRecycle() {
        this._service.recycle(this.pool);
        this._selector.close();
    }
}
