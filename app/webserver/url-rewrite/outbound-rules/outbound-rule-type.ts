import { Component, Inject, Input } from '@angular/core';

import { OutboundRule, OutboundMatchType, OutboundTags, IIS_SERVER_VARIABLES } from '../url-rewrite';

@Component({
    selector: 'outbound-rule-type',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <div>
                    <label class="inline-block">动作</label>
                    <tooltip>
                        一个不活动的出站规则不会执行任何对响应的重写
                    </tooltip>
                </div>
                <switch [(model)]="rule.enabled">{{rule.enabled ? "启用": "禁用"}}</switch>
            </fieldset>

            <fieldset>
                <label class="inline-block">匹配</label>
                <tooltip>
                    出站规则可以操作响应主体内容或HTTP消息头的内容(通过服务器变量)
                    <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule">更多</a>
                </tooltip>
                <enum [(model)]="rule.match_type" (modelChanged)="onMatchType()">
                    <field name="响应" value="response"></field>
                    <field name="服务器变量" value="server_variable"></field>
                </enum>
            </fieldset>

            <fieldset class="flags" *ngIf="rule.match_type == 'response'">
                <div>
                    <label class="inline-block">过滤条件</label>
                    <tooltip>
                        标签过滤器用于将模式匹配到特定的HTML元素，而不是根据规则的模式对整个响应进行评估
                        <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/creating-outbound-rules-for-url-rewrite-module#create-an-outbound-rewrite-rule">更多</a>
                    </tooltip>
                </div>
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tag_filters.a">a</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.area">area</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.base">base</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.form">form</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.frame">frame</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.head">head</checkbox2>
                </div>
                <div class="inline-block">
                    <checkbox2 [(model)]="rule.tag_filters.iframe">iframe</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.img">img</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.input">input</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.link">link</checkbox2>
                    <checkbox2 [(model)]="rule.tag_filters.script">script</checkbox2>
                </div>
            </fieldset>

            <fieldset *ngIf="rule.match_type == 'server_variable'">
                <label class="inline-block">服务器变量</label>
                <tooltip>
                     服务器变量可以用来重写HTTP头信息。
                    <a class="link" href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/modifying-http-response-headers#creating-an-outbound-rule-to-modify-the-http-response-header">更多</a>
                </tooltip>
                <input type="text" required class="form-control name" list="server-vars" [(ngModel)]="rule.server_variable" />
                <datalist id="server-vars">
                    <option *ngFor="let variable of _serverVariables" value="{{variable}}">
                </datalist>
            </fieldset>
        </div>
    `,
    styles: [`
        div.inline-block {
            margin-right: 140px;
            vertical-align: top;
        }
    `]
})
export class OutboundRuleTypeComponent {
    @Input() public rule: OutboundRule;

    private _serverVariables: Array<string> = IIS_SERVER_VARIABLES;

    private onMatchType() {
        if (this.rule.match_type == OutboundMatchType.Response && !this.rule.tag_filters) {
            this.rule.tag_filters = new OutboundTags();
        }
    }
}
