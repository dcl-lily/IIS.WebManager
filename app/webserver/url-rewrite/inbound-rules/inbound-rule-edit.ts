import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UrlRewriteService } from '../service/url-rewrite.service';
import { InboundRule, Condition, ActionType, MatchType, ConditionMatchConstraints, ServerVariableAssignment } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-edit',
    template: `
        <div>
            <tabs>
                <tab [name]="'设置'">
                    <inbound-rule-settings [rule]="rule"></inbound-rule-settings>
                </tab>
                <tab [name]="'动作'">
                    <inbound-rule-action [rule]="rule"></inbound-rule-action>
                </tab>
                <tab [name]="'条件'">
                    <inbound-rule-conditions [rule]="rule"></inbound-rule-conditions>
                </tab>
                <tab [name]="'服务器变量'">
                    <inbound-rule-variables [rule]="rule"></inbound-rule-variables>
                </tab>
            </tabs>
            <p class="pull-right">
                <button [disabled]="!isValid()" class="ok" (click)="onOk()">确认</button>
                <button (click)="onDiscard()" class="cancel">取消</button>
            </p>
        </div>
    `,
    styles: [`
        p {
            margin: 20px 0;
        }
    `]
})
export class InboundRuleEditComponent {
    @Input() public rule: InboundRule;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    private isValid(): boolean {
        return !!this.rule.name && !!this.rule.pattern &&
            (this.rule.action.type != ActionType.CustomResponse || (<any>this.rule.action.status_code !== "" && <any>this.rule.action.sub_status_code !== ""));
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.rule);
    }
}