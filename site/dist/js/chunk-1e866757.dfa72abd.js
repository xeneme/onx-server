(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-1e866757"],{"07ac":function(t,e,n){var i=n("23e7"),a=n("6f53").values;i({target:"Object",stat:!0},{values:function(t){return a(t)}})},"0847":function(t,e,n){"use strict";var i=n("27a6"),a=n.n(i);a.a},1148:function(t,e,n){"use strict";var i=n("a691"),a=n("1d80");t.exports="".repeat||function(t){var e=String(a(this)),n="",r=i(t);if(r<0||r==1/0)throw RangeError("Wrong number of repetitions");for(;r>0;(r>>>=1)&&(e+=e))1&r&&(n+=e);return n}},1276:function(t,e,n){"use strict";var i=n("d784"),a=n("44e7"),r=n("825a"),s=n("1d80"),o=n("4840"),c=n("8aa5"),l=n("50c4"),u=n("14c3"),f=n("9263"),p=n("d039"),h=[].push,d=Math.min,g=4294967295,m=!p((function(){return!RegExp(g,"y")}));i("split",2,(function(t,e,n){var i;return i="c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length?function(t,n){var i=String(s(this)),r=void 0===n?g:n>>>0;if(0===r)return[];if(void 0===t)return[i];if(!a(t))return e.call(i,t,r);var o,c,l,u=[],p=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),d=0,m=new RegExp(t.source,p+"g");while(o=f.call(m,i)){if(c=m.lastIndex,c>d&&(u.push(i.slice(d,o.index)),o.length>1&&o.index<i.length&&h.apply(u,o.slice(1)),l=o[0].length,d=c,u.length>=r))break;m.lastIndex===o.index&&m.lastIndex++}return d===i.length?!l&&m.test("")||u.push(""):u.push(i.slice(d)),u.length>r?u.slice(0,r):u}:"0".split(void 0,0).length?function(t,n){return void 0===t&&0===n?[]:e.call(this,t,n)}:e,[function(e,n){var a=s(this),r=void 0==e?void 0:e[t];return void 0!==r?r.call(e,a,n):i.call(String(a),e,n)},function(t,a){var s=n(i,t,this,a,i!==e);if(s.done)return s.value;var f=r(t),p=String(this),h=o(f,RegExp),v=f.unicode,_=(f.ignoreCase?"i":"")+(f.multiline?"m":"")+(f.unicode?"u":"")+(m?"y":"g"),b=new h(m?f:"^(?:"+f.source+")",_),x=void 0===a?g:a>>>0;if(0===x)return[];if(0===p.length)return null===u(b,p)?[p]:[];var E=0,w=0,C=[];while(w<p.length){b.lastIndex=m?w:0;var N,k=u(b,m?p:p.slice(w));if(null===k||(N=d(l(b.lastIndex+(m?0:w)),p.length))===E)w=c(p,w,v);else{if(C.push(p.slice(E,w)),C.length===x)return C;for(var O=1;O<=k.length-1;O++)if(C.push(k[O]),C.length===x)return C;w=E=N}}return C.push(p.slice(E)),C}]}),!m)},"13d5":function(t,e,n){"use strict";var i=n("23e7"),a=n("d58f").left,r=n("a640"),s=n("ae40"),o=r("reduce"),c=s("reduce",{1:0});i({target:"Array",proto:!0,forced:!o||!c},{reduce:function(t){return a(this,t,arguments.length,arguments.length>1?arguments[1]:void 0)}})},"169d":function(t,e,n){"use strict";var i=n("3cb2"),a=n.n(i);a.a},"1dfd":function(t,e,n){t.exports=n.p+"img/tracer2.3215c301.svg"},"248b":function(t,e,n){},"25f0":function(t,e,n){"use strict";var i=n("6eeb"),a=n("825a"),r=n("d039"),s=n("ad6d"),o="toString",c=RegExp.prototype,l=c[o],u=r((function(){return"/a/b"!=l.call({source:"a",flags:"b"})})),f=l.name!=o;(u||f)&&i(RegExp.prototype,o,(function(){var t=a(this),e=String(t.source),n=t.flags,i=String(void 0===n&&t instanceof RegExp&&!("flags"in c)?s.call(t):n);return"/"+e+"/"+i}),{unsafe:!0})},"27a6":function(t,e,n){},"3cb2":function(t,e,n){},"408a":function(t,e,n){var i=n("c6b6");t.exports=function(t){if("number"!=typeof t&&"Number"!=i(t))throw TypeError("Incorrect invocation");return+t}},"431e":function(t,e,n){"use strict";var i=n("8b78"),a=n.n(i);a.a},"4b58":function(t,e,n){"use strict";var i=n("66f8"),a=n.n(i);a.a},"4c03":function(t,e,n){"use strict";var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("footer",{staticClass:"footer"},[n("div",{staticClass:"container"},[n("div",{staticClass:"footer__wrap"},[n("div",{staticClass:"footer__logo"},[n("Logo"),n("p",{staticClass:"footer__logo-text"},[t._v(" Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor ")])],1),n("Menu"),n("Contact"),n("small",{staticClass:"footer__copyright"},[t._v(" © 2019 The exchange company ")])],1)])])},a=[],r=n("ef77"),s=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("nav",{staticClass:"menu-footer"},[n("h2",{staticClass:"menu-footer__title"},[t._v(" Menu ")]),n("ul",{staticClass:"menu-footer__list"},[n("li",{staticClass:"menu-footer__item"},[n("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Main ")])],1),n("li",{staticClass:"menu-footer__item"},[n("router-link",{staticClass:"menu-footer__link",attrs:{to:"/exchange"}},[t._v(" Exchange ")])],1),n("li",{staticClass:"menu-footer__item"},[n("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Contract ")])],1),n("li",{staticClass:"menu-footer__item"},[n("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" About us ")])],1)])])},o=[],c={name:"Menu"},l=c,u=(n("70c3"),n("2877")),f=Object(u["a"])(l,s,o,!1,null,"241b692c",null),p=f.exports,h=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},d=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("section",{staticClass:"footer-contact"},[n("h2",{staticClass:"footer-contact__title"},[t._v(" Contact ")]),n("ul",{staticClass:"footer-contact__list"},[n("li",{staticClass:"footer-contact__item"},[t._v(" Email: support@example.com ")]),n("li",{staticClass:"footer-contact__item"},[t._v(" Phone: +7 787 78 777 78 ")])])])}],g={name:"Contact"},m=g,v=(n("6095"),Object(u["a"])(m,h,d,!1,null,"fc6ad95a",null)),_=v.exports,b={name:"Footer",components:{Logo:r["a"],Menu:p,Contact:_}},x=b,E=(n("94ce"),Object(u["a"])(x,i,a,!1,null,"a26649f2",null));e["a"]=E.exports},"4cd9":function(t,e,n){t.exports=n.p+"img/logo--light.8aa47eec.svg"},"4d63":function(t,e,n){var i=n("83ab"),a=n("da84"),r=n("94ca"),s=n("7156"),o=n("9bf2").f,c=n("241c").f,l=n("44e7"),u=n("ad6d"),f=n("9f7f"),p=n("6eeb"),h=n("d039"),d=n("69f3").set,g=n("2626"),m=n("b622"),v=m("match"),_=a.RegExp,b=_.prototype,x=/a/g,E=/a/g,w=new _(x)!==x,C=f.UNSUPPORTED_Y,N=i&&r("RegExp",!w||C||h((function(){return E[v]=!1,_(x)!=x||_(E)==E||"/a/i"!=_(x,"i")})));if(N){var k=function(t,e){var n,i=this instanceof k,a=l(t),r=void 0===e;if(!i&&a&&t.constructor===k&&r)return t;w?a&&!r&&(t=t.source):t instanceof k&&(r&&(e=u.call(t)),t=t.source),C&&(n=!!e&&e.indexOf("y")>-1,n&&(e=e.replace(/y/g,"")));var o=s(w?new _(t,e):_(t,e),i?this:b,k);return C&&n&&d(o,{sticky:n}),o},O=function(t){t in k||o(k,t,{configurable:!0,get:function(){return _[t]},set:function(e){_[t]=e}})},y=c(_),I=0;while(y.length>I)O(y[I++]);b.constructor=k,k.prototype=b,p(a,"RegExp",k)}g("RegExp")},5142:function(t,e,n){},"552e":function(t,e,n){t.exports=n.p+"img/large-comet.1125501a.svg"},5899:function(t,e){t.exports="\t\n\v\f\r                　\u2028\u2029\ufeff"},"58a8":function(t,e,n){var i=n("1d80"),a=n("5899"),r="["+a+"]",s=RegExp("^"+r+r+"*"),o=RegExp(r+r+"*$"),c=function(t){return function(e){var n=String(i(e));return 1&t&&(n=n.replace(s,"")),2&t&&(n=n.replace(o,"")),n}};t.exports={start:c(1),end:c(2),trim:c(3)}},6095:function(t,e,n){"use strict";var i=n("b6d2"),a=n.n(i);a.a},"66f8":function(t,e,n){},"693b":function(t,e,n){},"6f53":function(t,e,n){var i=n("83ab"),a=n("df75"),r=n("fc6a"),s=n("d1e7").f,o=function(t){return function(e){var n,o=r(e),c=a(o),l=c.length,u=0,f=[];while(l>u)n=c[u++],i&&!s.call(o,n)||f.push(t?[n,o[n]]:o[n]);return f}};t.exports={entries:o(!0),values:o(!1)}},"70c3":function(t,e,n){"use strict";var i=n("248b"),a=n.n(i);a.a},7156:function(t,e,n){var i=n("861d"),a=n("d2bb");t.exports=function(t,e,n){var r,s;return a&&"function"==typeof(r=e.constructor)&&r!==n&&i(s=r.prototype)&&s!==n.prototype&&a(t,s),t}},"8b78":function(t,e,n){},"94ce":function(t,e,n){"use strict";var i=n("693b"),a=n.n(i);a.a},a960:function(t,e,n){"use strict";var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("header",[n("div",{staticClass:"container"},[n("div",{staticClass:"wrap"},[n("Logo",{attrs:{theme:"light"}}),n("Menu")],1)])])},a=[],r=n("ef77"),s=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("nav",[n("ul",[n("NeonLink",{attrs:{text:"Main",to:"/"}}),t.authenticated?n("NeonLink",{attrs:{text:"Exchange",to:"/exchange"}}):t._e(),n("NeonLink",{attrs:{text:"Contract",to:"/"}}),n("NeonLink",{attrs:{text:"About us",to:"/"}}),t.authenticated?t._e():n("NeonLink",{attrs:{text:"Log in",to:"",theme:"light"},nativeOn:{click:function(e){return t.login(e)}}}),t.authenticated?t._e():n("NeonLink",{attrs:{text:"Sign up",to:"",theme:"light"},nativeOn:{click:function(e){return t.signup(e)}}}),t.authenticated?n("Dropdown",{staticClass:"user-dropdown"}):t._e(),n("div",{staticClass:"burger",on:{click:t.toggleProfile}},[n("div"),n("div"),n("div")])],1)])},o=[],c=n("5530"),l=n("2f62"),u=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("nav",{ref:"dropdown",staticClass:"dropdown"},[n("button",{ref:"caller",class:["dropdown-auth",t.isOpen?"active":""],attrs:{type:"button"},on:{click:t.toggle}},[!t.itsAdmin&&t.newMessage?n("a",{staticClass:"message",attrs:{href:t.links.support,title:"New message from support"}},[n("font-awesome-icon",{attrs:{icon:"envelope"}})],1):t._e(),n("span",{staticClass:"name"},[t._v(t._s(t.name))]),n("span",{staticClass:"balance"},[t._v(t._s(t.balance)+"$")]),n("span",{staticClass:"angle"},[n("font-awesome-icon",{attrs:{icon:t.isOpen?"angle-up":"angle-down"}})],1)]),t.isOpen?n("ul",{on:{click:t.close}},[t.itsAdmin?n("li",[n("a",{attrs:{href:t.links.adminPanel}},[t._v("Admin Panel")])]):t._e(),t.itsAdmin?n("li",{staticClass:"divider"}):t._e(),n("li",[n("router-link",{attrs:{to:t.links.profile}},[t._v("Profile")])],1),n("li",[n("a",{attrs:{href:t.links.wallet},on:{click:function(e){return t.updateExchangeTab("wallet")}}},[t._v("Wallet")])]),n("li",[n("a",{attrs:{href:t.links.history},on:{click:function(e){return t.updateExchangeTab("history")}}},[t._v("History")])]),n("li",[t.itsAdmin?t._e():n("a",{attrs:{href:t.links.support},on:{click:function(e){return t.updateExchangeTab("support")}}},[t._v("Support")])]),n("li",{staticClass:"divider"}),n("li",[n("a",{attrs:{href:"#"},on:{click:t.logout}},[t._v("Sign Out")])])]):t._e()])},f=[],p=(n("caad"),n("13d5"),n("b0c0"),n("a9e3"),n("b680"),n("d3b7"),n("07ac"),n("4d63"),n("ac1f"),n("25f0"),n("466d"),n("1276"),{name:"Dropdown",data:function(){return{name:"Username",balance:"0",isOpen:!1,links:{profile:"/account",wallet:"/exchange#wallet",history:"/exchange#history",support:"/exchange#support",adminPanel:"/admin"}}},computed:Object(c["a"])(Object(c["a"])({},Object(l["b"])({profile:"auth/profile",wallets:"auth/wallets"})),{},{itsAdmin:function(){return!["user"].includes(this.profile.role.name)},newMessage:function(){return this.profile&&this.profile.newMessage}}),watch:{profile:function(t){this.updateName(t),this.updateBalance(t)},wallets:function(t){this.$anime({targets:this.$el,scale:[.9,1],duration:700,easing:"easeInOutSine"});var e=Object.values(t).reduce((function(t,e){return t+e.balance*e.price}),0);this.balance=Number(e.toFixed(2))}},methods:{updateName:function(t){var e=this.balance.toString().length;if(t){if(t.lastName&&t.firstName)this.name=this.profile.firstName.toLowerCase().capitalize()+" "+this.profile.lastName[0].toUpperCase()+".";else if(t.firstName){var n=this.profile.firstName.split("@");this.name=n.length>1?n[0]:this.profile.firstName}this.name.length>=16-e&&(this.name=this.name.match(new RegExp(".{".concat(16-e,"}")))[0]+"...")}else this.name="Username"},updateBalance:function(t){this.balance=Number(Object.values(t.wallets).reduce((function(t,e){return t+e.balance*e.price}),0).toFixed(2))},toggle:function(){this.isOpen=!this.isOpen},closeOutside:function(t){var e=this.$refs.dropdown;e&&!e.contains(t.target)&&(this.isOpen=!1)},close:function(){this.isOpen=!1},logout:function(){this.$store.commit("auth/SET_PROFILE",{profile:null}),"Main"!=this.$route.name&&this.$router.push("/")},updateExchangeTab:function(t){"wallet"===t?this.$store.commit("popups/SELECT_EXCHANGE_TAB",0):"history"===t?this.$store.commit("popups/SELECT_EXCHANGE_TAB",4):"support"===t&&this.$store.commit("popups/SELECT_EXCHANGE_TAB",5)}},mounted:function(){document.addEventListener("click",this.closeOutside);var t=this.$store.getters["auth/profile"];t&&(this.updateName(t),this.updateBalance(t))},destroyed:function(){document.removeEventListener("click",this.closeOutside)}}),h=p,d=(n("169d"),n("2877")),g=Object(d["a"])(h,u,f,!1,null,"0536274e",null),m=g.exports,v=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("router-link",t._b({class:["link",t.theme||"default"]},"router-link",t.$attrs,!1),[n("div",{staticClass:"comet"}),n("div",{staticClass:"edges"},[n("span"),n("span"),n("span"),n("span")]),n("p",[t._v(t._s(t.text||"Text"))])])},_=[],b={name:"NeonLink",data:function(){return{base:"#"}},props:["text","theme"]},x=b,E=(n("0847"),Object(d["a"])(x,v,_,!1,null,"dbea202c",null)),w=E.exports,C={name:"Menu",components:{NeonLink:w,Dropdown:m},computed:Object(c["a"])({},Object(l["b"])({authenticated:"auth/isLoggedIn"})),methods:{open:function(){this.show||this.$refs.drop.$emit("show",this.$refs.caller)},login:function(){this.$store.commit("popups/SIGN_IN",!0)},signup:function(){this.$store.commit("popups/SIGN_UP",!0)},toggleProfile:function(){this.$store.commit("popups/TOGGLE_SIDE_MENU")}}},N=C,k=(n("d679"),Object(d["a"])(N,s,o,!1,null,"1ea340df",null)),O=k.exports,y={name:"Header",components:{Logo:r["a"],Menu:O}},I=y,S=(n("4b58"),Object(d["a"])(I,i,a,!1,null,"10e8ca97",null));e["a"]=S.exports},a9e3:function(t,e,n){"use strict";var i=n("83ab"),a=n("da84"),r=n("94ca"),s=n("6eeb"),o=n("5135"),c=n("c6b6"),l=n("7156"),u=n("c04e"),f=n("d039"),p=n("7c73"),h=n("241c").f,d=n("06cf").f,g=n("9bf2").f,m=n("58a8").trim,v="Number",_=a[v],b=_.prototype,x=c(p(b))==v,E=function(t){var e,n,i,a,r,s,o,c,l=u(t,!1);if("string"==typeof l&&l.length>2)if(l=m(l),e=l.charCodeAt(0),43===e||45===e){if(n=l.charCodeAt(2),88===n||120===n)return NaN}else if(48===e){switch(l.charCodeAt(1)){case 66:case 98:i=2,a=49;break;case 79:case 111:i=8,a=55;break;default:return+l}for(r=l.slice(2),s=r.length,o=0;o<s;o++)if(c=r.charCodeAt(o),c<48||c>a)return NaN;return parseInt(r,i)}return+l};if(r(v,!_(" 0o1")||!_("0b1")||_("+0x1"))){for(var w,C=function(t){var e=arguments.length<1?0:t,n=this;return n instanceof C&&(x?f((function(){b.valueOf.call(n)})):c(n)!=v)?l(new _(E(e)),n,C):E(e)},N=i?h(_):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),k=0;N.length>k;k++)o(_,w=N[k])&&!o(C,w)&&g(C,w,d(_,w));C.prototype=b,b.constructor=C,s(a,v,C)}},b680:function(t,e,n){"use strict";var i=n("23e7"),a=n("a691"),r=n("408a"),s=n("1148"),o=n("d039"),c=1..toFixed,l=Math.floor,u=function(t,e,n){return 0===e?n:e%2===1?u(t,e-1,n*t):u(t*t,e/2,n)},f=function(t){var e=0,n=t;while(n>=4096)e+=12,n/=4096;while(n>=2)e+=1,n/=2;return e},p=c&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!o((function(){c.call({})}));i({target:"Number",proto:!0,forced:p},{toFixed:function(t){var e,n,i,o,c=r(this),p=a(t),h=[0,0,0,0,0,0],d="",g="0",m=function(t,e){var n=-1,i=e;while(++n<6)i+=t*h[n],h[n]=i%1e7,i=l(i/1e7)},v=function(t){var e=6,n=0;while(--e>=0)n+=h[e],h[e]=l(n/t),n=n%t*1e7},_=function(){var t=6,e="";while(--t>=0)if(""!==e||0===t||0!==h[t]){var n=String(h[t]);e=""===e?n:e+s.call("0",7-n.length)+n}return e};if(p<0||p>20)throw RangeError("Incorrect fraction digits");if(c!=c)return"NaN";if(c<=-1e21||c>=1e21)return String(c);if(c<0&&(d="-",c=-c),c>1e-21)if(e=f(c*u(2,69,1))-69,n=e<0?c*u(2,-e,1):c/u(2,e,1),n*=4503599627370496,e=52-e,e>0){m(0,n),i=p;while(i>=7)m(1e7,0),i-=7;m(u(10,i,1),0),i=e-1;while(i>=23)v(1<<23),i-=23;v(1<<i),m(1,1),v(2),g=_()}else m(0,n),m(1<<-e,0),g=_()+s.call("0",p);return p>0?(o=g.length,g=d+(o<=p?"0."+s.call("0",p-o)+g:g.slice(0,o-p)+"."+g.slice(o-p))):g=d+g,g}})},b6d2:function(t,e,n){},d58f:function(t,e,n){var i=n("1c0b"),a=n("7b0b"),r=n("44ad"),s=n("50c4"),o=function(t){return function(e,n,o,c){i(n);var l=a(e),u=r(l),f=s(l.length),p=t?f-1:0,h=t?-1:1;if(o<2)while(1){if(p in u){c=u[p],p+=h;break}if(p+=h,t?p<0:f<=p)throw TypeError("Reduce of empty array with no initial value")}for(;t?p>=0:f>p;p+=h)p in u&&(c=n(c,u[p],p,l));return c}};t.exports={left:o(!1),right:o(!0)}},d679:function(t,e,n){"use strict";var i=n("5142"),a=n.n(i);a.a},ef77:function(t,e,n){"use strict";var i=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("a",{attrs:{href:"/"}},["light"===t.theme?i("img",{attrs:{src:n("4cd9"),alt:"exchange"}}):i("img",{attrs:{src:n("f6d6"),alt:"exchange"}})])},a=[],r={name:"Logo",props:["theme"]},s=r,o=(n("431e"),n("2877")),c=Object(o["a"])(s,i,a,!1,null,null,null);e["a"]=c.exports},f6d6:function(t,e,n){t.exports=n.p+"img/logo.034b2f0a.svg"}}]);
//# sourceMappingURL=chunk-1e866757.dfa72abd.js.map