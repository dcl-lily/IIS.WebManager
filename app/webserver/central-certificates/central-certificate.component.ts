import { Component, OnInit, OnDestroy, ViewChildren, QueryList } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { ApiFile } from '../../files/file';
import { DiffUtil } from '../../utils/diff';
import { Status } from '../../common/status';
import { CentralCertificateService } from './central-certificate.service';
import { CentralCertificateConfiguration } from './central-certificates';

@Component({
    template: `
        <fieldset>
            <switch #s
                [model]="_enabled"
                (modelChange)="onEnabled($event)"
                [disabled]="_service.status == 'starting' || _service.status == 'stopping'">
                    <span *ngIf="!isPending">{{s.model ? "启用" : "禁用"}}</span>
                    <span *ngIf="isPending" class="loading"></span>
            </switch>
        </fieldset>
        <div *ngIf="_configuration">
            <fieldset class="path">
                <label>物理路径</label>
                <button title="选择目录" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()" [attr.disabled]="isPending || null" ></button>
                <div class="fill">
                    <input type="text" class="form-control" [(ngModel)]="_configuration.path" (modelChanged)="onModelChanged()" throttle required [attr.disabled]="isPending || null" />
                </div>
                <server-file-selector #fileSelector (selected)="onSelectPath($event)" [defaultPath]="_configuration.path" [types]="['directory']"></server-file-selector>
            </fieldset>
            <label class="block">连接凭据</label>
            <div class="in">
                <fieldset>
                    <label>用户名</label>
                    <input type="text" class="form-control name" [(ngModel)]="_configuration.identity.username" required (modelChanged)="onModelChanged()" throttle [attr.disabled]="isPending || null" />
                </fieldset>
                <fieldset>
                    <label>密码</label>
                    <input type="password" class="form-control name" #identityPassword [(ngModel)]="_identityPassword" 
                        [attr.required]="!_configuration.id ? true : null" (modelChanged)="clearIdentityPassword(f)" 
                        [attr.placeholder]="_configuration.id ? '*************' : null" throttle 
                        [attr.disabled]="isPending || null" />
                </fieldset>
                <fieldset *ngIf="identityPassword.value">
                    <label>确认密码</label>
                    <input type="password" class="form-control name" [(ngModel)]="_identityPasswordConfirm" (ngModelChange)="onConfirmIdentityPassword($event)" [validateEqual]="_identityPassword" throttle [attr.disabled]="isPending || null" />
                </fieldset>
            </div>
            <div>
                <label class="block" title="指定证书文件的私钥的密码">证书密码</label>
                <switch style="display:inline-block;margin-bottom:5px;" [(model)]="_usePvkPass" (modelChange)="onPvkPassRequired($event)" [attr.disabled]="isPending || null" ></switch>
            </div>
            <div class="in" *ngIf="_usePvkPass">
                <fieldset>
                    <label>密码</label>
                    <input type="password" class="form-control name" #pvkPass [(ngModel)]="_privateKeyPassword" (modelChanged)="clearPkPassword()" [attr.required]="!_configuration.id ? true : null" throttle 
                        [attr.disabled]="isPending || null" />
                </fieldset>
                <fieldset *ngIf="pvkPass.value">
                    <label>确认密码</label>
                    <input type="password" class="form-control name" [(ngModel)]="_privateKeyPasswordConfirm" (ngModelChange)="onConfirmPkPassword($event)" [validateEqual]="_privateKeyPassword" throttle [attr.disabled]="isPending || null" />
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .in {
            padding-left: 30px;
            padding-top: 15px;
            padding-bottom: 15px;
        }
    `]
})
export class CentralCertificateComponent implements OnInit, OnDestroy {
    id: string;
    private _enabled: boolean;
    private _usePvkPass: boolean = true;
    private _identityPassword: string = null;
    private _identityPasswordConfirm: string = null;
    private _privateKeyPassword: string = null;
    private _privateKeyPasswordConfirm: string = null;
    private _subscriptions: Array<Subscription> = [];
    private _original: CentralCertificateConfiguration;
    private _configuration: CentralCertificateConfiguration;
    @ViewChildren(NgModel) private _validators: QueryList<NgModel>;

    constructor(private _service: CentralCertificateService) {
    }

    private get canEnable(): boolean {
        return !!this._configuration &&
            !!this._configuration.identity.username &&
            !!this._configuration.identity.password &&
            (!this._usePvkPass || !!this._privateKeyPassword);
    }

    private get canUpdate(): boolean {
        let changes = DiffUtil.diff(this._original, this._configuration);

        return !changes.identity || !!changes.identity.password;
    }

    public ngOnInit() {
        this._service.initialize(this.id);

        this._subscriptions.push(this._service.enabled.subscribe(enabled => {
            this._enabled = enabled;
        }));

        this._subscriptions.push(this._service.configuration.subscribe(config => {
            this.setFeature(config);
        }));
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    private setFeature(config: CentralCertificateConfiguration) {
        if (config) {
            config.identity.password = null;
            config.private_key_password = null;
        }

        this._configuration = config;
        this._original = JSON.parse(JSON.stringify(config));
    }

    private onModelChanged() {
        if ((!this._configuration.id && !this.canEnable) || !this.canUpdate) {
            return;
        }

        var changes = DiffUtil.diff(this._original, this._configuration);

        if (Object.keys(changes).length > 0) {
            let action = this._configuration.id ? this._service.update(changes) : this._service.enable(changes);
            action.then(_ => {
                this.clearFormData();
            })
        }
    }

    private onConfirmIdentityPassword(identityPassword: string) {
        if (identityPassword === this._identityPassword) {
            this._configuration.identity.password = identityPassword;
            this.onModelChanged();
        }
        else {
            this.clearIdentityPassword();
        }
    }

    private onConfirmPkPassword(pkPassword: string) {
        if (pkPassword === this._privateKeyPassword) {
            this._configuration.private_key_password = pkPassword;
            this.onModelChanged();
        }
        else {
            this.clearPkPassword();
        }
    }

    private onEnabled(val: boolean) {
        if (!val) {
            if (this._configuration && this._configuration.id) {
                this._service.disable();
            }
            this.clearFormData();
            this._configuration = null;
        }
        else {
            this.setFeature(new CentralCertificateConfiguration());
        }
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this._configuration.path = event[0].physical_path;
            this.onModelChanged();
        }
    }

    private onPvkPassRequired(val: boolean): void {
        if (!val) {
            this._privateKeyPassword = null;
            this.clearPkPassword();
            this.onModelChanged();
        }
    }

    private clearIdentityPassword(f = null) {
        this._configuration.identity.password = null;
    }

    private clearPkPassword() {
        this._configuration.private_key_password = null;
    }

    private clearFormData() {
        this._privateKeyPassword = null;
        this._privateKeyPasswordConfirm = null;
        this._identityPassword = null;
        this._identityPasswordConfirm = null;
    }

    private get isPending(): boolean {
        return this._service.status == Status.Starting
            || this._service.status == Status.Stopping;
    }
}
