(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-0f4aec20"],{"1dfd":function(t,e,a){t.exports=a.p+"img/tracer2.3215c301.svg"},"357f":function(t,e,a){},"35eb":function(t,e,a){"use strict";var i=a("9741"),s=a.n(i);s.a},"4c03":function(t,e,a){"use strict";var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("footer",{staticClass:"footer"},[a("div",{staticClass:"container"},[a("div",{staticClass:"footer__wrap"},[a("div",{staticClass:"footer__logo"},[a("Logo"),a("p",{staticClass:"footer__logo-text"},[t._v(" Safety. Efficiency. Quality. ")])],1),a("Menu"),a("Contact"),a("small",{staticClass:"footer__copyright"},[t._v(" © 2020 MyBitFX ")])],1)])])},s=[],r=a("ef77"),n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("nav",{staticClass:"menu-footer"},[a("h2",{staticClass:"menu-footer__title"},[t._v(" Menu ")]),a("ul",{staticClass:"menu-footer__list"},[a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Main ")])],1),a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/wallet"}},[t._v(" Wallet ")])],1),a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/trading"}},[t._v(" Trading ")])],1),a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/contract"}},[t._v(" Contract ")])],1),a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/about"}},[t._v(" About us ")])],1),a("li",{staticClass:"menu-footer__item"},[a("router-link",{staticClass:"menu-footer__link",attrs:{to:"/terms"}},[t._v(" Terms ")])],1)])])},o=[],c={name:"Menu"},l=c,d=(a("a8dc"),a("2877")),u=Object(d["a"])(l,n,o,!1,null,"0de0644a",null),v=u.exports,f=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},p=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("section",{staticClass:"footer-contact"},[a("h2",{staticClass:"footer-contact__title"},[t._v(" Contact ")]),a("ul",{staticClass:"footer-contact__list"},[a("li",{staticClass:"footer-contact__item"},[t._v(" Email: "),a("a",{attrs:{href:"mailto:support@mybitfx.com"}},[t._v("support@mybitfx.com")])])])])}],m={name:"Contact"},_=m,y=(a("6bb4"),Object(d["a"])(_,f,p,!1,null,"3035a10a",null)),h=y.exports,g={name:"Footer",components:{Logo:r["a"],Menu:v,Contact:h}},C=g,b=(a("35eb"),Object(d["a"])(C,i,s,!1,null,"d18ed4f4",null));e["a"]=b.exports},"4dc1":function(t,e,a){},"552e":function(t,e,a){t.exports=a.p+"img/large-comet.1125501a.svg"},6072:function(t,e,a){},"6bb4":function(t,e,a){"use strict";var i=a("357f"),s=a.n(i);s.a},"7d17":function(t,e,a){t.exports=a.p+"img/triangle.c13e28b7.svg"},"81d4":function(t,e,a){"use strict";var i=a("6072"),s=a.n(i);s.a},9741:function(t,e,a){},a76a:function(t,e,a){"use strict";var i=a("e580"),s=a.n(i);s.a},a8dc:function(t,e,a){"use strict";var i=a("4dc1"),s=a.n(i);s.a},cb53:function(t,e,a){"use strict";var i=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},s=[function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"bg"},[i("img",{staticClass:"bg__comet",attrs:{src:a("1dfd")}}),i("img",{staticClass:"bg__large-comet",attrs:{src:a("552e")}}),i("img",{staticClass:"bg__triangle1",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle1",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle1",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle1",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle2",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle2",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle2",attrs:{src:a("7d17")}}),i("img",{staticClass:"bg__triangle2",attrs:{src:a("7d17")}})])}],r={name:"Background",mounted:function(){for(var t=this.$anime.timeline({loop:!0,direction:"alternate"}),e=0;e<20;e++)t.add({targets:".bg__triangle1",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)});for(var a=this.$anime.timeline({loop:!0,direction:"alternate"}),i=0;i<20;i++)a.add({targets:".bg__triangle2",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)})}},n=r,o=(a("81d4"),a("2877")),c=Object(o["a"])(n,i,s,!1,null,"33de5824",null);e["a"]=c.exports},e580:function(t,e,a){},f820:function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page"},[a("Background"),a("div",{staticClass:"structure animated fadeInUp"},[t._m(0),a("div",{staticClass:"overview animated fadeInRight"},[a("div",{staticClass:"overview-background"},[a("div",{staticClass:"up",on:{click:t.prev}}),a("div",{staticClass:"desc"}),a("div",{staticClass:"path"}),a("div",{staticClass:"years"}),a("div",{staticClass:"down",on:{click:t.next}})]),a("div",{staticClass:"overview-foreground"},[a("div",{staticClass:"description"},t._l(t.computedYears,(function(e,i){return a("div",{key:i,staticClass:"description-text",style:{cursor:"pointer",opacity:e.opacity},on:{click:function(e){return t.goTo(i)}}},[t._v(" "+t._s(e.desc)+" ")])})),0),a("div",{staticClass:"places"},t._l(t.computedYears,(function(e,i){return a("div",{key:i,staticClass:"place-wrap",on:{click:function(e){return t.goTo(i)}}},[a("div",{staticClass:"place",style:{cursor:"pointer",opacity:e.opacity}})])})),0),a("div",{staticClass:"years"},t._l(t.computedYears,(function(e,i){return a("div",{key:i,staticClass:"years-year",style:{cursor:"pointer",opacity:e.opacity},on:{click:function(e){return t.goTo(i)}}},[t._v(" "+t._s(e.year)+" ")])})),0)])]),a("div",{directives:[{name:"waypoint",rawName:"v-waypoint",value:{active:!0,callback:t.onServicesWaypoint,options:t.waypointOptions},expression:"{\n        active: true,\n        callback: onServicesWaypoint,\n        options: waypointOptions,\n      }"}],staticClass:"services"},[a("div",{staticClass:"service"},[a("fa",{attrs:{icon:"shield-alt"}}),a("div",{staticClass:"title"},[t._v("System & Account Security")]),t._m(1)],1),a("div",{staticClass:"service"},[a("fa",{attrs:{icon:"fingerprint"}}),a("div",{staticClass:"title"},[t._v("Financial Security")]),t._m(2)],1),a("div",{staticClass:"service"},[a("fa",{attrs:{icon:"newspaper"}}),a("div",{staticClass:"title"},[t._v("Legal Compliance")]),t._m(3)],1)])]),a("div",{directives:[{name:"waypoint",rawName:"v-waypoint",value:{active:!0,callback:t.onContactWaypoint,options:t.waypointOptions},expression:"{\n      active: true,\n      callback: onContactWaypoint,\n      options: waypointOptions,\n    }"}],staticClass:"contact card hidden"},[a("div",{staticClass:"title"},[t._v("Contact Us")]),t._m(4),t._m(5)]),a("Footer")],1)},s=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"text animated fadeInLeft"},[a("div",{staticClass:"introduction card"},[a("div",{staticClass:"title"},[t._v(" Introduction ")]),a("div",{staticClass:"paragraph"},[t._v(" Established in 2014 as the first cloud mining provider, MyBitFX has become a multi-functional cryptocurrency exchange, trusted by over a million users. ")]),a("div",{staticClass:"paragraph"},[t._v(" MyBitFX offers cross-platform trading via website, mobile app, WebSocket and REST API, providing access to high liquidity orderbook for top currency pairs on the market. Instant Bitcoin buying and selling is available via simplified bundle interface. ")]),a("div",{staticClass:"paragraph"},[t._v(" The exchange has developed a multi-level account system with individual approach to each customer, from Bitcoin beginners to institutional traders. Worldwide coverage, multiple payment options, and 24/7 support are accompanied by time-proven platform stability that guarantees safety of assets and data. ")])]),a("div",{staticClass:"summary card"},[a("div",{staticClass:"title"},[t._v(" Legal and Security ")]),a("div",{staticClass:"paragraph"},[t._v(" Stability is of the highest priority for MyBitFX. We give all efforts to provide trouble-free services backed by system and user account security, safe cold cryptocurrency storage, financial viability, and profound legal compliance. ")]),a("div",{staticClass:"paragraph"},[t._v(" Throughout the history of our company, none of our users ever experienced account funds theft, and practical support of such reputation is an affair of honour for us. ")])])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"desc"},[a("div",[t._v("Two-factor authentication")]),a("div",[t._v("SSL certificate")]),a("div",[t._v("Encrypted data")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"desc"},[a("div",[t._v("Cold storage for cryptocurrency funds")]),a("div",[t._v("PCI DSS certificate")]),a("div",[t._v("Strong relations with banks")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"desc"},[a("div",[t._v("MSB status in FinCEN (USA)")]),a("div",[t._v("Registered with the ICO in the UK (EU)")]),a("div",[t._v("Internal AML/KYC policy and procedures")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"email"},[t._v(" Email for business inquiries: "),a("span",[t._v("admin@mybitfx.com")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"email"},[t._v(" Email for account-related issues and cardholder correspondence: "),a("span",[t._v("support@mybitfx.com")])])}],r=(a("4160"),a("159b"),a("4c03")),n=a("cb53"),o={name:"About",components:{Footer:r["a"],Background:n["a"]},data:function(){return{scrollPermit:!0,waypointOptions:{root:null,rootMargin:"0px 0px 0px 0px",threshold:[0,.5]},years:[{year:"Jan 2015",desc:"Cloud mining services suspended.",selected:!0,opacity:1},{year:"Mar 2015",desc:"MSB status in FinCEN obtained.",selected:!1,opacity:.1},{year:"Apr 2015",desc:"Simple Buy/Sell service launched.",selected:!1,opacity:0},{year:"Oct 2015",selected:!1,desc:"Integration with TradingView platform.",opacity:0},{year:"Dec 2015",desc:"Mobile application released.",selected:!1,opacity:0},{year:"Apr 2016",desc:"ETH market added to N. Withdrawals to cards launched.",selected:!1,opacity:0},{year:"Dec 2017",desc:"Maker Taker Fee Schedule Launched",selected:!1,opacity:0},{year:"Jan 2017",desc:"PCI DSS Certificate Upgraded to Level 2",selected:!1,opacity:0},{year:"Oct 2017",desc:"Variable Trade Fee Schedule Launched",selected:!1,opacity:0},{year:"Mar 2018",desc:"Margin Trading Launched",selected:!1,opacity:0},{year:"Jun 2018",desc:"Bitcoin Affiliate Program Launched",selected:!1,opacity:0}]}},computed:{computedYears:function(){return this.years}},methods:{onServicesWaypoint:function(t){var e=t.going,a=document.querySelectorAll(".service");if(e===this.$waypointMap.GOING_IN){var i=0;a.forEach((function(t){setTimeout((function(){t.classList.add("animated","fadeInUp","visible")}),i),i+=100}))}},onContactWaypoint:function(t){var e=t.going,a=document.querySelectorAll(".contact");if(e===this.$waypointMap.GOING_IN){var i=0;a.forEach((function(t){setTimeout((function(){t.classList.add("animated","fadeInRight","visible")}),i),i+=100}))}},next:function(){if(this.scrollPermit){this.go(1),this.scrollPermit=!1;var t=this;setTimeout((function(){t.scrollPermit=!0}),700)}},prev:function(){if(this.scrollPermit){this.go(-1),this.scrollPermit=!1;var t=this;setTimeout((function(){t.scrollPermit=!0}),700)}},go:function(t){for(var e=0;e<this.years.length;e++)if(this.years[e].selected){this.years[e].selected=!1;var a=e+t<0?this.years.length-1:e+t>this.years.length-1?0:e+t;this.years[a].selected=!0;break}this.updateOpacity(),this.updatePosition()},goTo:function(t){this.years.forEach((function(t){t.selected=!1})),this.years[t].selected=!0,this.updateOpacity(),this.updatePosition()},updateYearsPosition:function(){for(var t=16,e=8,a=0;a<this.years.length;a++)this.years[a].position=t+"rem",t-=e},updatePosition:function(){for(var t=0;t<this.years.length;t++)if(this.years[t].selected){this.$el.querySelector(".overview-foreground").style.top=this.years[t].position;break}},updateOpacity:function(){for(var t=0;t<this.years.length;t++){var e,a,i,s;this.years[t].selected&&(this.years[t].opacity=1),((null===(e=this.years[t-1])||void 0===e?void 0:e.selected)||(null===(a=this.years[t+1])||void 0===a?void 0:a.selected))&&(this.years[t].opacity=.1),this.years[t].selected||(null===(i=this.years[t-1])||void 0===i?void 0:i.selected)||(null===(s=this.years[t+1])||void 0===s?void 0:s.selected)||(this.years[t].opacity=0)}}},mounted:function(){this.updateYearsPosition(),document.body.style.overflowY="auto";var t=this;setInterval((function(){t.scrollPermit&&t.go(1)}),5e3)}},c=o,l=(a("a76a"),a("2877")),d=Object(l["a"])(c,i,s,!1,null,"7c512aa6",null);e["default"]=d.exports}}]);
//# sourceMappingURL=chunk-0f4aec20.6c5862b2.js.map