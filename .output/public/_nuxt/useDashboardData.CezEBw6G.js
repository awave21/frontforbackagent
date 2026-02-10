import{bY as r,m as b,o as d,c as f,a,t as o,A as l,u as n,n as x,J as p,L as c,k as y}from"./entry.CVvpXMAV.js";import{F as C}from"./file-text.J1ertyIc.js";import{U as w}from"./user-check.C7subQIO.js";/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=r("ArrowUpIcon",[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=r("BarChart2Icon",[["line",{x1:"18",x2:"18",y1:"20",y2:"10",key:"1xfpm4"}],["line",{x1:"12",x2:"12",y1:"20",y2:"4",key:"be30l9"}],["line",{x1:"6",x2:"6",y1:"20",y2:"14",key:"1r4le6"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=r("CalendarIcon",[["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",ry:"2",key:"eu3xkr"}],["line",{x1:"16",x2:"16",y1:"2",y2:"6",key:"m3sa8f"}],["line",{x1:"8",x2:"8",y1:"2",y2:"6",key:"18kwsl"}],["line",{x1:"3",x2:"21",y1:"10",y2:"10",key:"xt86sb"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=r("CircleIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F=r("LayersIcon",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=r("TargetIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=r("UserXIcon",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=r("XCircleIcon",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),U={class:"bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm"},M={class:"flex items-center justify-between mb-4"},z={class:"text-xs sm:text-sm font-normal text-slate-600"},A={class:"text-3xl sm:text-4xl font-bold text-slate-900 mb-2"},T={class:"text-xs sm:text-sm text-slate-500 mb-3"},X={class:"flex items-center gap-1.5"},H=b({__name:"MetricCard",props:{title:{},value:{},description:{},trend:{},type:{},icon:{}},setup(t){const e=t,i=c(()=>({Calendar:g,XCircle:L,BarChart2:_,Target:I,UserCheck:w,Layers:F,FileText:C,UserX:B})[e.icon]||g),s=c(()=>{switch(e.type){case"positive":return"bg-green-50";case"negative":return"bg-red-50";case"info":return"bg-sky-50";case"warning":return"bg-amber-50";default:return"bg-slate-50"}}),h=c(()=>{switch(e.type){case"positive":return"text-green-600";case"negative":return"text-red-600";case"info":return"text-sky-600";case"warning":return"text-amber-600";default:return"text-slate-600"}}),u=c(()=>{switch(e.type){case"positive":return"text-green-600";case"negative":return"text-slate-500";case"info":return"text-green-600";case"warning":return"text-green-600";default:return"text-slate-600"}}),k=c(()=>e.type==="negative"?m:e.trend.includes("Достигнуто")?D:m);return(v,R)=>(d(),f("div",U,[a("div",M,[a("p",z,o(t.title),1),a("div",{class:l(["flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg",n(s)])},[(d(),x(p(n(i)),{class:l(["h-4 w-4 sm:h-5 sm:w-5",n(h)])},null,8,["class"]))],2)]),a("p",A,o(t.value),1),a("p",T,o(t.description),1),a("div",X,[(d(),x(p(n(k)),{class:l(["h-3 w-3",n(u)])},null,8,["class"])),a("span",{class:l(["text-xs sm:text-sm font-medium",n(u)])},o(t.trend),3)])]))}}),q=()=>({kpiMetrics:[{id:"created",title:"Создано записей",value:"245",description:"Новых записей на прием",trend:"Успешно",type:"positive",icon:"Calendar"},{id:"cancelled",title:"Отменено записей",value:"123",description:"Отмененных записей",trend:"Отслеживается",type:"negative",icon:"XCircle"},{id:"net",title:"Чистый результат",value:"+122",description:"Создано минус отменено",trend:"Положительный",type:"info",icon:"BarChart2"},{id:"goals",title:"Выполнено целей",value:"368",description:"Успешных операций агента",trend:"Достигнуто",type:"warning",icon:"Target"}],conversionMetrics:[{id:"cr-consultation",title:"CR записи на консультации",value:"59%",description:"Конверсия записанных пациентов на консультации к специалистам",icon:"UserCheck",type:"positive"},{id:"cr-complex",title:"CR записи на комплексы",value:"44%",description:"Конверсия записанных пациентов на комплексные услуги",icon:"Layers",type:"negative"},{id:"cr-total",title:"CR записи",value:"69%",description:"% записи от общего числа обращений",icon:"FileText",type:"info"},{id:"cr-refusal",title:"CR отказов",value:"23%",description:"% отказов от общего числа обращений",icon:"UserX",type:"warning"}],charts:{entryDynamics:{labels:["11.11","14.11","17.11","20.11","23.11","26.11","29.11","02.12","05.12","08.12"],datasets:[{label:"Создано",data:[3,6,1,7,7,3,2,9,9,3],backgroundColor:"#F06292"},{label:"Отменено",data:[2,1,3,2,6,2,2,1,1,3],backgroundColor:"#FFD54F"},{label:"Чистый",data:[1,5,-2,5,1,1,0,8,8,0],backgroundColor:"#4DB6AC"}]},messageDistribution:{labels:["Клиенты","Агент","Менеджер"],datasets:[{data:[34.57,33.04,32.39],backgroundColor:["#FF7043","#26A69A","#37474F"],borderWidth:0}]}}}),J=async()=>{const t=y(null),e=y(!0),i=y(null);try{await new Promise(s=>setTimeout(s,0)),t.value=q()}catch(s){i.value=s}finally{e.value=!1}return{data:t,pending:e,error:i}};export{g as C,H as _,J as u};
