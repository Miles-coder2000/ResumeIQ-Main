import{a as n,p as o,v as m}from"./chunk-B7RQU5TL-CzFyPpmW.js";/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),y=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,a)=>a?a.toUpperCase():s.toLowerCase()),d=t=>{const e=y(t);return e.charAt(0).toUpperCase()+e.slice(1)},i=(...t)=>t.filter((e,s,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===s).join(" ").trim(),f=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:s=2,absoluteStrokeWidth:a,className:c="",children:r,iconNode:u,...l},p)=>n.createElement("svg",{ref:p,...w,width:e,height:e,stroke:t,strokeWidth:a?Number(s)*24/Number(e):s,className:i("lucide",c),...!r&&!f(l)&&{"aria-hidden":"true"},...l},[...u.map(([g,k])=>n.createElement(g,k)),...Array.isArray(r)?r:[r]]));/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=(t,e)=>{const s=n.forwardRef(({className:a,...c},r)=>n.createElement(b,{ref:r,iconNode:e,className:i(`lucide-${x(d(t))}`,`lucide-${t}`,a),...c}));return s.displayName=d(t),s};/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]],j=h("moon",v);/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]],N=h("sun",C),E=()=>{const[t,e]=n.useState(!1);n.useEffect(()=>{const a=localStorage.getItem("theme"),c=window.matchMedia("(prefers-color-scheme: dark)").matches,r=a==="dark"||!a&&c;e(r),document.documentElement.classList.toggle("dark",r)},[]);const s=()=>{const a=!t;e(a),localStorage.setItem("theme",a?"dark":"light"),document.documentElement.classList.toggle("dark",a)};return o.jsx("button",{onClick:s,className:"p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200","aria-label":"Toggle theme",children:t?o.jsx(N,{className:"w-5 h-5 text-yellow-500"}):o.jsx(j,{className:"w-5 h-5 text-gray-600"})})},A=()=>o.jsxs("nav",{className:"navbar",children:[o.jsx(m,{to:"/",children:o.jsx("p",{className:"text-2xl font-bold text-gradient",children:"ResumèIQ"})}),o.jsxs("div",{className:"flex items-center space-x-4",children:[o.jsx(E,{}),o.jsx(m,{to:"/upload",className:"primary-button w-fit",children:"Upload Resume"})]})]});export{A as N,h as c};
