﻿import { Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { OptionsService } from './options.service';

@Component({
    styles: [`
        .sidebar .home::before {content: "\\f015";}

        :host >>> .sidebar > vtabs .items:before {
            content: "";
        }

        :host >>> .sidebar > vtabs .items {
            top: 35px;
        }

        :host >>> .sidebar > vtabs .content {
            margin-top: 10px;
        }
    `],
    template: `
        <div>
            <div class="sidebar" [class.nav]="_options.active">
                <vtabs [markLocation]="true" (activate)="_options.refresh()">
                    <item [name]="'站点'" [ico]="'fa fa-globe'">
                        <dynamic [name]="'WebSiteListComponent'" [module]="'app/webserver/websites/websites.module#WebSitesModule'"></dynamic>
                    </item>
                    <item [name]="'IIS服务器'" [ico]="'fa fa-server'" [routerLink]="['/webserver']"></item>
                    <item [name]="'文件'" [ico]="'fa fa-files-o'">
                        <dynamic [name]="'FilesComponent'" [module]="'app/files/files.module#FilesModule'"></dynamic>
                    </item>
                    <item [name]="'监控'" [ico]="'fa fa-medkit'">
                        <dynamic [name]="'MonitoringComponent'" [module]="'app/webserver/monitoring/monitoring.module#MonitoringModule'"></dynamic>
                    </item>
                </vtabs>
            </div>
        </div>
    `
})
export class HomeComponent {
    constructor(private _options: OptionsService,
        private _route: ActivatedRoute) {
    }
}
