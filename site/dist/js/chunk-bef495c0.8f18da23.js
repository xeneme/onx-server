(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-bef495c0"],{"11c0":function(e,t,s){"use strict";var a=s("d961"),n=s.n(a);n.a},"28f4":function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"changename"},[s("div",{staticClass:"changename_wrap"},[s("div",{staticClass:"changename__title"},[s("font-awesome-icon",{staticClass:"changename__title__icon",attrs:{icon:"times"},on:{click:e.close}}),s("p",[e._v(" Change your name ")])],1),s("div",{staticClass:"changename__form"},[s("div",{staticClass:"changename__form_loading"},[s("font-awesome-icon",{staticClass:"changename__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),s("ProfileInput",{attrs:{type:"name",place:"top",placeholder:"Firstname",busy:e.busy},on:{typed:function(t){e.firstName=t}},nativeOn:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.changeName(t)}}}),s("ProfileInput",{attrs:{type:"name",place:"bottom",placeholder:"Lastname",busy:e.busy},on:{typed:function(t){e.lastName=t}},nativeOn:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.changeName(t)}}}),s("Button",{class:["changename__form__button_submit",e.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(t){return e.changeName(t)}}})],1)])])},n=[],i=s("c8df"),o=s("894a"),r={name:"ChangeNameForm",components:{Button:i["a"],ProfileInput:o["a"]},props:["show"],watch:{show:function(e){this.visibleForm(e)}},data:function(){return{busy:!1,firstName:"",lastName:""}},methods:{changeName:function(){var e=this;this.firstName||this.lastName||this.close(),this.loading(),this.axios.post(window.location.protocol+"//"+window.location.host+"/api/user/update",{firstName:this.firstName,lastName:this.lastName},{headers:{Authorization:sessionStorage.getItem("auth-token")}}).then((function(t){e.loaded(),e.success(t.data.token,t.data.profile),e.handleSuccess(t.data)})).catch((function(t){e.loaded(),t.response&&e.handleError(t.response.data)}))},handleError:function(e){e&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:e.stage,message:e.message})},handleSuccess:function(e){this.$store.commit("popups/ADD_ALERT",{type:"message",title:e.stage,message:e.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changename__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changename__form_loading").style.display="none"},success:function(e,t){this.$store.commit("auth/SET_PROFILE",{token:e,profile:t}),this.close()},visibleForm:function(e){var t=this;this.$el.style.top=0,e?(this.$el.style.display="flex",this.$anime({targets:".changename_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(e){e.progress>30&&(t.$el.style.backgroundColor="#00002299",t.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changename_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){t.$el.style.display="none"}}))},close:function(){this.$store.commit("popups/CHANGE_NAME",!1),history.replaceState(null,null," ")}},mounted:function(){var e=this;this.visibleForm(this.show),this.$el.onclick=function(t){t.target===e.$el.querySelector(".changename_wrap")&&e.close()},document.addEventListener("keydown",(function(t){"Escape"===t.key&&e.close()}))}},c=r,l=(s("34a0"),s("2877")),u=Object(l["a"])(c,a,n,!1,null,null,null);t["a"]=u.exports},"340a":function(e,t,s){},"34a0":function(e,t,s){"use strict";var a=s("4230"),n=s.n(a);n.a},4230:function(e,t,s){},"63f5":function(e,t,s){"use strict";var a=s("ba86"),n=s.n(a);n.a},7281:function(e,t,s){},"7d17":function(e,t,s){e.exports=s.p+"img/triangle.c13e28b7.svg"},"894a":function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{class:["profileinput",e.place]},[s("div",{staticClass:"profileinput_icon_wrap"},[s("div",{staticClass:"profileinput_icon"},[s("font-awesome-icon",{attrs:{icon:e.icon}})],1)]),"checkbox"===e.parsedType?s("input",{directives:[{name:"model",rawName:"v-model",value:e.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:e.placeholder,disabled:e.busy,type:"checkbox"},domProps:{checked:Array.isArray(e.inputValue)?e._i(e.inputValue,null)>-1:e.inputValue},on:{change:function(t){var s=e.inputValue,a=t.target,n=!!a.checked;if(Array.isArray(s)){var i=null,o=e._i(s,i);a.checked?o<0&&(e.inputValue=s.concat([i])):o>-1&&(e.inputValue=s.slice(0,o).concat(s.slice(o+1)))}else e.inputValue=n}}}):"radio"===e.parsedType?s("input",{directives:[{name:"model",rawName:"v-model",value:e.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:e.placeholder,disabled:e.busy,type:"radio"},domProps:{checked:e._q(e.inputValue,null)},on:{change:function(t){e.inputValue=null}}}):s("input",{directives:[{name:"model",rawName:"v-model",value:e.inputValue,expression:"inputValue"}],staticClass:"profileinput_input",attrs:{placeholder:e.placeholder,disabled:e.busy,type:e.parsedType},domProps:{value:e.inputValue},on:{input:function(t){t.target.composing||(e.inputValue=t.target.value)}}})])},n=[],i={name:"ProfileInput",props:["type","busy","placeholder","place"],data:function(){return{inputValue:"",mounted:!1}},watch:{inputValue:function(e){this.$emit("typed",e)}},computed:{icon:function(){return this.mounted&&this.$anime({targets:this.$el.querySelector(".profileinput_icon *"),scale:[0,1],duration:1200}),{name:"user",password:"lock",repeatPassword:"lock"}[this.type]},parsedType:function(){return{name:"text",password:"password",repeatPassword:"password"}[this.type]}},mounted:function(){this.mounted=!0}},o=i,r=(s("c630"),s("2877")),c=Object(r["a"])(o,a,n,!1,null,"139470d0",null);t["a"]=c.exports},b885:function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement;e._self._c;return e._m(0)},n=[function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"bg"},[a("img",{staticClass:"bg__comet",attrs:{src:s("1dfd")}}),a("img",{staticClass:"bg__large-comet",attrs:{src:s("552e")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle1",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}}),a("img",{staticClass:"bg__triangle2",attrs:{src:s("7d17")}})])}],i={name:"Background",mounted:function(){for(var e=this.$anime.timeline({loop:!0,direction:"alternate"}),t=0;t<20;t++)e.add({targets:".bg__triangle1",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)});for(var s=this.$anime.timeline({loop:!0,direction:"alternate"}),a=0;a<20;a++)s.add({targets:".bg__triangle2",translateX:this.$anime.random(-50,50),translateY:this.$anime.random(-50,50),rotate:this.$anime.random(-180,180),duration:this.$anime.random(4e3,7e3),delay:this.$anime.stagger(100)})}},o=i,r=(s("f247"),s("2877")),c=Object(r["a"])(o,a,n,!1,null,"1089e527",null);t["a"]=c.exports},ba86:function(e,t,s){},c630:function(e,t,s){"use strict";var a=s("7281"),n=s.n(a);n.a},c66d:function(e,t,s){"use strict";s.r(t);var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"page"},[s("Background"),s("AlertsContainer"),s("ChangeNameForm",{attrs:{show:e.changeNameFormVisibility}}),s("ChangePasswordForm",{attrs:{show:e.changePasswordFormVisibility}}),s("div",{staticClass:"container"},[s("Header"),s("div",{staticClass:"profile"},[s("div",{staticClass:"profile__names"},[s("div",{staticClass:"profile__names__title"},[s("p",[e._v("Profile")]),s("a",{attrs:{href:"#edit"},on:{click:e.showChangeNameForm}},[e._v("edit")])]),s("div",{staticClass:"profile__names__profile"},[s("div",{staticClass:"profile__names__profile_user"},[s("font-awesome-icon",{attrs:{icon:"user"}})],1),s("div",{staticClass:"profile__names__profile_name"},[s("p",[e._v(e._s(e.profile.firstName)+" "+e._s(e.profile.lastName))]),e.profile.email!=e.profile.firstName?s("p",[e._v(e._s(e.profile.email))]):e._e()])])]),s("div",{staticClass:"profile__password__title"},[s("p",[e._v("Password")]),s("a",{attrs:{href:"#change-password"},on:{click:e.showChangePasswordForm}},[e._v("change")])]),e._m(0)]),e._m(1)],1),s("Footer")],1)},n=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"profile__password"},[s("p",[e._v("•••••••••••••••••••••")])])},function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"payment_method"},[s("div",{staticClass:"payment_method__title"},[s("p",[e._v("Two factor authentication")]),s("a",{attrs:{href:"#change-payment"}},[e._v("set up")])])])}],i=s("5530"),o=s("2f62"),r=s("a960"),c=s("b885"),l=s("10db"),u=s("4c03"),p=s("28f4"),d=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{staticClass:"changepassword"},[s("div",{staticClass:"changepassword_wrap"},[s("div",{staticClass:"changepassword__title"},[s("font-awesome-icon",{staticClass:"changepassword__title__icon",attrs:{icon:"times"},on:{click:e.close}}),s("p",[e._v(" Change your password ")])],1),s("div",{staticClass:"changepassword__form"},[s("div",{staticClass:"changepassword__form_loading"},[s("font-awesome-icon",{staticClass:"changepassword__form_loading_icon fa-spin",attrs:{icon:"spinner"}})],1),s("ProfileInput",{attrs:{type:"password",place:"top",placeholder:"Password",busy:e.busy},on:{typed:function(t){e.password=t}},nativeOn:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.changePassword(t)}}}),s("ProfileInput",{attrs:{type:"password",placeholder:"New Password",busy:e.busy},on:{typed:function(t){e.newPassword=t}},nativeOn:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.changePassword(t)}}}),s("ProfileInput",{attrs:{type:"repeatPassword",place:"bottom",placeholder:"Repeat new password",busy:e.busy},on:{typed:function(t){e.repeatNewPassword=t}},nativeOn:{keydown:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.changePassword(t)}}}),s("Button",{class:["changepassword__form__button_submit",e.busy?"busy_btn":""],attrs:{text:"Save",theme:"primary_big"},nativeOn:{click:function(t){return e.changePassword(t)}}})],1)])])},m=[],h=s("c8df"),f=s("894a"),_={name:"ChangePasswordForm",components:{Button:h["a"],ProfileInput:f["a"]},props:["show"],watch:{show:function(e){this.visibleForm(e)}},data:function(){return{busy:!1,password:"",newPassword:"",repeatNewPassword:""}},methods:{changePassword:function(){var e=this;if(this.password||this.repeatNewPassword||this.newPassword){if(!(this.password&&this.repeatNewPassword&&this.newPassword))return void this.handleError({stage:"Validation",message:"The operation was canceled because of validation troubles. Have you filed every form?"})}else this.close();this.loading(),this.axios.post(window.location.protocol+"//"+window.location.host+"/api/user/update",{password:this.password,newPassword:this.newPassword,repeatNewPassword:this.repeatNewPassword},{headers:{Authorization:sessionStorage.getItem("auth-token")}}).then((function(t){e.loaded(),e.success(t.data.token),e.handleSuccess(t.data)})).catch((function(t){e.loaded(),t.response&&e.handleError(t.response.data)}))},handleError:function(e){e&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:e.stage,message:e.message})},handleSuccess:function(e){this.$store.commit("popups/ADD_ALERT",{type:"message",title:e.stage,message:e.message})},loading:function(){this.busy=!0,this.$el.querySelector(".changepassword__form_loading").style.display="grid"},loaded:function(){this.busy=!1,this.$el.querySelector(".changepassword__form_loading").style.display="none"},success:function(e){this.$store.commit("auth/SET_PROFILE",{token:e}),this.close()},visibleForm:function(e){var t=this;this.$el.style.top=0,e?(this.$el.style.display="flex",this.$anime({targets:".changepassword_wrap",scale:[.9,1],opacity:[0,1],duration:200,easing:"easeInOutSine",update:function(e){e.progress>30&&(t.$el.style.backgroundColor="#00002299",t.$el.style.backdropFilter="blur(2px)")}})):(this.$el.style.backgroundColor="transparent",this.$el.style.backdropFilter="blur(0px)",this.$anime({targets:".changepassword_wrap",scale:[1,.9],opacity:[1,0],duration:200,easing:"easeInOutSine",complete:function(){t.$el.style.display="none"}}))},close:function(){console.log("closed"),this.$store.commit("popups/CHANGE_PASSWORD",!1),history.replaceState(null,null," ")}},mounted:function(){var e=this;this.visibleForm(this.show),this.$el.onclick=function(t){t.target===e.$el.querySelector(".changepassword_wrap")&&e.close()},document.addEventListener("keydown",(function(t){"Escape"===t.key&&e.close()}))}},g=_,y=(s("63f5"),s("2877")),w=Object(y["a"])(g,d,m,!1,null,null,null),v=w.exports,b={name:"Profile",components:{AlertsContainer:l["a"],Background:c["a"],Footer:u["a"],Header:r["a"],ChangeNameForm:p["a"],ChangePasswordForm:v},computed:Object(i["a"])(Object(i["a"])({},Object(o["b"])({changeNameFormVisibility:"popups/changeNameVisibility",changePasswordFormVisibility:"popups/changePasswordVisibility",profile:"auth/profile"})),{},{name:function(){return this.profile.firstName.toLowerCase().capitalize()+" "+this.profile.lastName.toLowerCase().capitalize()}}),methods:{showChangeNameForm:function(){this.$store.commit("popups/CHANGE_NAME",!0)},showChangePasswordForm:function(){this.$store.commit("popups/CHANGE_PASSWORD",!0)}},mounted:function(){this.profile?(this.$store.commit("popups/CHANGE_NAME",!1),this.$store.commit("popups/CHANGE_PASSWORD",!1),"#edit"===this.$route.hash?this.$store.commit("popups/CHANGE_NAME",!0):"#change-password"===this.$route.hash?this.$store.commit("popups/CHANGE_PASSWORD",!0):"#change-payment"===this.$route.hash&&this.$store.commit("popups/CHANGE_PAYMENT",!0)):this.$router.push("/")}},C=b,$=(s("11c0"),Object(y["a"])(C,a,n,!1,null,"14302ff3",null));t["default"]=$.exports},c8df:function(e,t,s){"use strict";var a=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("a",{class:["button",e.theme||"primary"]},[e._v(e._s(e.text))])},n=[],i={name:"Button",props:["theme","text"]},o=i,r=(s("dab0"),s("2877")),c=Object(r["a"])(o,a,n,!1,null,"689fcf99",null);t["a"]=c.exports},d961:function(e,t,s){},dab0:function(e,t,s){"use strict";var a=s("340a"),n=s.n(a);n.a},f19d:function(e,t,s){},f247:function(e,t,s){"use strict";var a=s("f19d"),n=s.n(a);n.a}}]);
//# sourceMappingURL=chunk-bef495c0.8f18da23.js.map