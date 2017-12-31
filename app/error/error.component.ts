
import {NgModule, Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ApiError} from '../error/api-error';

@Component({
    selector: 'section-locked',
    styles: [`
        #container {
            font-size: 16px;
            margin-bottom: 35px;
        }

        #lockSymbol {
            padding:10px;
            display:inline-block;
        }

        p {
            margin-top: 10px;
            font-size: 14px;
            width: 100%;
        }
    `],
    template: `
        <div id="container">
            <div id="lockSymbol" class="background-warning">
                <i class="fa fa-lock large left-icon"></i> 锁定
            </div>
            <p>
                该功能已锁定在父级，无法进行编辑，若要启用编辑，请将父级的覆盖设置更改为“允许”。
            </p>
            <p class="color-error">
               无法加载功能的设置
                当功能锁定在当前配置级别并修改了功能的设置时，就会发生这种情况要解决此问题，请手动删除对该特性的任何本地更改或在父级打开该功能
            </p>
        </div>
    `
})
export class SectionLockErrorComponent {
}

@Component({
    selector: 'feature-not-installed',
    template: `
        <div id="container">
            <p>
                '{{name}}' 没有安装.
            </p>
        </div>
    `
})
export class FeatureNotInstalledComponent {
    @Input() name: string;
}

@Component({
    selector: 'error',
    template: `
        <div *ngIf="error">
            <div *ngIf="error.type === 'SectionLocked'">
                <section-locked></section-locked>
            </div>
            <div *ngIf="notInstalled && error.type === 'FeatureNotInstalled'">
                <feature-not-installed [name]="error.name"></feature-not-installed>
            </div>
        </div>
    `
})
export class ErrorComponent {
    @Input() error: ApiError;
    @Input() notInstalled: boolean = false;
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        SectionLockErrorComponent,
        FeatureNotInstalledComponent,
        ErrorComponent
    ],
    declarations: [
        SectionLockErrorComponent,
        FeatureNotInstalledComponent,
        ErrorComponent
    ]
})
export class Module { }
