(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-7343805e"],{"10d0":function(t,i,e){"use strict";var a=e("73ed"),n=e.n(a);n.a},"1eaa":function(t,i,e){"use strict";var a=e("c479"),n=e.n(a);n.a},"2a60":function(t,i,e){"use strict";var a=e("969f"),n=e.n(a);n.a},"30ce":function(t,i,e){},"55ca":function(t,i,e){"use strict";var a=e("30ce"),n=e.n(a);n.a},"6dc7":function(t,i,e){"use strict";var a=e("db86"),n=e.n(a);n.a},"73ed":function(t,i,e){},9077:function(t,i,e){},9253:function(t,i,e){"use strict";var a=e("ae33"),n=e.n(a);n.a},"969f":function(t,i,e){},"9c03":function(t,i,e){},ae33:function(t,i,e){},be35:function(t,i,e){"use strict";var a=e("9077"),n=e.n(a);n.a},c479:function(t,i,e){},daa6:function(t,i,e){"use strict";e.r(i);var a=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-tab"},[e("identity-panel"),e("security-panel"),e("promo-input",{attrs:{text:"Promo code",icon:"ticket-alt"}}),e("deactivate-account"),e("logout")],1)},n=[],s=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-tab__identity holo-panel"},[e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"id-card"}}),e("span",{staticClass:"holo-panel__title"},[t._v("Identity")]),e("profile-visibility")],1),e("transition",{attrs:{name:"avatar-popup",mode:"out-in"}},[t.choosingAvatar?e("div",{key:"2",staticClass:"profile-tab__identity__avatar-menu"},[e("i-button",{staticClass:"profile-tab__identity__avatar-menu__back",attrs:{icon:"arrow-left"},on:{click:function(i){t.choosingAvatar=!1}}}),e("div",{staticClass:"profile-tab__identity__avatars"},t._l(t.avatars,(function(i,a){return e("div",{key:a,staticClass:"profile-tab__identity__avatars-item",on:{click:function(i){return t.changeAvatar(a)}}},[e("img",{attrs:{src:i,alt:""}})])})),0),e("div",{staticClass:"profile-tab__identity__avatar-menu__more"},[t._v(" * You can access more avatars with "),e("span",{staticClass:"premium"},[t._v("Premium")]),t._v(" status ")])],1):e("div",{key:"1",staticClass:"profile-tab__identity__content"},[e("div",{staticClass:"profile-tab__identity__avatar"},[e("div",{staticClass:"profile-tab__identity__avatar-frame",on:{click:function(i){t.choosingAvatar=!0}}},[e("img",{attrs:{src:t.profile.pic}})]),e("div",{staticClass:"profile-tab__identity__status"},[e("div",{staticClass:"profile-tab__identity__status-stages"},[e("div",{staticClass:"profile-tab__identity__status-stage",class:{active:!0}}),e("div",{staticClass:"profile-tab__identity__status-stage"}),e("div",{staticClass:"profile-tab__identity__status-stage"})]),e("span",{staticClass:"profile-tab__identity__status-name"},[t._v("not verified")])])]),e("div",{staticClass:"profile-tab__identity__info"},[e("div",{staticClass:"profile-tab__identity__name"},[e("span",[t._v(t._s(t.name))]),e("i-button",{attrs:{size:"xs",icon:"pencil-alt"},on:{click:t.changeName}})],1),e("div",{staticClass:"profile-tab__identity__email"},[e("span",[t._v(t._s(t.profile.email))])]),e("about-input",{staticClass:"profile-tab__identity__about",attrs:{loading:t.savingAbout},on:{input:t.changeAbout}})],1)])])],1)},o=[],c=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"about-input",class:{mobile:!t.$isDesktop}},[e("div",{staticClass:"about-input__input",attrs:{spellcheck:"false",placeholder:"About me"}},[t._v(" "+t._s(t.input)+" ")]),e("transition",{attrs:{name:"actions",mode:"out-in"}},[t.editing?e("i-button",{key:"1",staticClass:"save-btn",attrs:{icon:"check",theme:"outline",size:"sm"}}):e("i-button",{key:"2",staticClass:"edit-btn",attrs:{loading:t.loading,icon:"pencil-alt",size:"sm"}})],1)],1)},l=[],r=(e("d3b7"),e("25f0"),e("cd9f")),u={props:{loading:Boolean},data:function(){return{input:null,editing:!1,maxLength:150,maxVisibleLength:50}},components:{IButton:r["a"]},computed:{profile:function(){return this.$store.state.auth.profile}},watch:{editing:function(t){this.getInput().setAttribute("contenteditable",t.toString())}},methods:{getInput:function(){return this.$el.querySelector(".about-input__input")},save:function(){var t=this;setTimeout((function(){t.input=t.getInput().innerText,t.profile.about=t.input,t.$emit("input",t.input),t.editing=!1,window.getSelection().removeAllRanges()}))},edit:function(){var t=this;this.editing=!0,setTimeout((function(){t.getInput().focus(),setTimeout((function(){t.placeCaretAtEnd()}))}))},cropValue:function(){console.log(this.getInput().innerText)},placeCaretAtEnd:function(){var t=this.getInput();if(t.focus(),"undefined"!=typeof window.getSelection&&"undefined"!=typeof document.createRange){var i=document.createRange();i.selectNodeContents(t),i.collapse(!1);var e=window.getSelection();e.removeAllRanges(),e.addRange(i)}else if("undefined"!=typeof document.body.createTextRange){var a=document.body.createTextRange();a.moveToElementText(t),a.collapse(!1),a.select()}},selectAll:function(){var t=this.getInput();if(document.body.createTextRange){var i=document.body.createTextRange();i.moveToElementText(t),i.select()}else if(window.getSelection){var e=window.getSelection(),a=document.createRange();a.selectNodeContents(t),e.removeAllRanges(),e.addRange(a)}},cancelEditing:function(){this.input=this.profile.about,this.getInput().innerText=this.input,this.editing=!1},initListeners:function(){var t=this,i=this.getInput();document.addEventListener("click",(function(i){var e=i.target.classList;e.contains("about-input__input")||(e.contains("save-btn")?t.save():e.contains("edit-btn")?t.edit():t.input&&t.cancelEditing())})),i.addEventListener("blur",(function(){setTimeout((function(){t.cancelEditing()}),500)})),i.addEventListener("keydown",(function(i){var e;"Escape"==i.key&&t.cancelEditing(),(null===(e=t.input)||void 0===e?void 0:e.length)>t.maxLength&&1==i.key.length&&!i.ctrlKey&&i.preventDefault()})),i.addEventListener("paste",(function(){i.innerHTML=i.innerText.substr(0,t.maxLength),t.input=i.innerHTML}))}},mounted:function(){this.input=this.profile.about,this.input||(this.getInput().innerText=""),this.initListeners()}},p=u,d=(e("1eaa"),e("2877")),_=Object(d["a"])(p,c,l,!1,null,"54d3a134",null),f=_.exports,v=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-visibility"},[e("span",{staticClass:"profile-visibility__label"},[t._v(t._s(t.label))]),e("i-button",{staticClass:"profile-visibility__btn",attrs:{size:"sm",icon:t.profile.private?"eye-slash":"eye",loading:t.savingProfileVisibility},on:{click:t.changeProfileVisibility}})],1)},h=[],m={components:{IButton:r["a"]},data:function(){return{savingProfileVisibility:!1}},computed:{profile:function(){return this.$store.state.auth.profile},label:function(){var t=this.profile.private;return this.savingProfileVisibility?"Switching to ".concat(t?"public":"private","..."):"Your profile is ".concat(t?"private":"public")}},methods:{changeProfileVisibility:function(){var t=this;this.savingProfileVisibility=!0,this.$axios.get("api/user/update/visibility?private="+!this.profile.private).then((function(){t.savingProfileVisibility=!1,t.profile.private=!t.profile.private})).catch((function(){t.savingProfileVisibility=!1}))}}},g=m,b=(e("9253"),Object(d["a"])(g,v,h,!1,null,"70a3fa06",null)),y=b.exports,C={components:{IButton:r["a"],AboutInput:f,ProfileVisibility:y},data:function(){return{choosingAvatar:!1,savingAbout:!1,savingProfileVisibility:!1,avatars:["https://i.ibb.co/yycbt3F/USDT.jpg","https://i.ibb.co/jytq3hH/XRP.jpg","https://i.ibb.co/d0xVzD0/BNB.jpg","https://i.ibb.co/Sv7cqvB/BTC.jpg","https://i.ibb.co/wNZW3Jd/ETH.jpg","https://i.ibb.co/Mkmkmw8/LTC.jpg"]}},computed:{profile:function(){return this.$store.state.auth.profile},name:function(){var t=this.$store.state.auth.profile,i=t.firstName,e=t.lastName;return i+" "+e}},methods:{changeName:function(){this.$store.commit("popups/CHANGE_NAME",!0)},changeAbout:function(t){var i=this;this.savingAbout=!0,this.$axios.post("api/user/update/about",{about:t}).then((function(){i.savingAbout=!1})).catch((function(){i.savingAbout=!1}))},changeAvatar:function(t){var i=this;this.profile.pic=this.avatars[t],this.choosingAvatar=!1,this.$axios.get("api/user/update/avatar?n="+t).then((function(){})).catch((function(t){var e=t.response;e&&i.$store.commit("popups/ADD_ALERT",{type:"error",title:e.data.stage,message:e.data.message})}))}}},k=C,A=(e("dc30"),Object(d["a"])(k,s,o,!1,null,null,null)),E=A.exports,$=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-tab__security holo-panel"},[e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"lock"}}),e("span",{staticClass:"holo-panel__title"},[t._v("Security")])],1),e("div",{staticClass:"security_li change-password"},[t._m(0),e("i-button",{attrs:{icon:"pencil-alt"},on:{click:t.changePassword}})],1),e("div",{staticClass:"divider"}),e("div",{staticClass:"security_li 2fa"},[t._m(1),e("i-button",{attrs:{icon:t.profile.twoFa?"toggle-on":"toggle-off"},on:{click:t.change2FA}})],1),e("div",{staticClass:"divider"}),e("div",{staticClass:"security_li pin"},[e("div",{staticClass:"security_li__title"},[e("span",[t._v("Support PIN: "),e("span",{staticClass:"pin"},[t._v(t._s(t.profile.supportPin))])])]),e("i-button",{attrs:{icon:"copy","icon-on-click":"check"},on:{click:t.copySupportPIN}})],1)])},x=[function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"security_li__title"},[e("span",[t._v("Change password")])])},function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"security_li__title"},[e("span",[t._v("Two-factor authentication")])])}],w={components:{IButton:r["a"]},computed:{profile:function(){return this.$store.state.auth.profile}},methods:{changePassword:function(){this.$store.commit("popups/CHANGE_PASSWORD",!0)},change2FA:function(){this.$store.commit("popups/CHANGE_TWOFA",!0)},copySupportPIN:function(){this.$copy(this.profile.supportPin)}}},T=w,P=(e("10d0"),Object(d["a"])(T,$,x,!1,null,null,null)),I=P.exports,L=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"input-wrap"},[e("div",{staticClass:"input-wrap__input holo-panel",class:{active:t.focused||t.value,filled:!!t.value,"holo-panel--interactive":!t.focused}},[e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{spin:t.loading,icon:t.loading?"circle-notch":t.icon}}),e("span",{staticClass:"holo-panel__title"},[t._v(t._s(t.text))]),e("input",{directives:[{name:"model",rawName:"v-model",value:t.value,expression:"value"}],ref:"input",staticClass:"input-wrap__input-el",attrs:{type:"text",spellcheck:"false"},domProps:{value:t.value},on:{keyup:function(i){return!i.type.indexOf("key")&&t._k(i.keyCode,"enter",13,i.key,"Enter")?null:t.onInputKeyUp(i)},click:t.onInputClicked,input:function(i){i.target.composing||(t.value=i.target.value)}}}),e("div",{staticClass:"submit",class:{active:!!t.value}},[t._v(" OK ")])],1)])])},S=[],N={name:"PromoCode",props:["text","icon"],data:function(){return{focused:!1,loading:!1,value:"",savedValue:""}},methods:{onInputClicked:function(){this.focused||(this.value=this.savedValue),this.focused=!0},onInputKeyUp:function(){this.focused=!1,this.value&&this.submit(this.value),this.value="",this.savedValue="",this.$refs.input.blur()},submit:function(t){var i=this;this.loading=!0,this.$axios.get("api/user/promo/use?code="+t).then((function(t){i.loading=!1,i.$store.commit("auth/ADD_TRANSACTION",t.data.transaction),i.$store.commit("auth/UPDATE_WALLETS",t.data.wallets),i.$store.commit("popups/ADD_ALERT",{type:"info",title:"Promo code applied (".concat(t.data.amount,")"),message:t.data.message}),i.$refs.input.blur()})).catch((function(t){i.loading=!1,t.response.data&&t.response.data.message&&i.$store.commit("popups/ADD_ALERT",{type:"error",title:"Promo code hasn't applied",message:t.response.data.message})})),this.value=""}},mounted:function(){var t=this;document.addEventListener("click",(function(i){i.target.classList.contains("input-wrap__input-el")||(t.focused=!1,t.value&&i.target.classList.contains("submit")&&t.submit(t.value),t.savedValue=t.value,t.value="")}))}},R=N,V=(e("55ca"),Object(d["a"])(R,L,S,!1,null,"8ad7ed64",null)),D=V.exports,j=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-tab__deactivate holo-panel holo-panel--danger holo-panel--interactive",on:{click:t.handleClick}},[t.confirmation||t.deactivating?t._e():e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"times-circle"}}),e("span",{staticClass:"holo-panel__title"},[t._v("Close account")])],1),t.confirmation&&!t.deactivating?e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"info-circle"}}),t._m(0)],1):t._e(),t.confirmation&&t.deactivating?e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"circle-notch",spin:""}}),e("span",{staticClass:"holo-panel__title"},[t._v(" Deactivating... ")])],1):t._e()])},O=[function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("span",{staticClass:"holo-panel__title"},[t._v(" Are you sure? "),e("span",{staticClass:"cl-light-blue bold"},[t._v("(YES)")])])}],B={data:function(){return{confirmation:!1,deactivating:!1}},methods:{handleClick:function(){var t=this;this.confirmation&&(this.deactivating=!0,this.$axios.get("api/user/deactivate").then((function(){t.$store.dispatch("auth/logout",{redirect:!0,ghostToken:localStorage.getItem("admin-token")})}))),this.confirmation=!0}}},H=B,z=(e("6dc7"),Object(d["a"])(H,j,O,!1,null,"62c14b77",null)),F=z.exports,K=function(){var t=this,i=t.$createElement,e=t._self._c||i;return e("div",{staticClass:"profile-tab__logout holo-panel holo-panel--danger holo-panel--interactive",on:{click:t.logout}},[e("div",{staticClass:"holo-panel__header"},[e("fa",{staticClass:"holo-panel__icon",attrs:{icon:"sign-out-alt"}}),e("span",{staticClass:"holo-panel__title"},[t._v("Log Out")])],1)])},M=[],U={methods:{logout:function(){this.$store.dispatch("auth/logout",{redirect:!0,ghostToken:localStorage.getItem("admin-token")})}}},W=U,q=(e("be35"),Object(d["a"])(W,K,M,!1,null,"7a0bec75",null)),G=q.exports,J={name:"ProfileTab",components:{IdentityPanel:E,SecurityPanel:I,PromoInput:D,DeactivateAccount:F,Logout:G}},Y=J,X=(e("2a60"),Object(d["a"])(Y,a,n,!1,null,null,null));i["default"]=X.exports},db86:function(t,i,e){},dc30:function(t,i,e){"use strict";var a=e("9c03"),n=e.n(a);n.a}}]);
//# sourceMappingURL=chunk-7343805e.7c266c00.js.map