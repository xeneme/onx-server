(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-40a0153b"],{"060e":function(t,e,s){"use strict";var a=s("80e4"),o=s.n(a);o.a},"082c":function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("a",{staticClass:"button",class:[t.light?"button-light":"",t.theme||"primary"]},[t._v(t._s(t.text))])},o=[],n={name:"Button",props:["theme","text","light"]},i=n,r=(s("e203"),s("2877")),c=Object(r["a"])(i,a,o,!1,null,"0918ed06",null);e["a"]=c.exports},"18d3":function(t,e,s){"use strict";var a=s("4872"),o=s.n(a);o.a},"1dfd":function(t,e,s){t.exports=s.p+"img/tracer2.3215c301.svg"},"2b69":function(t,e,s){"use strict";var a=s("a24f"),o=s.n(a);o.a},"3f62":function(t,e,s){"use strict";var a=s("b0ce"),o=s.n(a);o.a},"44f5":function(t,e,s){"use strict";var a=s("917e"),o=s.n(a);o.a},4609:function(t,e,s){},4872:function(t,e,s){},"4c03":function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("footer",{staticClass:"footer"},[s("div",{staticClass:"container"},[s("div",{staticClass:"footer__wrap"},[s("div",{staticClass:"footer__logo"},[s("Logo"),s("p",{staticClass:"footer__logo-text"},[t._v(" Safety. Efficiency. Quality. ")])],1),s("Menu"),s("Contact"),s("small",{staticClass:"footer__copyright"},[t._v(" © "+t._s((new Date).getFullYear())+" "+t._s(t.host)+" ")])],1)])])},o=[],n=s("ef77"),i=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("nav",{staticClass:"menu-footer"},[s("h2",{staticClass:"menu-footer__title"},[t._v(" Menu ")]),s("ul",{staticClass:"menu-footer__list"},[s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Main ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/wallet"}},[t._v(" Wallet ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/trading"}},[t._v(" Trading ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/contract"}},[t._v(" Contract ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/about"}},[t._v(" About us ")])],1),s("li",{staticClass:"menu-footer__item"},[s("router-link",{staticClass:"menu-footer__link",attrs:{to:"/terms"}},[t._v(" Terms ")])],1)])])},r=[],c={name:"Menu"},l=c,u=(s("c5c2"),s("2877")),p=Object(u["a"])(l,i,r,!1,null,"55c89706",null),d=p.exports,h=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("section",{staticClass:"footer-contact"},[s("h2",{staticClass:"footer-contact__title"},[t._v(" Contact ")]),s("ul",{staticClass:"footer-contact__list"},[s("li",{staticClass:"footer-contact__item"},[t._v(" Email: "),s("a",{attrs:{href:"mailto:support@"+t.host}},[t._v("support@"+t._s(t.host))])])])])},f=[],m={name:"Contact",computed:{host:function(){return window.location.host}}},_=m,g=(s("18d3"),Object(u["a"])(_,h,f,!1,null,"7c615762",null)),y=g.exports,w={name:"Footer",components:{Logo:n["a"],Menu:d,Contact:y},computed:{host:function(){return this.$store.getters.host}}},b=w,v=(s("060e"),Object(u["a"])(b,a,o,!1,null,"55149196",null));e["a"]=v.exports},"552e":function(t,e,s){t.exports=s.p+"img/large-comet.1125501a.svg"},"7d17":function(t,e,s){t.exports=s.p+"img/triangle.c13e28b7.svg"},"80e4":function(t,e,s){},"89e7":function(t,e,s){"use strict";var a=s("c8b8"),o=s.n(a);o.a},"8a59":function(t,e,s){},"90eb":function(t,e,s){"use strict";var a=s("e5f2"),o=s.n(a);o.a},"917e":function(t,e,s){},9674:function(t,e,s){"use strict";var a=s("4609"),o=s.n(a);o.a},a24f:function(t,e,s){},ad15:function(t,e,s){"use strict";s.r(e);var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"page"},[s("Background"),s("ChangeNameForm",{attrs:{show:t.changeNameFormVisibility}}),s("ChangePasswordForm",{attrs:{show:t.changePasswordFormVisibility}}),s("TwoFA",{attrs:{show:t.twoFaFormVisibility}}),s("div",{staticClass:"profile"},[s("profile-tabs"),s("div",{staticClass:"profile__tab-content"},[s("transition",{attrs:{name:"tab-switch",mode:"out-in"}},[s("router-view")],1)],1)],1),s("Footer")],1)},o=[],n=s("5530"),i=s("2f62"),r=s("cb53"),c=s("4c03"),l=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"changename"},[s("div",{staticClass:"changename_wrap"},[s("div",{staticClass:"changename__title"},[s("i-button",{staticClass:"changename__title__close",attrs:{icon:"times"},on:{click:t.close}}),s("p",[s("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"user"}}),t._v(" Change name ")],1)],1),s("div",{staticClass:"changename__form"},[s("div",{staticClass:"changename__form_loading"},[s("fa",{staticClass:"changename__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),s("ProfileInput",{attrs:{type:"name",place:"top",placeholder:"Firstname",busy:t.busy},on:{typed:function(e){t.firstName=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changeName(e)}}}),s("ProfileInput",{attrs:{type:"name",place:"bottom",placeholder:"Lastname",busy:t.busy},on:{typed:function(e){t.lastName=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changeName(e)}}}),s("Button",{class:["changename__form__button_submit",t.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(e){return t.changeName(e)}}})],1)])])},u=[],p=(s("ac1f"),s("5319"),s("082c")),d=s("adb2"),h=s("cd9f"),f={name:"ChangeNameForm",components:{Button:p["a"],ProfileInput:d["a"],IButton:h["a"]},props:["show"],watch:{show:function(t){this.visibleForm(t)}},data:function(){return{busy:!1,firstName:"",lastName:""}},methods:{changeName:function(){var t=this;this.firstName.replace(" ","")||this.lastName.replace(" ","")?(this.loading(),this.axios.post(window.location.protocol+"//"+window.location.host+"/api/user/update/name",{firstName:this.firstName,lastName:this.lastName},{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(e){t.loaded(),t.success(e.data.token),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}))):this.close()},handleError:function(t){t&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:t.stage,message:t.message})},handleSuccess:function(t){this.$store.commit("popups/ADD_ALERT",{type:"info",title:t.stage,message:t.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changename__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changename__form_loading").style.display="none"},success:function(t){this.$store.commit("auth/GET_AUTHORIZED",{token:t}),this.$store.commit("auth/CHANGE_NAME",{first:this.firstName,last:this.lastName}),this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.$el.style.display="flex",this.$anime({targets:".changename_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changename_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/changeNameVisibility"]&&(this.$store.commit("popups/CHANGE_NAME",!1),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},m=f,_=(s("44f5"),s("2877")),g=Object(_["a"])(m,l,u,!1,null,null,null),y=g.exports,w=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"changepassword"},[s("div",{staticClass:"changepassword_wrap"},[s("div",{staticClass:"changepassword__title"},[s("i-button",{staticClass:"changepassword__title__close",attrs:{icon:"times"},on:{click:t.close}}),s("p",[s("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"lock"}}),t._v(" Change password ")],1)],1),s("div",{staticClass:"changepassword__form"},[s("div",{staticClass:"changepassword__form_loading"},[s("fa",{staticClass:"changepassword__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),t.isLoggedIn?s("ProfileInput",{attrs:{type:"password",place:"top",placeholder:"Current",busy:t.busy},on:{typed:function(e){t.password=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword(e)}}}):t._e(),t.isLoggedIn?s("ProfileInput",{attrs:{type:"password",placeholder:"New",busy:t.busy},on:{typed:function(e){t.newPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword(e)}}}):s("ProfileInput",{attrs:{type:"password",place:"top",placeholder:"New",busy:t.busy},on:{typed:function(e){t.newPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword(e)}}}),s("ProfileInput",{attrs:{type:"repeatPassword",place:"bottom",placeholder:"Repeat new",busy:t.busy},on:{typed:function(e){t.repeatNewPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword(e)}}}),s("Button",{class:["changepassword__form__button_submit",t.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(e){return t.changePassword(e)}}})],1)])])},b=[],v={name:"ChangePasswordForm",components:{Button:p["a"],IButton:h["a"],ProfileInput:d["a"]},props:["show","token"],watch:{show:function(t){this.visibleForm(t)}},data:function(){return{busy:!1,password:"",newPassword:"",repeatNewPassword:""}},computed:{isLoggedIn:function(){return this.$store.getters["auth/isLoggedIn"]}},methods:{changePassword:function(){var t=this;if(this.password.replace(" ","")||this.repeatNewPassword.replace(" ","")||this.newPassword.replace(" ","")){this.loading();var e=window.location.protocol+"//"+window.location.host;if(this.token)this.axios.post(e+"/api/auth/reset/submit",{token:this.token,newPassword:this.newPassword,repeatNewPassword:this.repeatNewPassword}).then((function(e){t.$store.commit("auth/RESET_PASSWORD",""),t.loaded(),t.close(),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}));else{if(!(this.password&&this.repeatNewPassword&&this.newPassword))return this.handleError({stage:"Validation",message:"The operation was canceled because of validation troubles. Have you filed every form?"}),void this.loaded();this.axios.post(e+"/api/user/update/password",{token:this.token,password:this.password,newPassword:this.newPassword,repeatNewPassword:this.repeatNewPassword},{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(e){t.loaded(),t.success(e.data.token),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}))}}else this.close()},handleError:function(t){t&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:t.stage,message:t.message})},handleSuccess:function(t){this.$store.commit("popups/ADD_ALERT",{type:"info",title:t.stage,message:t.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changepassword__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changepassword__form_loading").style.display="none"},success:function(t){this.$store.commit("auth/GET_AUTHORIZED",{token:t}),this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.$el.style.display="flex",this.$anime({targets:".changepassword_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changepassword_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/changePasswordVisibility"]&&(this.$store.commit("popups/CHANGE_PASSWORD",!1),this.$store.commit("auth/RESET_PASSWORD",""),this.$emit("closed"),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},k=v,C=(s("90eb"),Object(_["a"])(k,w,b,!1,null,null,null)),$=C.exports,F=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"twofa"},[s("div",{staticClass:"twofa_wrap"},[s("div",{staticClass:"twofa__title"},[s("i-button",{staticClass:"twofa__title__close",attrs:{icon:"times"},on:{click:t.close}}),s("p",[s("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"calculator"}}),t._v(" Two-Factor Authentication ")],1)],1),s("div",{staticClass:"twofa__form"},[s("div",{staticClass:"twofa__form_loading"},[s("fa",{staticClass:"twofa__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),s("div",{staticClass:"text"},[t._v(" With 2FA enabled, you have to enter a 6-digit code that our Telegram bot will send you every log in to your account. ")]),s("a",{staticClass:"link",attrs:{href:"/api/user/twofa",target:"_blank"}},[t._v(" go to the bot ")]),t.profile.twoFa?s("div",{staticClass:"text"},[t._v(" In order to disable 2FA, take your activation code from the bot and past it here: ")]):s("div",{staticClass:"text"},[t._v(" In order to enable 2FA, take your activation code from the bot and past it here: ")]),s("div",{staticClass:"code"},[s("input",{directives:[{name:"model",rawName:"v-model",value:t.code,expression:"code"}],staticClass:"code-input",attrs:{type:"text",min:"0",max:"6",placeholder:"000000"},domProps:{value:t.code},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.twoFa(e)},input:function(e){e.target.composing||(t.code=e.target.value)}}}),s("Button",{class:["twofa__form__button_submit",t.busy?"busy_btn":""],attrs:{text:t.profile.twoFa?"Disable":"Enable",light:t.profile.twoFa?"":"true",theme:"primary_big"},nativeOn:{click:function(e){return t.twoFa(e)}}})],1)])])])},E=[],x=(s("1276"),s("bc3a")),P=s.n(x),N=window.location.protocol+"//"+window.location.host+"/api/",O={name:"TwoFaForm",components:{Button:p["a"],IButton:h["a"]},props:["show"],watch:{show:function(t){this.visibleForm(t)}},computed:Object(n["a"])({host:function(){return window.location.host.split(".")[0]}},Object(i["b"])({profile:"auth/profile"})),data:function(){return{code:"",busy:!1}},methods:{sendCode:function(){var t=this,e=this.profile.twoFa?"disable":"enable";this.loading(),P.a.get(N+"user/two-factor-authorization/"+e+"/code",{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(){t.loaded()})).catch((function(){t.loaded()}))},twoFa:function(){var t=this;this.loading();var e=this.profile.twoFa?"disable":"enable",s=N+"user/two-factor-authorization",a={headers:{Authorization:localStorage.getItem("auth-token")}},o={mode:e,code:this.code};P.a.post(s,o,a).then((function(e){var s=e.data;t.loaded(),t.code="",t.profile.twoFa=!t.profile.twoFa,t.$store.commit("popups/ADD_ALERT",{type:"info",title:s.stage,message:s.message}),t.close()})).catch((function(e){t.loaded(),t.code="",e.response&&e.response.data?t.$store.commit("popups/ADD_ALERT",{type:"error",title:e.response.data.stage,message:e.response.data.message}):t.$store.commit("popups/ADD_ALERT",{type:"error",title:"Exception",message:"Something wrong with your connection"})}))},loading:function(){this.busy=!0,this.$el.querySelector(".twofa__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".twofa__form_loading").style.display="none"},success:function(){this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.sendCode(),this.$el.style.display="flex",this.$anime({targets:".twofa_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".twofa_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/twoFaFormVisibility"]&&(this.$store.commit("popups/CHANGE_TWOFA",!1),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},A=O,S=(s("89e7"),Object(_["a"])(A,F,E,!1,null,"26254060",null)),V=S.exports,I=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"profile-tabs"},t._l(t.tabs,(function(e,a){return s("router-link",{key:a,staticClass:"profile-tabs__item holo-panel",class:{active:a==t.activeTab},attrs:{to:"/account"+e.path}},[s("fa",{attrs:{icon:e.icon}})],1)})),1)},T=[],D=(s("b0c0"),{data:function(){return{tabs:[{name:"profile",path:"",icon:"user"},{name:"analytics",path:"/analytics",icon:"chart-area"}]}},computed:{activeTab:function(){return{Profile:0,Analytics:1}[this.$route.name]}}}),L=D,j=(s("e05d"),Object(_["a"])(L,I,T,!1,null,null,null)),R=j.exports,B={name:"Profile",components:{Background:r["a"],Footer:c["a"],ChangeNameForm:y,ChangePasswordForm:$,TwoFA:V,ProfileTabs:R},data:function(){return{}},computed:Object(n["a"])({},Object(i["b"])({changeNameFormVisibility:"popups/changeNameVisibility",changePasswordFormVisibility:"popups/changePasswordVisibility",twoFaFormVisibility:"popups/twoFaFormVisibility",profile:"auth/profile"})),methods:{},created:function(){this.profile||this.$router.push("/")},mounted:function(){}},q=B,H=(s("3f62"),Object(_["a"])(q,a,o,!1,null,"998e23f0",null));e["default"]=H.exports},adb2:function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{class:["profileinput",t.place]},[s("div",{staticClass:"profileinput_icon_wrap"},[s("div",{staticClass:"profileinput_icon"},[s("fa",{attrs:{icon:t.icon}})],1)]),"checkbox"===t.parsedType?s("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:"checkbox"},domProps:{checked:Array.isArray(t.inputValue)?t._i(t.inputValue,null)>-1:t.inputValue},on:{change:function(e){var s=t.inputValue,a=e.target,o=!!a.checked;if(Array.isArray(s)){var n=null,i=t._i(s,n);a.checked?i<0&&(t.inputValue=s.concat([n])):i>-1&&(t.inputValue=s.slice(0,i).concat(s.slice(i+1)))}else t.inputValue=o}}}):"radio"===t.parsedType?s("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:"radio"},domProps:{checked:t._q(t.inputValue,null)},on:{change:function(e){t.inputValue=null}}}):s("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:t.parsedType},domProps:{value:t.inputValue},on:{input:function(e){e.target.composing||(t.inputValue=e.target.value)}}})])},o=[],n={name:"ProfileInput",props:["type","busy","placeholder","place"],data:function(){return{inputValue:"",mounted:!1}},watch:{inputValue:function(t){this.$emit("typed",t)}},computed:{icon:function(){return this.mounted&&this.$anime({targets:this.$el.querySelector(".profileinput_icon *"),scale:[0,1],duration:1200}),{name:"user",password:"lock",repeatPassword:"lock"}[this.type]},parsedType:function(){return{name:"text",password:"password",repeatPassword:"password"}[this.type]}},mounted:function(){this.mounted=!0}},i=n,r=(s("2b69"),s("2877")),c=Object(r["a"])(i,a,o,!1,null,"34098b66",null);e["a"]=c.exports},b0ce:function(t,e,s){},c5c2:function(t,e,s){"use strict";var a=s("fc4e"),o=s.n(a);o.a},c8b8:function(t,e,s){},cb53:function(t,e,s){"use strict";var a=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},o=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"bg"},[a("img",{staticClass:"bg__comet",attrs:{src:s("1dfd")}}),a("img",{staticClass:"bg__large-comet",attrs:{src:s("552e")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}})])}],n={name:"Background"},i=n,r=(s("9674"),s("2877")),c=Object(r["a"])(i,a,o,!1,null,"61f92786",null);e["a"]=c.exports},d8a1:function(t,e,s){},e05d:function(t,e,s){"use strict";var a=s("8a59"),o=s.n(a);o.a},e203:function(t,e,s){"use strict";var a=s("d8a1"),o=s.n(a);o.a},e5f2:function(t,e,s){},fc4e:function(t,e,s){}}]);
//# sourceMappingURL=chunk-40a0153b.51462c08.js.map