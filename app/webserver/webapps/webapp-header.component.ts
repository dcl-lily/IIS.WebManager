import { Component, Input, Inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Selector } from '../../common/selector';
import { WebApp } from './webapp'
import { WebAppsService } from './webapps.service'
import { WebSitesService } from '../websites/websites.service';

@Component({
    selector: 'webapp-header',
    template: `
        <div class="feature-header">
            <div class="actions">
                <div class="selector-wrapper">
                    <button title="动作" (click)="_selector.toggle()" [class.background-active]="(_selector && _selector.opened) || false"><i class="fa fa-caret-down"></i></button>
                    <selector [right]="true">
                        <ul>
                            <li><a class="bttn link" title="浏览" [attr.title]="url" [attr.href]="url" target="_blank">浏览</a></li>
                            <li><button class="delete" title="删除" (click)="onDelete()">删除</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
            <div class="feature-title">
                <h1 [title]="model.website.name + model.path">{{model.path}}</h1>
            </div>
        </div>
    `,
    styles: [`
        .selector-wrapper {
            position: relative;
        }

        .feature-title h1:before {
            content: "\\f121";
        }
    `]
})
export class WebAppHeaderComponent {
    @Input() model: WebApp;
    @ViewChild(Selector) private _selector: Selector;

    constructor( @Inject("WebAppsService") private _service: WebAppsService,
        @Inject("WebSitesService") private _siteService: WebSitesService,
        private _router: Router) {
    }

    onDelete() {
        if (confirm("你确认要删除 '" + this.model.path + "'?")) {
            this._service.delete(this.model)
                .then(() => {
                    this._router.navigate(['/webserver/websites/', { id: this.model.website.id }]);
                });
        }
        this._selector.close();
    }

    private get url() {
        if (!this.model.website || this.model.website.bindings.length == 0) {
            return "";
        }

        return this._siteService.getUrl(this.model.website.bindings[0]) + this.model.path;
    }
}
