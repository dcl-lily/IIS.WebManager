﻿import { Component, Inject, Input } from '@angular/core';

import { InboundRule, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-settings',
    template: `
        <div class="row" *ngIf="rule">
            <div class="col-xs-12 col-lg-6">
                <fieldset>
                    <label>名称</label>
                    <input type="text" class="form-control" required [(ngModel)]="rule.name" />
                </fieldset>
                <fieldset>
                    <div>
                        <label class="inline-block">Url模式</label>
                        <tooltip>
                            将此模式与传入请求的URL进行比较，以确定规则是否匹配。
                            <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link"></a>
                        </tooltip>
                        <text-toggle onText="匹配" offText="不匹配" [on]="false" [off]="true" [(model)]="rule.negate" (modelChanged)="testRegex()"></text-toggle>
                        <text-toggle onText="不区分大小写" offText="区分大小写" [(model)]="rule.ignore_case" (modelChanged)="testRegex()"></text-toggle>
                    </div>
                    <input type="text" class="form-control" required [(ngModel)]="rule.pattern" (modelChanged)="testRegex()" />
                </fieldset>
                <fieldset>
                    <label class="inline-block">测试URL</label>
                    <tooltip>
                        该字段可用于测试Url模式的匹配行为.
                    </tooltip>
                    <span class="units" *ngIf="_testUrl && !_isMatching">(不匹配)</span>
                    <input type="text" class="form-control" [(ngModel)]="_testUrl" (modelChanged)="testRegex()" />
                </fieldset>
                <fieldset *ngIf="rule.action.type == 'rewrite' || rule.action.type == 'redirect'">
                    <div>
                        <label class="inline-block">替换URL</label>
                        <tooltip>
                            这是在重写请求URL时使用的替换字符串。替换URL可以包括对条件和URL模式以及服务器变量的回引用。
                            <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link"></a>
                        </tooltip>
                    </div>
                    <button class="right input" (click)="macros.toggle()" [class.background-active]="(macros && macros.opened) || false">宏</button>
                    <div class="fill">
                        <input type="text" required [title]="_result" class="form-control" [(ngModel)]="rule.action.url" (modelChanged)="testRegex()" />
                    </div>
                    <selector class="stretch" #macros>
                        <div class="table-scroll">
                            <table>
                                <tr *ngFor="let match of _matches; let i = index;" (dblclick)="addMatch(i)" (click)="select(i)" class="hover-editing" [class.background-selected]="_selected == i">
                                    <td class="back-ref border-color">{{ '{R:' + i + '}' }}</td>
                                    <td class="border-color">{{match}}</td>
                                </tr>
                                <tr *ngFor="let variable of _serverVariables; let i = index;" (dblclick)="addVariable(i)" (click)="select(i + _matches.length)" class="hover-editing" [class.background-selected]="_selected == (i + _matches.length)">
                                    <td class="back-ref border-color">{{ '{' + variable + '}' }}</td>
                                    <td class="border-color"></td>
                                </tr>
                            </table>
                        </div>
                        <p class="pull-right">
                            <button [attr.disabled]="_selected == -1 || null" (click)="addSelected()">插入</button>
                        </p>
                    </selector>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        table {
            width: 100%;
        }

        .table-scroll {
            max-height: 295px;
            overflow-y: auto;
        }

        p {
            margin: 10px;
        }
    
        td {
            border-style: solid;
            border-width: 1px;
            padding: 5px;
            border-top: none;
        }

        .back-ref {
            width: 200px;
        }

        text-toggle,
        tooltip {
            margin-right: 20px;
        }
    `]
})
export class InboundRuleSettingsComponent {
    @Input() public rule: InboundRule;

    private _result: string = "";
    private _testUrl: string = "";
    private _matches: Array<any> = [];
    private _selected: number = -1;
    private _isMatching: boolean;

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private testRegex(): void {
        this.reset();

        if (!this.rule.pattern || !this._testUrl) {
            return;
        }

        let regex: RegExp;

        try {
            let ignoreCase = + this.rule.ignore_case ? 'i' : '';
            regex = new RegExp(this.rule.pattern, 'g' + ignoreCase);
        }
        catch (e) {
            this._matches = [];
            return;
        }

        this._matches = regex.exec(this._testUrl) || [];

        this._isMatching = (this._matches.length > 0 && !this.rule.negate) ||
            (this._matches.length == 0 && this.rule.negate);

        if (this.rule.negate) {
            this._matches.splice(0, this._matches.length);
        }

        let result = this.rule.action.url || "";

        for (let i = 0; i < this._matches.length; i++) {
            result = result.replace(new RegExp('{R:' + i + '}', 'g'), this._matches[i]);
        }

        this._result = result;
    }

    private reset() {
        this._result = "";
        this._selected = -1;
    }

    private addMatch(i: number): void {
        if (!this.rule.action.url) {
            this.rule.action.url = "";
        }

        this.rule.action.url += '{R:' + i + '}';
        this.testRegex();
    }

    private addVariable(i: number): void {
        if (!this.rule.action.url) {
            this.rule.action.url = "";
        }

        this.rule.action.url += '{' + this._serverVariables[i] + '}';
        this.testRegex();
    }

    private select(i: number) {
        this._selected = i;
    }

    private addSelected() {
        if (this._selected < this._matches.length) {
            this.addMatch(this._selected);
        }
        else {
            this.addVariable(this._selected - this._matches.length);
        }
    }
}
