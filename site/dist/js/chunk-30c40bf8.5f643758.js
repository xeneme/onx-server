(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-30c40bf8"],{"06ca":function(t,e,s){},"1dfd":function(t,e,s){t.exports=s.p+"img/tracer2.3215c301.svg"},"42c9":function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"page"},[s("Background"),s("div",{staticClass:"container"},[s("contract-card"),s("div",{staticClass:"actions"},["user"==t.profile.role.name?s("a",{attrs:{title:"Call Support",href:"javascript:void(0)"},on:{click:t.callSupport}},[s("fa",{attrs:{icon:"headphones"}})],1):t._e(),s("a",{attrs:{title:"Go Back",href:"javascript:void(0)"},on:{click:t.goBack}},[s("fa",{staticStyle:{transform:"rotate(180deg)"},attrs:{icon:"sign-out-alt"}})],1)]),s("chat-card",{attrs:{messages:t.contract.messages},on:{typing:t.typing,send:t.sendMessage}})],1),s("Footer")],1)},n=[],o=(s("b0c0"),s("5530")),i=s("4c03"),c=s("cb53"),r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("card",{staticClass:"contract-card"},[s("div",{staticClass:"contract-card_top"},[s("div",{staticClass:"contract-card_top_title"},[s("div",{staticClass:"contract-card_top_title-trade-id"},[t._v(" Contract "),s("span",{staticStyle:{"font-weight":"600"}},[t._v("#"+t._s(t.contractId))])]),s("div",{staticClass:"contract-card_top_title-trade-product-name"},[t._v(' "'+t._s(t.contract.title)+'" ')])]),s("ul",{staticClass:"contract-card_top_rules"},[s("li",[t._v(" Do not confirm payment until you receive the product or service. ")]),s("li",[t._v(" Your chat is your contract, fully describe all the terms of your contract. ")]),s("li",[t._v("Check the correctness of the transaction amount.")]),s("li",[t._v("Do not give your Trade PIN to anyone.")]),s("li",[t._v(" If you have any questions feel free to call our support service. ")])])]),s("div",{staticClass:"contract-card_bottom"},[s("div",{staticClass:"contract-card_bottom_info"},[s("div",{staticClass:"contract-card_bottom_info-title"},[s("div",{staticClass:"contract-card_bottom_info-title-date"},[t._v("Date:")]),s("div",{staticClass:"contract-card_bottom_info-title-price"},[t._v("Price:")]),s("div",{staticClass:"contract-card_bottom_info-title-status"},[t._v("Status:")])]),s("div",{staticClass:"contract-card_bottom_info-data"},[s("div",{staticClass:"contract-card_bottom_info-data-date"},[t._v(" "+t._s(t.$time.format(t.contract.timestamp))+" ")]),s("div",{staticClass:"contract-card_bottom_info-data-price",staticStyle:{"font-weight":"600"}},[t._v(" "+t._s(t.contractAmount)+" ")]),s("div",{staticClass:"contract-card_bottom_info-data-status"},[t._v(" "+t._s(t.contract.status)+" ")])])]),s("div",{staticClass:"contract-card_bottom_status-circle"},[s("div",{staticClass:"percent"},[t._v(t._s(t.progressPercent))]),s("svg",{staticClass:"progress-ring-bg",attrs:{height:"120",width:"120"}},[s("circle",{staticClass:"progress-ring-bg__circle",attrs:{"stroke-width":"3",fill:"transparent",r:"38",cx:"60",cy:"60"}})]),s("svg",{staticClass:"progress-ring",attrs:{height:"120",width:"120"}},[s("circle",{class:["progress-ring__circle",t.progressClasses[t.paymentStage]],attrs:{"stroke-width":"3",fill:"transparent",r:"38",cx:"60",cy:"60"}})])]),s("button",{class:["contract-card_bottom_submit",t.loading||"completed"==t.contract.status?"loading":""],on:{click:t.handleReady}},[t._v(" "+t._s(t.ready?"Cancel":"Trade succeed")+" ")])])])},l=[],u=(s("99af"),s("d3b7"),s("ac1f"),s("25f0"),s("1276"),function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"card"},[t._t("default"),s("div",{staticClass:"card-light",style:{top:t.my+"px",left:t.mx+"px"}})],2)}),d=[],m={name:"card",data:function(){return{mx:0,my:0}},methods:{handleMouseMove:function(t){this.mx=t.x-this.$el.getBoundingClientRect().x-100,this.my=t.y-this.$el.getBoundingClientRect().y-100}},mounted:function(){this.$isDesktop&&document.addEventListener("mousemove",this.handleMouseMove)},destroyed:function(){this.$isDesktop&&document.removeEventListener("mousemove",this.handleMouseMove)}},_=m,f=(s("f5e0"),s("2877")),g=Object(f["a"])(_,u,d,!1,null,"443c66c6",null),h=g.exports,p=s("2f62"),v=s("bc3a"),C=s.n(v),y={name:"contract-card",components:{Card:h},data:function(){return{ready:!1,loading:!1,paymentStage:0,progressClasses:["","r25","r50","r75","r100"],progressPercent:"0%"}},watch:{paymentStage:function(t){var e=this,s={value:e.progressPercent};this.$anime({targets:s,duration:1500,round:1,value:["0%","25%","50%","75%","100%"][t],easing:"easeInOutExpo",update:function(){e.progressPercent=s.value}})}},computed:Object(o["a"])(Object(o["a"])({},Object(p["b"])({isLoggedIn:"auth/isLoggedIn",contract:"guard/CONTRACT"})),{},{contractId:function(){if(this.contract){var t=this.contract.timestamp.toString();return t.substring(t.length-6,t.length)}return""},contractAmount:function(){return this.contract?this.contract.amount+" "+this.contract.symbol:""}}),methods:{updateProgress:function(t){this.paymentStage=t.stage,this.contract.status=t.status},handleReady:function(){var t=this;this.loading||"completed"==this.contract.status||(this.loading=!0,C.a.get(window.location.protocol+"//"+window.location.host+"/trade-guard/contract/ready?pin="+this.contract.pin).then((function(e){if(t.loading=!1,t.ready=e.data.ready,e.data.transaction){t.$store.commit("auth/ADD_TRANSACTION",e.data.transaction),t.$store.commit("auth/UPDATE_WALLETS",e.data.wallets);var s=t.contract.amount+" of "+t.contract.symbol,a=e.data.transaction.type.split(" ")[0];t.$store.commit("popups/ADD_ALERT",{type:"info",title:"Transfer succeed!",message:"You have just ".concat(a," ").concat(s,"!")})}})).catch((function(e){t.loading=!1,e.response?(t.ready=e.response.data.ready,t.$store.commit("popups/ADD_ALERT",{type:"error",title:"Operation failed",message:e.response.data.message})):console.log(e)})))}},mounted:function(){this.$root.$on("update-progress",this.updateProgress),this.ready=this.contract.ready},beforeDestroy:function(){this.$root.$off("update-progress",this.updateProgress)}},b=y,$=(s("fe7d"),Object(f["a"])(b,r,l,!1,null,"3f372e7b",null)),k=$.exports,x=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("card",{staticClass:"chat-card"},[s("div",{staticClass:"chat-card__title"},[t._v(" Chat "),t._e()],1),s("chat",{attrs:{value:t.messages},on:{send:function(e){return t.$emit("send",e)},typing:function(e){return t.$emit("typing")}}})],1)},w=[],T=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"chat"},[s("div",{staticClass:"chat__body"},t._l(t.allMessages,(function(e){return s("div",{key:e.at,class:["chat__body__message",e.side,!e.sending||"sending"]},[s("div",{staticClass:"chat__body__message-text"},[e.icon?s("fa",{staticClass:"chat__body__message-text-icon",attrs:{icon:e.icon}}):t._e(),t._v(t._s(e.text)+" ")],1),e.sending&&"system"!=e.side?s("div",{staticClass:"chat__body__message-date"},[t._v(" "+t._s(e.side)+" ")]):s("div",{staticClass:"chat__body__message-date"},[t._v(" "+t._s(("system"!=e.side?e.side+", ":"")+t.$time.format(e.at))+" ")])])})),0),t._e(),s("div",{staticClass:"chat__input"},[s("input",{directives:[{name:"model",rawName:"v-model",value:t.message,expression:"message"}],staticClass:"chat__input-text",attrs:{placeholder:"Enter a message..."},domProps:{value:t.message},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.sendMessage(e)},input:[function(e){e.target.composing||(t.message=e.target.value)},function(e){return t.$emit("typing")}]}}),s("button",{staticClass:"chat__input-button",on:{click:t.sendMessage}},[t._v(" Send ")])])])},O=[],S=(s("4de4"),s("498a"),{props:{value:{type:Array,default:function(){return[{text:"Negotiations are under way!",at:1607075195449,side:"system",icon:"envelope"}]}}},data:function(){return{message:"",messagesQueue:[]}},computed:Object(o["a"])(Object(o["a"])({},Object(p["b"])({contract:"guard/CONTRACT"})),{},{allMessages:function(){return this.value.concat(this.messagesQueue)}}),methods:{sendMessage:function(){if(this.message.trim()){var t={id:this.$nanoid(),text:this.message.trim(),side:this.contract.buyer?"buyer":"seller",sending:!0};this.messagesQueue.push(t),this.$emit("send",t),this.message=""}},messageSent:function(t){this.scrollToLast(),this.messagesQueue=this.messagesQueue.filter((function(e){return e.id!=t}))},scrollToLast:function(){var t=this;setTimeout((function(){t.$el.querySelector(".chat__input-text").focus();var e=t.$el.querySelectorAll(".chat__body__message");if(e.length){var s=e[e.length-1];s.parentNode.scrollTop=s.offsetTop}}),10)}},mounted:function(){this.$root.$on("message",this.messageSent),this.scrollToLast()},beforeDestroy:function(){this.$root.$off("message",this.messageSent)}}),j=S,E=(s("519e"),Object(f["a"])(j,T,O,!1,null,null,null)),A=E.exports,M={name:"chat-card",components:{Card:h,Chat:A},props:{messages:{type:Array,default:function(){return[{text:"Negotiations are under way.",at:1607075195449,side:"system",icon:"podcast"},{text:"Hey there!",at:1607075196783,side:"seller",icon:"user-secret"},{text:"Hey!",at:1607075199861,side:"buyer",icon:"user"},{text:"I'm gonna buy this stuff.",at:1607075199761,side:"buyer",icon:"user"},{text:"Sure! Go ahead.",at:1607075390907,side:"seller",icon:"user-secret"},{text:"The product was successfully purchased!",at:1607075413907,side:"system",icon:"check"},{text:"Thank you so much! Have a good one.",at:1607075414907,side:"seller",icon:"user-secret"},{text:"You're welcome.",at:1607075415907,side:"buyer",icon:"user"}]}}},computed:Object(o["a"])({},Object(p["b"])({isLoggedIn:"auth/isLoggedIn"}))},D=M,L=(s("cc93"),Object(f["a"])(D,x,w,!1,null,"fa9e23b2",null)),P=L.exports,R={name:"trade-guard",components:{Footer:i["a"],Background:c["a"],ContractCard:k,ChatCard:P},computed:Object(o["a"])({},Object(p["b"])({profile:"auth/profile",contract:"guard/CONTRACT",socket:"auth/socket"})),methods:{typing:function(){this.socket.emit("typing",{contract:this.contract,email:this.profile.email})},sendMessage:function(t){this.socket.emit("message",t)},callSupport:function(){this.$store.commit("popups/SUPPORT")},goBack:function(){this.$router.push({path:"/wallet"})},disconnect:function(){"TradeGuard"==this.$route.name&&(this.goBack(),this.$store.commit("popups/ADD_ALERT",{type:"error",title:"Contract Connection",message:"For some reason, you've been diconnected"}))}},mounted:function(){var t=this;this.socket.emit("join-contract",{email:this.profile.email,contract:this.contract}),this.socket.on("message",(function(e){t.contract.messages.push(e),t.$root.$emit("message",e.id)})),this.socket.on("connected",(function(){t.$store.dispatch("preloader/startAfterLoading")})),this.socket.on("disconnected",(function(){t.disconnect()})),this.socket.on("progress",(function(e){t.$root.$emit("update-progress",e)})),this.socket.on("disconnect",(function(){t.disconnect()}))}},I=R,N=(s("7295"),Object(f["a"])(I,a,n,!1,null,"37d9b6e7",null));e["default"]=N.exports},"498a":function(t,e,s){"use strict";var a=s("23e7"),n=s("58a8").trim,o=s("c8d2");a({target:"String",proto:!0,forced:o("trim")},{trim:function(){return n(this)}})},"4c03":function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("footer",{staticClass:"footer"},[s("div",{staticClass:"container"},[s("div",{staticClass:"footer__wrap"},[s("div",{staticClass:"footer__logo"},[s("Logo"),s("p",{staticClass:"footer__logo-text"},[t._v(" Safety. Efficiency. Quality. ")])],1),s("Menu"),s("Contact"),s("small",{staticClass:"footer__copyright"},[t._v(" © "+t._s((new Date).getFullYear())+" "+t._s(t.host)+" ")])],1)])])},n=[],o=s("ef77"),i=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("nav",{staticClass:"menu-footer"},[s("h2",{staticClass:"menu-footer__title"},[t._v(" Menu ")]),s("ul",{staticClass:"menu-footer__list"},[s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Main ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/wallet"}},[t._v(" Wallet ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/trading"}},[t._v(" Trading ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/contract"}},[t._v(" Contract ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/about"}},[t._v(" About us ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/terms"}},[t._v(" Terms ")])],1)])])},c=[],r={name:"Menu"},l=r,u=(s("a8dc"),s("2877")),d=Object(u["a"])(l,i,c,!1,null,"0de0644a",null),m=d.exports,_=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("section",{staticClass:"footer-contact"},[s("h2",{staticClass:"footer-contact__title"},[t._v(" Contact ")]),s("ul",{staticClass:"footer-contact__list"},[s("li",{staticClass:"footer-contact__item"},[t._v(" Email: "),s("a",{attrs:{href:"mailto:support@"+t.host+".com"}},[t._v("support@"+t._s(t.host)+".com")])])])])},f=[],g=(s("ac1f"),s("1276"),{name:"Contact",computed:{host:function(){return window.location.host.split(".")[0]}}}),h=g,p=(s("5b1a"),Object(u["a"])(h,_,f,!1,null,"3d9529fa",null)),v=p.exports,C={name:"Footer",components:{Logo:o["a"],Menu:m,Contact:v},computed:{host:function(){return this.$store.getters.host}}},y=C,b=(s("e10f"),Object(u["a"])(y,a,n,!1,null,"1d2d8913",null));e["a"]=b.exports},"4dc1":function(t,e,s){},"519e":function(t,e,s){"use strict";var a=s("ec6a"),n=s.n(a);n.a},"552e":function(t,e,s){t.exports=s.p+"img/large-comet.1125501a.svg"},"5b1a":function(t,e,s){"use strict";var a=s("06ca"),n=s.n(a);n.a},6072:function(t,e,s){},7295:function(t,e,s){"use strict";var a=s("7ed8"),n=s.n(a);n.a},"7b6d":function(t,e,s){},"7c75":function(t,e,s){},"7d17":function(t,e,s){t.exports=s.p+"img/triangle.c13e28b7.svg"},"7ed8":function(t,e,s){},"81d4":function(t,e,s){"use strict";var a=s("6072"),n=s.n(a);n.a},a0da:function(t,e,s){},a8dc:function(t,e,s){"use strict";var a=s("4dc1"),n=s.n(a);n.a},c67a:function(t,e,s){},c8d2:function(t,e,s){var a=s("d039"),n=s("5899"),o="​᠎";t.exports=function(t){return a((function(){return!!n[t]()||o[t]()!=o||n[t].name!==t}))}},cb53:function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},n=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"bg"},[a("img",{staticClass:"bg__comet",attrs:{src:s("1dfd")}}),a("img",{staticClass:"bg__large-comet",attrs:{src:s("552e")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}})])}],o={name:"Background",mounted:function(){for(var t=this.$anime.timeline({loop:!0,direction:"alternate"}),e=0;e<20;e++)t.add({targets:".bg__triangle1",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)});for(var s=this.$anime.timeline({loop:!0,direction:"alternate"}),a=0;a<20;a++)s.add({targets:".bg__triangle2",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)})}},i=o,c=(s("81d4"),s("2877")),r=Object(c["a"])(i,a,n,!1,null,"33de5824",null);e["a"]=r.exports},cc93:function(t,e,s){"use strict";var a=s("c67a"),n=s.n(a);n.a},e10f:function(t,e,s){"use strict";var a=s("a0da"),n=s.n(a);n.a},ec6a:function(t,e,s){},f5e0:function(t,e,s){"use strict";var a=s("7b6d"),n=s.n(a);n.a},fe7d:function(t,e,s){"use strict";var a=s("7c75"),n=s.n(a);n.a}}]);
//# sourceMappingURL=chunk-30c40bf8.5f643758.js.map