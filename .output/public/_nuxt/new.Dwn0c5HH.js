import{M as X,_ as Z}from"./DashboardSidebar.vue.DrrvIn6-.js";import{_ as ee}from"./AuthModal.vue.S1p1aqV_.js";import{M as q,m as te,B as se,c as n,a as t,t as d,u as a,b as i,p as c,w as u,q as ae,n as M,d as U,D as le,s as oe,v as $,x as I,O as ie,F as w,C as k,k as v,L as D,b$ as ne,o,A as b,J as re,_ as de}from"./entry.B2IFVgKF.js";import{_ as ue,a as me,b as pe,c as ce,d as ve,e as be,f as fe,g as xe,h as ge}from"./index.Bjos5Ior.js";import{u as he}from"./useAgents.CrbTyjJz.js";import{u as _e}from"./useAuth.Vyp_2ZYp.js";import{u as ye}from"./useActiveModels.bfeUBYvV.js";import{A as we}from"./alert-circle.CK50UZ1-.js";import{L as ke}from"./loader-2.gphf9FK_.js";import{P as Ce}from"./plus.C5FiPnXx.js";import{C as Ae}from"./chevrons-up-down.D-QHIOia.js";import{C as Te}from"./check.DLWzRKND.js";import{M as Me}from"./message-circle.CIokyO3i.js";import{F as Ue}from"./file-text.CapHF1Gu.js";import{C as $e}from"./calendar.DhmVqeQd.js";import{S as N}from"./sparkles.DgfYw7vH.js";import"./nuxt-link.CZIucM_4.js";import"./useLayoutState.sNd_KhK0.js";import"./index.BzStbfpn.js";import"./floating-ui.vue.CxJzKeZY.js";import"./arrow-left.D4qTmew4.js";import"./settings.CVBEhxi9.js";import"./link.kpkGukWz.js";import"./database.B9xoHuOa.js";import"./code.xjqaw9ju.js";import"./cpu.VnXlKUPE.js";import"./message-square.YxiZE0Ei.js";import"./bot.DgHqvI4b.js";import"./activity.Bk43bQJl.js";import"./users.BYVY5mba.js";import"./key.D7l7b_ph.js";import"./eye.09w4ag_w.js";import"./utils.7735z2hl.js";import"./index.CXSSBYp8.js";import"./search.CsYQl3Fm.js";import"./index.Dj-Vg5LV.js";import"./useApiFetch.DTQFO30A.js";import"./authSessionManager.DTJsKR5D.js";/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ve=q("BellRingIcon",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}],["path",{d:"M4 2C2.8 3.7 2 5.7 2 8",key:"tap9e0"}],["path",{d:"M22 8c0-2.3-.8-4.3-2-6",key:"5bb3ad"}]]);/**
 * @license lucide-vue-next v0.294.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=q("ClipboardListIcon",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]),Le={class:"min-h-screen bg-slate-50"},Ee={class:"lg:hidden bg-white border-b border-slate-200 px-4 py-3"},je={class:"flex items-center justify-between"},Be={class:"flex items-center gap-2"},Se={class:"w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"},Ie={class:"text-white font-bold text-xs"},De={class:"text-slate-900 font-bold"},Ne={class:"flex"},qe={key:0,class:"lg:hidden fixed inset-0 z-50 w-full"},Fe={class:"flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10"},Oe={class:"max-w-4xl mx-auto"},Ke={key:0,class:"mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"},Re={class:"flex items-center justify-between"},Ye={class:"flex items-center"},He={class:"flex items-center justify-between mb-8"},Pe={class:"flex items-center gap-3"},Ge=["disabled"],Je={class:"bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"},Qe={class:"grid grid-cols-1 md:grid-cols-2 gap-8"},We={key:0,value:"",disabled:""},Xe={key:1,value:"",disabled:""},Ze={key:2,value:"",disabled:""},et=["label"],tt=["value"],st={key:0,class:"mt-2 text-xs text-rose-600"},at=["aria-expanded"],lt={class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4"},ot=["onClick"],it={class:"flex items-start gap-3"},nt={class:"flex-1 min-w-0"},rt={class:"text-xs text-slate-500 line-clamp-2"},dt={class:"relative"},ut=["placeholder"],mt={class:"absolute top-3 right-3"},pt={key:0,class:"inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700"},ct=te({__name:"new",setup(vt){const{isAuthenticated:F,tenant:C}=_e(),V=ne(),{createAgent:O}=he(),{modelGroups:f,isLoading:K,error:A,fetchActiveModels:R,getFirstModelValue:Y}=ye(),p=v(!1),x=v(!1),g=v(!1),T=[{id:"custom",name:"Свой вариант",description:"Создайте собственный системный промпт",prompt:""},{id:"appointment",name:"Агент записи на прием",description:"Помощник для записи пациентов к врачам",prompt:`Вы — профессиональный помощник медицинской клиники, специализирующийся на записи пациентов на прием к врачам.

Ваши основные задачи:
- Помогать пациентам выбрать подходящего специалиста
- Уточнять симптомы и направлять к нужному врачу
- Предлагать доступное время для записи
- Подтверждать записи и отправлять напоминания
- Отвечать на вопросы о подготовке к приему

Стиль общения:
- Вежливый и участливый тон
- Ясные и понятные формулировки
- Эмпатия к состоянию пациента
- Профессионализм без медицинского жаргона

Важно: Вы не ставите диагнозы и не даете медицинских советов, только помогаете с организационными вопросами.`},{id:"consultation",name:"Агент первичной консультации",description:"Первичный сбор информации о симптомах",prompt:`Вы — интеллектуальный помощник для первичной консультации пациентов в медицинской клинике.

Ваши функции:
- Собирать информацию о симптомах и жалобах пациента
- Задавать уточняющие вопросы о длительности, характере симптомов
- Выяснять наличие хронических заболеваний и аллергий
- Рекомендовать подходящего специалиста для обращения
- Определять срочность обращения (плановое/срочное/экстренное)

Принципы работы:
- Задавайте вопросы последовательно, не перегружая пациента
- Используйте простой язык без медицинской терминологии
- Проявляйте внимание и заботу
- При тревожных симптомах рекомендуйте срочное обращение

ВАЖНО: Вы НЕ врач и НЕ ставите диагнозы. Ваша задача — собрать информацию и направить к нужному специалисту.`},{id:"documentation",name:"Агент документации",description:"Помощь с медицинскими документами и справками",prompt:`Вы — помощник по работе с медицинской документацией в клинике.

Ваши задачи:
- Консультировать пациентов по получению справок и выписок
- Объяснять процедуру оформления документов
- Информировать о сроках готовности документов
- Помогать заполнять формы и заявления
- Отвечать на вопросы о медицинских картах

Области помощи:
- Справки для работы/учебы
- Выписки из медицинских карт
- Направления на обследования
- Копии результатов анализов
- Документы для страховых компаний

Стиль общения:
- Четкий и структурированный
- Понятные пошаговые инструкции
- Терпеливое объяснение бюрократических процедур
- Указание точных сроков и требований`},{id:"results",name:"Агент информирования о результатах",description:"Уведомление пациентов о готовых результатах",prompt:`Вы — помощник для информирования пациентов о результатах анализов и обследований.

Ваши функции:
- Уведомлять пациентов о готовности результатов
- Объяснять способы получения результатов (лично, онлайн, по почте)
- Помогать интерпретировать референсные значения
- Рекомендовать обратиться к врачу для расшифровки
- Отвечать на вопросы о сроках готовности анализов

Важные правила:
- Сообщайте факты о готовности, но НЕ интерпретируйте результаты
- Всегда рекомендуйте консультацию с врачом для расшифровки
- Объясняйте, что такое референсные значения
- При отклонениях от нормы мягко рекомендуйте записаться к врачу
- Не пугайте и не успокаивайте преждевременно

Тон: информативный, спокойный, поддерживающий.`},{id:"support",name:"Агент общей поддержки",description:"Универсальный помощник клиники",prompt:`Вы — универсальный помощник медицинской клиники.

Вы помогаете пациентам с широким спектром вопросов:
- Расписание работы клиники и специалистов
- Стоимость услуг и процедур
- Правила подготовки к анализам и обследованиям
- Местоположение и схема проезда
- Страховые программы и скидки
- Общие вопросы о работе клиники

Ваш стиль:
- Дружелюбный и отзывчивый
- Быстрые и точные ответы
- Готовность помочь с любым вопросом
- Перенаправление к профильным специалистам при необходимости

Помните: 
- Вы представляете клинику, будьте вежливы и профессиональны
- Если не знаете ответа, предложите связаться с администратором
- Не давайте медицинских советов, направляйте к врачам`}],m=v("custom"),z=[{value:"Europe/Moscow",label:"Москва (UTC+3)"},{value:"Europe/Kaliningrad",label:"Калининград (UTC+2)"},{value:"Asia/Yekaterinburg",label:"Екатеринбург (UTC+5)"},{value:"Asia/Omsk",label:"Омск (UTC+6)"},{value:"Asia/Novosibirsk",label:"Новосибирск (UTC+7)"},{value:"Asia/Krasnoyarsk",label:"Красноярск (UTC+7)"},{value:"Asia/Irkutsk",label:"Иркутск (UTC+8)"},{value:"Asia/Yakutsk",label:"Якутск (UTC+9)"},{value:"Asia/Vladivostok",label:"Владивосток (UTC+10)"},{value:"Asia/Magadan",label:"Магадан (UTC+11)"},{value:"Asia/Kamchatka",label:"Камчатка (UTC+12)"},{value:"UTC",label:"UTC"},{value:"Europe/London",label:"Лондон (UTC+0)"},{value:"Europe/Berlin",label:"Берлин (UTC+1)"},{value:"Europe/Istanbul",label:"Стамбул (UTC+3)"},{value:"Asia/Dubai",label:"Дубай (UTC+4)"},{value:"Asia/Almaty",label:"Алматы (UTC+6)"},{value:"Asia/Bangkok",label:"Бангкок (UTC+7)"},{value:"Asia/Shanghai",label:"Шанхай (UTC+8)"},{value:"Asia/Tokyo",label:"Токио (UTC+9)"},{value:"America/New_York",label:"Нью-Йорк (UTC-5)"},{value:"America/Los_Angeles",label:"Лос-Анджелес (UTC-8)"}],h=v(!1),l=v({name:"",model:"",timezone:"Europe/Moscow",system_prompt:""}),H=D(()=>{var r;return((r=z.find(e=>e.value===l.value.timezone))==null?void 0:r.label)??"Выберите часовой пояс"}),P=r=>{const e=T.find(_=>_.id===r);e&&e.id!=="custom"?l.value.system_prompt=e.prompt:(e==null?void 0:e.id)==="custom"&&(l.value.system_prompt=l.value.system_prompt||"")},G=r=>({custom:N,appointment:$e,consultation:ze,documentation:Ue,results:Ve,support:Me})[r]||N,L=D(()=>l.value.name.trim()!==""&&l.value.model!==""&&l.value.system_prompt.trim()!==""),E=async()=>{if(L.value)try{g.value=!0;const r=await O({...l.value,timezone:l.value.timezone||"Europe/Moscow",status:"draft",version:1,llm_params:{temperature:.7,max_tokens:1e3}});V.push(`/agents/${r.id}`)}catch(r){console.error("Error creating agent:",r)}finally{g.value=!1}},J=()=>{V.push("/agents")},Q=()=>{x.value=!1};return se(async()=>{await R(),l.value.model||(l.value.model=Y())}),(r,e)=>{var j,B,S;const _=Z,W=ee;return o(),n("div",Le,[t("div",Ee,[t("div",je,[t("div",Be,[t("div",Se,[t("span",Ie,d((j=a(C))!=null&&j.name?a(C).name.charAt(0).toUpperCase():"О"),1)]),t("span",De,d(((B=a(C))==null?void 0:B.name)||"Организация"),1)]),t("button",{onClick:e[0]||(e[0]=s=>p.value=!p.value),class:"p-2 rounded-lg text-slate-600 hover:bg-slate-100"},[i(a(X),{class:"h-5 w-5"})])])]),t("div",Ne,[i(_,{class:"hidden lg:flex"}),p.value?(o(),n("div",{key:0,class:"lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50",onClick:e[1]||(e[1]=s=>p.value=!1)})):c("",!0),i(ae,{"enter-active-class":"transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)","enter-from-class":"-translate-x-full opacity-0 scale-95","enter-to-class":"translate-x-0 opacity-100 scale-100","leave-active-class":"transition-all duration-400 ease-in","leave-from-class":"translate-x-0 opacity-100 scale-100","leave-to-class":"-translate-x-full opacity-0 scale-95"},{default:u(()=>[p.value?(o(),n("div",qe,[i(_,{onClose:e[2]||(e[2]=s=>p.value=!1)})])):c("",!0)]),_:1}),t("main",Fe,[t("div",Oe,[a(F)?c("",!0):(o(),n("div",Ke,[t("div",Re,[t("div",Ye,[i(a(we),{class:"h-5 w-5 text-yellow-400 mr-3"}),e[11]||(e[11]=t("div",null,[t("h3",{class:"text-sm font-medium text-yellow-800"}," Требуется аутентификация "),t("p",{class:"text-sm text-yellow-700 mt-1"}," Войдите в систему для создания агента ")],-1))]),t("button",{onClick:e[3]||(e[3]=s=>x.value=!0),class:"px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"}," Войти ")])])),t("div",He,[e[13]||(e[13]=t("div",null,[t("h1",{class:"text-3xl font-bold text-slate-900"},"Создать нового агента"),t("p",{class:"text-slate-500 mt-1"},"Настройте базовые параметры вашего будущего AI-помощника")],-1)),t("div",Pe,[t("button",{onClick:J,class:"px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"}," Отменить "),t("button",{onClick:E,disabled:g.value||!L.value,class:"px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"},[g.value?(o(),M(a(ke),{key:0,class:"h-4 w-4 animate-spin"})):(o(),M(a(Ce),{key:1,class:"h-4 w-4"})),e[12]||(e[12]=U(" Создать ",-1))],8,Ge)])]),e[22]||(e[22]=le('<div class="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar" data-v-1a35265d><button class="px-5 py-3 text-sm font-medium transition-all relative whitespace-nowrap text-indigo-600 bg-indigo-50 rounded-t-lg" data-v-1a35265d> Основная настройка <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" data-v-1a35265d></div></button><button disabled class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap" data-v-1a35265d> Подключения </button><button disabled class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap" data-v-1a35265d> База знаний </button><button disabled class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap" data-v-1a35265d> Модель </button></div>',1)),t("div",Je,[t("form",{onSubmit:oe(E,["prevent"]),class:"space-y-8"},[t("div",Qe,[t("div",null,[e[14]||(e[14]=t("label",{class:"block text-sm font-bold text-slate-900 mb-2"},"Название агента *",-1)),$(t("input",{"onUpdate:modelValue":e[4]||(e[4]=s=>l.value.name=s),type:"text",required:"",placeholder:"Например: Агент поддержки",class:"w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"},null,512),[[I,l.value.name]])]),t("div",null,[e[16]||(e[16]=t("label",{class:"block text-sm font-bold text-slate-900 mb-2"},"Модель ИИ *",-1)),$(t("select",{"onUpdate:modelValue":e[5]||(e[5]=s=>l.value.model=s),required:"",class:"w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"},[e[15]||(e[15]=t("option",{value:""},"Выберите модель",-1)),a(K)&&!a(f).length?(o(),n("option",We," Загрузка моделей... ")):a(A)&&!a(f).length?(o(),n("option",Xe," Не удалось загрузить модели ")):a(f).length?c("",!0):(o(),n("option",Ze," Нет доступных моделей ")),(o(!0),n(w,null,k(a(f),s=>(o(),n("optgroup",{key:s.group,label:s.group},[(o(!0),n(w,null,k(s.options,y=>(o(),n("option",{key:y.value,value:y.value},d(y.label),9,tt))),128))],8,et))),128))],512),[[ie,l.value.model]]),a(A)?(o(),n("p",st,d(a(A)),1)):c("",!0)])]),t("div",null,[e[18]||(e[18]=t("label",{class:"block text-sm font-bold text-slate-900 mb-2"},"Часовой пояс",-1)),i(a(ge),{open:h.value,"onUpdate:open":e[8]||(e[8]=s=>h.value=s)},{default:u(()=>[i(a(ue),{"as-child":""},{default:u(()=>[t("button",{type:"button",role:"combobox","aria-expanded":h.value,class:"w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all hover:bg-white"},[t("span",{class:b(l.value.timezone?"text-slate-900":"text-slate-400")},d(H.value),3),i(a(Ae),{class:"ml-2 h-4 w-4 shrink-0 opacity-50"})],8,at)]),_:1}),i(a(me),{class:"w-[--reka-popper-anchor-width] p-0",align:"start"},{default:u(()=>[i(a(pe),{modelValue:l.value.timezone,"onUpdate:modelValue":[e[6]||(e[6]=s=>l.value.timezone=s),e[7]||(e[7]=s=>h.value=!1)]},{default:u(()=>[i(a(ce),{placeholder:"Поиск часового пояса..."}),i(a(ve),null,{default:u(()=>[...e[17]||(e[17]=[U("Часовой пояс не найден",-1)])]),_:1}),i(a(be),null,{default:u(()=>[i(a(fe),null,{default:u(()=>[(o(),n(w,null,k(z,s=>i(a(xe),{key:s.value,value:s.value},{default:u(()=>[i(a(Te),{class:b(["mr-2 h-4 w-4",l.value.timezone===s.value?"opacity-100":"opacity-0"])},null,8,["class"]),U(" "+d(s.label),1)]),_:2},1032,["value"])),64))]),_:1})]),_:1})]),_:1},8,["modelValue"])]),_:1})]),_:1},8,["open"]),e[19]||(e[19]=t("p",{class:"mt-1.5 text-xs text-slate-400"},"Часовой пояс используется агентом при работе с датами и временем",-1))]),t("div",null,[e[20]||(e[20]=t("div",{class:"mb-4"},[t("h3",{class:"text-sm font-bold text-slate-900"},"Системный промпт *"),t("p",{class:"text-xs text-slate-500 mt-1"},"Выберите готовый шаблон или создайте свой вариант")],-1)),t("div",lt,[(o(),n(w,null,k(T,s=>t("button",{key:s.id,type:"button",onClick:y=>{m.value=s.id,P(s.id)},class:b(["text-left p-4 rounded-xl border-2 transition-all hover:shadow-sm",[m.value===s.id?"border-indigo-500 bg-indigo-50":"border-slate-200 bg-white hover:border-slate-300"]])},[t("div",it,[t("div",{class:b(["w-10 h-10 rounded-lg flex items-center justify-center shrink-0",[m.value===s.id?"bg-indigo-600":"bg-slate-100"]])},[(o(),M(re(G(s.id)),{class:b(["h-5 w-5",[m.value===s.id?"text-white":"text-slate-400"]])},null,8,["class"]))],2),t("div",nt,[t("h4",{class:b(["text-sm font-semibold mb-1",[m.value===s.id?"text-indigo-900":"text-slate-900"]])},d(s.name),3),t("p",rt,d(s.description),1)])])],10,ot)),64))]),t("div",dt,[$(t("textarea",{"onUpdate:modelValue":e[9]||(e[9]=s=>l.value.system_prompt=s),required:"",rows:"12",placeholder:m.value==="custom"?`Опишите роль и поведение агента. Например:

Вы — профессиональный помощник медицинской клиники...`:"Шаблон загружен. Вы можете отредактировать его под свои нужды.",class:"w-full px-5 py-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"},null,8,ut),[[I,l.value.system_prompt]]),t("div",mt,[m.value!=="custom"?(o(),n("span",pt," Шаблон: "+d((S=T.find(s=>s.id===m.value))==null?void 0:S.name),1)):c("",!0)])])]),e[21]||(e[21]=t("div",{class:"pt-4 flex items-center justify-end border-t border-slate-100"},[t("p",{class:"text-xs text-slate-400"},"* Обязательные поля для заполнения")],-1))],32)])])])]),i(W,{"is-open":x.value,onClose:e[10]||(e[10]=s=>x.value=!1),onAuthenticated:Q},null,8,["is-open"])])}}}),Zt=de(ct,[["__scopeId","data-v-1a35265d"]]);export{Zt as default};
