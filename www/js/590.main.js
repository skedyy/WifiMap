"use strict";(self.webpackChunkmy_app=self.webpackChunkmy_app||[]).push([[590],{39:(t,e,s)=>{s.d(e,{m:()=>d});var a=s(895),i=s(34),r=s(352),n=s(199);const o="--background";class d extends a.Uw{constructor(){super(...arguments),this.appearance=r.z.system,this.darkModeClass="dark",this.registeredListener=!1,this.appearanceListeners=new Set,this.syncStatusBar=!0,this.statusBarBackgroundVariable=o,this.handleTransitions=!0}async setNativeDarkModeListener(t,e){throw this.unimplemented("setNativeDarkModeListener is native only")}async init({cssClass:t,statusBarBackgroundVariable:e,getter:s,setter:a,syncStatusBar:i,statusBarStyleGetter:r,disableTransitions:n}={}){t&&(document.documentElement.classList.remove(this.darkModeClass),this.darkModeClass=t),this.statusBarBackgroundVariable=e||o,"function"==typeof s&&(this.getter=s),"function"==typeof a&&(this.setter=a),"boolean"!=typeof i&&"textOnly"!==i||(this.syncStatusBar=i),"function"==typeof r&&(this.statusBarStyleGetter=r),"boolean"==typeof n&&(this.handleTransitions=n),this.registeredListener||await this.registerDarkModeListener(),await this.update()}async configure(t){return this.init(t)}async addAppearanceListener(t){return this.appearanceListeners.add(t),Promise.resolve({remove:()=>this.appearanceListeners.delete(t)})}disableTransitions(){this.handleTransitions&&(this.disableTransitionsStyle||(this.disableTransitionsStyle=document.createElement("style"),this.disableTransitionsStyle.innerText="* { transition: none !important; --transition: none !important; } ion-content::part(background) { transition: none !important; }"),document.head.appendChild(this.disableTransitionsStyle))}enableTransitions(){if(this.handleTransitions&&this.disableTransitionsStyle){const t=this.disableTransitionsStyle;window.setTimeout((()=>{document.head.contains(t)&&document.head.removeChild(t)}),100)}}async update(t){const e=document.body.classList.contains(this.darkModeClass);let s,i=this.appearance;if(this.getter){const t=await this.getter();t&&(i=t)}if(s=i===r.z.system?t?t.dark:(await this.isDarkMode()).dark:i===r.z.dark,s!==e&&(this.disableTransitions(),document.body.classList[s?"add":"remove"](this.darkModeClass),this.enableTransitions()),a.dV.isNativePlatform()&&await this.handleStatusBar(s),this.setter&&this.appearance!==i&&await this.setter(i),t)for(const e of this.appearanceListeners)e(t);return this.appearance=i,Promise.resolve(this.appearance)}getBackgroundColor(){const t=document.querySelector("ion-content");if(t){const e=getComputedStyle(t).getPropertyValue(this.statusBarBackgroundVariable).trim();if((0,n.G3)(e))return(0,n.iF)(e);console.warn(`Invalid hex color '${e}' for ${this.statusBarBackgroundVariable}`)}return""}async handleStatusBar(t){let e="ios"===a.dV.getPlatform(),s=t?i.bg.Dark:i.bg.Light,r="";if(this.syncStatusBar&&"android"===a.dV.getPlatform())if(e=!0,"textOnly"!==this.syncStatusBar&&(r=this.getBackgroundColor()),this.statusBarStyleGetter){const t=await this.statusBarStyleGetter(s,r);t&&(s=t)}else r?s=(0,n.jn)(r)?i.bg.Dark:i.bg.Light:e=!1;const o=[];r&&o.push(i.A_.setBackgroundColor({color:r})),e&&o.push(i.A_.setStyle({style:s})),o.length&&await Promise.all(o)}}},590:(t,e,s)=>{s.r(e),s.d(e,{DarkModeNative:()=>i});var a=s(39);class i extends a.m{constructor(t){super(),this.setNativeDarkModeListener=t.setNativeDarkModeListener,this.isDarkMode=t.isDarkMode}async registerDarkModeListener(){await this.setNativeDarkModeListener({},(t=>{this.update(t).catch(console.error)})),this.registeredListener=!0}async isDarkMode(){return Promise.resolve({dark:!1})}}}}]);