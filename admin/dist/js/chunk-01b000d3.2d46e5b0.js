(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-01b000d3"],{5874:function(t,a,r){"use strict";var e=r("95f8"),s=r.n(e);s.a},"63cd":function(t,a,r){"use strict";var e=r("9b2f"),s=r.n(e);s.a},"83b1":function(t,a,r){"use strict";r.r(a);var e,s,n=function(){var t=this,a=t.$createElement,r=t._self._c||a;return r("div",{staticClass:"charts"},[r("div",{staticClass:"row"},[r("div",{staticClass:"flex md6 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.verticalBarChart")}},[r("va-chart",{attrs:{data:t.verticalBarChartData,type:"vertical-bar"}})],1)],1),r("div",{staticClass:"flex md6 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.horizontalBarChart")}},[r("va-chart",{attrs:{data:t.horizontalBarChartData,type:"horizontal-bar"}})],1)],1)]),r("div",{staticClass:"row"},[r("div",{staticClass:"flex md12 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.lineChart")}},[r("va-chart",{attrs:{data:t.lineChartData,type:"line"}})],1)],1)]),r("div",{staticClass:"row"},[r("div",{staticClass:"flex md6 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.pieChart")}},[r("va-chart",{attrs:{data:t.pieChartData,type:"pie"}})],1)],1),r("div",{staticClass:"flex md6 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.donutChart")}},[r("va-chart",{attrs:{data:t.donutChartData,type:"donut"}})],1)],1)]),r("div",{staticClass:"row"},[r("div",{staticClass:"flex md12 xs12"},[r("va-card",{staticClass:"chart-widget",attrs:{title:t.$t("charts.bubbleChart")}},[r("va-chart",{attrs:{data:t.bubbleChartData,type:"bubble"}})],1)],1)])])},o=[],i=r("9d2c"),c=function(){return Math.floor(100*Math.random())},l=function(){var t=!!Math.floor(2*Math.random());return t?["Debit","Credit"]:["Credit","Debit"]},d=function(t){return Array.from(Array(t),c)},h=function(){var t=4;return Math.max(t,(new Date).getMonth())},u=0,b=function(t,a){var r=h(),s=["January","February","March","April","May","June","July","August","September","October","November","December"],n=l();return e?(e.datasets[0].backgroundColor=Object(i["f"])(t.primary,.6).css,e.datasets[1].backgroundColor=Object(i["f"])(t.info,.6).css,a&&u!==a&&(e.labels.shift(),e.datasets.forEach((function(t){t.data.shift()})),u=a)):e={labels:s.splice(u,r),datasets:[{label:n[0],backgroundColor:Object(i["f"])(t.primary,.6).css,borderColor:"transparent",data:d(r-u)},{label:n[1],backgroundColor:Object(i["f"])(t.info,.6).css,borderColor:"transparent",data:d(r)}]},e},f=function(t){return{datasets:[{label:"USA",backgroundColor:Object(i["f"])(t.danger,.9).css,borderColor:"transparent",data:[{x:23,y:25,r:15},{x:40,y:10,r:10},{x:30,y:22,r:30},{x:7,y:43,r:40},{x:23,y:27,r:120},{x:20,y:15,r:11},{x:7,y:10,r:35},{x:10,y:20,r:40}]},{label:"Russia",backgroundColor:Object(i["f"])(t.primary,.9).css,borderColor:"transparent",data:[{x:0,y:30,r:15},{x:20,y:20,r:20},{x:15,y:15,r:50},{x:31,y:46,r:30},{x:20,y:14,r:25},{x:34,y:17,r:30},{x:44,y:44,r:10},{x:39,y:25,r:35}]},{label:"Canada",backgroundColor:Object(i["f"])(t.warning,.9).css,borderColor:"transparent",data:[{x:10,y:30,r:45},{x:10,y:50,r:20},{x:5,y:5,r:30},{x:40,y:30,r:20},{x:33,y:15,r:18},{x:40,y:20,r:40},{x:33,y:33,r:40}]},{label:"Belarus",backgroundColor:Object(i["f"])(t.info,.9).css,borderColor:"transparent",data:[{x:35,y:30,r:45},{x:25,y:40,r:35},{x:5,y:5,r:30},{x:5,y:20,r:40},{x:10,y:40,r:15},{x:3,y:10,r:10},{x:15,y:40,r:40},{x:7,y:15,r:10}]},{label:"Ukraine",backgroundColor:Object(i["f"])(t.success,.9).css,borderColor:"transparent",data:[{x:25,y:10,r:40},{x:17,y:40,r:40},{x:35,y:10,r:20},{x:3,y:40,r:10},{x:40,y:40,r:40},{x:20,y:10,r:10},{x:10,y:27,r:35},{x:7,y:26,r:40}]}]}},C=function(t){return{labels:["Africa","Asia","Europe"],datasets:[{label:"Population (millions)",backgroundColor:[t.primary,t.warning,t.danger],data:[2478,5267,734]}]}},p=function(t){return s?s.datasets[0].backgroundColor=[t.danger,t.info,t.primary]:s={labels:["North America","South America","Australia"],datasets:[{label:"Population (millions)",backgroundColor:[t.danger,t.info,t.primary],borderColor:"transparent",data:[2478,5267,734]}]},s},y=function(t){return{labels:["January","February","March","April","May","June","July","August","September","October","November","December"],datasets:[{label:"USA",backgroundColor:t.primary,borderColor:"transparent",data:[50,20,12,39,10,40,39,80,40,20,12,11]},{label:"USSR",backgroundColor:t.info,borderColor:"transparent",data:[50,10,22,39,15,20,85,32,60,50,20,30]}]}},m=function(t){return{labels:["January","February","March","April","May","June","July","August","September","October","November","December"],datasets:[{label:"Vuestic Satisfaction Score",backgroundColor:t.warning,borderColor:"transparent",data:[80,90,50,70,60,90,50,90,80,40,72,93]},{label:"Bulma Satisfaction Score",backgroundColor:t.danger,borderColor:"transparent",data:[20,30,20,40,50,40,15,60,30,20,42,53]}]}},x=function(){var t=this,a=t.$createElement,r=t._self._c||a;return r(t.chartComponent,{ref:"chart",tag:"component",staticClass:"va-chart",attrs:{options:t.options,"chart-data":t.data}})},v=[],g=r("1fca"),D={legend:{position:"bottom",labels:{fontColor:"#34495e",fontFamily:"sans-serif",fontSize:14,padding:20,usePointStyle:!0}},tooltips:{bodyFontSize:14,bodyFontFamily:"sans-serif"},responsive:!0,maintainAspectRatio:!1},w={pie:"pie-chart",donut:"donut-chart",bubble:"bubble-chart",line:"line-chart","horizontal-bar":"horizontal-bar-chart","vertical-bar":"vertical-bar-chart"},k={mixins:[g["g"].reactiveProp],props:["data","chartOptions"],mounted:function(){this.refresh()},watch:{"$themes.primary":function(){this.options.animation=!1,this.refresh()},"$themes.info":function(){this.options.animation=!1,this.refresh()},"$themes.danger":function(){this.options.animation=!1,this.refresh()}},methods:{refresh:function(){this.renderChart(this.chartData,this.options)}},computed:{options:function(){return Object.assign({},D,this.chartOptions)}}},$={extends:g["f"],mixins:[k]},O={extends:g["b"],mixins:[k]},A={extends:g["c"],mixins:[k]},S={extends:g["d"],mixins:[k]},j={extends:g["a"],mixins:[k]},M={extends:g["e"],mixins:[k]},B={name:"va-chart",props:{data:{},options:{},type:{validator:function(t){return t in w}}},components:{PieChart:$,LineChart:M,VerticalBarChart:j,HorizontalBarChart:S,DonutChart:A,BubbleChart:O},computed:{chartComponent:function(){return w[this.type]}}},J=B,z=(r("5874"),r("2877")),F=Object(z["a"])(J,x,v,!1,null,null,null),P=F.exports,E={name:"charts",components:{VaChart:P},data:function(){return{bubbleChartData:f(this.$themes),lineChartData:b(this.$themes),pieChartData:C(this.$themes),donutChartData:p(this.$themes),verticalBarChartData:y(this.$themes),horizontalBarChartData:m(this.$themes)}},methods:{refreshData:function(){this.lineChartData=b(this.$themes)}}},N=E,U=(r("63cd"),Object(z["a"])(N,n,o,!1,null,null,null));a["default"]=U.exports},"95f8":function(t,a,r){},"9b2f":function(t,a,r){}}]);
//# sourceMappingURL=chunk-01b000d3.2d46e5b0.js.map