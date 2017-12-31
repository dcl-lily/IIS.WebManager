import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApplicationPoolIdentity } from './app-pool';


@Component({
    selector: 'identity',
    template: `
        <fieldset class='inline-block'>
            <label>认证身份</label>
            <select class="form-control" [(ngModel)]="model.identity_type" (modelChanged)="onModelChanged()">
                <option value="ApplicationPoolIdentity">资源池</option>
                <option value="LocalSystem">本地系统</option>
                <option value="LocalService">本地服务</option>
                <option value="NetworkService">网络服务</option>
                <option value="SpecificUser">自定义</option>
            </select>
        </fieldset>
        <div *ngIf="model.identity_type == 'SpecificUser'" class='inline-block'>
            <fieldset class='inline-block'>
                <label>用户名</label>
                <input class="form-control" type="text" [(ngModel)]="model.username" throttle (modelChanged)="onModelChanged()" />
            </fieldset>
            <div class='inline-block'>
                <fieldset class='inline-block'>
                    <label>密码</label>
                    <input class="form-control" type="password" [(ngModel)]="_password" (modelChanged)="onModelChanged()" />
                </fieldset>
                <fieldset *ngIf="!!(_password)" class='inline-block'>
                    <label>确认密码</label>
                    <input class="form-control" type="password" ngModel (ngModelChange)="onConfirmPassword($event)" [validateEqual]="_password" />
                </fieldset>
            </div>
        </div>
        <fieldset class='inline-block' *ngIf="useUserProfile">
            <label>本地用户配置文件</label>
            <switch class="block" [(model)]="model.load_user_profile" (modelChanged)="onModelChanged()">
                {{model.load_user_profile ? "启用" : "禁用"}}
            </switch>
        </fieldset>
    `
})
export class IdentityComponent {
    @Input()
    model: ApplicationPoolIdentity;

    @Input()
    public useUserProfile: boolean = true;

    @Output()
    modelChanged: EventEmitter<any> = new EventEmitter();

    private _password: string;

    onModelChanged() {
        this.modelChanged.emit(null);
    }

    onConfirmPassword(value: string) {
        if (value == this._password) {
            this.model.password = value;
        }

        this.onModelChanged();
    }
}
