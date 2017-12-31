import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { InboundRule, Condition, MatchType, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-conditions',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <label>匹配</label>
                <enum [(model)]="rule.condition_match_constraints">
                    <field name="所有" value="match_all" title="所有规则必须匹配"></field>
                    <field name="任何" value="match_any" title="任何一个规则匹配"></field>
                </enum>
            </fieldset>
            <fieldset>
                <div>
                    <label class="inline-block">保留所有返回引用</label>
                    <tooltip>
                        指定是否保留引用所有匹配的条件或只有最后一个条件进行
                    </tooltip>
                </div>
                <switch [(model)]="rule.track_all_captures">
                    {{rule.track_all_captures ? '启用' : '禁用'}}
                </switch>
            </fieldset>

            <button (click)="add()" class="create"><span>添加条件</span></button>
            <div class="container-fluid">
                <div class="row hidden-xs border-active grid-list-header">
                    <label class="col-sm-3 col-lg-2">服务器变量</label>
                    <label class="col-sm-3 col-lg-2">匹配类型</label>
                    <label class="col-sm-3">模式</label>
                </div>
            </div>

            <ul class="grid-list container-fluid">
                <li *ngIf="_newCondition">
                    <condition-edit [condition]="_newCondition" (save)="saveNew($event)" (cancel)="discardNew()"></condition-edit>
                </li>
                <li *ngFor="let condition of rule.conditions; let i = index;">
                    <inbound-rule-condition [condition]="condition" (delete)="onDelete(i)"></inbound-rule-condition>
                </li>
            </ul>
        </div>
    `,
    styles: [`
        .create {
            margin-top: 50px;
        }
    `]
})
export class InboundRuleConditionsComponent {
    @Input() public rule: InboundRule;

    private _newCondition: Condition;

    private add() {
        let con = new Condition();
        con.ignore_case = true;
        con.match_type = MatchType.Pattern;
        con.negate = false;
        con.input = "";
        con.pattern = "(.*)"
        this._newCondition = con;
    }

    private saveNew(condition: Condition) {
        this.rule.conditions.push(condition);
        this._newCondition = null;
    }

    private discardNew() {
        this._newCondition = null;
    }

    private onDelete(index: number) {
        this.rule.conditions.splice(index, 1);
    }
}

@Component({
    selector: 'inbound-rule-condition',
    template: `
        <div *ngIf="condition && !_editing" class="grid-item row" (dblclick)="edit()">
            <div class="col-sm-3 col-lg-2 valign">
                {{condition.input}}
            </div>
            <div class="col-sm-3 col-lg-2 valign">
                {{condition.negate ? "不匹配" : "匹配"}}
            </div>
            <div class="col-sm-3 valign">
                {{condition.pattern}}
            </div>
            <div class="actions">
                <div class="action-selector">
                    <button title="更多" (click)="selector.toggle()" (dblclick)="$event.preventDefault()" [class.background-active]="(selector && selector.opened) || false">
                        <i class="fa fa-ellipsis-h"></i>
                    </button>
                    <selector #selector [right]="true">
                        <ul>
                            <li><button #menuButton class="edit" title="编辑" (click)="edit()">编辑</button></li>
                            <li><button #menuButton class="delete" title="删除" (click)="delete()">删除</button></li>
                        </ul>
                    </selector>
                </div>
            </div>
        </div>
        <condition-edit
            *ngIf="_editing"
            [condition]="condition"
            (save)="onSave()"
            (cancel)="onCancel()"></condition-edit>
    `
})
export class InboundRuleConditionComponent {
    @Input() public condition: Condition;
    @Output('delete') deleteEvent: EventEmitter<any> = new EventEmitter<any>();

    private _editing: boolean;

    private edit() {
        this._editing = true;
    }

    private onSave() {
        this._editing = false;
    }

    private onCancel() {
        this._editing = false;
    }

    private delete() {
        this.deleteEvent.next();
    }
}

@Component({
    selector: 'condition-edit',
    template: `
        <div *ngIf="condition" class="grid-item row background-editing">
            <div class="actions">
                <button class="no-border ok" [disabled]="!isValid()" title="确认" (click)="onOk()"></button>
                <button class="no-border cancel" title="取消" (click)="onDiscard()"></button>
            </div>
            <fieldset class="name">
                <label>服务器变量</label>
                <input type="text" required class="form-control" list="server-vars" [(ngModel)]="condition.input" />
                <datalist id="server-vars">
                    <option *ngFor="let variable of _serverVariables" value="{{'{' + variable + '}'}}">
                </datalist>
            </fieldset>
            <fieldset class="name">
                <div>
                    <label class="inline-block">模式</label>
                    <text-toggle onText="匹配" offText="不匹配" [on]="false" [off]="true" [(model)]="condition.negate"></text-toggle>
                    <text-toggle onText="不区分大小写" offText="区分大小写" [(model)]="condition.ignore_case"></text-toggle>
                </div>
                <input type="text" required class="form-control" [(ngModel)]="condition.pattern" />
            </fieldset>
        </div>
    `,
    styles: [`
        fieldset {
            padding-left: 15px;
            padding-right: 15px;
        }

        .inline-block,
        text-toggle {
            margin-right: 20px;
        }
    `]
})
export class ConditionEditComponent {
    @Input() public condition: Condition;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private isValid(): boolean {
        return !!this.condition.input && !!this.condition.pattern;
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.condition);
    }
}