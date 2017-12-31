
import {Component, EventEmitter, Output, Inject} from '@angular/core';

import {ApplicationPool, ApplicationPoolIdentity, ProcessModelIdentityType, PipelineMode} from './app-pool';
import {AppPoolsService} from './app-pools.service';


@Component({
    selector: 'new-app-pool',
    template: `
        <fieldset>
            <label>名字</label>
            <input type="text" class="form-control name" [(ngModel)]="model.name" required />
        </fieldset>
        <section>
            <div class="collapse-heading collapsed" data-toggle="collapse" data-target="#settings">
                <h2>设置</h2>
            </div>
            <div id="settings" class="collapse">
                <fieldset>
                    <identity [(model)]="model.identity"></identity>
                </fieldset>
                <fieldset>
                    <label>管道</label>
                    <enum [(model)]="model.pipeline_mode">
                        <field name="集成" value="Integrated"></field>
                        <field name="典型" value="Classic"></field>
                    </enum>
                </fieldset>
                <fieldset>
                    <label>.NET版本</label>
                    <enum  [(model)]="model.managed_runtime_version">
                        <field name="3.5" value="v2.0"></field>
                        <field name="4.x" value="v4.0"></field>
                        <field name="None" value=""></field>
                    </enum>
                </fieldset>
            </div>
        </section>
        <p class="pull-right">
            <button class="ok" (click)="onSave()" [disabled]="!IsValid()">创建</button>
            <button class="cancel" (click)="onCancel()">取消</button>
        </p>
    `
})
export class NewAppPoolComponent {
    model: ApplicationPool;

    @Output() created: EventEmitter<any> = new EventEmitter();
    @Output() cancel: EventEmitter<any> = new EventEmitter();

    constructor(@Inject("AppPoolsService") private _service: AppPoolsService) {
    }

    ngOnInit() {
        this.reset();
    }

    onSave() {
        this._service.create(this.model)
            .then(p => {
                this.reset();
                this.created.emit(p);
            });
    }

    onCancel() {
        this.reset();
        this.cancel.emit(null);
    }

    IsValid(): boolean {
        return this.model.name.length > 0;
    }

    private reset() {
        let pool = new ApplicationPool();
        pool = new ApplicationPool();
        pool.name = "";
        pool.pipeline_mode = PipelineMode.Integrated;
        pool.identity = new ApplicationPoolIdentity();
        pool.identity.identity_type = ProcessModelIdentityType.ApplicationPoolIdentity;
        
        this.model = pool;
    }
}
