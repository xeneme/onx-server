(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-e185e7a4"],{"06ad":function(t,e,r){},"13c4":function(t,e,r){"use strict";var n=r("60b0"),o=r.n(n);o.a},"1dfd":function(t,e,r){t.exports=r.p+"img/tracer2.3215c301.svg"},"482f":function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("div",{staticClass:"tooltip"},[r("span",{class:["tooltiptext",t.theme]},[t._v(t._s(t.text))])])},o=[],a=(r("4160"),{name:"Tooltip",props:{text:String,index:String,theme:{type:String,default:"dark"}},methods:{show:function(){this.$anime({targets:this.$el.querySelector(".tooltiptext"),opacity:1,duration:50,easing:"easeOutExpo"})},hide:function(){this.$anime({targets:this.$el.querySelector(".tooltiptext"),opacity:0,duration:50,easing:"easeOutExpo"})},once:function(){var t=this;this.$anime({targets:this.$el.querySelector(".tooltiptext"),opacity:1,duration:50,easing:"easeOutExpo",endDelay:1200,complete:function(){t.$anime({targets:t.$el.querySelector(".tooltiptext"),opacity:0,duration:50,easing:"easeOutExpo"})}})}},mounted:function(){var t=this;["once","show","hide"].forEach((function(e){t.$root.$on("tooltip:"+e,(function(r){r==t.index&&t[e]()}))}))}}),i=a,u=(r("a483"),r("2877")),s=Object(u["a"])(i,n,o,!1,null,"e1014624",null);e["a"]=s.exports},"4c03":function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("footer",{staticClass:"footer"},[r("div",{staticClass:"container"},[r("div",{staticClass:"footer__wrap"},[r("div",{staticClass:"footer__logo"},[r("Logo"),r("p",{staticClass:"footer__logo-text"},[t._v(" Safety. Efficiency. Quality. ")])],1),r("Menu"),r("Contact"),r("small",{staticClass:"footer__copyright"},[t._v(" © "+t._s((new Date).getFullYear())+" "+t._s(t.host)+" ")])],1)])])},o=[],a=r("ef77"),i=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("nav",{staticClass:"menu-footer"},[r("h2",{staticClass:"menu-footer__title"},[t._v(" Menu ")]),r("ul",{staticClass:"menu-footer__list"},[r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/"}},[t._v(" Main ")])],1),r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/wallet"}},[t._v(" Wallet ")])],1),r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/trading"}},[t._v(" Trading ")])],1),r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/contract"}},[t._v(" Contract ")])],1),r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/about"}},[t._v(" About us ")])],1),r("li",{staticClass:"menu-footer__item"},[r("router-link",{staticClass:"menu-footer__link",attrs:{to:"/terms"}},[t._v(" Terms ")])],1)])])},u=[],s={name:"Menu"},c=s,f=(r("a8dc"),r("2877")),l=Object(f["a"])(c,i,u,!1,null,"0de0644a",null),g=l.exports,h=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("section",{staticClass:"footer-contact"},[r("h2",{staticClass:"footer-contact__title"},[t._v(" Contact ")]),r("ul",{staticClass:"footer-contact__list"},[r("li",{staticClass:"footer-contact__item"},[t._v(" Email: "),r("a",{attrs:{href:"mailto:support@"+t.host}},[t._v("support@"+t._s(t.host))])])])])},d=[],v={name:"Contact",computed:{host:function(){return window.location.host}}},p=v,w=(r("e01a2"),Object(f["a"])(p,h,d,!1,null,"de308f92",null)),m=w.exports,y={name:"Footer",components:{Logo:a["a"],Menu:g,Contact:m},computed:{host:function(){return this.$store.getters.host}}},_=y,C=(r("e10f"),Object(f["a"])(_,n,o,!1,null,"1d2d8913",null));e["a"]=C.exports},"4dc1":function(t,e,r){},5344:function(t,e,r){"use strict";var n=r("ee8c"),o=r.n(n);o.a},"552e":function(t,e,r){t.exports=r.p+"img/large-comet.1125501a.svg"},"60b0":function(t,e,r){},"7d17":function(t,e,r){t.exports=r.p+"img/triangle.c13e28b7.svg"},a0da:function(t,e,r){},a483:function(t,e,r){"use strict";var n=r("d0b6"),o=r.n(n);o.a},a8dc:function(t,e,r){"use strict";var n=r("4dc1"),o=r.n(n);o.a},cb19:function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return t.value?r("popup",{attrs:{icon:"clock",title:"Payment"+(t.value.id?" #"+t.value.id:""),show:t.value.visible}},[r("div",{staticClass:"payment-popup"},[r("div",{staticClass:"title"},[t._v("Send exactly "+t._s(t.value.amount)+" at")]),r("Tooltip",{attrs:{text:"Address copied!",theme:"white",index:t.value.address}}),r("div",{staticClass:"address",on:{click:function(e){return t.copyPaymentAddress(t.value.address)}}},[t._v(" "+t._s(t.value.address)+" ")]),r("div",{staticClass:"wrap"},[r("div",{staticClass:"desc"},[t._v(" Your payment will be completed after confirmation by the network. Confirmation time may vary and depends on the Commission ")]),r("div",{staticClass:"qr"},[r("div",{staticClass:"qrcode",domProps:{innerHTML:t._s(t.value.qr)}})])])],1)]):t._e()},o=[],a=r("7adc"),i=r("482f"),u=r("e0d3"),s=r.n(u),c={name:"payment",components:{Popup:a["a"],Tooltip:i["a"]},props:{value:{type:Object,default:function(){return{visible:!1,id:0,address:"",amount:"",qr:function(t){var e=s()(0,"L");return e.addData(t),e.make(),e.createImgTag(4,1)}}}}},methods:{copyPaymentAddress:function(t){this.$root.$emit("tooltip:once",t),this.$copy(t)}}},f=c,l=(r("5344"),r("2877")),g=Object(l["a"])(f,n,o,!1,null,"ca2a5ec2",null);e["a"]=g.exports},cb53:function(t,e,r){"use strict";var n=function(){var t=this,e=t.$createElement;t._self._c;return t._m(0)},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"bg"},[n("img",{staticClass:"bg__comet",attrs:{src:r("1dfd")}}),n("img",{staticClass:"bg__large-comet",attrs:{src:r("552e")}}),n("img",{staticClass:"bg__triangle1",attrs:{src:r("7d17")}}),n("img",{staticClass:"bg__triangle2",attrs:{src:r("7d17")}})])}],a={name:"Background"},i=a,u=(r("13c4"),r("2877")),s=Object(u["a"])(i,n,o,!1,null,"335f5f1e",null);e["a"]=s.exports},d0b6:function(t,e,r){},e01a2:function(t,e,r){"use strict";var n=r("06ad"),o=r.n(n);o.a},e0d3:function(t,e,r){var n,o,a,i=function(){var t=function(t,e){var n=236,a=17,h=t,d=r[e],v=null,p=0,m=null,y=[],_={},C=function(t,e){p=4*h+17,v=function(t){for(var e=new Array(t),r=0;r<t;r+=1){e[r]=new Array(t);for(var n=0;n<t;n+=1)e[r][n]=null}return e}(p),A(0,0),A(p-7,0),A(0,p-7),k(),B(),x(t,e),h>=7&&b(t),null==m&&(m=D(h,d,y)),T(m,e)},A=function(t,e){for(var r=-1;r<=7;r+=1)if(!(t+r<=-1||p<=t+r))for(var n=-1;n<=7;n+=1)e+n<=-1||p<=e+n||(v[t+r][e+n]=0<=r&&r<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==r||6==r)||2<=r&&r<=4&&2<=n&&n<=4)},M=function(){for(var t=0,e=0,r=0;r<8;r+=1){C(!0,r);var n=o.getLostPoint(_);(0==r||t>n)&&(t=n,e=r)}return e},B=function(){for(var t=8;t<p-8;t+=1)null==v[t][6]&&(v[t][6]=t%2==0);for(var e=8;e<p-8;e+=1)null==v[6][e]&&(v[6][e]=e%2==0)},k=function(){for(var t=o.getPatternPosition(h),e=0;e<t.length;e+=1)for(var r=0;r<t.length;r+=1){var n=t[e],a=t[r];if(null==v[n][a])for(var i=-2;i<=2;i+=1)for(var u=-2;u<=2;u+=1)v[n+i][a+u]=-2==i||2==i||-2==u||2==u||0==i&&0==u}},b=function(t){for(var e=o.getBCHTypeNumber(h),r=0;r<18;r+=1){var n=!t&&1==(e>>r&1);v[Math.floor(r/3)][r%3+p-8-3]=n}for(r=0;r<18;r+=1){n=!t&&1==(e>>r&1);v[r%3+p-8-3][Math.floor(r/3)]=n}},x=function(t,e){for(var r=d<<3|e,n=o.getBCHTypeInfo(r),a=0;a<15;a+=1){var i=!t&&1==(n>>a&1);a<6?v[a][8]=i:a<8?v[a+1][8]=i:v[p-15+a][8]=i}for(a=0;a<15;a+=1){i=!t&&1==(n>>a&1);a<8?v[8][p-a-1]=i:a<9?v[8][15-a-1+1]=i:v[8][15-a-1]=i}v[p-8][8]=!t},T=function(t,e){for(var r=-1,n=p-1,a=7,i=0,u=o.getMaskFunction(e),s=p-1;s>0;s-=2){6==s&&(s-=1);while(1){for(var c=0;c<2;c+=1)if(null==v[n][s-c]){var f=!1;i<t.length&&(f=1==(t[i]>>>a&1));var l=u(n,s-c);l&&(f=!f),v[n][s-c]=f,a-=1,-1==a&&(i+=1,a=7)}if(n+=r,n<0||p<=n){n-=r,r=-r;break}}}},E=function(t,e){for(var r=0,n=0,a=0,u=new Array(e.length),s=new Array(e.length),c=0;c<e.length;c+=1){var f=e[c].dataCount,l=e[c].totalCount-f;n=Math.max(n,f),a=Math.max(a,l),u[c]=new Array(f);for(var g=0;g<u[c].length;g+=1)u[c][g]=255&t.getBuffer()[g+r];r+=f;var h=o.getErrorCorrectPolynomial(l),d=i(u[c],h.getLength()-1),v=d.mod(h);s[c]=new Array(h.getLength()-1);for(g=0;g<s[c].length;g+=1){var p=g+v.getLength()-s[c].length;s[c][g]=p>=0?v.getAt(p):0}}var w=0;for(g=0;g<e.length;g+=1)w+=e[g].totalCount;var m=new Array(w),y=0;for(g=0;g<n;g+=1)for(c=0;c<e.length;c+=1)g<u[c].length&&(m[y]=u[c][g],y+=1);for(g=0;g<a;g+=1)for(c=0;c<e.length;c+=1)g<s[c].length&&(m[y]=s[c][g],y+=1);return m},D=function(t,e,r){for(var i=u.getRSBlocks(t,e),c=s(),f=0;f<r.length;f+=1){var l=r[f];c.put(l.getMode(),4),c.put(l.getLength(),o.getLengthInBits(l.getMode(),t)),l.write(c)}var g=0;for(f=0;f<i.length;f+=1)g+=i[f].dataCount;if(c.getLengthInBits()>8*g)throw"code length overflow. ("+c.getLengthInBits()+">"+8*g+")";c.getLengthInBits()+4<=8*g&&c.put(0,4);while(c.getLengthInBits()%8!=0)c.putBit(!1);while(1){if(c.getLengthInBits()>=8*g)break;if(c.put(n,8),c.getLengthInBits()>=8*g)break;c.put(a,8)}return E(c,i)};_.addData=function(t,e){e=e||"Byte";var r=null;switch(e){case"Numeric":r=c(t);break;case"Alphanumeric":r=f(t);break;case"Byte":r=l(t);break;case"Kanji":r=g(t);break;default:throw"mode:"+e}y.push(r),m=null},_.isDark=function(t,e){if(t<0||p<=t||e<0||p<=e)throw t+","+e;return v[t][e]},_.getModuleCount=function(){return p},_.make=function(){if(h<1){for(var t=1;t<40;t++){for(var e=u.getRSBlocks(t,d),r=s(),n=0;n<y.length;n++){var a=y[n];r.put(a.getMode(),4),r.put(a.getLength(),o.getLengthInBits(a.getMode(),t)),a.write(r)}var i=0;for(n=0;n<e.length;n++)i+=e[n].dataCount;if(r.getLengthInBits()<=8*i)break}h=t}C(!1,M())},_.createTableTag=function(t,e){t=t||2,e="undefined"==typeof e?4*t:e;var r="";r+='<table style="',r+=" border-width: 0px; border-style: none;",r+=" border-collapse: collapse;",r+=" padding: 0px; margin: "+e+"px;",r+='">',r+="<tbody>";for(var n=0;n<_.getModuleCount();n+=1){r+="<tr>";for(var o=0;o<_.getModuleCount();o+=1)r+='<td style="',r+=" border-width: 0px; border-style: none;",r+=" border-collapse: collapse;",r+=" padding: 0px; margin: 0px;",r+=" width: "+t+"px;",r+=" height: "+t+"px;",r+=" background-color: ",r+=_.isDark(n,o)?"#000000":"#ffffff",r+=";",r+='"/>';r+="</tr>"}return r+="</tbody>",r+="</table>",r},_.createSvgTag=function(t,e,r,n){var o={};"object"==typeof arguments[0]&&(o=arguments[0],t=o.cellSize,e=o.margin,r=o.alt,n=o.title),t=t||2,e="undefined"==typeof e?4*t:e,r="string"===typeof r?{text:r}:r||{},r.text=r.text||null,r.id=r.text?r.id||"qrcode-description":null,n="string"===typeof n?{text:n}:n||{},n.text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var a,i,u,s,c,f=_.getModuleCount()*t+2*e,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+f+'px" height="'+f+'px"',l+=' viewBox="0 0 '+f+" "+f+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||r.text?' role="img" aria-labelledby="'+L([n.id,r.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+L(n.id)+'">'+L(n.text)+"</title>":"",l+=r.text?'<description id="'+L(r.id)+'">'+L(r.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',u=0;u<_.getModuleCount();u+=1)for(s=u*t+e,a=0;a<_.getModuleCount();a+=1)_.isDark(u,a)&&(i=a*t+e,l+="M"+i+","+s+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>",l},_.createDataURL=function(t,e){t=t||2,e="undefined"==typeof e?4*t:e;var r=_.getModuleCount()*t+2*e,n=e,o=r-e;return w(r,r,(function(e,r){if(n<=e&&e<o&&n<=r&&r<o){var a=Math.floor((e-n)/t),i=Math.floor((r-n)/t);return _.isDark(i,a)?0:1}return 1}))},_.createImgTag=function(t,e,r){t=t||2,e="undefined"==typeof e?4*t:e;var n=_.getModuleCount()*t+2*e,o="";return o+="<img",o+=' src="',o+=_.createDataURL(t,e),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',r&&(o+=' alt="',o+=L(r),o+='"'),o+="/>",o};var L=function(t){for(var e="",r=0;r<t.length;r+=1){var n=t.charAt(r);switch(n){case"<":e+="&lt;";break;case">":e+="&gt;";break;case"&":e+="&amp;";break;case'"':e+="&quot;";break;default:e+=n;break}}return e},S=function(t){var e=1;t="undefined"==typeof t?2*e:t;var r,n,o,a,i,u=_.getModuleCount()*e+2*t,s=t,c=u-t,f={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},g="";for(r=0;r<u;r+=2){for(o=Math.floor((r-s)/e),a=Math.floor((r+1-s)/e),n=0;n<u;n+=1)i="█",s<=n&&n<c&&s<=r&&r<c&&_.isDark(o,Math.floor((n-s)/e))&&(i=" "),s<=n&&n<c&&s<=r+1&&r+1<c&&_.isDark(a,Math.floor((n-s)/e))?i+=" ":i+="█",g+=t<1&&r+1>=c?l[i]:f[i];g+="\n"}return u%2&&t>0?g.substring(0,g.length-u-1)+Array(u+1).join("▀"):g.substring(0,g.length-1)};return _.createASCII=function(t,e){if(t=t||1,t<2)return S(e);t-=1,e="undefined"==typeof e?2*t:e;var r,n,o,a,i=_.getModuleCount()*t+2*e,u=e,s=i-e,c=Array(t+1).join("██"),f=Array(t+1).join("  "),l="",g="";for(r=0;r<i;r+=1){for(o=Math.floor((r-u)/t),g="",n=0;n<i;n+=1)a=1,u<=n&&n<s&&u<=r&&r<s&&_.isDark(o,Math.floor((n-u)/t))&&(a=0),g+=a?c:f;for(o=0;o<t;o+=1)l+=g+"\n"}return l.substring(0,l.length-1)},_.renderTo2dContext=function(t,e){e=e||2;for(var r=_.getModuleCount(),n=0;n<r;n++)for(var o=0;o<r;o++)t.fillStyle=_.isDark(n,o)?"black":"white",t.fillRect(n*e,o*e,e,e)},_};t.stringToBytesFuncs={default:function(t){for(var e=[],r=0;r<t.length;r+=1){var n=t.charCodeAt(r);e.push(255&n)}return e}},t.stringToBytes=t.stringToBytesFuncs["default"],t.createStringToBytes=function(t,e){var r=function(){var r=v(t),n=function(){var t=r.read();if(-1==t)throw"eof";return t},o=0,a={};while(1){var i=r.read();if(-1==i)break;var u=n(),s=n(),c=n(),f=String.fromCharCode(i<<8|u),l=s<<8|c;a[f]=l,o+=1}if(o!=e)throw o+" != "+e;return a}(),n="?".charCodeAt(0);return function(t){for(var e=[],o=0;o<t.length;o+=1){var a=t.charCodeAt(o);if(a<128)e.push(a);else{var i=r[t.charAt(o)];"number"==typeof i?(255&i)==i?e.push(i):(e.push(i>>>8),e.push(255&i)):e.push(n)}}return e}};var e={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},r={L:1,M:0,Q:3,H:2},n={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},o=function(){var t=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],r=1335,o=7973,u=21522,s={},c=function(t){var e=0;while(0!=t)e+=1,t>>>=1;return e};return s.getBCHTypeInfo=function(t){var e=t<<10;while(c(e)-c(r)>=0)e^=r<<c(e)-c(r);return(t<<10|e)^u},s.getBCHTypeNumber=function(t){var e=t<<12;while(c(e)-c(o)>=0)e^=o<<c(e)-c(o);return t<<12|e},s.getPatternPosition=function(e){return t[e-1]},s.getMaskFunction=function(t){switch(t){case n.PATTERN000:return function(t,e){return(t+e)%2==0};case n.PATTERN001:return function(t,e){return t%2==0};case n.PATTERN010:return function(t,e){return e%3==0};case n.PATTERN011:return function(t,e){return(t+e)%3==0};case n.PATTERN100:return function(t,e){return(Math.floor(t/2)+Math.floor(e/3))%2==0};case n.PATTERN101:return function(t,e){return t*e%2+t*e%3==0};case n.PATTERN110:return function(t,e){return(t*e%2+t*e%3)%2==0};case n.PATTERN111:return function(t,e){return(t*e%3+(t+e)%2)%2==0};default:throw"bad maskPattern:"+t}},s.getErrorCorrectPolynomial=function(t){for(var e=i([1],0),r=0;r<t;r+=1)e=e.multiply(i([1,a.gexp(r)],0));return e},s.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case e.MODE_NUMBER:return 10;case e.MODE_ALPHA_NUM:return 9;case e.MODE_8BIT_BYTE:return 8;case e.MODE_KANJI:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case e.MODE_NUMBER:return 12;case e.MODE_ALPHA_NUM:return 11;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case e.MODE_NUMBER:return 14;case e.MODE_ALPHA_NUM:return 13;case e.MODE_8BIT_BYTE:return 16;case e.MODE_KANJI:return 12;default:throw"mode:"+t}}},s.getLostPoint=function(t){for(var e=t.getModuleCount(),r=0,n=0;n<e;n+=1)for(var o=0;o<e;o+=1){for(var a=0,i=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||e<=n+u))for(var s=-1;s<=1;s+=1)o+s<0||e<=o+s||0==u&&0==s||i==t.isDark(n+u,o+s)&&(a+=1);a>5&&(r+=3+a-5)}for(n=0;n<e-1;n+=1)for(o=0;o<e-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(r+=3)}for(n=0;n<e;n+=1)for(o=0;o<e-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(r+=40);for(o=0;o<e;o+=1)for(n=0;n<e-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(r+=40);var f=0;for(o=0;o<e;o+=1)for(n=0;n<e;n+=1)t.isDark(n,o)&&(f+=1);var l=Math.abs(100*f/e/e-50)/5;return r+=10*l,r},s}(),a=function(){for(var t=new Array(256),e=new Array(256),r=0;r<8;r+=1)t[r]=1<<r;for(r=8;r<256;r+=1)t[r]=t[r-4]^t[r-5]^t[r-6]^t[r-8];for(r=0;r<255;r+=1)e[t[r]]=r;var n={glog:function(t){if(t<1)throw"glog("+t+")";return e[t]},gexp:function(e){while(e<0)e+=255;while(e>=256)e-=255;return t[e]}};return n}();function i(t,e){if("undefined"==typeof t.length)throw t.length+"/"+e;var r=function(){var r=0;while(r<t.length&&0==t[r])r+=1;for(var n=new Array(t.length-r+e),o=0;o<t.length-r;o+=1)n[o]=t[o+r];return n}(),n={getAt:function(t){return r[t]},getLength:function(){return r.length},multiply:function(t){for(var e=new Array(n.getLength()+t.getLength()-1),r=0;r<n.getLength();r+=1)for(var o=0;o<t.getLength();o+=1)e[r+o]^=a.gexp(a.glog(n.getAt(r))+a.glog(t.getAt(o)));return i(e,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var e=a.glog(n.getAt(0))-a.glog(t.getAt(0)),r=new Array(n.getLength()),o=0;o<n.getLength();o+=1)r[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)r[o]^=a.gexp(a.glog(t.getAt(o))+e);return i(r,0).mod(t)}};return n}var u=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],e=function(t,e){var r={};return r.totalCount=t,r.dataCount=e,r},n={},o=function(e,n){switch(n){case r.L:return t[4*(e-1)+0];case r.M:return t[4*(e-1)+1];case r.Q:return t[4*(e-1)+2];case r.H:return t[4*(e-1)+3];default:return}};return n.getRSBlocks=function(t,r){var n=o(t,r);if("undefined"==typeof n)throw"bad rs block @ typeNumber:"+t+"/errorCorrectionLevel:"+r;for(var a=n.length/3,i=[],u=0;u<a;u+=1)for(var s=n[3*u+0],c=n[3*u+1],f=n[3*u+2],l=0;l<s;l+=1)i.push(e(c,f));return i},n}(),s=function(){var t=[],e=0,r={getBuffer:function(){return t},getAt:function(e){var r=Math.floor(e/8);return 1==(t[r]>>>7-e%8&1)},put:function(t,e){for(var n=0;n<e;n+=1)r.putBit(1==(t>>>e-n-1&1))},getLengthInBits:function(){return e},putBit:function(r){var n=Math.floor(e/8);t.length<=n&&t.push(0),r&&(t[n]|=128>>>e%8),e+=1}};return r},c=function(t){var r=e.MODE_NUMBER,n=t,o={getMode:function(){return r},getLength:function(t){return n.length},write:function(t){var e=n,r=0;while(r+2<e.length)t.put(a(e.substring(r,r+3)),10),r+=3;r<e.length&&(e.length-r==1?t.put(a(e.substring(r,r+1)),4):e.length-r==2&&t.put(a(e.substring(r,r+2)),7))}},a=function(t){for(var e=0,r=0;r<t.length;r+=1)e=10*e+i(t.charAt(r));return e},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return o},f=function(t){var r=e.MODE_ALPHA_NUM,n=t,o={getMode:function(){return r},getLength:function(t){return n.length},write:function(t){var e=n,r=0;while(r+1<e.length)t.put(45*a(e.charAt(r))+a(e.charAt(r+1)),11),r+=2;r<e.length&&t.put(a(e.charAt(r)),6)}},a=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return o},l=function(r){var n=e.MODE_8BIT_BYTE,o=t.stringToBytes(r),a={getMode:function(){return n},getLength:function(t){return o.length},write:function(t){for(var e=0;e<o.length;e+=1)t.put(o[e],8)}};return a},g=function(r){var n=e.MODE_KANJI,o=t.stringToBytesFuncs["SJIS"];if(!o)throw"sjis not supported.";!function(t,e){var r=o(t);if(2!=r.length||(r[0]<<8|r[1])!=e)throw"sjis not supported."}("友",38726);var a=o(r),i={getMode:function(){return n},getLength:function(t){return~~(a.length/2)},write:function(t){var e=a,r=0;while(r+1<e.length){var n=(255&e[r])<<8|255&e[r+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(r+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),r+=2}if(r<e.length)throw"illegal char at "+(r+1)}};return i},h=function(){var t=[],e={writeByte:function(e){t.push(255&e)},writeShort:function(t){e.writeByte(t),e.writeByte(t>>>8)},writeBytes:function(t,r,n){r=r||0,n=n||t.length;for(var o=0;o<n;o+=1)e.writeByte(t[o+r])},writeString:function(t){for(var r=0;r<t.length;r+=1)e.writeByte(t.charCodeAt(r))},toByteArray:function(){return t},toString:function(){var e="";e+="[";for(var r=0;r<t.length;r+=1)r>0&&(e+=","),e+=t[r];return e+="]",e}};return e},d=function(){var t=0,e=0,r=0,n="",o={},a=function(t){n+=String.fromCharCode(i(63&t))},i=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){t=t<<8|255&n,e+=8,r+=1;while(e>=6)a(t>>>e-6),e-=6},o.flush=function(){if(e>0&&(a(t<<6-e),t=0,e=0),r%3!=0)for(var o=3-r%3,i=0;i<o;i+=1)n+="="},o.toString=function(){return n},o},v=function(t){var e=t,r=0,n=0,o=0,a={read:function(){while(o<8){if(r>=e.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=e.charAt(r);if(r+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|i(t.charCodeAt(0)),o+=6)}var a=n>>>o-8&255;return o-=8,a}},i=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return a},p=function(t,e){var r=t,n=e,o=new Array(t*e),a={setPixel:function(t,e,n){o[e*r+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(r),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(r),t.writeShort(n),t.writeByte(0);var e=2,o=u(e);t.writeByte(e);var a=0;while(o.length-a>255)t.writeByte(255),t.writeBytes(o,a,255),a+=255;t.writeByte(o.length-a),t.writeBytes(o,a,o.length-a),t.writeByte(0),t.writeString(";")}},i=function(t){var e=t,r=0,n=0,o={write:function(t,o){if(t>>>o!=0)throw"length over";while(r+o>=8)e.writeByte(255&(t<<r|n)),o-=8-r,t>>>=8-r,n=0,r=0;n|=t<<r,r+=o},flush:function(){r>0&&e.writeByte(n)}};return o},u=function(t){for(var e=1<<t,r=1+(1<<t),n=t+1,a=s(),u=0;u<e;u+=1)a.add(String.fromCharCode(u));a.add(String.fromCharCode(e)),a.add(String.fromCharCode(r));var c=h(),f=i(c);f.write(e,n);var l=0,g=String.fromCharCode(o[l]);l+=1;while(l<o.length){var d=String.fromCharCode(o[l]);l+=1,a.contains(g+d)?g+=d:(f.write(a.indexOf(g),n),a.size()<4095&&(a.size()==1<<n&&(n+=1),a.add(g+d)),g=d)}return f.write(a.indexOf(g),n),f.write(r,n),f.flush(),c.toByteArray()},s=function(){var t={},e=0,r={add:function(n){if(r.contains(n))throw"dup key:"+n;t[n]=e,e+=1},size:function(){return e},indexOf:function(e){return t[e]},contains:function(e){return"undefined"!=typeof t[e]}};return r};return a},w=function(t,e,r){for(var n=p(t,e),o=0;o<e;o+=1)for(var a=0;a<t;a+=1)n.setPixel(a,o,r(a,o));var i=h();n.write(i);for(var u=d(),s=i.toByteArray(),c=0;c<s.length;c+=1)u.writeByte(s[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();!function(){i.stringToBytesFuncs["UTF-8"]=function(t){function e(t){for(var e=[],r=0;r<t.length;r++){var n=t.charCodeAt(r);n<128?e.push(n):n<2048?e.push(192|n>>6,128|63&n):n<55296||n>=57344?e.push(224|n>>12,128|n>>6&63,128|63&n):(r++,n=65536+((1023&n)<<10|1023&t.charCodeAt(r)),e.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return e}return e(t)}}(),function(r){o=[],n=r,a="function"===typeof n?n.apply(e,o):n,void 0===a||(t.exports=a)}((function(){return i}))},e10f:function(t,e,r){"use strict";var n=r("a0da"),o=r.n(n);o.a},ee8c:function(t,e,r){}}]);
//# sourceMappingURL=chunk-e185e7a4.0fe7d4b4.js.map