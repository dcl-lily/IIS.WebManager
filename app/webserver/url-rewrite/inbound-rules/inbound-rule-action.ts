import { Component, Input } from '@angular/core';

import { InboundRule, ActionType, RedirectType } from '../url-rewrite';

@Component({
    selector: 'inbound-rule-action',
    template: `
        <div *ngIf="rule">
            <fieldset>
                <enum [(model)]="rule.action.type" (modelChanged)="onActionType()">
                    <field name="重写" value="rewrite" title="在进入IIS管道之前，将重写请求URL"></field>
                    <field name="重定向" value="redirect" title="重定向响应将被发送到客户机"></field>
                    <field name="自定义" value="custom_response" title="提供自定义响应"></field>
                    <field name="终止" value="abort_request" title="结束这个请求"></field>
                    <field name="无" value="none" title="不做任何处理"></field>
                </enum>
            </fieldset>
            <fieldset *ngIf="rule.action.type == 'redirect'">
                <label class="inline-block">响应状态</label>
                <tooltip>
                    指定重定向过程中要使用的状态代码
                    <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link">更多</a>
                </tooltip>
                <enum [(model)]="rule.action.redirect_type">
                    <field name="301" title="301 (永久移除)" value="permanent"></field>
                    <field name="302" title="302 (找到)" value="found"></field>
                    <field name="303" title="303 (移动到其他位置)" value="seeother"></field>
                    <field name="307" title="307 (暂时重定向)" value="temporary"></field>
                </enum>
            </fieldset>
            <div *ngIf="rule.action.type == 'custom_response'" class="row">
                <div class="col-xs-12 col-lg-6">
                    <fieldset>
                        <label>状态代码</label>
                        <input type="text" required class="form-control" [(ngModel)]="rule.action.status_code" />
                    </fieldset>
                    <fieldset>
                        <label>子状态代码</label>
                        <input type="text" required class="form-control" [(ngModel)]="rule.action.sub_status_code" />
                    </fieldset>
                    <fieldset>
                        <label>原因</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.action.reason" />
                    </fieldset>
                    <fieldset>
                        <label>错误描述</label>
                        <input type="text" class="form-control" [(ngModel)]="rule.action.description" />
                    </fieldset>
                </div>
            </div>
            <fieldset>
                <div>
                    <label class="inline-block">追加查询字符串</label>
                    <tooltip>
                        指定是否在替换期间保留当前URL的查询字符串.
                        <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link">更多</a>
                    </tooltip>
                </div>
                <switch [(model)]="rule.action.append_query_string">
                    {{rule.action.append_query_string ? "启用" : "禁用"}}
                </switch>
            </fieldset>
            <fieldset *ngIf="rule.response_cache_directive">
                <label class="inline-block">响应缓存</label>
                <tooltip>
                    定是否是可缓存的响应。默认值自动会allow the URL Rewrite模块决定最好的行为。
                </tooltip>
                <enum [(model)]="rule.response_cache_directive">
                    <field name="自动" value="auto" title="响应缓存基于规则中使用的服务器变量 (默认)"></field>
                    <field name="总是" value="always" title="响应始终缓存"></field>
                    <field name="从不" value="never" title="响应从不缓存"></field>
                    <field name="条件" value="not_if_rule_matched" title="如果整个规则与URL和条件匹配，则将禁用缓存"></field>
                </enum>
            </fieldset>
            <fieldset>
                <label>URL重写日志</label>
                <switch [(model)]="rule.action.log_rewritten_url">
                    {{rule.action.log_rewritten_url ? "启用" : "禁用"}}
                </switch>
            </fieldset>
            <fieldset>
                <div>
                    <label class="inline-block">停止处理后续规则</label>
                    <tooltip>
                        当此标志打开时，这意味着将不再处理后续规则，并将此规则生成的URL传递给IIS请求管道
                        <a href="https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/url-rewrite-module-configuration-reference" class="link">更多</a>
                    </tooltip>
                </div>
                <switch [(model)]="rule.stop_processing">
                    {{rule.stop_processing ? "启用" : "禁用"}}
                </switch>
            </fieldset>
        </div>
    `
})
export class InboundRuleActionComponent {
    @Input() public rule: InboundRule;

    private onActionType() {
        if (this.rule.action.type == ActionType.Redirect && !this.rule.action.redirect_type) {
            this.rule.action.redirect_type = RedirectType.Permanent;
        }
        else if (this.rule.action.type == ActionType.CustomResponse) {
            //
            // Setup custom response action type
            if (!this.rule.action.status_code) {
                this.rule.action.status_code = 403;
            }
            if (!this.rule.action.sub_status_code) {
                this.rule.action.sub_status_code = 0;
            }
            if (!this.rule.action.reason) {
                this.rule.action.reason = "Forbidden: Access is denied.";
            }
            if (!this.rule.action.description) {
                this.rule.action.description = "You do not have permission to view this directory or page using the credentials that you supplied";
            }
        }
    }
}
