import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';

import { Selector } from '../../common/selector';

import { ApiFile } from '../../files/file';
import { WebSite, Binding } from './site';
import { WebSitesService } from './websites.service';
import { BindingList } from './binding-list.component';

import { AppPoolListComponent } from '../app-pools/app-pool-list.component';
import { AppPoolsService } from '../app-pools/app-pools.service';


@Component({
    selector: 'website-general',
    template: `
        <tabs>
            <tab [name]="'设置'">
                <fieldset>
                    <label>名称</label>
                    <input class="form-control name" type="text" [(ngModel)]="site.name" throttle (modelChanged)="onModelChanged()" required/>
                </fieldset>
                <fieldset class="path">
                    <label>物理路径</label>
                    <button title="选择目录" [class.background-active]="fileSelector.isOpen()" class="right select" (click)="fileSelector.toggle()"></button>
                    <div class="fill">
                        <input type="text" class="form-control" [(ngModel)]="site.physical_path" (modelChanged)="onModelChanged()" throttle required />
                    </div>
                    <server-file-selector #fileSelector [types]="['directory']" [defaultPath]="site.physical_path" (selected)="onSelectPath($event)"></server-file-selector>
                </fieldset>
                <fieldset>
                    <label>自动启动</label>
                    <switch class="block" [(model)]="site.server_auto_start" (modelChanged)="onModelChanged()">{{site.server_auto_start ? "启用" : "禁用"}}</switch>
                </fieldset>
                <fieldset class="inline-block">
                    <label>自定义协议</label>
                    <switch class="block" [(model)]="custom_protocols" (modelChange)="useCustomProtocols($event)">{{custom_protocols ? "启用" : "禁用"}}</switch>
                </fieldset>
                <fieldset class="inline-block" *ngIf="custom_protocols">
                    <label>协议</label>
                    <input class="form-control" type="text" [(ngModel)]="site.enabled_protocols" (modelChanged)="onModelChanged()" required throttle />
                </fieldset>
            </tab>
            <tab [name]="'绑定'">
                <binding-list *ngIf="site.bindings" [(model)]="site.bindings" (modelChange)="onModelChanged()"></binding-list>
            </tab>
            <tab [name]="'限制'">
                <limits [model]="site.limits" (modelChanged)="onModelChanged()"></limits>
            </tab>
            <tab [name]="'应用池'">
                <button [class.background-active]="poolSelect.opened" (click)="selectAppPool()">改变应用池 <i class="fa fa-caret-down"></i></button>
                <selector #poolSelect class="container-fluid create">
                    <app-pools #appPools [actions]="'view'" [lazy]="true" (itemSelected)="onAppPoolSelected($event)"></app-pools>
                </selector>
                <app-pool-details [model]="site.application_pool"></app-pool-details>
            </tab>
        </tabs>
    `
})
export class WebSiteGeneralComponent {
    @Input() site: WebSite;
    @Output() modelChanged: EventEmitter<any> = new EventEmitter();

    @ViewChild('poolSelect') poolSelect: Selector;
    @ViewChild('appPools') appPools: AppPoolListComponent;
    @ViewChildren(NgModel) validators: QueryList<NgModel>;

    custom_protocols: boolean;

    ngOnInit() {
        this.custom_protocols = !(this.site.enabled_protocols.toLowerCase() == "http" ||
                                  this.site.enabled_protocols.toLowerCase() == "https");
    }

    onModelChanged() {
        if (this.isValid()) {

            // Bubble up model changed event to parent
            this.modelChanged.emit(null);
        }
    }

    isValid() {

        // Check all validators provided by ngModel
        if (this.validators) {
            let vs = this.validators.toArray();
            for (var control of vs) {
                if (!control.valid) {
                    return false;
                }
            }
        }

        return true;
    }

    selectAppPool() {
        this.poolSelect.toggle();

        if (this.poolSelect.opened) {
            this.appPools.activate();
        }
    }

    onAppPoolSelected(pool) {
        this.poolSelect.close();

        if (this.site.application_pool && this.site.application_pool.id == pool.id) {
            return;
        }

        this.site.application_pool = pool;

        this.onModelChanged();
    }

    useCustomProtocols(value: boolean) {
        if (!value) {
            this.site.enabled_protocols = "http";
            this.onModelChanged();
        }
    }

    private onSelectPath(event: Array<ApiFile>) {
        if (event.length == 1) {
            this.site.physical_path = event[0].physical_path;
            this.onModelChanged();
        }
    }
}
