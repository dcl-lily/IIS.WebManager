import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { NotificationService } from '../../../notification/notification.service';
import { Selector } from '../../../common/selector';
import { UrlRewriteService } from '../service/url-rewrite.service';
import { RewriteMap } from '../url-rewrite';

@Component({
    selector: 'rewrite-map',
    template: `
        <div *ngIf="map" class="grid-item row" [class.background-selected]="_editing" (dblclick)="edit()">
            <div class="col-xs-8 col-sm-6 valign">
                <span class="pointer" (click)="edit()">{{map.name}}</span>
            </div>
            <div class="hidden-xs col-sm-2 valign">
                {{map.mappings.length}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="更多" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || _editing || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="编辑" (click)="edit()">编辑</button></li>
                            <li><button #menuButton class="delete" title="删除" (click)="delete()">删除</button></li>
                            <li><button #menuButton class="copy" title="复制" (click)="copy()">复制</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <selector #editSelector [opened]="true" *ngIf="_editing" class="container-fluid" (hide)="discard()">
            <rewrite-map-edit [map]="map" (save)="save($event)" (cancel)="discard()"></rewrite-map-edit>
        </selector>
    `
})
export class RewriteMapComponent implements OnChanges {
    @Input() public map: RewriteMap;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean = false;
    private _original: RewriteMap;

    constructor(private _service: UrlRewriteService, private _notificationService: NotificationService) {
    }

    ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["map"]) {
            this._original = JSON.parse(JSON.stringify(changes["map"].currentValue));
        }
    }

    private edit() {
        this._editing = true;
    }

    private delete() {
        this._notificationService.confirm("删除重写地图", "你确认要删除 '" + this.map.name + "'?")
            .then(confirmed => confirmed && this._service.deleteRewriteMap(this.map));
    }

    private save() {
        this._service.saveRewriteMap(this.map)
            .then(() => this._original = JSON.parse(JSON.stringify(this.map)));
        this._editing = false;
    }

    private discard() {
        this.map = JSON.parse(JSON.stringify(this._original));
        this._editing = false;
    }

    private copy() {
        this._service.copyRewriteMap(this.map);
    }
}