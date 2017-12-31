import { Component, Input, Output, EventEmitter, ElementRef, ViewChildren, QueryList, OnInit, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { NgModel } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { IpRestrictionsService } from './ip-restrictions.service';
import { DiffUtil } from '../../utils/diff';
import { RestrictionRule, IpRestrictions } from './ip-restrictions'

@Component({
    selector: 'restriction-rule',
    template: `
        <div class="row grid-item" [class.background-editing]="_editing">
            <div class="actions">
                <button class="no-border" title="确认" *ngIf="_editing" [disabled]="!isValid() || null" (click)="onSave()">
                    <i class="fa fa-check blue"></i>
                </button>
                <button enabled class="no-border" title="取消" *ngIf="_editing" (click)="onDiscard()">
                    <i class="fa fa-times red"></i>
                </button>
                <button enabled class="no-border" title="编辑" [class.inactive]="!_editable" *ngIf="!_editing" (click)="onEdit()">
                    <i class="fa fa-pencil blue"></i>
                </button>
                <button class="no-border" *ngIf="model.id" title="删除" [class.inactive]="!_editable || _editing" (click)="onDelete()">
                    <i class="fa fa-trash-o red"></i>
                </button>
            </div>
            <div *ngIf="!_editing">
                <fieldset class="col-xs-8 col-md-2">
                    <label class="visible-xs visible-sm">状态</label>
                    <i class="fa fa-circle green hidden-xs hidden-sm" *ngIf="model.allowed"></i>
                    <i class="fa fa-ban red hidden-xs hidden-sm" *ngIf="!model.allowed"></i>
                    <span>{{model.allowed ? "允许" : "拒绝"}}</span>
                </fieldset>
                <fieldset class="col-xs-12 col-md-3">
                    <label class="visible-xs visible-sm">IP地址</label>
                    <span>{{model.ip_address}}</span>
                </fieldset>
                <fieldset class="col-xs-12 col-md-3">
                    <label class="visible-xs visible-sm">子网掩码</label>
                    <span>{{model.subnet_mask}}</span>
                </fieldset>
                <fieldset class="col-xs-12 col-md-2" *ngIf="enableDomainName && model.domain_name != ''">
                    <label class="visible-xs visible-sm">域名</label>
                    <span>{{model.domain_name}}</span>
                </fieldset>
            </div>
            <div *ngIf="_editing" class="col-left">
                <fieldset>
                    <label>状态</label>
                    <enum [model]="model.allowed" (modelChange)="model.allowed=($event==='true')">
                        <field name="允许" value="true"></field>
                        <field name="拒绝" value="false"></field>
                    </enum>
                </fieldset>
                <fieldset>
                    <label>IP地址</label>
                    <input class="form-control name" type="text" placeholder="Example: 192.168.100.1" [(ngModel)]="model.ip_address" required pattern="^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$" />
                </fieldset>
                <fieldset>
                    <div class="inline-block">
                        <label class="block">使用子网掩码限制</label>
                        <switch #s [model]="model.subnet_mask!='255.255.255.255'" (modelChange)="onEnableSubnetMask($event)">{{s.model ? "是" : "否"}}</switch>
                    </div>
                    <div class="inline-block no-label" *ngIf="s.model">
                        <input class="form-control name" placeholder="Example: 255.255.0.0" type="text" [(ngModel)]="model.subnet_mask" required />
                    </div>
                </fieldset>
                <fieldset *ngIf="enableDomainName">
                    <label>域名</label>
                    <input class="form-control name" type="text" [(ngModel)]="model.domain_name" />
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        .fa-circle,
        .fa-ban {
            font-size: 20px;
            margin-right: 10px;
            padding-left: 1px
        }

        .grid-item:not(.background-editing) fieldset {
            padding-top: 5px;
            padding-bottom: 0;
        }
        
        .col-left {
            padding-left: 15px;
        }

        .no-label {
            vertical-align: bottom;
        }

        .no-label input {
            margin-top: 15px;
        }

        div.inline-block {
            margin-right:40px;
        }
    `]
})
export class RestrictionRuleComponent implements OnChanges, OnInit {
    @Input() model: RestrictionRule;
    @Input() enableDomainName: boolean;

    @Output() edit: EventEmitter<any> = new EventEmitter();
    @Output() discard: EventEmitter<any> = new EventEmitter();

    @ViewChildren(NgModel) private _validators: QueryList<NgModel>;

    private _editable: boolean = true;
    private _editing: boolean = false;
    private _original: RestrictionRule;

    constructor(private _service: IpRestrictionsService) {
    }

    public ngOnInit() {
        this._editing = !this.model.id;
    }

    public ngOnChanges(changes: { [key: string]: SimpleChange; }): any {
        if (changes["model"]) {
            this.setModel(changes["model"].currentValue);
        }
    }

    onSave() {
        this._editing = false;
        if (this.model.id) {
            let changes = DiffUtil.diff(this._original, this.model);
            if (Object.keys(changes).length > 0) {
                this._service.updateRule(this.model, changes)
                    .then(() => this.setModel(this.model));
            }
            this.discard.emit(null);
        }
        else {
            this._service.addRule(this.model);
            this.discard.emit(null);
        }
    }

    onEdit() {
        this._editing = true;
        this.edit.emit(null);
    }

    onDiscard() {
        this._editing = false;
        for (let key of Object.keys(this._original)) {
            this.model[key] = JSON.parse(JSON.stringify(this._original[key] || null));
        }

        this.discard.emit(null);
    }

    onDelete() {
        if (confirm("你确定要删除这个规则?\nIP地址: " + this.model.ip_address)) {
            this._service.deleteRule(this.model);
        }
    }

    setEditable(val: boolean) {
        this._editable = val;
    }

    isValid() {
        var valid = !!this._validators;

        if (this._validators) {
            this._validators.forEach(v => {
                if (!v.valid) {
                    valid = false;
                }
            });
        }

        return valid;
    }

    private setModel(model: RestrictionRule) {
        this.model = model;
        this._original = JSON.parse(JSON.stringify(this.model));
    }

    private onEnableSubnetMask(val: boolean): void {
        this.model.subnet_mask = val ? "" : "255.255.255.255";
    }
}

@Component({
    selector: 'restriction-rules',
    template: `
        <fieldset>
            <label>允许未注册</label>
            <switch class="block" [(model)]="ipRestrictions.allow_unlisted" (modelChanged)="onModelChanged()">{{ipRestrictions.allow_unlisted ? "启用" : "禁用"}}</switch>
        </fieldset>
        <fieldset>
            <button class="create" (click)="createRule()" [class.inactive]="_editing || _newRule"><i class="fa fa-plus blue"></i><span>添加</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs hidden-sm border-active grid-list-header" [hidden]="rules.length == 0">
                    <label class="col-md-2">状态</label>
                    <label class="col-md-3">IP地址</label>
                    <label class="col-md-3">子网掩码</label>
                    <label class="col-md-2" *ngIf="ipRestrictions.enable_reverse_dns">域名</label>
                </div>
            </div>
            <ul class="grid-list container-fluid">
                <li *ngIf="_newRule">
                    <restriction-rule [model]="_newRule"
                                      [enableDomainName]="ipRestrictions.enable_reverse_dns"
                                      (discard)="onDiscardNew()">
                    </restriction-rule>
                </li>
                <li *ngFor="let rule of rules; let i = index;">
                    <restriction-rule [model]="rule"
                                      [enableDomainName]="ipRestrictions.enable_reverse_dns" 
                                      (edit)="edit(i)"
                                      (discard)="discard()">
                    </restriction-rule>
                </li>
            </ul>
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

        fieldset:first-of-type {
            margin-bottom: 15px;
        }
    `]
})
export class RestrictionRulesComponent implements OnInit, OnDestroy {
    rules: Array<RestrictionRule>;

    private _editing: boolean;
    private _newRule: RestrictionRule;
    private _subscriptions: Array<Subscription> = [];

    @Input() ipRestrictions: IpRestrictions;
    @Output() modelChanged: any = new EventEmitter();

    @ViewChildren(RestrictionRuleComponent) private _ruleComponents: QueryList<RestrictionRuleComponent>;

    constructor(private _service: IpRestrictionsService) {
    }

    ngOnInit() {
        this._subscriptions.push(this._service.rules.subscribe(rules => this.setRules(rules)));
        this._service.loadRules();
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(sub => sub.unsubscribe());
    }

    onModelChanged() {
        this.modelChanged.emit();
    }

    createRule() {
        if (this._newRule) {
            return;
        }

        this._newRule = new RestrictionRule();

        this._newRule.ip_address = "";
        this._newRule.allowed = false;
        this._newRule.subnet_mask = "255.255.255.255";
        this.disableEditingExcept(-1); // New rule is not yet added to ruleComponents, therefore disable editing for all
    }

    private onDiscardNew() {
        this._newRule = null;
        this.enableEditing();
    }

    edit(index) {
        this._editing = true;
        this.disableEditingExcept(index);
    }

    discard() {
        this._editing = false;
        this.enableEditing();
    }

    private setRule(index, rule) {
        this.rules[index] = rule;
    }

    private disableEditingExcept(index) {
        let arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (i !== index) {
                if (arr[i].model.id) {
                    arr[i].setEditable(false);
                }
            }
        }
    }

    private enableEditing() {
        let arr = this._ruleComponents.toArray();
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].model.id) {
                arr[i].setEditable(true);
            }
        }
    }

    private setRules(rules: Array<RestrictionRule>) {
        this.rules = rules;
    }
}
