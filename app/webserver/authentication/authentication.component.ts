﻿import { Component, OnInit, DoCheck, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { AuthenticationService } from './authentication.service';
import { Logger } from '../../common/logger';
import { NotificationService } from '../../notification/notification.service';

import { DiffUtil } from '../../utils/diff';

@Component({
    template: `
        <loading *ngIf="!settings"></loading>
        <tabs *ngIf="settings">
            <tab [name]="'匿名'">
                <anon-auth></anon-auth>
            </tab>
            <tab [name]="'基础'">
                <basic-auth></basic-auth>
            </tab>
            <tab [name]="'摘要式'">
                <digest-auth></digest-auth>
            </tab>
            <tab [name]="'Windows'">
                <win-auth></win-auth>
            </tab>
        </tabs>
    `
})
export class AuthenticationComponent implements OnInit, OnDestroy {
    id: string;
    settings: any;

    private _original: any;
    private _subscriptions: Array<Subscription> = [];

    constructor(private _service: AuthenticationService, private _notificationService: NotificationService) {
    }

    public ngOnInit() {
        this._subscriptions.push(this._service.settings.subscribe(settings => {
            this.setFeature(settings);
        }));
        this._service.initialize(this.id);
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private setFeature(feature: any) {
        this.settings = feature;
        this._original = JSON.parse(JSON.stringify(feature));
    }
}
