﻿
import {Component, Input, Output, EventEmitter, ViewChild, Optional, Injector, OnInit, OnChanges, SimpleChange} from '@angular/core';

import {DateTime} from '../../common/primitives';
import {Selector} from '../../common/selector';

import {Binding} from './site';
import {WebSitesService} from './websites.service';


@Component({
    selector: 'navigator',
    template: `
        <div class="wrapper">
            <div class="url inline-block">
                <a class="hidden-xs" *ngIf="model.length > 0" [hidden]="small" [class.cert]="isHttps(0)" title="{{getUrl(0)}}" href="{{getUrl(0)}}" (click)="onNavigate($event)">
                    <span>{{getFriendlyUrl(0)}}</span>
                </a>
            </div>
            <div class="selector-wrapper" *ngIf="model.length > 0">
                <button class="no-border" [class.visible-xs]="model.length == 1 && !small" [class.background-active]="navigator.opened" (click)="openNavigator($event)">
                    <span [class.visible-xs]="!small" class="browse">浏览 </span>
                    <span class="hidden-xs" *ngIf="!small"></span>
                </button>
                <div class="selector" [class.right-align]="right" [class.left-align]="left">
                    <selector #navigator>
                        <ul class="grid-list">
                            <li *ngFor="let b of model; let i = index" class="grid-item hover-active">
                                <a [class.cert]="isHttps(i)" href="{{getUrl(i)}}" title="{{getUrl(i)}}" target="_blank" (click)="onNavigate($event)"><span>{{getFriendlyUrl(i)}}</span></a>
                            </li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .wrapper {
            dispay: block;
            overflow: hidden;
        }

        .url {
            margin-right: -10px;
            padding-right: 15px;
            max-width:90%;
            float: left;
            line-height: 25px;
        }
        .selector-wrapper {
            float: left;
            display: inline-flex;
        }

        button > span:after {
            font-family: FontAwesome;
            font-size: 16px;
            content: "\\f0d7";
        }

        .selector {
            margin-top: 29px;
        }

        .selector.right-align {
            margin-left: -302px;            
        }

        .selector.left-align {
            position: absolute;
        }

        ul {
            margin-bottom: 0px;
        }

        .grid-item {
            padding: 0;
            width: 300px;
            border-width: 0px;
        }

        a {
            content: " ";
            padding-left: 15px;
        }

        a.cert {
            padding-left: 0px;
        }

        .grid-item a {
            line-height: 35px;
            width: 100%;
            padding-right: 10px;
            padding-left: 20px;
        }

        .grid-item a.cert {
            padding-left: 5px;
        }

        .cert span:before {
            font-family: FontAwesome;
            content: "\\f023";
            padding-right: 5px;
        }

        .cert span {
            vertical-align: middle;
        }

        .browse:before {
            content: "";
            padding: 0;
        }

        .browse.cert:after {
            content: "\\f0d7";
        }
        .browse:after {
            margin-left: 5px;
        }
    `]
})
export class NavigatorComponent implements OnInit, OnChanges {
    @Input() model: Array<Binding>;
    @Input() path: string;

    @Input() small: boolean;
    @Input() left: boolean;
    @Input() right: boolean;

    @ViewChild('navigator') navigator: Selector;

    constructor(@Optional() private _service: WebSitesService, injector: Injector) {
        if (!this._service) {
            this._service = injector.get("WebSitesService");
        }
    }

    ngOnInit() {
        this.filterModel();
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.filterModel();
        }
    }

    private onNavigate(e: Event) {
        e.stopPropagation();
    }

    private openNavigator(e: Event) {
        e.preventDefault();
        this.navigator.toggle();
    }

    private getUrl(i: number): string {
        return this._service.getUrl(this.model[i], this.path);
    }

    private getFriendlyUrl(i: number) {
        let url = this.getUrl(i);
        return url.substr(url.indexOf("://") + 3);
    }

    private isHttps(i: number): boolean {
        return this.model[i].is_https;
    }

    private filterModel() {
        // Sort bindings by HTTPS
        this.model = this.model.filter(b => {
            return b.protocol.indexOf("http") == 0;
        }).sort((b1, b2) => {
            if (b2.is_https && !b1.is_https) {
                return 1;
            }

            return 0;
        });
    }
}
