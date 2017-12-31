import { Component, Input, Output, EventEmitter } from '@angular/core';

import { UrlRewriteService } from '../service/url-rewrite.service';
import { OutboundRule, OutboundMatchType } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-edit',
    template: `
        <div>
            <tabs>
                <tab [name]="'设置'">
                    <outbound-rule-settings [rule]="rule"></outbound-rule-settings>
                </tab>
                <tab [name]="'重写'">
                    <outbound-rule-type [rule]="rule"></outbound-rule-type>
                </tab>
                <tab [name]="'条件'">
                    <inbound-rule-conditions [rule]="rule"></inbound-rule-conditions>
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
export class OutboundRuleEditComponent {
    @Input() public rule: OutboundRule;

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() save: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _svc: UrlRewriteService) {
    }

    private isValid(): boolean {
        return !!this.rule.name &&
            !!this.rule.pattern &&
            (this.rule.match_type != OutboundMatchType.ServerVariable || !!this.rule.server_variable);
    }

    private onDiscard() {
        this.cancel.emit();
    }

    private onOk() {
        this.save.emit(this.rule);
    }
}