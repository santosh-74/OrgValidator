import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { OrgValidatorComponent } from './org-validator/org-validator.component';

@NgModule({
  declarations: [
    AppComponent,
    OrgValidatorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
