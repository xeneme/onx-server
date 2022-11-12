(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-1f404dd4"],{"00aa":function(t,e,a){},"082c":function(t,e,a){"use strict";var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("a",{staticClass:"button",class:[t.light?"button-light":"",t.theme||"primary"]},[t._v(t._s(t.text))])},o=[],n={name:"Button",props:["theme","text","light"]},i=n,r=(a("e203"),a("2877")),l=Object(r["a"])(i,s,o,!1,null,"0918ed06",null);e["a"]=l.exports},"1b70":function(t,e,a){},"44f5":function(t,e,a){"use strict";a("708a")},"4dfd":function(t,e,a){},"53de":function(t,e,a){"use strict";a("8bda")},"708a":function(t,e,a){},"8bda":function(t,e,a){},"90eb":function(t,e,a){"use strict";a("eac1")},aa88:function(t,e,a){"use strict";a("4dfd")},ad15:function(t,e,a){"use strict";a.r(e);var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"page"},[a("Background"),a("ChangeNameForm",{attrs:{show:t.changeNameFormVisibility}}),a("ChangePasswordForm",{attrs:{show:t.changePasswordFormVisibility}}),a("TwoFA",{attrs:{show:t.twoFaFormVisibility}}),a("div",{staticClass:"profile"},[a("profile-tabs"),a("div",{staticClass:"profile__tab-content"},[a("transition",{attrs:{name:"tab-switch",mode:"out-in"}},[a("router-view")],1)],1)],1),a("Footer")],1)},o=[],n=a("5530"),i=a("2f62"),r=a("cb53"),l=a("4c03"),c=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"changename"},[a("div",{staticClass:"changename_wrap"},[a("div",{staticClass:"changename__title"},[a("i-button",{staticClass:"changename__title__close",attrs:{icon:"times"},on:{click:t.close}}),a("p",[a("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"user"}}),t._v(" Change name ")],1)],1),a("div",{staticClass:"changename__form"},[a("div",{staticClass:"changename__form_loading"},[a("fa",{staticClass:"changename__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),a("ProfileInput",{attrs:{type:"name",place:"top",placeholder:"Firstname",busy:t.busy},on:{typed:function(e){t.firstName=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changeName.apply(null,arguments)}}}),a("ProfileInput",{attrs:{type:"name",place:"bottom",placeholder:"Lastname",busy:t.busy},on:{typed:function(e){t.lastName=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changeName.apply(null,arguments)}}}),a("Button",{class:["changename__form__button_submit",t.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(e){return t.changeName.apply(null,arguments)}}})],1)])])},u=[],p=(a("ac1f"),a("5319"),a("082c")),d=a("adb2"),h=a("cd9f"),f={name:"ChangeNameForm",components:{Button:p["a"],ProfileInput:d["a"],IButton:h["a"]},props:["show"],watch:{show:function(t){this.visibleForm(t)}},data:function(){return{busy:!1,firstName:"",lastName:""}},methods:{changeName:function(){var t=this;this.firstName.replace(" ","")||this.lastName.replace(" ","")?(this.loading(),this.axios.post(window.location.protocol+"//"+window.location.host+"/api/user/update/name",{firstName:this.firstName,lastName:this.lastName},{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(e){t.loaded(),t.success(e.data.token),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}))):this.close()},handleError:function(t){t&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:t.stage,message:t.message})},handleSuccess:function(t){this.$store.commit("popups/ADD_ALERT",{type:"info",title:t.stage,message:t.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changename__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changename__form_loading").style.display="none"},success:function(t){this.$store.commit("auth/GET_AUTHORIZED",{token:t}),this.$store.commit("auth/CHANGE_NAME",{first:this.firstName,last:this.lastName}),this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.$el.style.display="flex",this.$anime({targets:".changename_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changename_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/changeNameVisibility"]&&(this.$store.commit("popups/CHANGE_NAME",!1),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},m=f,y=(a("44f5"),a("2877")),w=Object(y["a"])(m,c,u,!1,null,null,null),g=w.exports,_=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"changepassword"},[a("div",{staticClass:"changepassword_wrap"},[a("div",{staticClass:"changepassword__title"},[a("i-button",{staticClass:"changepassword__title__close",attrs:{icon:"times"},on:{click:t.close}}),a("p",[a("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"lock"}}),t._v(" Change password ")],1)],1),a("div",{staticClass:"changepassword__form"},[a("div",{staticClass:"changepassword__form_loading"},[a("fa",{staticClass:"changepassword__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),t.isLoggedIn?a("ProfileInput",{attrs:{type:"password",place:"top",placeholder:"Current",busy:t.busy},on:{typed:function(e){t.password=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword.apply(null,arguments)}}}):t._e(),t.isLoggedIn?a("ProfileInput",{attrs:{type:"password",placeholder:"New",busy:t.busy},on:{typed:function(e){t.newPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword.apply(null,arguments)}}}):a("ProfileInput",{attrs:{type:"password",place:"top",placeholder:"New",busy:t.busy},on:{typed:function(e){t.newPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword.apply(null,arguments)}}}),a("ProfileInput",{attrs:{type:"repeatPassword",place:"bottom",placeholder:"Repeat new",busy:t.busy},on:{typed:function(e){t.repeatNewPassword=e}},nativeOn:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.changePassword.apply(null,arguments)}}}),a("Button",{class:["changepassword__form__button_submit",t.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(e){return t.changePassword.apply(null,arguments)}}})],1)])])},b=[],v={name:"ChangePasswordForm",components:{Button:p["a"],IButton:h["a"],ProfileInput:d["a"]},props:["show","token"],watch:{show:function(t){this.visibleForm(t)}},data:function(){return{busy:!1,password:"",newPassword:"",repeatNewPassword:""}},computed:{isLoggedIn:function(){return this.$store.getters["auth/isLoggedIn"]}},methods:{changePassword:function(){var t=this;if(this.password.replace(" ","")||this.repeatNewPassword.replace(" ","")||this.newPassword.replace(" ","")){this.loading();var e=window.location.protocol+"//"+window.location.host;if(this.token)this.axios.post(e+"/api/auth/reset/submit",{token:this.token,newPassword:this.newPassword,repeatNewPassword:this.repeatNewPassword}).then((function(e){t.$store.commit("auth/RESET_PASSWORD",""),t.loaded(),t.close(),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}));else{if(!(this.password&&this.repeatNewPassword&&this.newPassword))return this.handleError({stage:"Validation",message:"The operation was canceled because of validation troubles. Have you filed every form?"}),void this.loaded();this.axios.post(e+"/api/user/update/password",{token:this.token,password:this.password,newPassword:this.newPassword,repeatNewPassword:this.repeatNewPassword},{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(e){t.loaded(),t.success(e.data.token),t.handleSuccess(e.data)})).catch((function(e){t.loaded(),e.response&&t.handleError(e.response.data)}))}}else this.close()},handleError:function(t){t&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:t.stage,message:t.message})},handleSuccess:function(t){this.$store.commit("popups/ADD_ALERT",{type:"info",title:t.stage,message:t.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changepassword__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changepassword__form_loading").style.display="none"},success:function(t){this.$store.commit("auth/GET_AUTHORIZED",{token:t}),this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.$el.style.display="flex",this.$anime({targets:".changepassword_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changepassword_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/changePasswordVisibility"]&&(this.$store.commit("popups/CHANGE_PASSWORD",!1),this.$store.commit("auth/RESET_PASSWORD",""),this.$emit("closed"),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},k=v,C=(a("90eb"),Object(y["a"])(k,_,b,!1,null,null,null)),$=C.exports,F=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"twofa"},[a("div",{staticClass:"twofa_wrap"},[a("div",{staticClass:"twofa__title"},[a("i-button",{staticClass:"twofa__title__close",attrs:{icon:"times"},on:{click:t.close}}),a("p",[a("fa",{staticStyle:{color:"#0075ff","margin-right":"3px"},attrs:{icon:"calculator"}}),t._v(" Two-Factor Authentication ")],1)],1),a("div",{staticClass:"twofa__form"},[a("div",{staticClass:"twofa__form_loading"},[a("fa",{staticClass:"twofa__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),a("div",{staticClass:"text"},[t._v(" With 2FA enabled, you have to enter a 6-digit code that our Telegram bot will send you every log in to your account. ")]),a("a",{staticClass:"link",attrs:{href:"/api/user/twofa",target:"_blank"}},[t._v(" go to the bot ")]),t.profile.twoFa?a("div",{staticClass:"text"},[t._v(" In order to disable 2FA, take your activation code from the bot and past it here: ")]):a("div",{staticClass:"text"},[t._v(" In order to enable 2FA, take your activation code from the bot and past it here: ")]),a("div",{staticClass:"code"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.code,expression:"code"}],staticClass:"code-input",attrs:{type:"text",min:"0",max:"6",placeholder:"000000"},domProps:{value:t.code},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.twoFa.apply(null,arguments)},input:function(e){e.target.composing||(t.code=e.target.value)}}}),a("Button",{class:["twofa__form__button_submit",t.busy?"busy_btn":""],attrs:{text:t.profile.twoFa?"Disable":"Enable",light:t.profile.twoFa?"":"true",theme:"primary_big"},nativeOn:{click:function(e){return t.twoFa.apply(null,arguments)}}})],1)])])])},P=[],E=(a("1276"),a("bc3a")),x=a.n(E),N=window.location.protocol+"//"+window.location.host+"/api/",A={name:"TwoFaForm",components:{Button:p["a"],IButton:h["a"]},props:["show"],watch:{show:function(t){this.visibleForm(t)}},computed:Object(n["a"])({host:function(){return window.location.host.split(".")[0]}},Object(i["b"])({profile:"auth/profile"})),data:function(){return{code:"",busy:!1}},methods:{sendCode:function(){var t=this,e=this.profile.twoFa?"disable":"enable";this.loading(),x.a.get(N+"user/two-factor-authorization/"+e+"/code",{headers:{Authorization:localStorage.getItem("auth-token")}}).then((function(){t.loaded()})).catch((function(){t.loaded()}))},twoFa:function(){var t=this;this.loading();var e=this.profile.twoFa?"disable":"enable",a=N+"user/two-factor-authorization",s={headers:{Authorization:localStorage.getItem("auth-token")}},o={mode:e,code:this.code};x.a.post(a,o,s).then((function(e){var a=e.data;t.loaded(),t.code="",t.profile.twoFa=!t.profile.twoFa,t.$store.commit("popups/ADD_ALERT",{type:"info",title:a.stage,message:a.message}),t.close()})).catch((function(e){t.loaded(),t.code="",e.response&&e.response.data?t.$store.commit("popups/ADD_ALERT",{type:"error",title:e.response.data.stage,message:e.response.data.message}):t.$store.commit("popups/ADD_ALERT",{type:"error",title:"Exception",message:"Something wrong with your connection"})}))},loading:function(){this.busy=!0,this.$el.querySelector(".twofa__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".twofa__form_loading").style.display="none"},success:function(){this.close()},visibleForm:function(t){var e=this;this.$el.style.top=0,t?(this.sendCode(),this.$el.style.display="flex",this.$anime({targets:".twofa_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(t){t.progress>30&&(e.$el.style.backgroundColor="#00002299",e.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".twofa_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){e.$el.style.display="none"}}))},close:function(){this.$store.getters["popups/twoFaFormVisibility"]&&(this.$store.commit("popups/CHANGE_TWOFA",!1),history.replaceState(null,null," "))}},mounted:function(){var t=this;this.visibleForm(this.show),document.addEventListener("keydown",(function(e){"Escape"===e.key&&t.close()}))}},O=A,S=(a("53de"),Object(y["a"])(O,F,P,!1,null,"d9553624",null)),V=S.exports,I=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"profile-tabs"},t._l(t.tabs,(function(e,s){return a("router-link",{key:s,staticClass:"profile-tabs__item holo-panel",class:{active:s==t.activeTab},attrs:{to:"/account"+e.path}},[a("fa",{attrs:{icon:e.icon}})],1)})),1)},T=[],D=(a("b0c0"),{data:function(){return{tabs:[{name:"profile",path:"",icon:"user"},{name:"analytics",path:"/analytics",icon:"chart-area"}]}},computed:{activeTab:function(){return{Profile:0,Analytics:1}[this.$route.name]}}}),L=D,R=(a("e05d"),Object(y["a"])(L,I,T,!1,null,null,null)),B=R.exports,j={name:"Profile",components:{Background:r["a"],Footer:l["a"],ChangeNameForm:g,ChangePasswordForm:$,TwoFA:V,ProfileTabs:B},data:function(){return{}},computed:Object(n["a"])({},Object(i["b"])({changeNameFormVisibility:"popups/changeNameVisibility",changePasswordFormVisibility:"popups/changePasswordVisibility",twoFaFormVisibility:"popups/twoFaFormVisibility",profile:"auth/profile"})),methods:{},created:function(){this.profile||this.$router.push("/")},mounted:function(){}},q=j,H=(a("b8a5"),Object(y["a"])(q,s,o,!1,null,"0115f904",null));e["default"]=H.exports},adb2:function(t,e,a){"use strict";var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{class:["profileinput",t.place]},[a("div",{staticClass:"profileinput_icon_wrap"},[a("div",{staticClass:"profileinput_icon"},[a("fa",{attrs:{icon:t.icon}})],1)]),"checkbox"===t.parsedType?a("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:"checkbox"},domProps:{checked:Array.isArray(t.inputValue)?t._i(t.inputValue,null)>-1:t.inputValue},on:{change:function(e){var a=t.inputValue,s=e.target,o=!!s.checked;if(Array.isArray(a)){var n=null,i=t._i(a,n);s.checked?i<0&&(t.inputValue=a.concat([n])):i>-1&&(t.inputValue=a.slice(0,i).concat(a.slice(i+1)))}else t.inputValue=o}}}):"radio"===t.parsedType?a("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:"radio"},domProps:{checked:t._q(t.inputValue,null)},on:{change:function(e){t.inputValue=null}}}):a("input",{directives:[{name:"model",rawName:"v-model",value:t.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:t.placeholder,disabled:t.busy,type:t.parsedType},domProps:{value:t.inputValue},on:{input:function(e){e.target.composing||(t.inputValue=e.target.value)}}})])},o=[],n={name:"ProfileInput",props:["type","busy","placeholder","place"],data:function(){return{inputValue:"",mounted:!1}},watch:{inputValue:function(t){this.$emit("typed",t)}},computed:{icon:function(){return this.mounted&&this.$anime({targets:this.$el.querySelector(".profileinput_icon *"),scale:[0,1],duration:1200}),{name:"user",password:"lock",repeatPassword:"lock"}[this.type]},parsedType:function(){return{name:"text",password:"password",repeatPassword:"password"}[this.type]}},mounted:function(){this.mounted=!0}},i=n,r=(a("aa88"),a("2877")),l=Object(r["a"])(i,s,o,!1,null,"e85bac00",null);e["a"]=l.exports},b8a5:function(t,e,a){"use strict";a("00aa")},e05d:function(t,e,a){"use strict";a("1b70")},e203:function(t,e,a){"use strict";a("e31c")},e31c:function(t,e,a){},eac1:function(t,e,a){}}]);
//# sourceMappingURL=chunk-1f404dd4.175f08ad.js.map