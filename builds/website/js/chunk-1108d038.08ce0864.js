(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-1108d038"],{"09f5":function(t,i,s){"use strict";s("41d8")},"1d74":function(t,i,s){},"2f48":function(t,i,s){t.exports=s.p+"img/gears2.26e51c40.svg"},3792:function(t,i,s){t.exports=s.p+"img/stable.e2315d89.svg"},"381f":function(t,i,s){t.exports=s.p+"img/access.f0f6e746.svg"},"41d8":function(t,i,s){},"88ad":function(t,i,s){t.exports=s.p+"img/coins.a985d163.svg"},"9bb0":function(t,i,s){"use strict";var a=function(){var t=this,i=t.$createElement,s=t._self._c||i;return t.isButton?s("button",{class:["default",t.theme,t.disabled||t.loading?"disabled":""],attrs:{type:t.typeButton,disabled:t.disabled||t.loading}},[t.loading?s("fa",{staticClass:"fa-spin",attrs:{icon:"circle-notch"}}):t._e(),s("span",[t._v(t._s(t.value))])],1):s("a",{class:["default",t.theme],attrs:{href:t.link}},[t.loading?s("fa",{staticClass:"fa-spin",attrs:{icon:"circle-notch"}}):t._e(),s("span",[t._v(t._s(t.value))])],1)},e=[],n={name:"Button",props:{disabled:{type:Boolean,default:!1},isButton:{type:Boolean,default:!0},typeButton:{type:String,default:"button"},link:{type:String,default:"javascript: void(0)"},value:{type:String,default:"send"},theme:String,loading:Boolean}},o=n,r=(s("ac6d"),s("2877")),c=Object(r["a"])(o,a,e,!1,null,"6f0952fa",null);i["a"]=c.exports},"9f10":function(t,i,s){},a4c1:function(t,i,s){"use strict";s("1d74")},a89d:function(t,i,s){t.exports=s.p+"img/wallet3.b3a8f592.svg"},ac6d:function(t,i,s){"use strict";s("9f10")},bf98:function(t,i,s){t.exports=s.p+"img/gears1.91aad0a5.svg"},bfb6:function(t,i,s){t.exports=s.p+"img/safety.85685261.svg"},c7ab:function(t,i,s){t.exports=s.p+"img/diag.7cbbc210.svg"},e538e:function(t,i,s){"use strict";s.r(i);var a=function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"page"},[a("Background"),a("Payment",{attrs:{value:t.payment}}),a("div",{staticClass:"structure animated fadeInUp"},[t._m(0),a("div",{staticClass:"profit animated fadeInRight"},[t._m(1),a("div",{staticClass:"profit__wrap"},[a("div",{staticClass:"profit__wrap-about"},[a("div",{staticClass:"title"},[t._v("Where does the profit come from?")]),a("p",[t._v(" "+t._s(t.host)+" staking is based on BTC, ETH, LTC with a floating yield of up to 20%. Using BTC / ETH / LTC as the basis for placing USDT, we provide a fixed interest rate of 20% with daily payments. ")])])])]),a("div",{staticClass:"actions"},[a("div",{staticClass:"calculator card"},[a("div",{staticClass:"title"},[t._v("Calculate your profit")]),a("p",[t._v("How much "+t._s(t.network)+" do you want to send to staking?")]),a("div",{staticClass:"wrapper"},[a("input",{staticClass:"input",attrs:{disabled:"",type:"text"},domProps:{value:t.computedAmount}}),a("div",{staticClass:"currencies"},[a("Icon",{class:t.currency(0),attrs:{icon:["currency__icon","bitcoin"]},nativeOn:{click:function(i){return t.selectCurrency(0)}}}),a("Icon",{class:t.currency(1),attrs:{icon:["currency__icon","ethereum"]},nativeOn:{click:function(i){return t.selectCurrency(1)}}}),a("Icon",{class:t.currency(2),attrs:{icon:["currency__icon","litecoin"]},nativeOn:{click:function(i){return t.selectCurrency(2)}}}),a("Icon",{class:t.currency(3),attrs:{icon:["currency__icon","usdc"]},nativeOn:{click:function(i){return t.selectCurrency(3)}}})],1)]),a("input",{directives:[{name:"model",rawName:"v-model",value:t.amount,expression:"amount"}],attrs:{min:t.computedMin,max:t.computedMax,type:"range",step:"0.01"},domProps:{value:t.amount},on:{__r:function(i){t.amount=i.target.value}}}),a("p",[t._v(" Сalculate your profit for the day, month and year based on the amount of the investment ")])]),a("div",{staticClass:"staking card"},[a("div",{staticClass:"income"},[a("p",[t._v("Daily income")]),a("p",{staticClass:"bucks"},[t._v(t._s(t.dailyIncome))])]),a("div",{staticClass:"divider"}),a("div",{staticClass:"income"},[a("p",[t._v("Monthly income")]),a("p",{staticClass:"bucks"},[t._v(t._s(t.monthlyIncome))])]),a("div",{staticClass:"divider"}),a("div",{staticClass:"income"},[a("p",[t._v("Annual income")]),a("p",{staticClass:"bucks"},[t._v(t._s(t.annualIncome))])]),a("div",{staticClass:"button-wrap"},[a("Button",{staticClass:"button",attrs:{disabled:t.loading,value:"Begin staking"},nativeOn:{click:function(i){return t.beginStacking.apply(null,arguments)}}})],1)])]),a("div",{staticClass:"special-offer"},[t._m(2),a("div",{staticClass:"inputs"},[a("input",{staticClass:"input",attrs:{type:"text",placeholder:"E-mail"}}),a("input",{staticClass:"input",attrs:{type:"text",placeholder:"Your name"}}),a("Button",{staticClass:"button",attrs:{value:"Get the offer"}})],1)]),a("div",{staticClass:"advantages-block"},[a("div",{staticClass:"title"},[t._v("Why is it advantageous?")]),a("div",{staticClass:"advantages"},[t._m(3),a("div",{staticClass:"no-commission"},[a("div",{staticClass:"subtitle"},[t._v("No commission")]),a("p",[t._v(" "+t._s(t.host)+" does not charge a fee for placing coins in a staking. ")])]),t._m(4),t._m(5)])]),a("div",{staticClass:"safety"},[a("div",{staticClass:"title"},[t._v("Safety comes first")]),a("div",{staticClass:"items"},[t._m(6),t._m(7),a("div",{staticClass:"item"},[a("img",{staticClass:"icon",attrs:{src:s("bfb6")}}),a("div",{staticClass:"subtitle"},[t._v("Safety of exchange")]),a("p",[t._v(" "+t._s(t.host)+" has been operating since 2014 and has gained a reputation as a stable platform - one of the few that has never been hacked. ")])])])]),t._m(8)]),a("Footer")],1)},e=[function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"intro"},[a("div",{staticClass:"header card animated fadeInLeft"},[a("div",{staticClass:"title"},[t._v("Cryptocurrency staking with a 20% yield")]),a("p",[t._v("Make money on a cryptocurrency with minimal risk")]),a("ul",[a("li",[a("p",[t._v("Variable minimum deposit")])]),a("li",[a("p",[t._v("Minimum period: 20 hours")])])])]),a("div",{staticClass:"about-wrap animated fadeInLeft"},[a("div",{staticClass:"about"},[a("div",{staticClass:"title"},[t._v("What is staking?")]),a("p",[t._v(" Stacking is a passive income by storing funds on a crypt currency wallet to provide support for blockchain operations. ")])])]),a("img",{staticClass:"wallet animated fadeInRight",attrs:{src:s("a89d")}})])},function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"gears"},[a("img",{staticClass:"gear-over",attrs:{src:s("bf98")}}),a("img",{staticClass:"gear-out",attrs:{src:s("2f48")}})])},function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("div",{staticClass:"header"},[s("div",{staticClass:"title"},[t._v("Are you a large investor?")]),s("p",[t._v(" For investors with a deposit of $100,000 or more we have prepared a special offer that will allow them to earn more and manage their investments through a personal manager. ")])])},function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"high-profits"},[a("div",{staticClass:"subtitle"},[t._v("High profits")]),a("p",[t._v(" There are no offers on the market for the BTC / ETH / LTC stack with a guaranteed yield of 20%. ")]),a("img",{staticClass:"diag",attrs:{src:s("c7ab")}})])},function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("div",{staticClass:"available-funds"},[s("div",{staticClass:"subtitle"},[t._v("Funds are always available")]),s("p",[t._v(" You can replenish or withdraw your assets at any time without losing interest. ")])])},function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"daily-profit"},[a("div",{staticClass:"subtitle"},[t._v("Profit is accrued daily")]),a("p",[t._v(" You earn every day, not at the end of the storage period. ")]),a("img",{staticClass:"coins",attrs:{src:s("88ad")}})])},function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"item"},[a("img",{staticClass:"icon",attrs:{src:s("3792")}}),a("div",{staticClass:"subtitle"},[t._v("Coins are always equal to their price")]),a("p",[t._v(" Thus, even in the conditions of a pandemic, you will save your coins, and also earn more. ")])])},function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"item"},[a("img",{staticClass:"icon",attrs:{src:s("381f")}}),a("div",{staticClass:"subtitle"},[t._v("Only you have access to the funds")]),a("p",[t._v(" Coin staking, which is the basis of our staking, is organized on smart contracts and is fully decentralized. ")])])},function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("div",{staticClass:"start card"},[s("div",{staticClass:"title"},[t._v("What do you need to start?")]),s("div",{staticClass:"start-wrap"},[s("div",{staticClass:"stages"},[s("div",{staticClass:"stage"},[t._v("1")]),s("div",{staticClass:"divider"}),s("div",{staticClass:"stage"},[t._v("2")]),s("div",{staticClass:"divider"}),s("div",{staticClass:"stage"},[t._v("3")]),s("div",{staticClass:"divider"}),s("div",{staticClass:"stage"},[t._v("4")])]),s("div",{staticClass:"desc"},[s("div",[t._v("Sign up")]),s("div"),s("div",[t._v("Verify your account")]),s("div"),s("div",[t._v("Minimum deposit")]),s("div"),s("div",[t._v("Start getting a profit")])])])])}],n=(s("b680"),s("4c03")),o=s("cb53"),r=s("9bb0"),c=s("ed0e"),l=s("cb19"),u=s("e0d3"),d=s.n(u);function v(t,i){return Math.floor(Math.random()*(i-t+1)+t)}var m={name:"Contract",components:{Footer:n["a"],Background:o["a"],Button:r["a"],Icon:c["a"],Payment:l["a"]},data:function(){return{selectedCurrency:"bitcoin",amount:.01,loading:!1,payment:null,currencies:["bitcoin","ethereum","litecoin","usd coin"]}},watch:{network:"updateAmount"},computed:{profile:function(){return this.$store.getters["auth/profile"]},host:function(){return this.$store.getters.host},network:function(){return{bitcoin:"BTC",ethereum:"ETH",litecoin:"LTC","usd coin":"USDC"}[this.selectedCurrency]},computedMin:function(){var t,i,s=null===(t=this.profile)||void 0===t||null===(i=t.settings)||void 0===i?void 0:i.depositMinimum;return{BTC:(null===s||void 0===s?void 0:s.BTC)||.01,LTC:(null===s||void 0===s?void 0:s.LTC)||3,ETH:(null===s||void 0===s?void 0:s.ETH)||1,USDC:(null===s||void 0===s?void 0:s.USDC)||10}[this.network]},computedMax:function(){return{BTC:10.01,LTC:50,ETH:50,USDC:1e4}[this.network]},computedAmount:function(){var t=10.01!=this.amount?this.amount:10;return t+" "+this.network},dailyIncome:function(){var t=10.01!=this.amount?this.amount:10;return(.2*t/365).toFixed(3)+" "+this.network},monthlyIncome:function(){var t=10.01!=this.amount?this.amount:10;return(.2*t/12).toFixed(3)+" "+this.network},annualIncome:function(){var t=10.01!=this.amount?this.amount:10;return(.2*t).toFixed(3)+" "+this.network}},methods:{beginStacking:function(){var t=this;if(!this.loading){if(!this.$store.getters["auth/isLoggedIn"])return this.$router.push({path:"/"}),void this.$store.commit("popups/SIGN_IN",!0);this.$root.$emit("staking-loading",!0),this.loading=!0,this.$axios.post("api/wallet/staking/begin",{net:this.network,amount:this.amount}).then((function(i){t.$root.$emit("staking-loading",!1),t.loading=!1,t.handleSuccess(i.data)})).catch((function(i){t.$root.$emit("staking-loading",!1),t.loading=!1,t.$root.contractLoading=!1,t.handleError(i.response.data)}))}},handleError:function(t){t&&this.$store.commit("popups/ADD_ALERT",{type:"error",title:"Error",message:t.message.length<200?t.message:"Message is too long"})},handleSuccess:function(t){var i=t.amount,s=t.network,a=t.address,e=function(t){var i=d()(0,"L");return i.addData(t),i.make(),i.createImgTag(4,1)};this.payment={visible:!0,id:v(1e4,99999),address:a,amount:i+" "+s,qr:e(a)}},updateAmount:function(t){var i=this.profile.settings.depositMinimum,s={BTC:(null===i||void 0===i?void 0:i.BTC)||.01,LTC:(null===i||void 0===i?void 0:i.LTC)||3,ETH:(null===i||void 0===i?void 0:i.ETH)||1,USDC:(null===i||void 0===i?void 0:i.USDC)||10}[t],a={BTC:10,LTC:50,ETH:50,USDC:1e4}[t];this.amount<s?this.amount=s:this.amount>a&&(this.amount=a)},currency:function(t){return[this.currencies[t]===this.selectedCurrency?"active":""]},selectCurrency:function(t){this.selectedCurrency=this.currencies[t]}},mounted:function(){this.updateAmount(this.network)}},f=m,p=(s("09f5"),s("2877")),h=Object(p["a"])(f,a,e,!1,null,"685a3db6",null);i["default"]=h.exports},ed0e:function(t,i,s){"use strict";var a=function(){var t=this,i=t.$createElement,s=t._self._c||i;return s("i",{class:["ox-icon",t.icon]},[s("div",{staticClass:"hover_circle"})])},e=[],n={name:"Icon",props:["icon"]},o=n,r=(s("a4c1"),s("2877")),c=Object(r["a"])(o,a,e,!1,null,"ff5ecc88",null);i["a"]=c.exports}}]);
//# sourceMappingURL=chunk-1108d038.08ce0864.js.map