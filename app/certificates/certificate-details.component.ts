import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { DateTime } from '../common/primitives';
import { Certificate } from './certificate';

@Component({
    selector: 'certificate-details',
    template: `
        <div *ngIf="model">
            <div class="inline-block">
                <fieldset>
                    <label>别名</label>
                    <span>{{model.friendly_name || model.alias}}</span>
                </fieldset>
                <fieldset>
                    <label>主题</label>
                    <span>{{model.subject}}</span>
                </fieldset>
                <fieldset>
                    <label>发行人</label>
                    <span>{{model.issued_by}}</span>
                </fieldset>
                <fieldset>
                    <label>特征指纹</label>
                    <span>{{model.thumbprint}}</span>
                </fieldset>
            </div>
            <div class="inline-block">
                <fieldset>
                    <label>有效期</label>
                    <span>{{validTo}}</span>
                </fieldset>
                <fieldset>
                    <label>开始日期</label>
                    <span>{{validFrom}}</span>
                </fieldset>
                <fieldset>
                    <label>签名算法</label>
                    <span>{{model.hash_algorithm || model.signature_algorithm}}</span>
                </fieldset>
                <fieldset>
                    <label>存储位置</label>
                    <span>{{!(model.store) ? "" : model.store.name}}</span>
                </fieldset>
            </div>
            <div class="inline-block">
                <fieldset>
                    <label>主题选择的名字</label>
                    <ul *ngIf="model.subject_alternative_names">
                        <li *ngFor="let san of model.subject_alternative_names">
                            {{san}}
                        </li>
                    </ul>
                </fieldset>
                <fieldset>
                    <label>使用目的</label>
                    <ul *ngIf="model.intended_purposes">
                        <li *ngFor="let purpose of model.intended_purposes">
                            {{purpose}}
                        </li>
                    </ul>
                </fieldset>
            </div>
        </div>
    `,
    styles: [`
        span {
            display: block;
        }

        .inline-block {
            width: 400px;
            overflow: hidden;
        }

        div {
            vertical-align: top;
        }

        fieldset label {
            margin-bottom: 5px;
        }
    `]
})
export class CertificateDetailsComponent {
    @Input() model: Certificate;

    private get validTo() {
        return Certificate.friendlyValidTo(this.model);
    }

    private get validFrom() {
        return Certificate.friendlyValidFrom(this.model);
    }

    private get displayName() {
        return Certificate.displayName(this.model);
    }
}
