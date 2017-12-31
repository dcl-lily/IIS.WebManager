
import {Component, Input} from '@angular/core';
import {WebServer} from './webserver';


@Component({
    selector: 'webserver-general',
    template: `
        <fieldset>
            <label>名称</label>
            <span class="form-control">{{model.name}}</span>
        </fieldset>
        <fieldset>
            <label>版本</label>
            <span class="form-control">{{model.version}}</span>
        </fieldset>
    `
})
export class WebServerGeneralComponent {
    @Input() model: WebServer;
}
