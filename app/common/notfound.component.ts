
import {NgModule, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';


@Component({
    selector: 'not-found',
    template: `
        <h1>这里什么都没有 :(</h1>
        <span>但是什么都是从没有到有的.</span>
    `
})
export class NotFound {
}

@NgModule({
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        NotFound
    ],
    declarations: [
        NotFound
    ]
})
export class Module { }
