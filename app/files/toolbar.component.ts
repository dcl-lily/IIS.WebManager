import { NgModule, Component, Output, Input, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'toolbar',
    template: `
        <div>
            <button class="delete" title="删除" (click)="onDelete.next($event)" *ngIf="delete !== null" [attr.disabled]="delete === false || null"></button>
            <button title="上传" (click)="onUpload.next()" *ngIf="upload !== null" [attr.disabled]="upload === false || null"><i class="fa fa-upload"></i></button>
            <button class="fi text-center directory" title="新建文件夹" (click)="onNewFolder.next()" *ngIf="newFolder !== null" [attr.disabled]="newFolder === false || null"><i></i></button>
            <button class="fi text-center directory location" title="新建根目录" (click)="onNewLocation.next()" *ngIf="newLocation !== null" [attr.disabled]="newLocation === false || null"><i class="color-normal"></i></button>
            <button title="新建文件" (click)="onNewFile.next()" *ngIf="newFile !== null" [attr.disabled]="newFile === false || null"><i class="fa fa-file-o"></i></button>
            <button class="refresh" title="刷新" (click)="onRefresh.next()" *ngIf="refresh !== null" [attr.disabled]="refresh === false || null"></button>
        </div>
        <div class="clear"></div>
    `,
    styles: [`
        button span {
            font-size: 85%;
        }

        button {
            border: none;
            float: right;
        }
    `],
    styleUrls: [
        'app/files/file-icons.css'
    ]
})
export class ToolbarComponent {
    @Input() newLocation: boolean = null;
    @Input() refresh: boolean;
    @Input() newFile: boolean = null;
    @Input() newFolder: boolean = null;
    @Input() upload: boolean = null;
    @Input() delete: boolean = null;

    @Output() onNewLocation: EventEmitter<any> = new EventEmitter<any>();
    @Output() onRefresh: EventEmitter<any> = new EventEmitter<any>();
    @Output() onNewFile: EventEmitter<any> = new EventEmitter<any>();
    @Output() onNewFolder: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpload: EventEmitter<any> = new EventEmitter<any>();
    @Output() onDelete: EventEmitter<any> = new EventEmitter<any>();
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        ToolbarComponent
    ],
    declarations: [
        ToolbarComponent
    ]
})
export class Module { }
