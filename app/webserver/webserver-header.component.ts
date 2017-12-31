import { Component, Input, Inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Selector } from '../common/selector';
import { Status } from '../common/status';
import { WebServerService } from './webserver.service';
import { WebServer } from './webserver';


@Component({
    selector: 'webserver-header',
    template: `
        <div class="feature-header">
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="Actions" (click)="_selector.toggle()" [class.background-active]="(_selector && _selector.opened) || false"><i class="fa fa-caret-down"></i></button>
                    <selector [right]="true">
                        <ul>
                            <li><button class="refresh" title="重启" (click)="restart()">重启</button></li>
                            <li><button class="start" title="启动" [attr.disabled]="model.status != 'stopped' || null" (click)="start()">启动</button></li>
                            <li><button class="stop" title="停止" [attr.disabled]="model.status != 'started' || null" (click)="stop()">停止</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <div class="feature-title">
                <h1 [ngClass]="model.status">IIS服务器</h1>
                <span class="status" *ngIf="model.status.startsWith('stop')">{{model.status}}</span>
            </div>
        </div>
    `,
    styles: [`
        .selector-wrapper {
            position: relative;
        }

        .feature-title h1:before {
            content: "\\f233";
        }

        .status {
            display: block;
            text-align: right;
        }
    `]
})
export class WebServerHeaderComponent {
    @Input() model: WebServer;
    @ViewChild(Selector) private _selector: Selector;

    private _subs: Array<Subscription> = [];


    constructor(@Inject('WebServerService') private _service: WebServerService) {
    }

    ngOnInit() {
        this._subs.push(this._service.status.subscribe(status => this.model.status = status));
    }

    ngOnDestroy() {
        this._subs.forEach(s => s.unsubscribe());
    }

    start() {
        this._service.start();
        this._selector.close();
    }

    stop() {
        this._service.stop();
        this._selector.close();
    }

    restart() {
        this._service.restart();
        this._selector.close();
    }
}
