
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Provider, Trace} from './request-tracing';

@Component({
    selector: 'trace',
    template: `
        <div *ngIf="model">
            <fieldset class="inline-block pull-left">
                <label>信息显示</label>
                <div>
                    <select id="s" class="form-control" [(ngModel)]="model.verbosity">
                        <option value="general">基础</option>
                        <option value="criticalerror">关键性错误</option>
                        <option value="error">错误</option>
                        <option value="warning">警告</option>
                        <option value="information">信息</option>
                        <option value="verbose">调试</option>
                    </select>
                </div>
            </fieldset>
            <fieldset class="inline-block" *ngIf="getKeys(model.allowed_areas).length > 0">
                <label>区域</label>
                <ul>
                    <li *ngFor="let area of getKeys(model.allowed_areas)">                        
                        <checkbox2 [(model)]="model.allowed_areas[area]"><span>{{area}}</span></checkbox2>
                    </li>
                </ul>
            </fieldset>
        </div>
    `,
    styles: [`
        li {
            margin-top: 4px;
        }
        
        li:first-of-type {
            margin-top: 0;
        }

        li span {
            font-weight: normal;
        }
    
        fieldset {
            
        }

        fieldset div {
            max-width: 180px;
            display: block;
        }
    `],
})
export class TraceComponent {
    @Input() model: Trace;

    private getKeys(o) {
        return Object.keys(o);
    }
}
