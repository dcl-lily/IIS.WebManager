import { Component, Input, Output, EventEmitter } from '@angular/core';

import { IpRestrictions } from './ip-restrictions'

@Component({
    selector: 'ip-addresses',
    template: `
        <fieldset>
            <label>拒绝返回状态</label>
            <select class="form-control name" [(ngModel)]="model.deny_action" (modelChanged)="onModelChanged()">
                <option value="Abort">终止连接</option>
                <option value="Unauthorized">HTTP 401 未经授权</option>
                <option value="Forbidden">HTTP 403 禁止访问</option>
                <option value="NotFound">HTTP 404 文件为找到</option>
            </select>
        </fieldset>
        <fieldset>
            <label>代理模式</label>
            <switch class="block" [(model)]="model.enable_proxy_mode" (modelChanged)="onModelChanged()">{{model.enable_proxy_mode ? "启用" : "禁用"}}</switch>
        </fieldset>
        <fieldset>
            <label>使用DNS找</label>
            <switch class="block" [(model)]="model.enable_reverse_dns" (modelChanged)="onModelChanged()">{{model.enable_reverse_dns ? "启用" : "禁用"}}</switch>
        </fieldset>
    `,
    styles: [`
        li select,
        li input {
            display: inline;
        }

        .grid-list > li .actions {
            z-index: 1;
            position: absolute;
            right: 0;
        }
        .grid-list > li.background-editing .actions {
            top: 32px;
        }
    `]
})
export class IpAddressesComponent {
    @Input() model: IpRestrictions;
    @Output() modelChanged: any = new EventEmitter();

    onModelChanged() {
        this.modelChanged.emit();
    }
}
