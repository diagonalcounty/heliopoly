(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();function _(e,n,t){const o=t[Math.min(e,t.length-1)]??.2,r=(n-90)*Math.PI/180;return{x:.5+o*Math.cos(r),y:.5+o*Math.sin(r),ring:e}}function P(e){const{next:n,refuel:t,fuelToLeave:o,gravityClass:r,...a}=e,i=r??(o?2:0);return{...a,next:n??[],refuel:t??"none",gravityClass:i,fuelToLeave:i>0||!!o}}function tr(){const e=[.1,.16,.22,.28,.34,.4,.46],n=[P({id:"earth",name:"Earth",kind:"planet",..._(2,8.3,e),landingBonus:400,refuel:"free",gravityClass:3,price:0}),P({id:"t_ev",name:"Transit",kind:"space",..._(2,47.5,e)}),P({id:"venus",name:"Venus",kind:"planet",..._(2,76.6,e),price:500,rent:70,group:"venus",gravityClass:3,refuel:"station"}),P({id:"t_vm",name:"Transit",kind:"space",..._(1,120,e)}),P({id:"mercury",name:"Mercury",kind:"planet",..._(0,170.5,e),price:400,rent:60,group:"mercury",gravityClass:2,refuel:"station"}),P({id:"t_mm",name:"Transit",kind:"space",..._(0,250.7,e)}),P({id:"elon",name:"Elon",kind:"federation",..._(3,220,e),price:550,rent:75,group:"mars",refuel:"paid",gravityClass:0}),P({id:"mars",name:"Mars",kind:"planet",..._(3,250,e),price:600,rent:85,group:"mars",gravityClass:2,refuel:"station"}),P({id:"phobos",name:"Phobos",kind:"moon",..._(3,280,e),price:250,rent:30,group:"mars",gravityClass:1,refuel:"station"}),P({id:"deimos",name:"Deimos",kind:"moon",..._(3,310,e),price:250,rent:30,group:"mars",gravityClass:1,refuel:"station"}),P({id:"t_mb",name:"Transit",kind:"space",..._(3,333,e)}),P({id:"belt1",name:"Belt 1",kind:"space",..._(4,357,e)}),P({id:"belt2",name:"Belt 2",kind:"space",..._(4,21.7,e)}),P({id:"belt3",name:"Belt 3",kind:"space",..._(4,68,e)}),P({id:"belt4",name:"Belt 4",kind:"space",..._(4,113,e)}),P({id:"belt5",name:"Belt 5",kind:"space",..._(4,158,e)}),P({id:"belt6",name:"Belt 6",kind:"space",..._(4,207,e)}),P({id:"holst",name:"Holst Space Station",kind:"federation",..._(5,240,e),price:700,rent:100,group:"jupiter",refuel:"paid",gravityClass:0}),P({id:"j_b1",name:"J Transit",kind:"space",..._(5,265,e)}),P({id:"io",name:"Io",kind:"moon",..._(5,290,e),price:350,rent:45,group:"jupiter",gravityClass:2,refuel:"station",paint:"jupiter-moon"}),P({id:"j_b2",name:"J Transit",kind:"space",..._(5,315,e)}),P({id:"europa",name:"Europa",kind:"moon",..._(5,340,e),price:400,rent:55,group:"jupiter",gravityClass:2,refuel:"station",paint:"jupiter-moon"}),P({id:"j_b3",name:"J Transit",kind:"space",..._(5,5,e)}),P({id:"ganymede",name:"Ganymede",kind:"moon",..._(5,30,e),price:550,rent:90,group:"jupiter",gravityClass:2,refuel:"station",paint:"jupiter-moon"}),P({id:"j_b4",name:"J Transit",kind:"space",..._(5,58.7,e)}),P({id:"callisto",name:"Callisto",kind:"moon",..._(5,80,e),price:500,rent:75,group:"jupiter",gravityClass:2,refuel:"station",paint:"jupiter-moon"}),P({id:"j_b5",name:"J Transit",kind:"space",..._(5,105,e)}),P({id:"daktulios",name:"Daktulios",kind:"federation",..._(6,130,e),price:800,rent:120,group:"saturn",refuel:"paid",gravityClass:0}),P({id:"titan",name:"Titan",kind:"moon",..._(6,155,e),price:600,rent:95,group:"saturn",gravityClass:2,refuel:"station",paint:"saturn-moon"}),P({id:"s_b1",name:"S Transit",kind:"space",..._(6,175,e)}),P({id:"enceladus",name:"Enceladus",kind:"moon",..._(6,195,e),price:320,rent:40,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"s_b2",name:"S Transit",kind:"space",..._(6,215,e)}),P({id:"iapetus",name:"Iapetus",kind:"moon",..._(6,235,e),price:380,rent:50,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"s_b3",name:"S Transit",kind:"space",..._(6,255,e)}),P({id:"mimas",name:"Mimas",kind:"moon",..._(6,275,e),price:280,rent:35,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"s_b4",name:"S Transit",kind:"space",..._(6,295,e)}),P({id:"rhea",name:"Rhea",kind:"moon",..._(6,315,e),price:420,rent:60,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"s_b5",name:"S Transit",kind:"space",..._(6,335,e)}),P({id:"dione",name:"Dione",kind:"moon",..._(6,355,e),price:400,rent:55,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"s_b6",name:"S Transit",kind:"space",..._(6,20,e)}),P({id:"tethys",name:"Tethys",kind:"moon",..._(6,40,e),price:360,rent:48,group:"saturn",gravityClass:1,refuel:"station",paint:"saturn-moon"}),P({id:"t_se",name:"Homeward",kind:"space",..._(6,57,e)})],t={};for(const r of n)t[r.id]=r;const o=[["earth","t_ev"],["t_ev","venus"],["venus","t_vm"],["t_vm","mercury"],["mercury","t_mm"],["t_mm","elon"],["elon","mars"],["mars","phobos"],["phobos","deimos"],["deimos","t_mb"],["t_mb","belt1"],["belt1","belt2"],["belt2","belt3"],["belt3","belt4"],["belt4","belt5"],["belt5","belt6"],["belt6","holst"],["holst","j_b1"],["j_b1","io"],["io","j_b2"],["j_b2","europa"],["europa","j_b3"],["j_b3","ganymede"],["ganymede","j_b4"],["j_b4","callisto"],["callisto","j_b5"],["j_b5","daktulios"],["daktulios","titan"],["titan","s_b1"],["s_b1","enceladus"],["enceladus","s_b2"],["s_b2","iapetus"],["iapetus","s_b3"],["s_b3","mimas"],["mimas","s_b4"],["s_b4","rhea"],["rhea","s_b5"],["s_b5","dione"],["dione","s_b6"],["s_b6","tethys"],["tethys","t_se"],["t_se","earth"]];for(const[r,a]of o)t[r].next=[a];return{nodes:t,startId:"earth",rings:e}}function I(e,n){const t=e.nodes[n];if(!t)throw new Error(`Unknown node: ${n}`);return t}function H(e){return typeof e.price=="number"&&e.price>0&&(e.kind==="planet"||e.kind==="moon"||e.kind==="federation"||e.kind==="dock")}function Wt(e){return Object.values(e.nodes)}const ha="⍼";function g(e){return`${ha}${e}`}const Gt={mercury:{id:"mercury",name:"Mercury",deedIds:["mercury"]},venus:{id:"venus",name:"Venus",deedIds:["venus"]},mars:{id:"mars",name:"Mars",deedIds:["elon","mars","phobos","deimos"]},jupiter:{id:"jupiter",name:"Jupiter",deedIds:["holst","io","europa","ganymede","callisto"],moonColor:"#ff9f43"},saturn:{id:"saturn",name:"Saturn",deedIds:["daktulios","titan","enceladus","iapetus","mimas","rhea","dione","tethys"],moonColor:"#f6e58d"}};function le(e){return e?Gt[e]??null:null}function he(e,n,t){return Gt[t].deedIds.every(r=>e[r]===n)}const ke=["elon","holst","daktulios"];function pe(e){return ke.includes(e)}function Ft(e,n){return ke.filter(t=>e[t]===n).length}function jt(e,n,t){if(!pe(t))return 1;const o=Ft(e,n);return o<=1?1:o===2?2:4}function pa(e,n,t){const o=I(e.board,n),r=o.rent??0,a=le(o.group),s=!!a&&he(e.owners,t,a.id)?2:1,l=jt(e.owners,t,n),c=e.stations[n]?1.5:1;return Math.floor(r*s*l*c)}function pn(e){return Math.floor((e??0)/2)}function or(e,n,t){return{listPrice:e,cashInvested:n,rentCollected:0,gusherCollected:0,acquiredOnTurn:t}}function mn(e,n,t){const o=or(t.listPrice,t.cashInvested??t.listPrice,t.acquiredOnTurn??0);return t.rentCollected!=null&&(o.rentCollected=t.rentCollected),t.gusherCollected!=null&&(o.gusherCollected=t.gusherCollected),e.claimBooks[n]=o,o}function gn(e,n){delete e.claimBooks[n]}function Ut(e,n,t){const o=e.claimBooks[n];return o||mn(e,n,{listPrice:t})}function Kt(e,n){const t=e.propertyLedger;if(!t)return null;let o=t[n];return o||(o={nodeId:n,invested:0,rentCollected:0,landings:0,claims:0},t[n]=o),o}function ma(e,n,t){const o=Kt(e,n);o&&(o.invested+=Math.max(0,t),o.claims+=1)}function ga(e,n,t){const o=Kt(e,n);o&&(o.invested+=Math.max(0,t))}function fa(e,n,t){const o=Kt(e,n);o&&(o.rentCollected+=Math.max(0,t),o.landings+=1)}function On(e,n,t,o,r){t>0&&(Ut(e,n,o).rentCollected+=t),r&&fa(r,n,Math.max(0,t))}function ba(e,n,t,o){t<=0||(Ut(e,n,o).gusherCollected+=t)}function ya(e,n,t,o,r){t>0&&(Ut(e,n,o).cashInvested+=t),r&&ga(r,n,Math.max(0,t))}function Yt(e){return e.rentCollected+e.gusherCollected}function rr(e){return e.cashInvested<=0?null:Yt(e)/e.cashInvested}function ka(e,n,t=3){const o=e.players.find(a=>a.id===n);if(!o)return"";const r=[];for(const[a,i]of Object.entries(o.claimBooks)){const s=rr(i);s!==null&&r.push({name:I(e.board,a).name,pct:Math.round(s*100)})}return r.length===0?"":(r.sort((a,i)=>i.pct-a.pct),`Best books: ${r.slice(0,t).map(a=>`${a.name} ${a.pct}%`).join(" · ")}.`)}function oe(e,n,t,o){const r=I(e.board,t);if(!H(r))return;const a=e.players.find(s=>s.id===n);if(!a||a.eliminated)return;const i=e.owners[t];if(i&&i!==n){const s=e.players.find(l=>l.id===i);s&&(s.properties=s.properties.filter(l=>l!==t),gn(s,t),s.ephemerisBodyId===t&&(s.ephemerisBodyId=s.properties[0]??null))}e.owners[t]=n,a.properties.includes(t)||a.properties.push(t),a.ephemerisBodyId||(a.ephemerisBodyId=t),o?.depot&&(e.stations[t]=!0),mn(a,t,{listPrice:r.price??0,cashInvested:o?.cashInvested??r.price??0,rentCollected:o?.rentCollected??0,gusherCollected:o?.gusherCollected??0,acquiredOnTurn:e.gameTurn})}function va(e,n){e.landingRights[n]=(e.landingRights[n]??0)+1}function ar(e,n){const t=e.landingRights[n]??0;return t<=0?!1:(t<=1?delete e.landingRights[n]:e.landingRights[n]=t-1,!0)}function ir(e,n){return e.players.filter(t=>!t.eliminated&&t.id!==n)}function Vt(e,n,t){const o=e.players.length,r=e.players.findIndex(a=>a.id===t);if(r<0)return null;for(let a=1;a<=o;a++){const i=e.players[(r+a)%o];if(!(!i||i.eliminated||i.id===n.sellerId)&&n.bids[i.id]===void 0)return i.id}return null}function wa(e,n,t){const o=e.players.findIndex(i=>i.id===n.sellerId),r=e.players.length,a=[];if(o<0)return"";for(let i=1;i<=r;i++){const s=e.players[(o+i)%r];if(!s||s.id===n.sellerId)continue;const l=n.bids[s.id];l!==void 0&&(l<=0?a.push(`${s.name}  passed`):s.id===t?a.push(`${s.name}  ${g(l)}  won`):a.push(`${s.name}  ${g(l)}`))}return a.join(`
`)}function bo(e,n,t){const o=I(e.board,n.nodeId),r=e.players.find(f=>f.id===n.sellerId),a=t.winnerId?e.players.find(f=>f.id===t.winnerId):void 0,i=e.players.find(f=>f.agent==="human"&&!f.eliminated),s=wa(e,n,t.winnerId),l=s?`

Bids (reserve ${g(n.reserve)})
${s}`:`

Reserve ${g(n.reserve)}.`,c=t.tied?`
Tie at ${g(t.price)} — next seat after the seller takes it.`:"";if(!t.winnerId||!a||!r)return{title:"Auction withdrawn",body:`No bid met the reserve (${g(n.reserve)}) for ${o.name}.${l}`};const p=i?n.bids[i.id]??0:0,m=!!i&&i.id===a.id,h=!!i&&i.id!==r.id&&p>0&&!m,E=m?"Won":h?"Outbid":"Claim sold",b=`${a.name} takes ${o.name} for ${g(t.price)}.`,u=`${r.name} keeps docking rights for one landing.`;return{title:E,body:`${b}
${u}${l}${c}`}}function sr(e,n,t){const o=t.reserve;if(n.cash<o)return 0;const r=I(e.board,t.nodeId),a=e.config.aiDifficulty,i=a==="easy"?400:a==="expert"?80:150,s=n.cash-i;if(s<o)return 0;const l=le(r.group);let c=!1;l&&(c=l.deedIds.every(u=>u===t.nodeId||e.owners[u]===n.id));const p=Ft(e.owners,n.id),h=pe(t.nodeId)&&e.owners[t.nodeId]!==n.id&&p>=1,E=r.price??o*2;let b=0;if(c)b=Math.max(o,Math.floor(E*(a==="expert"?1.25:a==="hard"?1.1:.95)));else if(h)b=Math.max(o,Math.floor(E*(a==="easy"?.6:.85)));else if(a==="easy")b=$a(e.rngState,n.id+t.nodeId)>.72?o:0;else if(n.cash>=o+i+200){const u=r.rent??0;(pe(t.nodeId)||u>=50)&&(b=o)}return b<=0?0:Math.min(s,Math.max(o,b))}function $a(e,n){let t=e|0;for(let o=0;o<n.length;o++)t=Math.imul(t^n.charCodeAt(o),2654435769);return(t>>>0)%1e3/1e3}function Ea(e,n,t){const o=e.players.find(b=>b.id===n);if(!o)return null;const r=I(e.board,o.position);let a=0;const i=new Map,s=[];for(const b of o.properties){const u=I(e.board,b);if(!H(u))continue;a+=u.price??0;const f=o.claimBooks[b]??or(u.price??0,u.price??0,0),S=le(u.group),A=!!S&&he(e.owners,o.id,S.id),x={nodeId:b,name:u.name,systemName:S?.name??"Other",listPrice:f.listPrice,cashInvested:f.cashInvested,rentCollected:f.rentCollected,gusherCollected:f.gusherCollected,earnings:Yt(f),roi:rr(f),rentNow:pa(e,b,o.id),hasDepot:!!e.stations[b],monopoly:A,hubMult:jt(e.owners,o.id,b),bankValue:pn(u.price),isHub:pe(b)};if(S){const $=i.get(S.id)??[];$.push(x),i.set(S.id,$)}else s.push(x)}const l=[];for(const b of Object.values(Gt)){const u=i.get(b.id);u?.length&&l.push({title:b.name,monopoly:he(e.owners,o.id,b.id),owned:u.length,total:b.deedIds.length,rows:u})}s.length&&l.push({title:"Other",monopoly:!1,owned:s.length,total:s.length,rows:s});const c=o.properties.filter(b=>e.stations[b]).length,p=Object.entries(o.landingRights).filter(([,b])=>b>0).map(([b,u])=>({nodeId:b,name:I(e.board,b).name,remaining:u})),m=e.players[e.currentPlayerIndex],h=e.phase==="await_action"||e.phase==="await_post_land",E=!o.eliminated&&o.agent==="human"&&m?.id===o.id&&h&&!e.pendingAuction&&!e.pendingCharterChoice&&o.properties.length>0;return{playerId:o.id,name:o.name,color:o.color,agent:o.agent,cash:o.cash,fuel:o.fuel,maxFuel:e.config.maxFuel,netWorth:t(e,o),deedValue:a,depotValue:c*500+o.stationsInHand*500,circuits:o.circuitsCompleted,parkCount:o.parkCount,propellant:o.propellant,positionName:r.name,eliminated:o.eliminated,landingRights:p,hubCount:Ft(e.owners,o.id),groups:l,canSell:E,auctionedThisTurn:[...o.auctionedThisTurn??[]]}}function Sa(e){return e.cashInvested<=0?e.earnings>0?`no cash in · ${g(e.earnings)} earned`:"no cash in":`${Math.round(e.earnings/e.cashInvested*100)}% recovered (${g(e.earnings)} / ${g(e.cashInvested)})`}function Ca(e){return e<=0?"no hubs":e===1?`hubs 1/${ke.length}`:e===2?`hubs 2/${ke.length} · hub rent ×2`:`hubs 3/${ke.length} · hub rent ×4`}const de={methane:{id:"methane",label:"Methane (CH₄)",short:"CH₄",uiShort:"CH4",leaveMult:1,leaveRisk:0,blurb:"Stable tanks. Fuel strike on Titan or Enceladus with a depot. No leak risk."},hydrogen:{id:"hydrogen",label:"Hydrogen (H₂)",short:"H₂",uiShort:"H2",leaveMult:.85,leaveRisk:.1,blurb:"Cheaper leave burns. Ice strikes on Enceladus/Mars/Europa/Ganymede with a depot. Leak on landing: half fuel + lose a turn to repair."}},Ia={0:0,1:.75,2:1,3:1.4,4:1.85};function lr(e){return e.gravityClass!==void 0?e.gravityClass:e.fuelToLeave?2:0}function se(e,n,t){const o=lr(e),r=Ia[o];if(r<=0||n<=0)return 0;const a=de[t].leaveMult;return Math.max(1,Math.ceil(n*r*a))}function Ma(e,n){return I(e,n).next[0]??n}function dr(e,n){for(const t of Object.values(e.nodes))if(t.next.includes(n))return t.id;return null}function yo(e,n,t){return t==="forward"?Ma(e,n):dr(e,n)??n}function Re(e,n,t,o="forward"){let r=n;const a=[],i=[];for(let s=0;s<t;s++){r=yo(e,r,o);let l=I(e,r);l.kind==="gravity"&&(i.push({nodeId:r,passThrough:!0}),r=yo(e,r,o),l=I(e,r)),i.push({nodeId:r,passThrough:!1}),a.push(r)}return{stops:a,frames:i,endId:a.length?a[a.length-1]:n}}const Ta=["enceladus","mars","europa","ganymede"],Ra=["titan","enceladus"],Aa=750,La=["You've struck pure ice!","Hydrogen vein tapped!","Massive ice pocket uncovered!","You've hit a hydrogen-rich layer!","Clean ice motherlode found!","Electrolysis goldmine discovered!","Deep ice reserve tapped!"],_a=["You've struck liquid methane!","Methane reservoir tapped!","Hydrocarbon lake discovered!","You've hit a methane sea!","Rich methane pocket tapped!","Surface hydrocarbon strike!","You've uncovered a fuel lake!"];function Pa(e){return e==="hydrogen"?Ta:Ra}function Ba(e,n){return Pa(e).includes(n)}function Da(e){return e==="hydrogen"?La:_a}function Oa(e,n,t,o){const r=Da(e),a=Math.min(r.length-1,Math.floor(n*r.length)),i=r[a]??r[0];return o?i:/^You've\s+/i.test(i)?i.replace(/^You've\s+/i,`${t} `):`${t}: ${i}`}function xa(e,n,t,o){const r=`${e} on ${n}.`,a=`${t} written to the ledger.`,i=o?"Your depot tapped a natural fuel reservoir — sell excess propellant to pilots who land here.":`${e}'s depot tapped a natural fuel reservoir — excess propellant can be sold to pilots who land here.`;return[r,a,i].join(`
`)}function Zn(e){return e.name==="You"}function Na(e){return Zn(e)?"You Prevail":`${e.name} Prevails`}function Ha(e){return e==="You"?"You win!":`${e} wins!`}function Wa(e,n){const t=e==="You"?"You win!":`${e} wins!`,o=n==="You"?"You lose a turn and are knocked back one space":`${n} loses a turn and is knocked back one space`,r=e==="You"?"You get":`${e} gets`,a=n==="You"?"your claims":`${n}'s claims`;return`${t} ${o} · ${r} a rent free-pass on ${a}.`}function Ga(e){return Zn(e)?"You are the last rocket flying.":`${e.name} is the last rocket flying.`}function Fa(e){return Zn(e)?"You left the expedition.":`${e.name} left the expedition.`}function ja(e,n){return Zn(e)?`You lead with ${n}.`:`${e.name} leads with ${n}.`}const Ua=["You win and Han shot first.","Clean roll — the lane is yours.","Your dice behaved for once.","Gravity picked your side this round.","Claim held. Rent waived. Take a lap.","The high-stakes dice never lie. This time they love you."],Ka=["You're benched. The lane belongs to a rival.","While you're sitting here you can speed-run King's Quest 2.","The dice giveth, and the dice taketh.","Somewhere, a fuel depot just got cheaper for the winner.","Your claim slips to the other pilot. Stewardship, suspended.","Gravity has no favorites. Today it has a least favorite."],Ya=["Dead heat. Nobody gets the corner office.","Both hold the lane. Cramped, but intact.","Gravity calls it even.","A draw — no claims change hands.","Two low rollers, zero outcomes. Move along."],Va=["The dice have spoken.","A lane decided by two quick rolls.","Gravity settles it in seconds.","High stakes, low math."];function mt(e){return e[Math.floor(Math.random()*e.length)]}function qa(e,n,t){return mt(t?e==="tie"?Ya:n?Ua:Ka:Va)}const gt={earth:{id:"earth",name:"Earth",nearest:.983,furthest:1.017,average:1},mercury:{id:"mercury",name:"Mercury",nearest:.307,furthest:.467,average:.387},venus:{id:"venus",name:"Venus",nearest:.718,furthest:.728,average:.723},mars:{id:"mars",name:"Mars",nearest:1.381,furthest:1.666,average:1.524},elon:{id:"elon",name:"Elon",nearest:1.38,furthest:1.67,average:1.52},phobos:{id:"phobos",name:"Phobos",nearest:1.38,furthest:1.67,average:1.52},deimos:{id:"deimos",name:"Deimos",nearest:1.38,furthest:1.67,average:1.52},holst:{id:"holst",name:"Holst Space Station",nearest:4.95,furthest:5.46,average:5.2},daktulios:{id:"daktulios",name:"Daktulios",nearest:9,furthest:10.1,average:9.5},titan:{id:"titan",name:"Titan",nearest:9,furthest:10.1,average:9.5},enceladus:{id:"enceladus",name:"Enceladus",nearest:9,furthest:10.1,average:9.5},iapetus:{id:"iapetus",name:"Iapetus",nearest:9,furthest:10.1,average:9.5},mimas:{id:"mimas",name:"Mimas",nearest:9,furthest:10.1,average:9.5},rhea:{id:"rhea",name:"Rhea",nearest:9,furthest:10.1,average:9.5},dione:{id:"dione",name:"Dione",nearest:9,furthest:10.1,average:9.5},tethys:{id:"tethys",name:"Tethys",nearest:9,furthest:10.1,average:9.5},io:{id:"io",name:"Io",nearest:4.95,furthest:5.46,average:5.2},europa:{id:"europa",name:"Europa",nearest:4.95,furthest:5.46,average:5.2},ganymede:{id:"ganymede",name:"Ganymede",nearest:4.95,furthest:5.46,average:5.2},callisto:{id:"callisto",name:"Callisto",nearest:4.95,furthest:5.46,average:5.2},charon:{id:"charon",name:"Charon",nearest:29.7,furthest:49.3,average:39.5}},za=["nearest","furthest","average"];function cr(e){return e&&gt[e]?gt[e]:gt.earth}function Ja(e){return za[Math.floor(e*3)%3]}function Xa(e,n){return cr(e)[n]}function Qa(e){const n=Math.max(2,Math.floor(Math.abs(e))),t=a=>{if(a<2)return!1;if(a%2===0)return a===2;for(let i=3;i*i<=a;i+=2)if(a%i===0)return!1;return!0};if(t(n))return n;let o=n-1,r=n+1;for(;o>=2||r<n+1e4;){if(o>=2&&t(o))return o;if(t(r))return r;o--,r++}return 2}function Za(...e){let n=2166136261;for(const t of e)n^=t>>>0,n=Math.imul(n,16777619);return n>>>0}function ei(e){return Math.floor(Math.abs(e)*1e9)>>>0}function ni(e,n){const t=Date.now()>>>0,o=Qa(n.fuel),r=(e.rngState*1664525+1013904223>>>0)/4294967296,a=Ja(r),i=Xa(n.ephemerisBodyId,a),s=n.ephemerisBodyId??"earth";let l=0;try{const c=globalThis.crypto;if(c?.getRandomValues){const p=new Uint32Array(1);c.getRandomValues(p),l=p[0]}}catch{}return e.rngState=Za(t,o,ei(i),s.split("").reduce((c,p)=>c+p.charCodeAt(0),0),n.fuel,e.diceTotals.length,l||t^o),e.rngState===0&&(e.rngState=1),`seed[${n.name} fuel′=${o} ${s}:${a}=${i.toFixed(6)}AU t=${t}]`}const et=[{id:"recorde",callsign:"Recorde",schoolHook:"Robert Recorde — invented the equals sign (=) in 1557."},{id:"k127",callsign:"K-127",schoolHook:"Khmer stele (Sambor) — early dated zero in a decimal place-value system (683 CE)."},{id:"turing",callsign:"Turing",schoolHook:"Helped invent computer science; broke codes in World War II."},{id:"ada",callsign:"Ada",schoolHook:"Ada Lovelace — often called the first computer programmer."},{id:"sagan",callsign:"Sagan",schoolHook:"Astronomer who brought Cosmos to millions of living rooms."},{id:"asimov",callsign:"Asimov",schoolHook:"Science-fiction giant — robots, Foundation, and laws of robotics."},{id:"clarke",callsign:"Clarke",schoolHook:"2001: A Space Odyssey; also predicted geostationary satellites."},{id:"goddard",callsign:"Goddard",schoolHook:"American pioneer of liquid-fuel rockets (ideas, not a flight crew)."},{id:"von-braun",callsign:"von Braun",schoolHook:"Heavy-lift rocketry that made crewed lunar flight possible (complex legacy)."}],ko=et.map(e=>e.callsign);function ti(e){return et.find(n=>n.callsign===e)}function vo(e,n){const t=Math.max(0,Math.min(e,ko.length)),o=[...ko];let r=n>>>0||1;for(let a=o.length-1;a>0;a--){r=Math.imul(r,1664525)+1013904223>>>0;const i=r%(a+1);[o[a],o[i]]=[o[i],o[a]]}return o.slice(0,t)}function ur(e,n="Venture"){const t=e.replace(/\s+/g," ").trim().slice(0,24);return!t||!/[\p{L}\p{N}]/u.test(t)?n:t}function wo(e){const n=e.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu,"");if(n.length<2)return!1;for(let t=0,o=n.length-1;t<o;t++,o--)if(n[t]!==n[o])return!1;return!0}const oi=[36329644e3,36384478531,36545741047,36805093375,37149119079,37560018051,38016528044,38495025444,38970748299,39419078277,39816815190,40143378099,40381870817,40519956645,40550497058,40471921275,40288307577,40009172164,39648976487,39226378552,38763266965,38283627728,37812302437,37373702201,36990543838,36682673788,36466040630,36351869399,36346080450,36448982944,36655258840,36954238222,37330451685,37764431209,38233718046,38714025440,39180495980,39608988508,39977327938,40266453287,40461404493,40552096909,40533843409,40407597032,40179901649,39862553171,39471988856,39028436325,38554866346,38075803604,37616057014,37199435335,36847514542,36578520813,36406386927,36340030942,36382894493,36532764610,36781888289,37117373868,37521858453,37974406811,38451595225,38928724162,39381097013,39785298664,40120407733,40369079695,40518444838,40560774542,40493881400,40321232461,40051769739,39699447265,39282508669,38822542678,38343365438,37869787511,37426329399,37035952079,36718868282,36491496044,36365608725,36347725480,36438773757,36634041276,36923419994,37291929411,37720492134,38186921537,38667070401,39136081047,39569672255,39945396337,40243801290,40449437852,40551659335,40545172818,40430313170,40213025716,39904558434,39520879636,39081851264,38610200607,38130343679,37667121166,37244512385,36884393846,36605406668,36421991506,36343640935,36374408009,36512696428,36751343180,37077989386,37475720134,37923940195,38399440264,38877598543,39333655450,39743995462,40087369720,40345996123,40506479928,40560507223,40505275348,40343637996,40083957475,39739671779,39328598887,38872014304,38393549592,37917968940,37469887079,37072494950,36746359075,36508356796,36370802521,36340810183,36419924946,36604043216,36883625084,37244188233,37667057704,38130332729,38610020575,39081278676,39519700777,39902580485,40210086811,40426290855,40539990470,40545290216,40441906577,40235182647,39935811506,39559282630,39125079982,38655673298,38175354802,37708981563,37280688610,36912639433,36623878544,36429345523,36339101574,36357808644,36484488073,36712571261,37030239739,37421037031,37864720631,38338309994,38817276271,39276812212,39693116472,40044625847,40313131634,40484722329,40550503844,40507059977,40356629267,40106989116,39771053136,39366202598,38913386585,38436037424,37958857569,37506540718,37102493389,36767623132,36519256121,36370240150,36328279494,36395536042,36568517386,36838257622,37190781536,37607828124,38067795993,38546861699,39020213127,39463334053,39853273386,40169833383,40396615322,40521868487,40539098524,40447403667,40251521424,39961583316,39592590354,39163636417,38696919737,38216593667,37747516231,37313963187,36938371239,36640176462,36434808066,36332889608,36339688997,36454845770,36672389754,36981050156,37364839070,37803879193,38275432911,38755079457,39217979211,39640159689,39999756634,40278145965,40460907970,40538573844,40507115901,40368156096,40128882057,39801674972,39403468598,38954872580,38479105457,38000792611,37544691373,37134409301,36791181988,36532773660,36372557502,36318823309,36374348311,36536253393,36796152157,37140585093,37551716403,38008257385,38486568584,38961883642,39409591487,39806510487,40132088600,40369467380,40506354767,40535661468,40455867973,40271103234,39990930893,39629854165,39206564986,38742976300,38263087601,37791742435,37353342224,36970582961,36663280209,36447343219,36333951285,36328974978,36432672213,36639674901,36939266859,37315938607,37750190311,38219541320,38699694023,39165791770,39593705738,39961284114,40249498925,40443431146,40533043080,40513698018,40386400295,40157743286,39839568062,39448350355,39004347590,38530550121,38051490989,37591975810,37175798547,36824509666,36556300429,36385061112,36319661875,36363493546,36514292070,36764255719,37100448998,37505472333,37958362874,38435679764,38912717711,39364786012,39768486827,40102926516,40350797333,40499273468,40540675062,40472865795,40299363493,40029157993,39676245733,39258905128,38798750268,38319611924,37846303794,37403337852,37013655332,36697439020,36471068362,36346271471,36329517943,36421683918,36618006711,36908331388,37277636494,37706811738,38173647350,38653983921,39122963159,39556314843,39931613321,40229438518,40434381337,40535841413,40528575897,40412970893,40195021461,39886021239,39501977756,39062783695,38591187014,38111613250,37648900970,37227015840,36867809879,36589890152,36407655448,36330550829,36362578648,36502091330,36741876675,37069531233,37468102451,37916966328];function ri(e){const n=Math.min(365,Math.max(1,Math.floor(e)));return oi[n-1]}function ai(e=new Date){const n=Date.UTC(e.getFullYear(),0,0),t=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),o=Math.round((t-n)/864e5);return ri(o)}function Ne(e){return e.config.aiDifficulty==="easy"}const ii=5,si=.5,en=300,ft=4,bt=250,$n=1,nn=350,li=60,di=.5,ci=30,ui=50,$o=2,En=200,hi=5,pi=.3,mi=.1;function gi(e){const n=e.trim();return n.length>=3?n.charCodeAt(2):n.length>=1?n.charCodeAt(0):67}function fi(e){const n=e.players.find(o=>o.agent==="human"&&!o.eliminated);return n?n.name:(e.players.find(o=>!o.eliminated)??e.players[0])?.name??"Venture"}function sn(e,n=new Date,t=0){const o=gi(fi(e)),r=ai(n);let i=Math.imul(o|0,r%2147483647|0)+Math.imul(e.round|0,9973)+Math.imul(e.gameTurn|0,131)+Math.imul(t|0,7919)+(e.rngState|0)|0;i=(Math.imul(i^i>>>16,2246822507)|0)^e.round,i=Math.imul(i^i>>>13,3266489909)|0,i=(i^i>>>16)>>>0,i===0&&(i=1);let s=i|0;return s=Math.imul(s,1664525)+1013904223|0,(s>>>0)/4294967296}function bi(e){const n=Math.min(1,Math.max(0,e));return n+(1-n)/2}const yi=["monolith","mms_free_break","kings_quest","harlock_fuel","asteroid_depot","ledger_dividend","comet_free_leave","rent_holiday","rogue_tesla","olbers_station","karen_skip","blockchain_steal","strongbad_email","disney_royalties","tuesday_boy","error_47"];function K(e){return e.players.filter(n=>!n.eliminated)}function fn(e,n,t=0){if(n<=0)return 0;const o=(sn(e)+t*.6180339887)%1;return Math.min(n-1,Math.floor(o*n))}function ki(e,n){if(pe(n))return!1;const t=e.board.nodes[n]?.group;return t==="jupiter"||t==="saturn"}function hr(e){const n=[];for(const[t,o]of Object.entries(e.owners)){if(!o||!ki(e,t))continue;const r=e.board.nodes[t];if(!r||r.kind!=="planet"&&r.kind!=="moon"||r.price==null)continue;const a=e.players.find(i=>i.id===o&&!i.eliminated);a&&(Ne(e)&&a.agent==="human"||n.push(t))}return n}function vi(e,n){delete e.owners[n],e.stations[n]&&delete e.stations[n];for(const t of e.players)t.properties.includes(n)&&(t.properties=t.properties.filter(o=>o!==n),gn(t,n),t.ephemerisBodyId===n&&(t.ephemerisBodyId=t.properties[0]??null))}function wi(e){const n=e.players.find(t=>t.agent==="human"&&!t.eliminated);return n||(K(e)[0]??null)}function Ue(e){const n=K(e);return n.length===0?null:n[fn(e,n.length,3)]}function pr(e){let n=K(e);return Ne(e)&&(n=n.filter(t=>t.agent==="ai")),n.length===0?null:n[fn(e,n.length)]}function Ee(e,n,t){return e.agent==="human"?n:t}function He(e,n){return Object.entries(e.owners).filter(([t,o])=>{if(!o||o===n)return!1;const r=e.players.find(i=>i.id===o&&!i.eliminated);if(!r||Ne(e)&&r.agent==="human")return!1;const a=e.board.nodes[t];return!!a&&a.price!=null}).map(([t])=>t)}function mr(e){const n=new Set(e.timedEvent.firedIds??[]);return yi.filter(t=>!(n.has(t)||t==="karen_skip"&&(e.round<ci||Ne(e)&&!K(e).some(o=>o.agent==="ai"))||t==="rogue_tesla"&&hr(e).length===0||(t==="disney_royalties"||t==="error_47")&&Ne(e)&&!K(e).some(o=>o.agent==="ai")||t==="blockchain_steal"&&!K(e).some(r=>He(e,r.id).length>0)))}function $i(e){const n=mr(e);if(n.length===0)return null;const t=sn(e),o=Math.min(n.length-1,Math.floor(t*n.length));return n[o]}function Ei(e){const n=K(e);for(const t of n)t.monolithEarthPending=!0;e.pendingAnnouncement={kind:"info",title:"Monolith on Earth's Moon",body:["A black slab has been catalogued on the lunar farside.",`Every active rocket: one-time ${g(en)} on your next Earth land or pass.`,`(${n.length} rocket(s) marked.)`].join(`
`)},e.log.push(`Ledger event: Monolith — next Earth visit pays +${g(en)} once per rocket.`)}function Si(e){const n=Ue(e);n&&(n.freeBreakPending=!0,e.pendingAnnouncement={kind:"info",title:"Blue and brown M&Ms are back",body:[Ee(n,"You brought back the blue and brown M&Ms.",`${n.name} brought back the blue and brown M&Ms.`),"One free brake on their next turn (break ≥1 space costs 0 fuel once; unused expires at end of that seat)."].join(`
`)},e.log.push(`Ledger event: blue & brown M&Ms — ${n.name} gets one free brake.`))}function Ci(e){const n=Ue(e);n&&(n.warpCharges+=1,e.pendingAnnouncement={kind:"info",title:"King's Quest speed-run record",body:[Ee(n,"You kill time on an old terminal and set a King's Quest record.",`${n.name} kills time on an old terminal and sets a King's Quest record.`),"One warp: instead of rolling, click any beacon. No stops on the way; landing rules still apply where you arrive."].join(`
`)},e.log.push(`Ledger event: King's Quest — ${n.name} gets one warp charge.`))}function Ii(e){const n=Ue(e);n&&(n.warpCharges+=1,e.pendingAnnouncement={kind:"info",title:"Strong Bad answers your email",body:[Ee(n,"You emailed Strong Bad from a deep-space relay. He typed one word and hit send.",`${n.name} emailed Strong Bad from a deep-space relay. He typed one word and hit send.`),"WARP.","One warp: click any beacon instead of rolling. No stops on the way; landing rules still apply where you arrive."].join(`
`)},e.log.push(`Ledger event: Strong Bad Email — WARP — ${n.name} gets one warp charge.`))}function Mi(e){const n=e.config.maxFuel,t=K(e);for(const o of t){const r=o.fuel;o.fuel=Math.min(n,o.fuel+ft),o.fuel-r}e.pendingAnnouncement={kind:"info",title:"Arcadia on the Mainline",body:["Captain Harlock salutes orbital economics — the Arcadia dumps spare tanks for every rocket.",`Every active rocket: +${ft} fuel (capped at tank max ${n}).`,`(${t.length} rocket(s) topped.)`].join(`
`)},e.log.push(`Ledger event: Captain Harlock / Arcadia — +${ft} fuel per active rocket.`)}function Ti(e){const n=Ue(e);n&&(n.stationsInHand+=$n,e.pendingAnnouncement={kind:"info",title:"Belt ice survey",body:["A survey drone marks a rich carbonaceous rock.",Ee(n,`You take +${$n} fuel depot in hand.`,`${n.name} takes +${$n} fuel depot in hand.`)].join(`
`)},e.log.push(`Ledger event: belt ice survey — ${n.name} +${$n} depot in hand.`))}function Ri(e){const n=K(e);for(const t of n)t.cash+=bt;e.pendingAnnouncement={kind:"info",title:"Quantum ledger dividend",body:["The Automated Interplanetary Asset Ledger pays a rare universal dividend.",`Every active rocket: +${g(bt)} now.`,`(${n.length} wallet(s) credited.)`].join(`
`)},e.log.push(`Ledger event: AIL dividend — +${g(bt)} per active rocket.`)}function Ai(e){const n=K(e);for(const t of n)t.freeLeavePending=!0;e.pendingAnnouncement={kind:"info",title:"Comet dust trail",body:["A dirty snowball sheds a trail across the Mainline — outbound burns ride the stream for free once.","Every active rocket: next leave from a gravity well costs 0 fuel (then clears).",`(${n.length} rocket(s) marked.)`].join(`
`)},e.log.push("Ledger event: comet dust — one free leave burn per active rocket.")}function Li(e){const n=K(e);for(const t of n)t.nextRentWaived=!0;e.pendingAnnouncement={kind:"info",title:"Port authority holiday",body:["Station councils declare a one-claim rent holiday under the free-port compact.","Every active rocket: next rent you would pay is waived (once), then normal rates resume.",`(${n.length} rocket(s) stamped.)`].join(`
`)},e.log.push("Ledger event: port holiday — next rent payment waived once per active rocket.")}function _i(e){const n=hr(e);if(n.length===0)return;const t=n[fn(e,n.length,1)],o=e.board.nodes[t],r=e.owners[t],a=e.players.find(s=>s.id===r),i=!!e.stations[t];vi(e,t),e.pendingAnnouncement={kind:"info",title:"Rogue Tesla Roadster",body:[`A Tesla Roadster fell out of a long orbit and hit ${o.name}.`,`${a.name} loses the claim${i?" — and the fuel depot with it":""}.`].join(`
`)},e.log.push(`Ledger event: rogue Tesla Roadster destroyed ${a.name}'s claim on ${o.name}${i?" (depot lost)":""}.`)}function Pi(e){const n=Ue(e);n&&(e.pendingCharterChoice={kind:"olbers_station",chooserId:n.id},e.pendingAnnouncement={kind:"info",title:"Olbers' paradox, Netflix optional",body:["During a streaming outage you accidentally prove Olbers' paradox with a napkin and a star map.",`Award: warp to any station hub (Elon · Holst · Daktulios — not Earth) and collect ${g(nn)}.`,n.agent==="human"?"Dismiss this, then click a station hub on the board.":`${n.name} will chart a hub.`].join(`
`)},e.log.push(`Ledger event: Olbers award — ${n.name} may warp to a station hub for ${g(nn)}.`))}function Bi(e){let n=K(e);if(Ne(e)&&(n=n.filter(o=>o.agent==="ai")),n.length===0)return;const t=n[fn(e,n.length)];t.skipTurns+=1,e.pendingAnnouncement={kind:"info",title:"Karen in the comments",body:["Someone named Karen left a novel-length social-media essay under your last telemetry selfie.",`${t.name} misses a critical ship maneuver — lose one full seat turn.`].join(`
`)},e.log.push(`Ledger event: Karen distraction — ${t.name} will skip a turn.`)}function Di(e){const n=K(e).filter(o=>He(e,o.id).length>0);if(n.length===0)return;const t=n[fn(e,n.length,5)];He(e,t.id).length!==0&&(e.pendingCharterChoice={kind:"blockchain_steal",chooserId:t.id},e.pendingAnnouncement={kind:"info",title:"Invalid claim on the ledger",body:["You read the AIL chain and prove an opponent's deed hash never finalised.","The ledger reassigns the body to you — with a fuel depot already bolted down.",t.agent==="human"?"Dismiss this, then click an opponent's claim on the board.":`${t.name} will reassign a deed.`].join(`
`)},e.log.push(`Ledger event: blockchain reassignment — ${t.name} steals one opponent claim + depot.`))}function Oi(e){const n=pr(e);if(!n)return;const t=Math.min(ui,Math.max(0,n.cash));n.cash-=t,n.skipTurns+=1,e.pendingAnnouncement={kind:"info",title:"Hot microphone",body:[Ee(n,"You sing a Disney song. The mic was live.",`${n.name} sings a Disney song. The mic was live.`),`Royalties ${g(t)}. Miss the next seat turn.`].join(`
`)},e.log.push(`Ledger event: hot microphone — ${n.name} pays ${g(t)} and skips a turn.`)}function xi(e){const n=Ue(e);if(!n)return;const t=n.parkCount;n.parkCount=Math.max(0,n.parkCount-1),e.pendingAnnouncement={kind:"info",title:"The Tuesday boy paradox",body:[Ee(n,"You prove the Tuesday boy paradox is 13/27.",`${n.name} proves the Tuesday boy paradox is 13/27.`),t>0?"Park count −1. Feral is one park further away.":"Park count is already 0. The proof still stands."].join(`
`)},e.log.push(`Ledger event: Tuesday boy — ${n.name} park count ${t} → ${n.parkCount}.`)}function Ni(e){const n=pr(e);if(!n)return;const t=Math.min($o,n.fuel);n.fuel=Math.max(0,n.fuel-$o),e.pendingAnnouncement={kind:"info",title:"Error 47: not an object",body:["The terminal prints Error 47: not an object.",Ee(n,`You dump ${t} fuel.`,`${n.name} dumps ${t} fuel.`)].join(`
`)},e.log.push(`Ledger event: Error 47 — ${n.name} loses ${t} fuel.`)}function Hi(e,n){n.cash+=En,e.pendingAnnouncement={kind:"info",title:"Kostka",body:[Ee(n,`On Earth, you adopt a dog named Kostka. +${g(En)}.`,`On Earth, ${n.name} adopts a dog named Kostka. +${g(En)}.`)].join(`
`)},e.log.push(`Ledger event: Kostka — ${n.name} +${g(En)} (Earth).`),e.timedEvent.firedIds.includes("kostka_dog")||e.timedEvent.firedIds.push("kostka_dog"),e.timedEvent.lastEventId="kostka_dog"}function Wi(e,n,t){const o=e.timedEvent;o.earthTransits=(o.earthTransits??0)+1,t==="land"&&Gi(e,n)}function Gi(e,n){const t=e.timedEvent;if((t.firedIds??[]).includes("kostka_dog")||(t.earthTransits??0)<=hi||n.eliminated||e.pendingAnnouncement)return;if((!t.kostkaChance||t.kostkaChance<=0)&&(t.kostkaChance=pi),sn(e,new Date,17+(t.earthTransits??0))>=t.kostkaChance){t.kostkaChance=Math.min(1,t.kostkaChance+mi);return}Hi(e,n)}function Fi(e){const n=wi(e);if(!n)return;const t=K(e).filter(r=>r.id!==n.id&&r.agent==="ai");(t.length>0?t:K(e).filter(r=>r.id!==n.id)).length!==0&&(e.pendingCharterChoice={kind:"vibe_kick",chooserId:n.id},e.pendingAnnouncement={kind:"info",title:"You vibe-coded the rules",body:["You shipped a video game about monopoly in space. Congrats — you write the patch notes now.","Kick one rival rocket off the ledger.",n.agent==="human"?"Dismiss this, then click an AI rocket in standings.":`${n.name} will uninvite a rival.`].join(`
`)},e.log.push(`Ledger event: vibe-code authority — ${n.name} may eliminate one rival.`),e.timedEvent.firedIds.includes("vibe_kick")||e.timedEvent.firedIds.push("vibe_kick"),e.timedEvent.lastEventId="vibe_kick")}function ji(e,n){switch(n){case"monolith":Ei(e);break;case"mms_free_break":Si(e);break;case"kings_quest":Ci(e);break;case"strongbad_email":Ii(e);break;case"harlock_fuel":Mi(e);break;case"asteroid_depot":Ti(e);break;case"ledger_dividend":Ri(e);break;case"comet_free_leave":Ai(e);break;case"rent_holiday":Li(e);break;case"rogue_tesla":_i(e);break;case"olbers_station":Pi(e);break;case"karen_skip":Bi(e);break;case"blockchain_steal":Di(e);break;case"disney_royalties":Oi(e);break;case"tuesday_boy":xi(e);break;case"error_47":Ni(e);break}e.timedEvent.lastEventId=n,e.timedEvent.firedIds||(e.timedEvent.firedIds=[]),e.timedEvent.firedIds.includes(n)||e.timedEvent.firedIds.push(n)}function Ui(e){const n=e.timedEvent;if(n.vibeKickChecked===void 0&&(n.vibeKickChecked=!1),n.lastProcessedRound===e.round||(n.lastProcessedRound=e.round,n.roundsSinceLast+=1,e.pendingAnnouncement||e.pendingCharterChoice))return;if(!n.vibeKickChecked&&e.round>=li&&!(n.firedIds??[]).includes("vibe_kick")){if(n.vibeKickChecked=!0,sn(e)<di){Fi(e),n.roundsSinceLast=0,n.rollChance=0;return}e.log.push(`Ledger note: vibe-code authority did not unlock (round ${e.round}, 50% miss).`)}if(mr(e).length===0||n.roundsSinceLast<ii)return;if(n.rollChance<=0&&(n.rollChance=si),sn(e)>=n.rollChance){n.rollChance=bi(n.rollChance);return}const o=$i(e);o&&(ji(e,o),n.roundsSinceLast=0,n.rollChance=0)}function Ki(){return ke}function gr(e){return pe(e)}function fr(e){e.gameTurn+=1,Ui(e)}function bn(e){return e==="easy"||e==="normal"||e==="hard"||e==="expert"?e:e==="difficult"?"hard":"normal"}const Eo=["#6ec8ff","#ffc857","#5ddea0","#ff6b7a","#c792ea","#ff9f43"],Yi={playerCount:4,humanSeat:!0,humanName:"Venture",humanPropellant:"methane",aiDifficulty:"normal",startingCash:1500,startingFuel:20,stationsEach:3,maxFuel:25,maxRounds:0};function So(e,n){return(n+e*17&1)===0?"methane":"hydrogen"}function qt(e={}){const n={...Yi,...e},t=Math.min(6,Math.max(2,n.playerCount));n.playerCount=t;const o=tr(),r=n.seed??Date.now()>>>0,a=[],i=ur(n.humanName??"","Venture"),s=n.humanSeat&&/^heliopolis$/i.test(i.trim()),l=s?n.startingCash*4:n.startingCash,c=n.humanSeat?t-1:t,p=vo(c,r);let m=0;for(let u=0;u<t;u++){const f=n.humanSeat&&u===0,S=f?n.humanPropellant:So(u,r),A=f?i:p[m++]??`Pilot ${u+1}`;a.push({id:`p${u}`,name:A,color:Eo[u%Eo.length],agent:f?"human":"ai",cash:f?l:n.startingCash,fuel:n.startingFuel,position:o.startId,propellant:S,properties:[],claimBooks:{},landingRights:{},auctionedThisTurn:[],stationsInHand:n.stationsEach,eliminated:!1,eliminatedOnTurn:null,eliminatedOnRound:null,eliminatedReason:null,skipTurns:0,rentWaiversAgainst:[],ephemerisBodyId:null,circuitActive:!1,circuitsCompleted:0,rolledThisTurn:!1,movedThisTurn:!1,parkCount:0,pendingLeak:!1,monolithEarthPending:!1,freeBreakPending:!1,warpCharges:0,freeLeavePending:!1,nextRentWaived:!1,depotsPlacedThisCircuit:0,canBidirectional:wo(A),moveDirection:"forward",directionLocked:!1})}if(!n.humanSeat){m=0;const u=vo(t,r^40503);for(let f=0;f<a.length;f++)a[f].name=u[f]??`Pilot ${f+1}`,a[f].agent="ai",a[f].propellant=So(f,r),a[f].canBidirectional=wo(a[f].name)}const h=a.map(u=>`${u.name}:${de[u.propellant].short}`).join(" · "),E={board:o,players:a,owners:{},stations:{},currentPlayerIndex:0,phase:"await_action",round:1,gameTurn:0,lastRoll:null,breakSpaces:0,log:["Heliopoly · Orbital Economics",`Game start: ${t} pilots · bank ${g(n.startingCash)} each`,`Propellants: ${h}`,"Path: Earth→Venus→Mercury→Mars→Belt→Jupiter→Saturn→Earth","Monopoly rent ×2 · park 5+ no-move → feral risk (50% then half-gap toward 100%) · depots lost on feral/out","Earth: land ⍼400 / pass ⍼200 (+⍼10 per your rotations) · ⍼1000 at rotation 10/20/30…"],turnDeltas:[],diceTotals:[],pendingDuel:null,lastDuelResult:null,encounterMem:{},boardRotations:0,winnerId:null,endReason:null,gusherPaid:{},pendingAnnouncement:null,pendingCharterChoice:null,pendingAuction:null,timedEvent:{roundsSinceLast:0,lastProcessedRound:0,rollChance:0,lastEventId:null,firedIds:[],vibeKickChecked:!1,earthTransits:0,kostkaChance:0},config:{...n,seed:r,aiDifficulty:bn(n.aiDifficulty)},rngState:r||1};typeof console<"u"&&console.debug&&console.debug(`[heliopoly] seed ${r} · AI ${E.config.aiDifficulty}${n.humanSeat?` · human ${de[n.humanPropellant].short}`:" · self-play"}`),fr(E);const b=E.players[0];return E.log.push(`— Turn ${E.gameTurn} · Round ${E.round}: ${b.name}'s turn —`),s&&E.log.push(`Genesis injection: callsign Heliopolis — AIL seed funding ×4 (${g(l)}).`),E}function We(e){return e.players.filter(n=>!n.eliminated)}function O(e){return e.players[e.currentPlayerIndex]}function nt(e){return{...e,board:e.board,players:e.players.map(n=>({...n,properties:[...n.properties],rentWaiversAgainst:[...n.rentWaiversAgainst],claimBooks:Object.fromEntries(Object.entries(n.claimBooks??{}).map(([t,o])=>[t,{...o}])),landingRights:{...n.landingRights??{}},auctionedThisTurn:[...n.auctionedThisTurn??[]]})),owners:{...e.owners},stations:{...e.stations},lastRoll:e.lastRoll?{...e.lastRoll}:null,log:[...e.log],turnDeltas:[...e.turnDeltas],diceTotals:[...e.diceTotals],pendingDuel:e.pendingDuel?{...e.pendingDuel,challengerRoll:e.pendingDuel.challengerRoll?{...e.pendingDuel.challengerRoll}:null,defenderRoll:e.pendingDuel.defenderRoll?{...e.pendingDuel.defenderRoll}:null}:null,lastDuelResult:e.lastDuelResult?{...e.lastDuelResult,challengerRoll:{...e.lastDuelResult.challengerRoll},defenderRoll:{...e.lastDuelResult.defenderRoll}}:null,encounterMem:{...e.encounterMem},gusherPaid:{...e.gusherPaid},pendingAnnouncement:e.pendingAnnouncement?{...e.pendingAnnouncement}:null,pendingCharterChoice:e.pendingCharterChoice?{...e.pendingCharterChoice}:null,pendingAuction:e.pendingAuction?{...e.pendingAuction,bids:{...e.pendingAuction.bids}}:null,timedEvent:{...e.timedEvent,firedIds:[...e.timedEvent.firedIds??[]]},config:{...e.config},propertyLedger:e.propertyLedger?Object.fromEntries(Object.entries(e.propertyLedger).map(([n,t])=>[n,{...t}])):void 0}}const tn=5,Vi=.5;function br(e){if(e<tn)return 0;const n=e-tn;return 1-Vi**(n+1)}const Co=5e3;function w(e,n){e.log.push(n),e.log.length>Co&&e.log.splice(0,e.log.length-Co)}function L(e,n){e.turnDeltas.push(n)}function tt(e){let n=e.rngState|0;n=n+1831565813|0;let t=Math.imul(n^n>>>15,1|n);return t=t+Math.imul(t^t>>>7,61|t)^t,e.rngState=n,((t^t>>>14)>>>0)/4294967296}function Ct(e,n,t){return n+Math.floor(tt(e)*(t-n+1))}function on(e,n){const t=ni(e,n),o=Ct(e,1,6),r=Ct(e,1,6),a=o+r;return e.diceTotals.push(a),typeof console<"u"&&console.debug&&console.debug(`↺ ${t}`),{d1:o,d2:r,total:a,doubles:o===r}}function yr(e){return e.diceTotals.length===0?7:e.diceTotals.reduce((t,o)=>t+o,0)/e.diceTotals.length}function q(e,n){let t=0;for(const r of n.properties)t+=I(e.board,r).price??0;const o=n.properties.filter(r=>e.stations[r]).length;return n.cash+t+o*500+n.stationsInHand*500}function qi(e){return We(e).map(t=>({player:t,worth:q(e,t)})).sort((t,o)=>o.worth-t.worth).map((t,o)=>({...t,rank:o+1}))}function xn(e,n,t){const o=I(e.board,n),r=o.rent??0,a=le(o.group),s=!!a&&he(e.owners,t,a.id)?2:1,l=jt(e.owners,t,n),c=e.stations[n]?1.5:1;return Math.floor(r*s*l*c)}const zi=400,Ji=200,kr=10,yt=1e3;function Xi(e,n){return e+kr*Math.max(0,n)}function zt(e,n,t){const o=t==="land"?zi:Ji,r=Xi(o,n.circuitsCompleted);n.cash+=r;const a=t==="land"?"lands on":"passes";w(e,`${n.name} ${a} Earth: +${g(r)} (base ${g(o)} + ${g(kr)}×${n.circuitsCompleted} rotations).`),L(e,`+${g(r)} Earth ${t}`),n.monolithEarthPending&&(n.monolithEarthPending=!1,n.cash+=en,w(e,`${n.name} claims Monolith stipend on Earth: +${g(en)}.`),L(e,`+${g(en)} Monolith`)),Wi(e,n,t)}function Jt(e,n){e.boardRotations+=1,n.circuitActive=!1,n.circuitsCompleted+=1,w(e,`Circuit complete: ${n.name} · rotation ${n.circuitsCompleted} (board loops ${e.boardRotations}).`),n.circuitsCompleted>0&&n.circuitsCompleted%10===0&&(n.cash+=yt,w(e,`${n.name} decade ledger bonus (rotation ${n.circuitsCompleted}): +${g(yt)}.`),L(e,`+${g(yt)} decade rotation`));const t=e.config.stationsEach;n.stationsInHand+=t,n.depotsPlacedThisCircuit=0,w(e,`${n.name} resupplies at Earth: +${t} fuel depot(s) in hand (now ${n.stationsInHand}).`),L(e,`+${t} fuel depots (Earth resupply)`)}const Qi=.1;function ln(e,n){return e<=0?0:Math.floor(Math.max(0,n??0)*Qi)}function Zi(e){return Math.max(0,e)*.5}function De(e,n){return n<=0||e?0:Zi(n)}function Xt(e,n){const t=e.owners[n];if(t){const o=e.players.find(r=>r.id===t);o&&gn(o,n)}delete e.owners[n],e.stations[n]&&delete e.stations[n]}function vr(e,n){if(n.eliminated)return;n.parkCount+=1;const t=n.parkCount,o=br(t);if(w(e,`${n.name} parks (no move) · park count ${t}${o>0?` · feral risk ${Math.round(o*100)}% per claim`:""}.`),L(e,`${n.name} park #${t}`),!(o<=0||n.properties.length===0))for(const r of[...n.properties]){if(tt(e)>=o){const i=I(e.board,r);w(e,`${i.name} stays held (${n.name} park #${t}, ${Math.round(o*100)}% resisted).`);continue}const a=I(e.board,r);n.properties=n.properties.filter(i=>i!==r),Xt(e,r),w(e,`${a.name} goes FERAL — ${n.name} park #${t} (${Math.round(o*100)}%). Depot lost if any.`),L(e,`feral: ${a.name}`),n.ephemerisBodyId===r&&(n.ephemerisBodyId=n.properties[0]??null)}}function Nn(e,n,t){if(!n.eliminated){n.eliminated=!0,n.eliminatedOnTurn=e.gameTurn,n.eliminatedOnRound=e.round,n.eliminatedReason=t,w(e,`${n.name} eliminated (round ${e.round}, turn ${e.gameTurn}): ${t}`),L(e,`OUT ${n.name}: ${t}`),e.pendingAnnouncement={kind:"out",title:"OUT!",body:`${n.name} is off the ledger.
${t}
Round ${e.round}.`};for(const o of[...n.properties])Xt(e,o);n.properties=[],n.cash=0,n.ephemerisBodyId=null,es(e),e.phase!=="game_over"&&e.players[e.currentPlayerIndex]?.id===n.id&&Hn(e)}}function es(e){const n=We(e);if(n.length===1){e.winnerId=n[0].id,e.phase="game_over",e.endReason=Ga(n[0]),w(e,`Winner: ${n[0].name}`);return}n.length===0&&(e.phase="game_over",e.endReason="No survivors among the stars.",w(e,"No survivors."))}function ns(e){if(e.config.maxRounds<=0||e.round<=e.config.maxRounds)return!1;const n=We(e);if(n.length===0)return!1;n.sort((o,r)=>q(e,r)-q(e,o)),e.winnerId=n[0].id,e.phase="game_over";const t=ja(n[0],g(q(e,n[0])));return e.endReason=`The ledger closed (round ${e.config.maxRounds}). ${t}`,w(e,`Round limit: ${n[0].name} wins on net worth (${g(q(e,n[0]))}).`),!0}function Hn(e){if(e.phase==="game_over")return;const n=e.players[e.currentPlayerIndex];n?.freeBreakPending&&(n.freeBreakPending=!1);const t=e.players.length;let o=e.currentPlayerIndex,r=0;do o=(o+1)%t,o===0&&(e.round+=1),r++;while(e.players[o].eliminated&&r<=t+1);if(e.currentPlayerIndex=o,e.phase="await_action",e.lastRoll=null,e.breakSpaces=0,e.pendingDuel=null,ns(e))return;fr(e);const a=O(e);if(a.skipTurns>0){a.skipTurns-=1,a.movedThisTurn=!1,w(e,`— Turn ${e.gameTurn} · Round ${e.round}: ${a.name} skips (Gravity Duel forfeit) —`),L(e,`${a.name}: skipped turn`),e.turnDeltas=[`${a.name}: skipped turn (duel loss)`],vr(e,a),Gn(e),Hn(e);return}a.rolledThisTurn=!1,a.movedThisTurn=!1,a.auctionedThisTurn=[],e.turnDeltas=[],w(e,`— Turn ${e.gameTurn} · Round ${e.round}: ${a.name}'s turn —`),Gn(e)}function Qt(e){const n=O(e);if(n.eliminated||e.phase==="game_over"||e.phase==="await_duel")return{allowed:!1,max:0,costPer:0};const t=I(e.board,n.position),o=e.config.maxFuel-n.fuel;if(o<=0)return{allowed:!1,max:0,costPer:0};if(t.refuel==="free"||t.id==="earth")return{allowed:!0,max:o,costPer:0};if(t.refuel==="paid"){const r=e.owners[t.id];if(r&&r!==n.id){const l=Math.floor(n.cash/50);return{allowed:l>0,max:Math.min(o,l),costPer:50}}const a=25,i=Math.floor(n.cash/a);return{allowed:i>0||r===n.id,max:r===n.id?o:Math.min(o,i),costPer:r===n.id?0:a}}if(t.refuel==="station"){const r=e.owners[t.id],a=!!e.stations[t.id];if(r===n.id&&a)return{allowed:!0,max:o,costPer:0};if(r&&r!==n.id&&a){const s=Math.floor(n.cash/40);return{allowed:s>0,max:Math.min(o,s),costPer:40}}}return{allowed:!1,max:0,costPer:0}}function ts(e,n,t){if(n.eliminated)return[];const o=t?n.properties:n.properties.filter(a=>a===n.position),r=[];for(const a of o){if(e.owners[a]!==n.id)continue;const i=I(e.board,a);if(!H(i))continue;const s=pn(i.price);s>0&&r.push({nodeId:a,value:s})}return r}function te(e){const n={refuel:!1,refuelMax:0,refuelCostPer:0,roll:!1,move:!1,maxBreak:0,breakSpaces:0,breakFuelCost:0,buy:!1,buyPrice:0,sell:!1,sellNodeId:null,sellValue:0,sellClaims:[],canAuction:!1,placeStation:!1,placeStationCost:0,endTurn:!1,leaveBurnPreview:0,duelStance:!1,duelRoll:!1,warp:!1,setDirection:!1,moveDirection:"forward",directionLocked:!0,canBidirectional:!1};if(e.pendingCharterChoice||e.pendingAuction||e.phase==="game_over")return n;const t=O(e);if(t.eliminated)return n;if(e.phase==="await_duel"&&e.pendingDuel){const y=e.pendingDuel,v=t.id===y.challengerId,C=t.id===y.defenderId;let R=!1,T=!1;return v&&(R=y.challengerStance===null,T=y.challengerStance!==null&&y.defenderStance!==null&&y.challengerRoll===null),C&&(R=y.defenderStance===null,T=y.challengerStance!==null&&y.defenderStance!==null&&y.defenderRoll===null),{...n,duelStance:R,duelRoll:T}}const o=Qt(e),r=I(e.board,t.position),i=e.owners[r.id]===t.id&&(r.kind==="planet"||r.kind==="moon")&&!e.stations[r.id]&&t.stationsInHand>0,s=i?ln(t.depotsPlacedThisCircuit,r.price):0,l=i&&t.cash>=s,c=e.phase==="await_action"||e.phase==="await_post_land",p=ts(e,t,c),m=p.find(y=>y.nodeId===r.id),h=m?.value??0,E=!!m,b=new Set(t.auctionedThisTurn??[]),u=c&&p.some(y=>!b.has(y.nodeId))&&ir(e,t.id).length>0;if(e.phase==="await_move"&&e.lastRoll){const y=e.lastRoll.total,v=Math.min(Math.max(0,e.breakSpaces),y),C=e.lastRoll.total-v,R=De(t.freeBreakPending,v);let T=se(r,Math.max(1,C),t.propellant);t.freeLeavePending&&(T=0);const B=t.fuel+1e-9>=R;return{...n,refuel:!1,roll:!1,move:B,maxBreak:y,breakSpaces:v,breakFuelCost:R,leaveBurnPreview:T,sell:E,sellNodeId:E?r.id:null,sellValue:h,sellClaims:p,canAuction:!1,placeStation:l,placeStationCost:s,endTurn:!1,setDirection:t.canBidirectional&&!t.directionLocked,moveDirection:t.moveDirection,directionLocked:t.directionLocked,canBidirectional:t.canBidirectional}}const f=e.lastRoll?.total??7;let S=se(r,f,t.propellant);t.freeLeavePending&&(S=0);const x=H(r)&&!e.owners[r.id]&&t.cash>=(r.price??0),$=r.price??0;return e.phase==="await_action"?{refuel:o.allowed&&o.max>0,refuelMax:o.max,refuelCostPer:o.costPer,roll:!0,move:!1,maxBreak:0,breakSpaces:0,breakFuelCost:0,buy:x,buyPrice:$,sell:E,sellNodeId:E?r.id:null,sellValue:h,sellClaims:p,canAuction:u,placeStation:l,placeStationCost:s,endTurn:!0,leaveBurnPreview:S,duelStance:!1,duelRoll:!1,warp:t.warpCharges>0,setDirection:t.canBidirectional&&!t.directionLocked,moveDirection:t.moveDirection,directionLocked:t.directionLocked,canBidirectional:t.canBidirectional}:{refuel:o.allowed&&o.max>0,refuelMax:o.max,refuelCostPer:o.costPer,roll:!1,move:!1,maxBreak:0,breakSpaces:0,breakFuelCost:0,buy:x,buyPrice:$,sell:E,sellNodeId:E?r.id:null,sellValue:h,sellClaims:p,canAuction:u,placeStation:l,placeStationCost:s,endTurn:!0,leaveBurnPreview:S,duelStance:!1,duelRoll:!1,warp:!1,setDirection:!1,moveDirection:t.moveDirection,directionLocked:t.directionLocked,canBidirectional:t.canBidirectional}}function wr(e,n,t,o){const r=de[n.propellant];if(r.leaveRisk<=0)return;let a=n.pendingLeak;if(!a){if(tt(e)>r.leaveRisk)return;a=!0}if(!o){n.pendingLeak=!0;return}n.pendingLeak=!1;const i=n.propellant==="hydrogen"?Math.max(1,Math.floor(n.fuel/2)):Math.min(n.fuel,Ct(e,1,2));i<=0||n.fuel<=0||(n.fuel-=i,n.propellant==="hydrogen"?(n.skipTurns+=1,w(e,`${n.name} LEAK on landing ${t}: −${i} fuel (half tanks) · loses next turn to repair.`),L(e,`−${i} fuel LEAK · +1 skip repair`),e.pendingAnnouncement||(e.pendingAnnouncement={kind:"leak",title:"LEAK!",body:`${n.name}'s H₂ tanks failed landing on ${t}.
−${i} fuel (half the tanks).
Loses next turn to repair.`})):(w(e,`${n.name} propellant glitch landing on ${t}: −${i} fuel`),L(e,`−${i} fuel (${n.propellant})`)))}function os(e,n,t){return e.players.filter(o=>!o.eliminated&&o.position===n&&o.id!==t)}function rs(e,n,t){const o=os(e,n,t);if(o.length===0)return null;const r=e.encounterMem[n];if(r?.lastRollerId){const a=o.find(i=>i.id===r.lastRollerId);if(a)return a}if(r?.championId){const a=o.find(i=>i.id===r.championId);if(a)return a}return o[0]??null}function $r(e,n,t,o){e.pendingDuel={nodeId:o,challengerId:n.id,defenderId:t.id,challengerStance:null,defenderStance:null,challengerRoll:null,defenderRoll:null},e.phase="await_duel";const r=e.players.findIndex(a=>a.id===n.id);r>=0&&(e.currentPlayerIndex=r),w(e,`Gravity Duel on ${I(e.board,o).name}: ${n.name} vs ${t.name}!`),L(e,`Duel vs ${t.name}`)}function as(e,n,t,o){const r=e.players.find(s=>s.id===n),a=e.players.find(s=>s.id===t);if(!r||!a||r.eliminated||a.eliminated)throw new Error("forceGravityDuel: need two living pilots");if(n===t)throw new Error("forceGravityDuel: challenger and defender must differ");const i=o;r.position=i,a.position=i,e.lastDuelResult=null,$r(e,r,a,i)}function Zt(e){const n=e.pendingDuel;if(!n||!n.challengerStance||!n.defenderStance||!n.challengerRoll||!n.defenderRoll)return;const t=e.players.find(m=>m.id===n.challengerId),o=e.players.find(m=>m.id===n.defenderId),r=n.challengerRoll.total,a=n.defenderRoll.total,i=yr(e);w(e,`Reveal: ${t.name} ${n.challengerStance.toUpperCase()} ${r} · ${o.name} ${n.defenderStance.toUpperCase()} ${a} · mean ${i.toFixed(2)}`);let s=null,l=null;if(n.challengerStance==="low"&&n.defenderStance==="low")r<a?(s=t,l=o):a<r&&(s=o,l=t);else if(n.challengerStance==="high"&&n.defenderStance==="high")r>a?(s=t,l=o):a>r&&(s=o,l=t);else{const m=Math.abs(r-i),h=Math.abs(a-i);m<h?(s=t,l=o):h<m&&(s=o,l=t)}const c=e.encounterMem[n.nodeId]??{lastRollerId:null,championId:null};if(c.lastRollerId=n.challengerId,!s||!l){const m="TIE — both hold the transit. No forfeit.";w(e,`Gravity Duel: ${m}`),L(e,"Duel TIE — both occupy"),c.championId=null,e.encounterMem[n.nodeId]=c,e.lastDuelResult={nodeName:I(e.board,n.nodeId).name,challengerName:t.name,defenderName:o.name,challengerStance:n.challengerStance,defenderStance:n.defenderStance,challengerRoll:n.challengerRoll,defenderRoll:n.defenderRoll,mean:i,outcome:"tie",winnerName:null,loserName:null,summary:m},e.pendingDuel=null,e.phase="await_post_land";return}c.championId=s.id,e.encounterMem[n.nodeId]=c,l.skipTurns+=1,s.rentWaiversAgainst.includes(l.id)||s.rentWaiversAgainst.push(l.id),is(e,l);const p=Wa(s.name,l.name);w(e,`Gravity Duel: ${p}`),L(e,`Duel WIN ${s.name} / ${l.name} skips + knockback + waiver`),e.lastDuelResult={nodeName:I(e.board,n.nodeId).name,challengerName:t.name,defenderName:o.name,challengerStance:n.challengerStance,defenderStance:n.defenderStance,challengerRoll:n.challengerRoll,defenderRoll:n.defenderRoll,mean:i,outcome:"win",winnerName:s.name,loserName:l.name,summary:p},e.pendingDuel=null,e.phase="await_post_land"}function is(e,n){if(n.eliminated)return;const t=n.position,o=I(e.board,t).name;if(t==="earth"){w(e,`${n.name} holds Earth — cannot be knocked further back.`);return}const r=dr(e.board,t);if(!r||r===t){w(e,`${n.name} cannot be knocked back from ${o}.`);return}const a=I(e.board,r).name;n.position=r,w(e,`${n.name} is knocked back ${o} → ${a} (duel forfeit).`),L(e,`${n.name}: knockback → ${a}`),ss(e,n)}function ss(e,n){if(n.eliminated||e.phase==="game_over")return;const t=I(e.board,n.position);t.id==="earth"?(zt(e,n,"land"),n.circuitActive&&Jt(e,n)):t.landingBonus&&t.landingBonus>0&&(n.cash+=t.landingBonus,w(e,`${n.name} collects ${g(t.landingBonus)} from ${t.name} (knockback).`),L(e,`+${g(t.landingBonus)} ${t.name}`));const o=t.kind==="planet"||t.kind==="moon";wr(e,n,t.name,o);const r=e.owners[t.id];if(r&&r!==n.id&&H(t)){const a=e.players.find(s=>s.id===r);if(!a||a.eliminated)return;if(ar(n,t.id)){w(e,`${n.name} uses docking rights — no rent on ${t.name} (knockback).`),L(e,`docking rights ${t.name}`);return}if(n.nextRentWaived){n.nextRentWaived=!1,w(e,`${n.name} uses port holiday — no rent to ${a.name} (knockback).`),L(e,`rent holiday vs ${a.name}`);return}const i=n.rentWaiversAgainst.indexOf(a.id);if(i>=0)n.rentWaiversAgainst.splice(i,1),w(e,`${n.name} uses Gravity Duel free pass — no rent to ${a.name} (knockback).`),L(e,`rent waived vs ${a.name}`);else{const s=xn(e,t.id,r);if(n.cash>=s)n.cash-=s,a.cash+=s,On(a,t.id,s,t.price??0,e),w(e,`${n.name} pays ${g(s)} rent to ${a.name} (knockback).`),L(e,`−${g(s)} rent → ${a.name}`);else{const l=n.cash;a.cash+=l,On(a,t.id,l,t.price??0,e),w(e,`${n.name} cannot pay ${g(s)} rent (knockback).`),L(e,`bankrupt to ${a.name}`),Nn(e,n,"bankruptcy")}}}}function ls(e,n){const t=O(e);let o=t.position;const r=I(e.board,o),a=lr(r);let i=se(r,n,t.propellant);if(i>0&&t.freeLeavePending&&(t.freeLeavePending=!1,w(e,`${t.name} rides free leave from ${r.name} (comet dust token · g${a}).`),L(e,`free leave ${r.name}`),i=0),i>0){if(t.fuel<i){w(e,`${t.name} cannot leave ${r.name} (g${a}): need ${i} fuel, have ${t.fuel}.`),L(e,`stuck on ${r.name} (no leave fuel)`),Wn(e,!0);return}t.fuel-=i,w(e,`${t.name} burns ${i} fuel leaving ${r.name} (g${a} · ${de[t.propellant].short}).`),L(e,`−${i} fuel leave ${r.name}`)}r.id==="earth"&&(t.circuitActive=!0),t.canBidirectional&&!t.directionLocked&&(t.directionLocked=!0);const s=t.moveDirection,l=Re(e.board,o,n,s);for(const c of l.frames)c.passThrough&&w(e,`${t.name} is pulled through ${I(e.board,c.nodeId).name}.`);if(l.stops.length>1)for(let c=0;c<l.stops.length-1;c++)l.stops[c]==="earth"&&zt(e,t,"pass");t.position=l.endId,Wn(e,!1),l.endId==="earth"&&t.circuitActive&&Jt(e,t)}function ds(e,n){const t=O(e);if(!t.canBidirectional||t.directionLocked){w(e,`${t.name} cannot change course.`);return}n!=="forward"&&n!=="backward"||t.moveDirection!==n&&(t.moveDirection=n,w(e,`${t.name} sets course ${n==="backward"?"retrograde":"prograde"} on the Mainline.`),L(e,`course ${n}`))}function Wn(e,n){const t=O(e),o=I(e.board,t.position);if(!n){w(e,`${t.name} lands on ${o.name} (insertion free).`);const a=o.kind==="planet"||o.kind==="moon";wr(e,t,o.name,a)}!n&&o.id==="earth"?zt(e,t,"land"):o.landingBonus&&o.landingBonus>0&&!n&&(t.cash+=o.landingBonus,w(e,`${t.name} collects ${g(o.landingBonus)} from ${o.name}.`),L(e,`+${g(o.landingBonus)} ${o.name}`));const r=e.owners[o.id];if(r&&r!==t.id&&H(o)){const a=e.players.find(i=>i.id===r);if(!n&&ar(t,o.id))w(e,`${t.name} uses docking rights — no rent on ${o.name}.`),L(e,`docking rights ${o.name}`);else if(t.nextRentWaived)t.nextRentWaived=!1,w(e,`${t.name} uses port holiday — no rent to ${a.name}.`),L(e,`rent holiday vs ${a.name}`);else{const i=t.rentWaiversAgainst.indexOf(a.id);if(i>=0)t.rentWaiversAgainst.splice(i,1),w(e,`${t.name} uses Gravity Duel free pass — no rent to ${a.name}.`),L(e,`rent waived vs ${a.name}`);else{const s=xn(e,o.id,r);if(t.cash>=s)t.cash-=s,a.cash+=s,On(a,o.id,s,o.price??0,e),w(e,`${t.name} pays ${g(s)} rent to ${a.name}.`),L(e,`−${g(s)} rent → ${a.name}`);else{const l=t.cash;a.cash+=l,On(a,o.id,l,o.price??0,e),w(e,`${t.name} cannot pay ${g(s)} rent.`),L(e,`bankrupt to ${a.name}`),Nn(e,t,"bankruptcy");return}}}}if((o.kind==="planet"||o.kind==="moon")&&t.fuel<=1&&!Er(e,t)){Nn(e,t,"stranded — cannot fuel an exit");return}if(e.phase!=="game_over"){if(!n&&o.kind==="space"){const a=rs(e,o.id,t.id);if(a){$r(e,t,a,o.id);return}}e.phase="await_post_land"}}function Er(e,n){const t=I(e.board,n.position);return!!(t.refuel==="free"||t.id==="earth"||t.refuel==="paid"||t.refuel==="station"&&e.stations[t.id])}function cs(e,n){const t=Qt(e),o=O(e),r=Math.max(0,Math.min(n,t.max));if(!t.allowed||r<=0){w(e,`${o.name} cannot refuel here.`);return}const a=r*t.costPer;if(o.cash<a){w(e,`${o.name} cannot afford refuel.`);return}o.cash-=a,o.fuel+=r;const i=I(e.board,o.position),s=e.owners[i.id];if(a>0&&s&&s!==o.id){const l=e.players.find(c=>c.id===s);l&&(l.cash+=a)}w(e,`${o.name} refuels +${r} fuel${a?` for ${g(a)}`:" (free)"}.`),L(e,`+${r} fuel${a?` (−${g(a)})`:" free"}`)}function us(e){const n=O(e),t=I(e.board,n.position),o=te(e);if(!o.buy){w(e,`${n.name} cannot buy ${t.name}.`);return}n.cash-=o.buyPrice,e.owners[t.id]=n.id,n.properties.push(t.id),mn(n,t.id,{listPrice:t.price??o.buyPrice,cashInvested:o.buyPrice,acquiredOnTurn:e.gameTurn}),ma(e,t.id,o.buyPrice),n.ephemerisBodyId||(n.ephemerisBodyId=t.id,w(e,`${n.name}'s ephemeris anchor is now ${t.name} (first claim).`));const r=le(t.group),a=!!r&&he(e.owners,n.id,r.id);w(e,`${n.name} claims ${t.name} for ${g(o.buyPrice)}${a?` · ${r.name} MONOPOLY (rent ×2)`:""}.`),L(e,`−${g(o.buyPrice)} claim ${t.name}`)}function hs(e){const n=O(e);if(!te(e).placeStation){w(e,`${n.name} cannot place a fuel depot here.`);return}const o=I(e.board,n.position);if(o.kind!=="planet"&&o.kind!=="moon"){w(e,`${n.name} cannot place a depot on ${o.name}.`);return}const r=ln(n.depotsPlacedThisCircuit,o.price);if(n.cash<r){w(e,`${n.name} cannot afford depot on ${o.name} (${g(r)}).`);return}r>0&&(n.cash-=r,ya(n,o.id,r,o.price??0,e)),n.stationsInHand-=1,n.depotsPlacedThisCircuit+=1,e.stations[n.position]=!0;const a=r===0?" (first this circuit free)":` for ${g(r)} (10% of claim)`;w(e,`${n.name} places a fuel depot on ${o.name}${a}.`),L(e,r>0?`+depot ${o.name} (−${g(r)})`:`+depot ${o.name} free`),ps(e,n,n.position)}function ps(e,n,t){if(e.owners[t]!==n.id||!e.stations[t]||e.gusherPaid[t]||!Ba(n.propellant,t))return;const o=e.config.startingCash>0?Math.floor(e.config.startingCash*.5):Aa;e.gusherPaid[t]=!0,n.cash+=o;const r=I(e.board,t);ba(n,t,o,r.price??0);const a=de[n.propellant].short,i=n.agent==="human",s=Oa(n.propellant,tt(e),n.name,i),l=i?`${s} (${n.name})`:s;w(e,`${l} · ${r.name} · +${g(o)} (${a}).`),L(e,`+${g(o)} fuel strike ${r.name}`),e.pendingAnnouncement={kind:"gusher",title:s,body:xa(n.name,r.name,`+${g(o)}`,i)}}function ms(e,n){const t=O(e),o=I(e.board,n);if(e.pendingAuction||e.pendingCharterChoice){w(e,`${t.name} cannot sell during a pending table action.`);return}if(e.phase!=="await_action"&&e.phase!=="await_post_land"&&e.phase!=="await_move"){w(e,`${t.name} cannot sell ${o.name} now.`);return}if(e.phase==="await_move"&&n!==t.position){w(e,`${t.name} can only dump the claim underfoot after rolling.`);return}if(e.owners[n]!==t.id||!H(o)){w(e,`${t.name} cannot sell ${o.name}.`);return}const r=pn(o.price);if(r<=0){w(e,`${t.name} cannot sell ${o.name}.`);return}t.cash+=r,t.properties=t.properties.filter(i=>i!==n);const a=!!e.stations[n];Xt(e,n),t.ephemerisBodyId===n&&(t.ephemerisBodyId=t.properties[0]??null),w(e,`${t.name} sells ${o.name} to the bank for ${g(r)}${a?" (depot scrapped)":""}.`),L(e,`+${g(r)} sold ${o.name}`)}function gs(e,n,t){if(e.pendingAuction||e.pendingCharterChoice||n.eliminated||(n.auctionedThisTurn??[]).includes(t)||e.phase!=="await_action"&&e.phase!=="await_post_land"||e.owners[t]!==n.id)return!1;const o=I(e.board,t);return!H(o)||pn(o.price)<=0?!1:ir(e,n.id).length>0}function fs(e,n,t){const o=O(e),r=I(e.board,n);if(!gs(e,o,n)){w(e,`${o.name} cannot auction ${r.name}.`);return}const a=pn(r.price),i=r.price??a,s=typeof t=="number"&&Number.isFinite(t)?Math.floor(t):a,l=Math.min(i,Math.max(a,s)),c={sellerId:o.id,nodeId:n,reserve:l,bids:{},awaitingBidderId:null};o.auctionedThisTurn||(o.auctionedThisTurn=[]),o.auctionedThisTurn.includes(n)||o.auctionedThisTurn.push(n),c.awaitingBidderId=Vt(e,c,o.id),e.pendingAuction=c;const p=l>a?`reserve ${g(l)} — ${g(l-a)} over the ${g(a)} mark`:`reserve ${g(a)} — same as sell`;if(w(e,`${o.name} auctions ${r.name} (${p}).`),L(e,`auction ${r.name}`),!c.awaitingBidderId){eo(e);return}no(e)}function Sr(e,n,t){const o=e.pendingAuction;if(!o||o.awaitingBidderId!==n)return;const r=e.players.find(l=>l.id===n);if(!r||r.eliminated)return;const a=Math.floor(t);let i=0;if(a>0){if(a<o.reserve){w(e,`${r.name}'s bid ${g(a)} is below reserve ${g(o.reserve)}.`);return}if(a>r.cash){w(e,`${r.name} cannot bid ${g(a)} (cash ${g(r.cash)}).`);return}i=a}o.bids[n]=i;const s=I(e.board,o.nodeId).name;w(e,i>0?`${r.name} bids ${g(i)} on ${s}.`:`${r.name} passes on ${s}.`),o.awaitingBidderId=Vt(e,o,n),o.awaitingBidderId||eo(e)}function bs(e,n,t){Sr(e,n,t),no(e)}function ys(e,n,t,o){const r=I(e.board,n),a=e.owners[n],i=e.players.find(l=>l.id===a),s=e.players.find(l=>l.id===t);s&&(i&&(i.properties=i.properties.filter(l=>l!==n),gn(i,n),i.ephemerisBodyId===n&&(i.ephemerisBodyId=i.properties[0]??null)),e.owners[n]=t,s.properties.includes(n)||s.properties.push(n),s.ephemerisBodyId||(s.ephemerisBodyId=n),mn(s,n,{listPrice:r.price??0,cashInvested:o,acquiredOnTurn:e.gameTurn}))}function eo(e){const n=e.pendingAuction;if(!n)return;const t=I(e.board,n.nodeId),o=e.players.find(h=>h.id===n.sellerId),r=Object.entries(n.bids).filter(([,h])=>h>=n.reserve).sort((h,E)=>E[1]-h[1]);if(!o||o.eliminated||e.owners[n.nodeId]!==o.id){e.pendingAuction=null,w(e,`Auction of ${t.name} cancelled.`);return}if(r.length===0){const h=bo(e,n,{winnerId:null,price:0,tied:!1});e.pendingAuction=null,w(e,`No bid met the reserve (${g(n.reserve)}) for ${t.name} — auction withdrawn.`),e.pendingAnnouncement={kind:"info",title:h.title,body:h.body};return}const a=r[0][1],i=r.filter(([,h])=>h===a).map(([h])=>h);let s=i[0];if(i.length>1){const h=e.players.length,E=e.players.findIndex(b=>b.id===o.id);for(let b=1;b<=h;b++){const u=e.players[(E+b)%h];if(u&&i.includes(u.id)){s=u.id;break}}}const l=e.players.find(h=>h.id===s);if(!l||l.cash<a){e.pendingAuction=null,w(e,`Auction of ${t.name} failed to settle.`);return}const c=!!e.stations[n.nodeId],p=bo(e,n,{winnerId:l.id,price:a,tied:i.length>1});l.cash-=a,o.cash+=a,ys(e,n.nodeId,l.id,a),va(o,n.nodeId),e.pendingAuction=null;const m=c?" (depot stays)":"";w(e,`${l.name} takes ${t.name} from ${o.name} for ${g(a)}${m}. ${o.name} keeps docking rights for one landing.`),L(e,`${t.name} → ${l.name} ${g(a)}`),e.pendingAnnouncement={kind:"info",title:p.title,body:p.body}}function no(e){let n=0;for(;e.pendingAuction&&n++<16;){const t=e.pendingAuction.awaitingBidderId;if(!t){eo(e);return}const o=e.players.find(a=>a.id===t);if(!o||o.eliminated){e.pendingAuction.bids[t]=0,e.pendingAuction.awaitingBidderId=Vt(e,e.pendingAuction,t);continue}if(o.agent==="human")return;const r=sr(e,o,e.pendingAuction);Sr(e,o.id,r)}}function ot(e){const n=e.pendingAuction;return n?.awaitingBidderId?e.players.find(t=>t.id===n.awaitingBidderId)?.agent==="human":!1}function ks(e,n){if(e.phase!=="await_move"||!e.lastRoll)return;const t=e.lastRoll.total;e.breakSpaces=Math.min(t,Math.max(0,Math.floor(n)))}function vs(e,n){const t=O(e);if(e.phase!=="await_action")return;if(t.warpCharges<=0){w(e,`${t.name} has no warp charge.`);return}const o=e.board.nodes[n];if(!o){w(e,`${t.name} cannot warp — unknown beacon.`);return}if(n===t.position){w(e,`${t.name} is already at ${o.name}.`);return}t.warpCharges-=1;const r=t.position,a=I(e.board,r).name;r==="earth"&&(t.circuitActive=!0),t.position=n,t.rolledThisTurn=!0,t.movedThisTurn=!0,e.lastRoll=null,e.breakSpaces=0,w(e,`${t.name} warps ${a} → ${o.name} (King's Quest · ${t.warpCharges} charge(s) left).`),L(e,`warp → ${o.name}`),Wn(e,!1),n==="earth"&&t.circuitActive&&Jt(e,t),e.pendingDuel&&Ce(e)}function ws(e){const n=O(e);if(e.phase!=="await_move"||!e.lastRoll)return;const t=e.lastRoll.total,o=Math.min(e.breakSpaces,t),r=o>0&&n.freeBreakPending,a=De(n.freeBreakPending,o);if(n.fuel+1e-9<a){w(e,`${n.name} cannot afford break (${a} fuel for −${o} spaces).`);return}o>0&&(r&&(n.freeBreakPending=!1),n.fuel-=a,n.fuel=Math.round(n.fuel*2)/2,w(e,r?`${n.name} breaks −${o} space(s) free (M&Ms token) (roll ${t} → move ${t-o}).`:`${n.name} breaks −${o} space(s) for ${a} fuel (roll ${t} → move ${t-o}).`),L(e,r?`free break (−${o} spaces)`:`−${a} fuel break (−${o} spaces)`));const i=t-o;if(e.breakSpaces=0,i<=0){w(e,`${n.name} breaks full roll — stays put.`),L(e,"stay (full break)"),e.phase="await_post_land";return}const s=n.position;ls(e,i),n.position!==s&&(n.movedThisTurn=!0),e.pendingDuel&&Ce(e)}function Ce(e){const n=e.pendingDuel;if(!n)return;const t=e.players.find(a=>a.id===n.challengerId),o=e.players.find(a=>a.id===n.defenderId),r=a=>a.fuel>12?"high":"low";t.agent==="ai"&&n.challengerStance===null&&(n.challengerStance=r(t)),o.agent==="ai"&&n.defenderStance===null&&(n.defenderStance=r(o)),n.challengerStance&&n.defenderStance&&n.challengerRoll===null&&t.agent==="ai"&&(n.challengerRoll=on(e,t),w(e,`${t.name} rolls duel dice ${n.challengerRoll.d1}+${n.challengerRoll.d2}=${n.challengerRoll.total}.`)),n.challengerStance&&n.defenderStance&&n.defenderRoll===null&&o.agent==="ai"&&(n.defenderRoll=on(e,o),w(e,`${o.name} rolls duel dice ${n.defenderRoll.d1}+${n.defenderRoll.d2}=${n.defenderRoll.total}.`)),Zt(e)}function $s(e){const n=nt(e);return Gn(n),n}function Gn(e){const n=e.pendingCharterChoice;if(!n)return;const t=e.players.find(o=>o.id===n.chooserId);if(!t||t.eliminated){e.pendingCharterChoice=null;return}if(t.agent!=="human"){if(n.kind==="vibe_kick"){let o=We(e).filter(a=>a.id!==t.id&&a.agent==="ai");if(o.length===0&&(o=We(e).filter(a=>a.id!==t.id)),o.length===0){e.pendingCharterChoice=null;return}const r=o[Math.floor(Math.random()*o.length)];It(e,t.id,r.id);return}if(n.kind==="olbers_station"){const o=Ki().filter(a=>a!==t.position),r=o[Math.floor(Math.random()*o.length)]??o[0];r?Mt(e,t.id,r):e.pendingCharterChoice=null;return}if(n.kind==="blockchain_steal"){const o=He(e,t.id);if(o.length===0){e.pendingCharterChoice=null;return}const r=o[Math.floor(Math.random()*o.length)];Tt(e,t.id,r)}}}function It(e,n,t){const o=e.pendingCharterChoice;if(!o||o.kind!=="vibe_kick"||o.chooserId!==n)return;const r=e.players.find(i=>i.id===n),a=e.players.find(i=>i.id===t);!r||!a||a.eliminated||a.id===r.id||r.agent==="human"&&a.agent!=="ai"||(e.pendingCharterChoice=null,Nn(e,a,`removed by ${r.name} (vibe-code rules authority)`),w(e,`${r.name} patches the build: ${a.name} is off the ledger.`))}function Mt(e,n,t){const o=e.pendingCharterChoice;if(!o||o.kind!=="olbers_station"||o.chooserId!==n)return;const r=e.players.find(l=>l.id===n);if(!r||r.eliminated){e.pendingCharterChoice=null;return}if(!gr(t)||t==="earth")return;const a=e.board.nodes[t];if(!a)return;e.pendingCharterChoice=null;const i=I(e.board,r.position).name;r.position==="earth"&&(r.circuitActive=!0),r.position=t,r.cash+=nn,r.rolledThisTurn=!0,r.movedThisTurn=!0,e.lastRoll=null,e.breakSpaces=0,w(e,`${r.name} warps ${i} → ${a.name} (Olbers award · +${g(nn)}).`),L(e,`Olbers → ${a.name} +${g(nn)}`),e.players[e.currentPlayerIndex]?.id===r.id&&(Wn(e,!1),e.pendingDuel&&Ce(e))}function Tt(e,n,t){const o=e.pendingCharterChoice;if(!o||o.kind!=="blockchain_steal"||o.chooserId!==n)return;const r=e.players.find(c=>c.id===n);if(!r||r.eliminated){e.pendingCharterChoice=null;return}if(!He(e,n).includes(t))return;const a=e.owners[t],i=e.players.find(c=>c.id===a),s=I(e.board,t);i&&(i.properties=i.properties.filter(c=>c!==t),gn(i,t),i.ephemerisBodyId===t&&(i.ephemerisBodyId=i.properties[0]??null)),e.owners[t]=r.id,r.properties.includes(t)||r.properties.push(t);const l=s.kind==="planet"||s.kind==="moon";l&&(e.stations[t]=!0),r.ephemerisBodyId||(r.ephemerisBodyId=t),mn(r,t,{listPrice:s.price??0,cashInvested:0,acquiredOnTurn:e.gameTurn}),e.pendingCharterChoice=null,w(e,`${r.name} reassigns ${s.name} from ${i?.name??"the bank"} via AIL${l?" (depot installed)":""}.`),L(e,`blockchain claim ${s.name}`)}function Ge(e,n){const t=nt(e);if(t.phase==="game_over"||(Gn(t),no(t),t.phase==="game_over"))return t;if(t.pendingAuction){if(n.type==="auction_bid"){const r=t.pendingAuction.awaitingBidderId;r&&bs(t,r,n.amount)}return t}if(t.pendingCharterChoice){const r=t.pendingCharterChoice;if(t.players.find(i=>i.id===r.chooserId)?.agent==="human")return n.type==="charter_kick"?(It(t,r.chooserId,n.targetPlayerId),t):n.type==="charter_olbers"?(Mt(t,r.chooserId,n.stationId),t):(n.type==="charter_steal"&&Tt(t,r.chooserId,n.nodeId),t)}if(t.phase==="await_duel"&&(Ce(t),t.phase!=="await_duel"))return t;const o=O(t);if(o.eliminated&&n.type!=="duel_stance"&&n.type!=="duel_roll")return Hn(t),t;switch(n.type){case"refuel":(t.phase==="await_action"||t.phase==="await_post_land")&&cs(t,n.amount);break;case"warp":t.phase==="await_action"&&vs(t,n.destination);break;case"roll":{if(t.phase!=="await_action")break;const r=on(t,o);t.lastRoll=r,t.breakSpaces=0,o.rolledThisTurn=!0,w(t,`${o.name} rolls ${r.d1}+${r.d2}=${r.total}${r.doubles?" (doubles)":""}, Break=${t.breakSpaces}, Move`),L(t,`roll ${r.total}`),t.phase="await_move";break}case"set_direction":(t.phase==="await_action"||t.phase==="await_move"||t.phase==="await_post_land")&&ds(t,n.direction);break;case"set_break":ks(t,n.spaces);break;case"move":ws(t);break;case"buy":(t.phase==="await_post_land"||t.phase==="await_action")&&us(t);break;case"sell":(t.phase==="await_action"||t.phase==="await_move"||t.phase==="await_post_land")&&ms(t,n.nodeId);break;case"auction_start":(t.phase==="await_action"||t.phase==="await_post_land")&&fs(t,n.nodeId,n.reserve);break;case"auction_bid":break;case"place_station":(t.phase==="await_post_land"||t.phase==="await_action"||t.phase==="await_move")&&hs(t);break;case"end_turn":(t.phase==="await_post_land"||t.phase==="await_action")&&(o.rolledThisTurn||w(t,`${o.name} ends turn without rolling (camping).`),o.movedThisTurn||vr(t,o),Hn(t));break;case"duel_stance":{const r=t.pendingDuel;if(!r||t.phase!=="await_duel")break;o.id===r.challengerId&&r.challengerStance===null?(r.challengerStance=n.stance,w(t,`${o.name} locks a secret stance.`)):o.id===r.defenderId&&r.defenderStance===null&&(r.defenderStance=n.stance,w(t,`${o.name} locks a secret stance.`)),Ce(t);break}case"duel_roll":{const r=t.pendingDuel;if(!r||t.phase!=="await_duel"||r.challengerStance===null||r.defenderStance===null)break;o.id===r.challengerId&&r.challengerRoll===null?(r.challengerRoll=on(t,o),w(t,`${o.name} rolls duel ${r.challengerRoll.d1}+${r.challengerRoll.d2}=${r.challengerRoll.total}.`)):o.id===r.defenderId&&r.defenderRoll===null&&(r.defenderRoll=on(t,o),w(t,`${o.name} rolls duel ${r.defenderRoll.d1}+${r.defenderRoll.d2}=${r.defenderRoll.total}.`)),Ce(t),Zt(t);break}case"charter_kick":t.pendingCharterChoice?.kind==="vibe_kick"&&It(t,t.pendingCharterChoice.chooserId,n.targetPlayerId);break;case"charter_olbers":t.pendingCharterChoice?.kind==="olbers_station"&&Mt(t,t.pendingCharterChoice.chooserId,n.stationId);break;case"charter_steal":t.pendingCharterChoice?.kind==="blockchain_steal"&&Tt(t,t.pendingCharterChoice.chooserId,n.nodeId);break}return t}function dn(e){let n=e,t=0;for(;n.phase==="await_duel"&&n.pendingDuel&&t++<20;){const o=JSON.stringify(n.pendingDuel),r=nt(n);if(Ce(r),Zt(r),n=r,JSON.stringify(n.pendingDuel)===o&&n.phase==="await_duel")break}return n}function Es(e,n){const t=nt(e),o=t.players.find(a=>a.id===n);if(!o||t.phase==="game_over")return t;t.phase="game_over",o.eliminated=!0,o.eliminatedOnTurn=t.gameTurn,o.eliminatedOnRound=t.round,o.eliminatedReason="left the expedition",t.endReason=Fa(o),t.pendingAnnouncement={kind:"out",title:"OUT!",body:`${o.name} left the expedition.
Round ${t.round}.`};const r=We(t).filter(a=>a.id!==n);return r.length===1?t.winnerId=r[0].id:r.length>1&&(r.sort((a,i)=>q(t,i)-q(t,a)),t.winnerId=r[0].id),w(t,t.endReason),t}function Fn(e,n){const t=bn(e.config.aiDifficulty);if(e.pendingAuction){const i=e.pendingAuction.awaitingBidderId;if(i){const s=e.players.find(l=>l.id===i);if(s&&s.agent==="ai")return{type:"auction_bid",amount:sr(e,s,e.pendingAuction)}}return{type:"end_turn"}}if(e.phase==="await_duel"&&e.pendingDuel){const i=e.pendingDuel,s=O(e);if(s.id===i.challengerId||s.id===i.defenderId){const l=s.id===i.challengerId?i.challengerStance:i.defenderStance,c=s.id===i.challengerId?i.challengerRoll:i.defenderRoll;if(l===null)return t==="easy"?{type:"duel_stance",stance:"low"}:t==="expert"?{type:"duel_stance",stance:s.fuel>8?"high":"low"}:{type:"duel_stance",stance:s.fuel>12?"high":"low"};if(i.challengerStance&&i.defenderStance&&c===null)return{type:"duel_roll"}}return{type:"duel_stance",stance:"low"}}const o=O(e),r=te(e),a=Qt(e);if(e.phase==="await_action"){if(r.buy&&o.cash>=r.buyPrice+(t==="easy"?250:150))return{type:"buy"};const i=Ss(e,o,r,t);if(i&&o.cash<200)return i;if(r.refuel&&a.max>0&&(o.fuel<=12||r.leaveBurnPreview>o.fuel)){const s=Math.min(a.max,Math.max(5,18-o.fuel));if(a.costPer===0||o.cash>s*a.costPer+150)return{type:"refuel",amount:s}}if(i&&o.cash<100&&o.properties.length>2)return i;if(r.placeStation&&(o.fuel<=14||o.stationsInHand>=2)){const s=r.placeStationCost;if(s===0||o.cash>=s+120)return{type:"place_station"}}if(r.warp&&o.warpCharges>0){const s=Ms(e,t);if(s)return{type:"warp",destination:s}}return{type:"roll"}}if(e.phase==="await_move"){if(r.setDirection&&o.canBidirectional&&!o.directionLocked){const s=Is(e,t);if(s!==o.moveDirection)return{type:"set_direction",direction:s}}const i=Ts(e,r,t);return i!==e.breakSpaces?{type:"set_break",spaces:i}:!r.move&&e.breakSpaces>0?{type:"set_break",spaces:0}:{type:"move"}}if(r.buy&&o.cash>=r.buyPrice+(t==="easy"?250:150))return{type:"buy"};if(r.placeStation&&(o.fuel<=14||o.stationsInHand>=2)){const i=r.placeStationCost;if(i===0||o.cash>=i+120)return{type:"place_station"}}return r.refuel&&o.fuel<=8&&a.costPer===0?{type:"refuel",amount:Math.min(a.max,10)}:{type:"end_turn"}}function Ss(e,n,t,o){if(t.sellClaims.length===0)return null;const r=n.cash<80,a=new Set(n.auctionedThisTurn??[]),i=t.sellClaims.map(h=>{const E=I(e.board,h.nodeId),b=le(E.group),u=!!b&&he(e.owners,n.id,b.id),f=n.claimBooks[h.nodeId],S=f?Yt(f):0;return{...h,mono:u,earned:S,rent:E.rent??0,hub:pe(h.nodeId)}}).filter(h=>r||!h.mono).sort((h,E)=>h.earned-E.earned||h.rent-E.rent),s=i.filter(h=>a.has(h.nodeId)),l=i.filter(h=>!a.has(h.nodeId));if(s.length>0&&n.cash<100)return{type:"sell",nodeId:s[0].nodeId};const c=l[0];if(!c)return null;const m=e.players.filter(h=>!h.eliminated&&h.id!==n.id).some(h=>h.cash>=c.value);return t.canAuction&&m&&o!=="easy"?{type:"auction_start",nodeId:c.nodeId}:n.cash<100?{type:"sell",nodeId:c.nodeId}:null}function Cs(e,n,t){if(n<=0||t<=0)return 0;switch(e){case"easy":return 0;case"normal":return Math.min(n,2);case"hard":return Math.min(n,Math.max(2,Math.ceil(t/2)));case"expert":return n;default:return Math.min(n,2)}}function jn(e,n,t,o,r){const a=I(e.board,o);let i=0;if(H(a)&&!e.owners[o]&&(a.price??0)<=t-80){if(i+=40+Math.min(35,(a.price??0)/35),pe(o)){i+=r==="expert"?55:r==="hard"?35:15;const c=ke.filter(p=>e.owners[p]===n).length;c===2?i+=r==="expert"?80:40:c===1&&(i+=r==="expert"?30:12)}const l=le(a.group);if(l){const c=l.deedIds.filter(m=>e.owners[m]===n).length,p=l.deedIds.length;c===p-1?i+=r==="expert"?100:r==="hard"?55:20:c>=Math.floor(p/2)&&(i+=r==="expert"?25:r==="hard"?12:4)}}e.owners[o]===n&&(i+=18,e.stations[o]&&(i+=10)),o==="earth"&&(i+=r==="expert"?70:r==="hard"?40:28);const s=e.owners[o];if(s&&s!==n&&H(a)){const l=a.rent??0,c=!!le(a.group)&&he(e.owners,s,le(a.group).id),p=Math.floor(l*(c?2:1)*(e.stations[o]?1.5:1));i-=25+p/4,t<p&&(i-=55),r==="expert"&&(i-=20+p/5),pe(o)&&(i-=r==="expert"?35:15)}return a.kind==="space"&&(i+=r==="expert"?14:r==="hard"?6:0,i-=4),i}function Io(e,n,t,o){if(t<=1)return!1;const r=Re(e.board,n,t,o);return r.endId==="earth"?!1:r.stops.some(a=>a==="earth")}function Is(e,n){const t=O(e);if(n==="easy")return"forward";const o=e.lastRoll?.total??7,r=l=>jn(e,t.id,t.cash,Re(e.board,t.position,o,l).endId,n)+(n==="normal"&&l==="forward"?2:0)+(n==="hard"&&l==="forward"?1:0),a=r("forward");return r("backward")>a+(n==="expert"?3:n==="hard"?5:8)?"backward":"forward"}function Ms(e,n){const t=O(e);if(n==="easy"&&t.fuel>6)return null;let o=null,r=-1e9;for(const i of Object.keys(e.board.nodes)){if(i===t.position)continue;let s=jn(e,t.id,t.cash,i,n);n==="normal"?s+=Math.random()*4:n==="easy"?s+=Math.random()*8:s+=Math.random()*2,t.fuel<=4&&(s+=15),s>r&&(r=s,o=i)}return r<(n==="expert"?5:n==="hard"?8:10)&&t.fuel>8?null:o}function Ts(e,n,t){const o=O(e),r=e.lastRoll?.total??0;if(r<=0||n.maxBreak<=0)return 0;const a=I(e.board,o.position);if(t==="easy")return 0;if(t==="normal"){const p=se(a,Math.max(1,r),o.propellant);let m=0;if(o.fuel<p&&n.maxBreak>0){for(m=Math.min(n.maxBreak,2);m>0;){const h=De(o.freeBreakPending,m),E=se(a,Math.max(1,r-m),o.propellant);if(o.fuel+1e-9>=h+E||o.fuel+1e-9>=h&&o.fuel<p)break;m--}for(;m>0&&o.fuel+1e-9<De(o.freeBreakPending,m);)m--}return m}const i=t==="expert",s=Cs(t,n.maxBreak,r);let l=0,c=-1e9;for(let p=0;p<=s;p++){const m=De(o.freeBreakPending,p);if(o.fuel+1e-9<m)continue;const h=r-p;if(h<1)continue;const E=se(a,h,o.propellant);if(o.fuel+1e-9<m+E){const S=se(a,r,o.propellant);if(!(o.fuel<S&&o.fuel>=m))continue}const b=Re(e.board,o.position,h,o.moveDirection);let u=jn(e,o.id,o.cash,b.endId,t);if(b.endId==="earth"?u+=i?25:12:Io(e,o.position,r,o.moveDirection)&&!b.stops.includes("earth")&&(i||t==="hard")&&(u-=8),b.endId==="earth"&&Io(e,o.position,r,o.moveDirection)&&(u+=i?45:22),u-=m*(i?1.2:2.5),o.freeBreakPending&&p>=1&&(u+=i?14:6),i&&o.fuel<14){const S=se(a,r,o.propellant);u+=Math.max(0,S-E)*2.5}I(e.board,b.endId).kind==="space"&&i&&(u+=8),u>c&&(c=u,l=p)}if(l>0){const p=Re(e.board,o.position,r,o.moveDirection),m=jn(e,o.id,o.cash,p.endId,t);if(c<m+(i?2:t==="hard"?6:8))return 0}return l}const Cr=.08,Ir=.09,Rs=.74,As=[110,200,255],Ls=.9;function _s(e=Rs){const[n,t,o]=As;return`rgba(${n}, ${t}, ${o}, ${e})`}function Mr(e,n,t,o,r=Cr,a=Ir){const i=o%2===0?1:-1,s=i>0?r:a;if(s<=1e-6)return[e,n];const l=Math.atan2(e.y-t.y,e.x-t.x);let p=Math.atan2(n.y-t.y,n.x-t.x)-l;for(;p>Math.PI;)p-=Math.PI*2;for(;p<-Math.PI;)p+=Math.PI*2;const m=Math.hypot(e.x-t.x,e.y-t.y),h=Math.hypot(n.x-t.x,n.y-t.y),E=(m+h)/2||1,b=Math.hypot(n.x-e.x,n.y-e.y),u=s*Math.min(E*.55,b*.85+E*.12),f=Math.max(12,Math.ceil(Math.abs(p)*28)+Math.ceil(b/16)),S=[e];for(let A=1;A<=f;A++){const x=A/f,$=l+p*x;let y=m+(h-m)*x;const v=Math.sin(x*Math.PI);y+=i*u*v,y=Math.max(y,E*.08),S.push({x:t.x+Math.cos($)*y,y:t.y+Math.sin($)*y})}return S[S.length-1]=n,S}function Ps(e,n,t,o=Cr,r=Ir){if(e.length===0)return[];if(e.length===1)return[e[0]];const a=[];for(let i=0;i<e.length-1;i++){const s=Mr(e[i],e[i+1],n,t+i,o,r);i===0?a.push(...s):a.push(...s.slice(1))}return a}const Tr=.28,Rr=.05,Bs=.9,Ds=.35,Mo=.5,To=[{ringIndex:6,name:"Saturn",rgb:[212,185,95]},{ringIndex:5,name:"Jupiter",rgb:[210,140,75]},{ringIndex:4,name:"Belt",rgb:[150,115,75]},{ringIndex:3,name:"Mars",rgb:[190,95,75]},{ringIndex:2,name:"Earth",rgb:[90,145,175]},{ringIndex:1,name:"Venus",rgb:[175,150,100]},{ringIndex:0,name:"Mercury",rgb:[140,140,145]}];function Rt(e,n){return`rgba(${e[0]}, ${e[1]}, ${e[2]}, ${n})`}function Sn(e,n){return Math.min(1,Math.max(0,e*n))}function Os(e,n,t,o,r,a,i=Tr,s=Rr){const l=Math.min(1,Math.max(0,i)),c=Math.min(1,Math.max(0,s));if(o<=r+.5||l<=0&&c<=0)return;const p=e.createRadialGradient(n,t,Math.max(0,r),n,t,o);p.addColorStop(0,Rt(a,c)),p.addColorStop(1,Rt(a,l)),e.fillStyle=p,e.beginPath(),e.arc(n,t,o,0,Math.PI*2),e.arc(n,t,Math.max(0,r),0,Math.PI*2,!0),e.fill("evenodd")}function Ro(e,n,t,o,r,a,i=1.75){const s=Math.min(1,Math.max(0,a));s<=0||o<=0||(e.beginPath(),e.arc(n,t,o,0,Math.PI*2),e.strokeStyle=Rt(r,s),e.lineWidth=i,e.setLineDash([4,8]),e.stroke(),e.setLineDash([]))}function xs(e,n){const t={noFuelInWell:!1,stuckOnEnemyClaim:!1,belowKnownRent:!1,atRisk:!1,reasons:[]};if(n.eliminated||e.phase==="game_over")return t;const o=I(e.board,n.position),r=se(o,1,n.propellant),a=Er(e,n),i=e.owners[o.id];if(r>0&&n.fuel<r&&!a&&(t.noFuelInWell=!0,t.reasons.push(`no fuel to leave ${o.name} (no refuel here)`)),i&&i!==n.id&&H(o)){const c=e.players.find(p=>p.id===i);if(c&&!c.eliminated&&r>0&&n.fuel<r){const p=xn(e,o.id,i);t.stuckOnEnemyClaim=!0,t.reasons.push(`stuck on ${c.name}'s ${o.name} — failed leave owes ${g(p)} rent again`)}}let s=0,l=null;for(const[c,p]of Object.entries(e.owners)){if(p===n.id)continue;const m=I(e.board,c);if(!H(m))continue;const h=e.players.find(b=>b.id===p);if(!h||h.eliminated)continue;const E=xn(e,c,p);E>s&&(s=E,l=m)}return s>0&&n.cash<s&&(t.belowKnownRent=!0,t.reasons.push(`cash ${g(n.cash)} below worst rent ${g(s)}${l?` (${l.name})`:""}`)),t.atRisk=t.noFuelInWell||t.stuckOnEnemyClaim||t.belowKnownRent,t}function to(e){return e.kind==="planet"?e.id==="earth"?18:e.id==="mars"||e.id==="venus"?16:e.id==="mercury"?13:15:e.kind==="moon"?12:e.kind==="federation"?16:e.kind==="dock"?13:e.kind==="gravity"?9:8}function ne(e,n,t,o,r,a,i){const s=e.createRadialGradient(n-o*.35,t-o*.4,o*.1,n,t,o);s.addColorStop(0,r),s.addColorStop(.55,a),s.addColorStop(1,i??a),e.beginPath(),e.arc(n,t,o,0,Math.PI*2),e.fillStyle=s,e.fill(),e.strokeStyle="rgba(255,255,255,0.25)",e.lineWidth=1.5,e.stroke(),e.beginPath(),e.arc(n+o*.15,t+o*.1,o*.92,-.4,Math.PI*.9),e.strokeStyle="rgba(0,0,0,0.2)",e.lineWidth=2,e.stroke()}function oo(e,n,t,o,r){const a=e.createRadialGradient(n,t,o*.7,n,t,o*1.45);a.addColorStop(0,"rgba(0,0,0,0)"),a.addColorStop(.65,"rgba(0,0,0,0)"),a.addColorStop(1,r),e.beginPath(),e.arc(n,t,o*1.45,0,Math.PI*2),e.fillStyle=a,e.fill()}function Ns(e,n,t,o,r){const a=e.createRadialGradient(n,t,2,n,t,o*1.8);a.addColorStop(0,"rgba(180,220,255,0.35)"),a.addColorStop(1,"rgba(0,0,0,0)"),e.fillStyle=a,e.beginPath(),e.arc(n,t,o*1.8,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(n,t,o*.95,0,Math.PI*2),e.strokeStyle=r,e.lineWidth=3.5,e.stroke(),e.beginPath(),e.arc(n,t,o*.72,0,Math.PI*2),e.strokeStyle="rgba(255,255,255,0.35)",e.lineWidth=1.5,e.stroke();for(let l=0;l<4;l++){const c=l*Math.PI/2+.2;e.beginPath(),e.moveTo(n+Math.cos(c)*o*.25,t+Math.sin(c)*o*.25),e.lineTo(n+Math.cos(c)*o*.9,t+Math.sin(c)*o*.9),e.strokeStyle="rgba(200,220,255,0.55)",e.lineWidth=1.5,e.stroke()}ne(e,n,t,o*.32,"#ffffff",r,"#2a3a55");const i=o*.55,s=o*.28;e.fillStyle="rgba(80,140,220,0.85)",e.strokeStyle="rgba(200,230,255,0.8)",e.lineWidth=1,e.fillRect(n-o*1.35,t-s/2,i,s),e.strokeRect(n-o*1.35,t-s/2,i,s),e.fillRect(n+o*.8,t-s/2,i,s),e.strokeRect(n+o*.8,t-s/2,i,s),e.strokeStyle="rgba(255,255,255,0.25)";for(let l=1;l<3;l++){const c=n-o*1.35+i*l/3,p=n+o*.8+i*l/3;e.beginPath(),e.moveTo(c,t-s/2),e.lineTo(c,t+s/2),e.stroke(),e.beginPath(),e.moveTo(p,t-s/2),e.lineTo(p,t+s/2),e.stroke()}e.fillStyle="#7dffa0",e.beginPath(),e.arc(n,t-o*.95,2,0,Math.PI*2),e.fill(),e.fillStyle="#ff8a8a",e.beginPath(),e.arc(n,t+o*.95,2,0,Math.PI*2),e.fill()}function Hs(e,n,t,o){oo(e,n,t,o,"rgba(100,180,255,0.35)"),ne(e,n,t,o,"#b8e0ff","#3d8fd4","#1a4a7a"),e.fillStyle="rgba(90,170,90,0.75)",e.beginPath(),e.ellipse(n-o*.2,t-o*.1,o*.35,o*.45,-.4,0,Math.PI*2),e.fill(),e.beginPath(),e.ellipse(n+o*.25,t+o*.2,o*.28,o*.22,.5,0,Math.PI*2),e.fill(),e.strokeStyle="rgba(255,255,255,0.45)",e.lineWidth=2,e.beginPath(),e.moveTo(n-o*.5,t+o*.15),e.quadraticCurveTo(n,t+o*.05,n+o*.55,t+o*.2),e.stroke()}function Ws(e,n,t,o){oo(e,n,t,o,"rgba(255,120,80,0.2)"),ne(e,n,t,o,"#ffb088","#c45c3a","#6b2a18"),e.fillStyle="rgba(90,40,30,0.35)",e.beginPath(),e.arc(n-o*.25,t-o*.15,o*.2,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(n+o*.2,t+o*.1,o*.12,0,Math.PI*2),e.fill(),e.fillStyle="rgba(240,248,255,0.85)",e.beginPath(),e.ellipse(n,t-o*.65,o*.35,o*.18,0,0,Math.PI*2),e.fill()}function Gs(e,n,t,o){oo(e,n,t,o,"rgba(255,220,120,0.3)"),ne(e,n,t,o,"#fff2c8","#e8c878","#b8893a"),e.strokeStyle="rgba(255,255,255,0.35)",e.lineWidth=2;for(let r=-1;r<=1;r++)e.beginPath(),e.moveTo(n-o*.7,t+r*o*.25),e.quadraticCurveTo(n,t+r*o*.15-o*.05,n+o*.7,t+r*o*.28),e.stroke()}function Fs(e,n,t,o){ne(e,n,t,o,"#e8e4dc","#9a958c","#4a4844"),e.fillStyle="rgba(0,0,0,0.25)";for(const[r,a,i]of[[-.3,-.2,.18],[.25,.15,.14],[.1,-.35,.1],[-.15,.3,.12]])e.beginPath(),e.arc(n+o*r,t+o*a,o*i,0,Math.PI*2),e.fill()}function Cn(e,n,t,o,r){r==="jupiter"?ne(e,n,t,o,"#ffd4a0","#ff9f43","#c45f12"):r==="saturn"?ne(e,n,t,o,"#fff9d6","#f6e58d","#c4a84a"):r==="mars"?ne(e,n,t,o,"#ddd5d0","#8a8078","#3d3835"):ne(e,n,t,o,"#f0eef5","#b0a8c0","#5a5468"),e.fillStyle="rgba(0,0,0,0.18)",e.beginPath(),e.arc(n-o*.25,t-o*.15,o*.2,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(n+o*.2,t+o*.2,o*.12,0,Math.PI*2),e.fill()}function js(e,n,t,o,r){e.save(),e.translate(n,t),e.rotate(Math.PI/4);const a=o*.9,i=e.createLinearGradient(-a,-a,a,a);r?(i.addColorStop(0,"rgba(255,120,100,0.5)"),i.addColorStop(1,"rgba(80,40,60,0.8)")):(i.addColorStop(0,"rgba(140,170,220,0.45)"),i.addColorStop(1,"rgba(40,50,80,0.75)")),e.fillStyle=i,e.fillRect(-a/2,-a/2,a,a),e.strokeStyle="rgba(255,255,255,0.35)",e.lineWidth=1,e.strokeRect(-a/2,-a/2,a,a),e.restore(),e.fillStyle=r?"rgba(255,180,160,0.9)":"rgba(200,220,255,0.7)",e.beginPath(),e.arc(n,t,2,0,Math.PI*2),e.fill()}function Us(e,n,t,o){const r=to(n);if(n.kind==="space"){const a=n.id.startsWith("belt")||n.id.startsWith("j_b")||n.id.startsWith("s_b")||n.name.includes("Transit")||n.name==="Belt"||n.name==="Homeward";return js(e,t,o,r,a),r}if(n.kind==="federation"||n.id==="elon"||n.id==="holst"||n.id==="daktulios"){let a="#c9e4ff";return n.id==="elon"&&(a="#ff8c5a"),n.id==="holst"&&(a="#ffb347"),n.id==="daktulios"&&(a="#ffe566"),Ns(e,t,o,r,a),r*1.15}return n.id==="earth"?(Hs(e,t,o,r),r):n.id==="mars"?(Ws(e,t,o,r),r):n.id==="venus"?(Gs(e,t,o,r),r):n.id==="mercury"?(Fs(e,t,o,r),r):n.kind==="moon"?(n.paint==="jupiter-moon"?Cn(e,t,o,r,"jupiter"):n.paint==="saturn-moon"?Cn(e,t,o,r,"saturn"):n.group==="mars"?Cn(e,t,o,r,"mars"):Cn(e,t,o,r,"neutral"),r):n.kind==="gravity"?(ne(e,t,o,r,"#4a4060","#1a1528","#0a0810"),r):(ne(e,t,o,r,"#a0c4ff","#4a6fa5","#1e3048"),r)}function Ks(e,n,t){e.fillStyle="rgba(15,22,40,0.9)",e.fillRect(n-8,t-9,16,18);const o=e.createLinearGradient(n-6,t-7,n+6,t+7);o.addColorStop(0,"#f0f8ff"),o.addColorStop(.45,"#7ec8ff"),o.addColorStop(1,"#2a6098"),e.fillStyle=o,e.fillRect(n-6,t-7,12,14),e.strokeStyle="rgba(255,255,255,0.9)",e.lineWidth=1.25,e.strokeRect(n-6,t-7,12,14),e.fillStyle="#ffc857",e.fillRect(n-4,t-1,8,4),e.strokeStyle="rgba(0,0,0,0.35)",e.strokeRect(n-4,t-1,8,4)}function Ys(e,n,t){const o=I(e.board,n),r=[],a=le(o.group);r.push(`Type: ${o.kind}${o.paint?` (${o.paint})`:""}`),a&&r.push(`System: ${a.name}`);const i=e.owners[n];if(i){const l=e.players.find(p=>p.id===i),c=!!a&&!!l&&he(e.owners,l.id,a.id);r.push(`Owner: ${l?.name??i}${c?" · SYSTEM MONOPOLY (rent ×2)":""}`)}else H(o)?r.push("Owner: unclaimed — available"):r.push("Owner: n/a (not a claim)");if(H(o)){r.push(`Buy price: ${g(o.price??0)}`);const l=o.rent??0;let c=l;if(i){const p=e.players.find(h=>h.id===i),m=!!a&&he(e.owners,p.id,a.id);c=Math.floor(l*(m?2:1)*(e.stations[n]?1.5:1))}r.push(`Rent: base ${g(l)}${i?` · now ${g(c)}`:""}`),e.stations[n]?r.push("Fuel depot: yes (built)"):(o.kind==="planet"||o.kind==="moon")&&r.push("Fuel depot: none")}if(t&&!t.eliminated){const l=de[t.propellant],c=[2,7,12].map(p=>{const m=se(o,p,t.propellant);return`roll ${p}→${m}`});r.push(`Leave fuel (${l.short}, you have ${t.fuel}): ${c.join(" · ")}`),o.refuel==="free"||o.id==="earth"?r.push("Refuel here: free (Earth/home rate)"):o.refuel==="paid"?r.push("Refuel here: paid dock/station rates"):o.refuel==="station"?r.push("Refuel here: only with a fuel depot (yours free / foe paid)"):r.push("Refuel here: none")}if(i&&H(o)){const c=e.players.find(m=>m.id===i).parkCount,p=br(c);if(r.push(`Owner park count: ${c}`),p<=0){const m=Math.max(0,tn-c);r.push(m===0?`Feral checks start at park ${tn}+ (no-move seat turns).`:`${m} more park(s) until feral checks (threshold ${tn}).`)}else r.push(`Feral risk ${Math.round(p*100)}% per claim on each no-move park (all claims roll independently).`)}const s=cr(n);if(s&&n!=="earth"&&H(o)&&r.push(`Ephemeris table (AU-ish): near ${s.nearest} · avg ${s.average} · far ${s.furthest}`),t&&i===t.id){r.push(`Your net worth: ${g(q(e,t))}`);const l=t.claimBooks[n];if(l){const c=l.rentCollected+l.gusherCollected;if(l.cashInvested>0){const p=Math.round(c/l.cashInvested*100);r.push(`This claim: ${p}% recovered (${g(c)} / ${g(l.cashInvested)})`)}else c>0&&r.push(`This claim: no cash in · ${g(c)} earned`)}}if(t&&t.position===n){if(H(o)&&!i){const l=t.cash>=(o.price??0);r.push(l?`You can BUY this (${g(o.price??0)}; you have ${g(t.cash)})`:`Cannot buy — need ${g(o.price??0)}, have ${g(t.cash)}`)}else if(i&&i!==t.id)r.push("Cannot buy — owned by another pilot");else if(i===t.id)if(e.stations[n])r.push("Depot already built here");else if(t.stationsInHand<=0)r.push("Cannot build depot — no depots left in hand");else if(o.kind==="planet"||o.kind==="moon"){const l=ln(t.depotsPlacedThisCircuit,o.price),c=l===0?"first this circuit FREE":`${g(l)} (10% of claim)`;r.push(`You can place a FUEL DEPOT here (${t.stationsInHand} left · ${c})`)}else r.push("Cannot build depot on stations/hubs — only planets & moons")}return{title:o.name,lines:r}}const Vs={recorde:`
<p class="pilot-hook"><em>Robert Recorde — invented the equals sign (=) in 1557.</em></p>
<p><strong>Robert Recorde</strong> was a Welsh physician and mathematician. In <em>The Whetstone of Witte</em> he introduced the twin parallel lines of the <strong>equals sign</strong>, writing that no two things can be more equal.</p>
<p>Every rent line, fuel equation, and ledger balance sheet still runs on his glyph. If Recorde is flying against you, remember: the ledger is older than the rocket — and more succinct math is how orbital economics keeps score.</p>
`,k127:`
<p class="pilot-hook"><em>Khmer stele (Sambor) — early dated zero in a decimal place-value system (683&nbsp;CE).</em></p>
<p><strong>K-127</strong> is a 7th-century <strong>Khmer stone stele</strong> from Cambodia, often cited as one of the oldest <em>firmly dated</em> uses of the <strong>zero symbol</strong> in a decimal place-value system. It is not a Mesopotamian clay tablet; the designation is an epigraphic catalogue number.</p>
<p>French official Adhémar Leclère found it in 1891 near a temple at Sambor (Sambaur) on the Mekong in Kratié province. Scholar George Cœdès catalogued and translated it in 1931 as <strong>K-127</strong>. Written in Old Khmer, it records a date of Śaka 605 (about <strong>683&nbsp;CE</strong>) and uses a small <strong>dot for zero</strong> in the number. The text is administrative — slaves, oxen, rice — the ordinary ledger work of a state.</p>
<p>The stele vanished during the Khmer Rouge period, was later rediscovered, and is now in the <strong>National Museum of Cambodia</strong> in Phnom Penh. Historians of mathematics treat it as important Southeast Asian evidence for the zero numeral.</p>
<p>In Heliopoly the callsign is deliberate: zero is not “nothing,” it is structure. Without place-value, you cannot keep price, propellant, or a ledger. The blank still counts.</p>
`,turing:`
<p class="pilot-hook"><em>Helped invent computer science; broke codes in World War II.</em></p>
<p><strong>Alan Turing</strong> formalized what a computer can be (the Turing machine) and led work that cracked enemy codes at Bletchley Park. Textbooks place him at the root of both algorithms and modern computing ethics.</p>
<p>A Turing rival is pure logic under pressure: when fuel and rent are tight, the better model of the board wins. Crypto, AI seats, and the whole orbital ledger sit downstream of his idea of computation.</p>
`,ada:`
<p class="pilot-hook"><em>Ada Lovelace — often called the first computer programmer.</em></p>
<p><strong>Ada Lovelace</strong> (Ada King, Countess of Lovelace) worked with Charles Babbage’s Analytical Engine designs in the 1840s. Her notes include what many historians treat as the first published algorithm intended for a machine.</p>
<p>She saw that engines might manipulate symbols, not only numbers — art, music, and general thought. Mainline software and the quantum-era ledger all sit in that lineage.</p>
`,sagan:`
<p class="pilot-hook"><em>Astronomer who brought Cosmos to millions of living rooms.</em></p>
<p><strong>Carl Sagan</strong> made planetary science famous. Through the TV series <em>Cosmos</em>, books, and public talks, he argued that ordinary people could understand stars, evolution, and the fragile Earth.</p>
<p>He is here as a <em>visionary</em>, not a flight-crew callsign: the culture that funded the next launch. Wonder is not soft; it is how orbital economics sells the sky.</p>
`,asimov:`
<p class="pilot-hook"><em>Science-fiction giant — robots, Foundation, and laws of robotics.</em></p>
<p><strong>Isaac Asimov</strong> wrote hundreds of books. Students meet him through robot stories and the <em>Foundation</em> series: big futures, clear rules, and the idea that ideas themselves can shape empires.</p>
<p>His Three Laws of Robotics are classroom shorthand for “design your tools before they design you.” In orbital economics among the planets, contracts and claims play a similar role.</p>
`,clarke:`
<p class="pilot-hook"><em>2001: A Space Odyssey; also predicted geostationary satellites.</em></p>
<p><strong>Arthur C. Clarke</strong> co-created <em>2001</em> and wrote hard science fiction that treated space as engineering, not magic. Years before Sputnik, he described satellites parked in geostationary orbit — the same altitude that now carries much of Earth’s TV and weather data.</p>
<p>Clarke’s lesson for the Mainline: the useful idea often arrives decades before the infrastructure.</p>
`,goddard:`
<p class="pilot-hook"><em>American pioneer of liquid-fuel rockets (ideas, not a flight crew).</em></p>
<p><strong>Robert Goddard</strong> launched the first liquid-fueled rocket in 1926. Newspapers mocked the idea of spaceflight; he kept filing patents and test-firing in New Mexico anyway.</p>
<p>He is on the roster for the <em>physics of leave-burn</em>, not as a “famous astronaut.” Prove the burn, then scale it — that is still the ledger’s problem.</p>
`,"von-braun":`
<p class="pilot-hook"><em>Heavy-lift rocketry that made crewed lunar flight possible.</em></p>
<p><strong>Wernher von Braun</strong> led design work on the Saturn V class of heavy-lift rockets. He also worked on the German V-2 in World War II — history classes rightly treat his career as both engineering triumph and moral hazard.</p>
<p>Kept as an <em>infrastructure</em> callsign (how you get mass off Earth), not a flight-crew hero. Technology that opens the system can begin as a weapon. Orbital economics still has a past.</p>
`};function qs(e){return`
${Vs[e.id]??`<p class="pilot-hook"><em>${e.schoolHook}</em></p><p>Entry pending.</p>`}
<p class="pilot-foot mono">Rocket · ${e.callsign} · see also Rival rockets index</p>
`}function zs(){return{id:"rival-pilots-overview",title:"Overview",html:`
<p>Each AI seat flies a <strong>named rocket</strong> — not a named pilot. Callsigns honor people and ideas behind <strong>number, notation, computation</strong>, and the culture of spaceflight (Civ-style civilopedia).</p>
<p>You name <strong>your</strong> rocket at launch. Rivals draw from this short roster so every opponent has a page you can look up mid-expedition.</p>
<p><strong>No modern astronaut flight crews</strong> as ship names — foundations of the ledger age better. Unused names may still label <strong>transit lanes</strong> later.</p>
<ul class="pilot-index">${et.map(n=>`<li><strong>${n.callsign}</strong> — ${n.schoolHook}</li>`).join("")}</ul>
<p class="hint">Open a rocket entry below in this section.</p>
`}}function Js(){return et.map(e=>({id:`pilot-${e.id}`,title:`Rocket: ${e.callsign}`,html:qs(e)}))}const Xs=`# Changelog

## [1.1.0] — 2026-08-23

Weekly **https://heliopoly.live/** promote at **Sunday 00:01 UTC** (\`2026-08-23T00:01:00.000Z\`).

### Play / UX
- **Best books on the end screen (#136):** the winning story names up to three held claims by ROI — “Best books: Enceladus 236% · Venus 180% · Elon 91%.” Sold / lost / zero-cash-in deeds don’t rank.
- **Rocket dossier:** click any text on a seat in **On the ledger** to open that rocket’s holdings — cash, systems, current rent, and ROI (rent + fuel strikes vs cash in).
- **Remote sell:** sell a claim from the dossier without being on it (half deed, depot scrapped). One sale per turn.
- **Auction:** list a claim to the table at the same half-price reserve. Highest bid wins; depot stays; seller keeps one free landing. Result card lists every bid or pass.
- **Ops Manual** covers dossier / sell / auction; Lab **Economy → Claim ledger / remote sell** for local checks.
- **Game difficulty** (was AI difficulty at Launch). Radios describe expedition length, not brake tactics. Easy: Tesla, Karen, hot-mic royalties, and Error 47 never hit the human; blockchain steal no longer bolts a depot onto a hub.
- **Ledger events, one rocket:** King’s Quest, M&Ms, Strong Bad Email, Belt ice, Tuesday boy, Olbers, and steal prize a **random living rocket that round**, not the lead seat (#135).
- **New pool cards:** Hot microphone (Disney song, 50 + skip), Tuesday boy paradox (park count −1), Error 47 (−2 fuel). Clerk banners in the existing chance-card style.
- **Kostka** is off the round pool: after 5 Earth transits (land or pass), the next Earth landing rolls 30%, then +10% per later landing. The lander gets +200.
- **Tesla copy:** player-facing hit line; targeting notes stay in the Ops Manual, not on the card.

### Meta
- Version **1.1.0** (package, badge, Ops Manual welcome, README)
- **Live window:** Sunday **00:01 UTC** — staged as \`heliopoly-releases/1.1.0\`

## [1.0.0] — 2026-08-16

**First public 1.x** — App Store paperwork / TestFlight prep + weekly **https://heliopoly.live/** promote at **Sunday 00:01 UTC** (\`2026-08-16T00:01:00.000Z\`). Human QA passed on local + iPad.

iOS **MARKETING_VERSION** / web badge / package all **1.0.0** (build number \`CURRENT_PROJECT_VERSION\` = 1).

### Play / UX
- **Rogue Tesla is the Roadster (#109 / #115):** Falcon Heavy payload only. Hits a random owned Jupiter or Saturn claim — not Mars system, not inner system. Stations dodge; planetoid fuel pods do not.
- **Rocket board tokens (#110):** teardrop hull + three swept fins, seat color, gold outline while hopping. Ops Manual legend matches.
- **Gravity Duel box (#117):** panel hugs content (no 88vh Ops Manual frame); dice and High/Low share rows.
- **Ops Manual ledger lore (#112) + voice (#114):** the ledger is the contract book and the history book; Angzarr is post-quantum crypto that still keeps a ledger; last rocket flying is written as one of the greatest of all kind. Manual written for a smart 10–12 year old (pre-1997 game-manual shape, no costume 80s). “Charter alerts” → Ledger events.
- **Gameplay chrome matches the book (#116):** standings **On the ledger**; alerts **Ledger event**; end kicker **Greatest of all kind**; quit / logs / vibe-kick drop “charter.”
- **Ledger event cards (#113):** Chance-card silhouette — clerk art on top, Limelight title, Special Elite body, bronze border, slight tilt. 2:1 banner crops so heads and props stay in frame.
- **Welcome card (#118):** clerk briefing on New game (ledger lore). Launch hides it; setup stays clickable. Sits on the black board, flush with the New game column.
- **iPad palindrome course (#111):** tap Prograde / Retrograde — no confirm. Native shell still implements \`WKUIDelegate\` so Quit \`confirm()\` works; Course/Break rows no longer clip under tablet 44px buttons.
- **Charter alerts (#106 / #107):** expanded chance-card pool — Monolith, M&Ms, King's Quest, **Strong Bad Email → WARP**, Arcadia/Harlock, belt ice, AIL dividend, comet free leave, port holiday; plus **rogue Tesla** (claim+depot destroyed, Mars orbit immune), **Olbers station award**, **Karen skip** (late), **blockchain steal claim+depot**, rare **vibe-code kick** (50% once at round ≥60). Cadence midpoints only on real miss rolls.
- **Duration meter polish (#94):** title **(µ)** only; type slightly smaller than AI difficulty legend; bars hard-clipped so they never cover tick labels (grid columns + opaque tick lane)
- **Board map batch (on \`main\`, live with this promote):** curved Mainline lanes (#99), system ring bands + Rings slider (#101), polar remesh / Belt 1–6 / Homeward (#102)

### Lab
- Eastern Arabic + multi-script **Which is larger?** packs (#81 / #76)

### iPad / tablet
- Viewport zoom lock (#95); iPad mini layout polish (#96)
- Native shell WebDist + marketing version aligned for App Store listing prep (#66)

### Tooling / ops
- Board-previews design tools (#103)
- Droplet **Mode B** stage + Sunday 00:01 UTC promote (#98)

### Cleanup
- Dead code removal (#27)

### Meta
- Version **1.0.0** (package, badge, Ops Manual welcome, README, Xcode \`MARKETING_VERSION\`) — display drops the leading **v** (\`1.0.0\`, not \`v1.0.0\`)
- **Live window:** Sunday **00:01 UTC** — staged as \`heliopoly-releases/1.0.0\` on the droplet

## [0.0.25] — 2026-08-14

### Play / UX
- **AI pack duration meter (#94):** New game setup — estimated charter rounds vs Expert pilot for selected AI pack (density bars; Easy short → Expert ~µ60). Polish: title shortened to **Est. rounds (µ)**, matches AI-difficulty legend type and fieldset height, meter bars kept clear of tick labels
- **Travel lane color (#99):** Mainline lanes locked to cool cyan with thickness at **45% of prior** (0.9px, \`LANE_STROKE_WIDTH\`) so the cyan \`#6ec8ff\` roll/path highlight stays primary

### Cleanup
- **Remove dead code (#27):** unused PRNG file \`rng.ts\` (\`createRng\` / \`roll2d6\` — duplicate of rules engine PRNG), unused \`canAffordLeave\` export in \`fuel.ts\`, \`void isPurchasable\` stub in \`main.ts\`, unused \`name\` param in \`drawStation\`

### Meta
- Version **0.0.25** (badge, package, Ops Manual welcome, README)

## [0.0.24] — 2026-08-14

### Play / UX
- **Curved Mainline lanes (#99):** polar alternate out/in (0.08 / 0.09); path preview follows curves
- **Travel lane color:** cyan Mainline at **45% prior thickness** (0.9px) so roll path highlight stays primary
- **System ring bands (#101):** Saturn→Mercury tinted dashes + radial falloff; Pilot Controls **Rings** slider (default 50%, modest max); thin-rail dual-triangle chrome
- **Board polar layout (#102):** mapper-driven geometry — Homeward on Saturn @57°, Belt **1–6** names, Earth cluster + \`j_b4\` retune

### Tooling
- **Board previews (#103):** \`tools/board-previews/\` — elliptical lanes, ring colors, interactive **board-mapper** (export / agent JSON)

### Lab (on main; ship with live deploy)
- Accordion Lab; multi-script Which is larger? packs (#76 / #81)

### Meta
- Version **0.0.24** (badge, package, Ops Manual welcome, README)

## [0.0.23] — 2026-08-13

### Play / UX
- **Travel lane color:** cool cyan \`rgb(110,200,255)\` so Mainline stays distinct from warm system-ring dashes
- **System ring bands (#101):** stylized Saturn→Mercury dashed tints + radial falloff bands (outer α 0.17 → inner α 0.02); legacy blue underlay α 0.29; travel lanes α 0.74
- **Rings slider:** Pilot Controls title row — retro range control; default **50%** (preferred look); peak (100%) brighter than old full lock; persists; default mid (50%); peak alphas raised so mid is brighter than old full lock

### Meta
- Version **0.0.23**

## [0.0.22] — 2026-08-13

### Play / UX
- **Curved travel lanes (#99):** Mainline edges draw as polar mid-span arcs (outward **0.08** / inward **0.09**, alternating) so the path—especially home to Earth—reads as orbital trajectories, not straight chords; roll path preview follows the same curves
- **Belt spacing (#99):** \`t_mb\` + early belt nodes pulled toward Deimos so the curved Earth-return arc does not overlap belt pips

### Lab / docs (carried from unreleased)
- **Lab menu (#76 structure):** accordion categories; **Which is larger?** packs (Eastern Arabic, Chinese, Korean, Hebrew, Binary); single Gravity Duel; Ops Manual **The Lab**
- **Multi-script compare (#76 / #81):** shared ladder + binary bit-strings

### iPad / tablet (carried from unreleased)
- **Viewport zoom lock (#95)** and **iPad mini layout (#96)**

### Meta
- Version **0.0.22**

## [0.0.21] — 2026-08-13

### Play
- **Feral park curve (#92):** half-gap asymptotic after park 5 (50% → 75% → 87.5% …) instead of double-to-100% at park 6; Ops Manual + startup log copy match

### Tooling
- **Sim Lab polish:** elimination density chart (round axis), seat curves in board rocket colors, max games to 1e6, launch-order win chances, human-vs-pack outcome summary, stale-server detection, win-rate share-of-finished fixes

### Meta
- Version **0.0.21** (badge, package, Ops Manual welcome, README)

## [0.0.20] — 2026-08-11

### Play
- **Remove legacy neglect / care stamps (#54):** feral is parking-only; dropped \`neglectClock\`, \`claimCareRotations\`, \`touchClaim\`, skipper neglect logs, and unused \`FERAL_*\` constants

### UX
- **Animation speed (#10):** Slow / Normal / Fast / Instant in the header; persists in localStorage; scales ship hops, dice rolls, and AI pacing
- **Path preview click-to-land (#15):** after roll, rocket-color range line on the board; click/tap a stop to set break and move; break fuel on path-segment hover (planetoid inspect unchanged); line ~¾ prior thickness after playtest
- **Buy before leave (#88):** claim unowned deed underfoot in \`await_action\` as well as post-land (rent income can fund a later buy)

### Tooling
- **Batch sim harness (#89):** \`npm run sim\` drives live TS core; writes \`sim-results/<run>/{config,games.ndjson,summary}.json\`; experiments (prograde/retrograde/choice/mixed); \`python3 scripts/sim_report.py\`; docs \`scripts/README-sim.md\`
- **Sim HTML report (#90):** \`python3 scripts/sim_html_report.py\` → self-contained \`report.html\` for latest (or chosen) run
- **Sim Lab (#91):** \`npm run sim-lab\` → local web UI (http://127.0.0.1:5174) to run batch scenarios and view results
- **Sim human vs pack skill:** seat 0 \`humanDifficulty\` vs other seats \`packDifficulty\`; Lab shows human win % + plain-language outcome summary; README notes even equal-skill AI tables

### Lab
- **Eastern Arabic compare drill (#81):** Lab literacy minigame (hint, reset, 12-try cap, win recap)

### UX
- **iPad / tablet layout:** smaller map in portrait so Pilot Controls stay on-screen; landscape side-by-side fit; safe-area padding; sticky controls

### iOS (#66 Phase A+)
- Xcode project hygiene: App icons, display name, iPhone+iPad, iOS 17+, shared scheme, PrivacyInfo stub
- Offline **WebDist** game via WKWebView; \`npm run ios:sync\` packages Vite build
- Vite \`base: './'\` for portable assets (web + file bundle)
- **Offline WebDist load:** WKWebView serves the game over \`heliopoly://\` (custom scheme) so ES modules run; \`ios:sync\` still strips Vite \`crossorigin\` for file:// fallback. Fixes empty board + dead buttons (JS never executed under \`file://\`)

### Meta
- Version **0.0.20**

## [0.0.19] — 2026-08-04

### Play
- **Fuel strike attribution (#17):** AI strikes use third-person titles and body (\`Name's depot…\`); never “You've / Your” for non-human seats

### Meta
- Version **0.0.19**

## [0.0.18] — 2026-08-04

### UX
- **Log fills sidebar:** height from bottom of Pilot Controls to bottom of board (pilot stays auto-height so controls don’t clip)

### Meta
- Version **0.0.18**

## [0.0.17] — 2026-08-04

### UX
- **Log panel / pilot layout:** pilot controls auto-height so Course + Break + actions fit

### Meta
- Version **0.0.17**

## [0.0.16] — 2026-08-04

### Play
- **Palindrome course (#47):** palindrome rocket names (e.g. Ada) unlock prograde/retrograde Mainline travel. Facing permanent after first Move; confirm on retrograde; AI can choose. Hidden (no handbook). Earth + gravity wells work both ways.

### Meta
- Version **0.0.16**

## [0.0.15] — 2026-08-04

### Play
- **Fuel depot cash (#45 Option C):** first depot per circuit free; additional planetoid depots cost **10%** of claim price. Hubs never get depots. Cost on button + inspect; free slot resets on Earth circuit complete.

### Meta
- Version **0.0.15**

## [0.0.14] — 2026-08-04

### UX
- **Gravity Duel → Ops Manual (#21):** Rules button (ops icon) on the duel panel opens Gameplay → Gravity Duel without dismissing the duel

### Meta
- Version **0.0.14**

## [0.0.13] — 2026-08-04

### Play
- **Gravity Duel knockback (#48):** loser is shoved **one space back** on the Mainline (plus skip turn + rent waiver). Light landing at new node; no second duel; cannot knock past Earth while already on Earth.

### Ops Manual
- Duel stakes updated for knockback

### Meta
- Version **0.0.13**

## [0.0.12] — 2026-08-04

### UX
- **Gravity Duel dice:** classic pip faces (1–6) instead of plain numbers

### Meta
- Version **0.0.12**

## [0.0.11] — 2026-08-04

### Play
- **King's Quest warp (#39):** timed charter event grants each rocket one warp charge
  - Click any board node (cyan rings) to teleport — no en-route stops/rent/duels
  - Landing effects still apply; AI uses charges when destinations score well
  - Added to once-per-charter event pool (with Monolith + M&Ms)

### Ops Manual
- **Gravity Duel (#67):** full human-friendly rules page — when it fires, Low/High/mixed resolution, stakes, ties, panel tips
- Charter alerts + warp noted in Glossary / turn flow; welcome version badge

### Meta
- Version **0.0.11**

## [0.0.10] — 2026-08-04

### Play
- **Timed charter events (#4):** real pool replaces GitHub teaser
  - **Monolith on Earth's Moon** — each active rocket: one-time **⍼300** on next Earth land or pass
  - **Blue & brown M&Ms** — each active rocket: one free brake (≥1 space) on next seat turn; unused expires end of that turn
  - Cadence unchanged (5 rounds → 50% → midpoint toward 100%)
  - **Each pool event fires at most once per charter** (no re-announce loops)

### Meta
- Version **0.0.10**

## [0.0.9] — 2026-07-29

### UX (locked)
- **Charter standings density (#64):** rocket name links no longer inherit global \`button { min-height: 44px }\`, so name + fuel/claims lines sit tight; **CH₄ / H₂** subscripts restored
- **Layout refinements (#63):** header / pilot controls / log for touch; standings remain dense
- **Favicon** + apple-touch-icon from Ops Manual art
- Default rocket name **Venture** (migrate stored “Captain”)

### Meta
- Version **0.0.9**

## [0.0.8] — 2026-07-29

### Play & economy
- **Earth pay:** land **⍼400** / pass **⍼200**, both **+⍼10** per completed rotation; **+1000** decade bonus at rotation 10/20/30…
- **Resource strikes:** headline copy reads as a win (no “breached”); short player-facing explanation
- **H₂ leak:** only on planet/moon landings; pending leak defers on transit/stations
- Strike headlines conjugate for AI vs human seats

### UX
- **Charter standings** absorbs Rockets list (single roster); New game shares the same sidebar slot
- Top bar: Lab · Ops Manual · **New game** · Quit
- Cleaner **game log** (no engine seed crumbs / AI meta); **Copy** log button
- End screen: eliminated pilots sorted by round then turn
- Tap rocket name → Rival rockets handbook entry

### Gravity Duel
- Result splash on **every** duel (fixed skipped ceremony after first)
- Mirrored UI: opponent left, human right; per-side **High / Low / Roll** with selection highlight

### Ops Manual & lore
- AIL / Angzarr (⍼), Mainline, hub-station lore, feral as software bitrot
- Planetoid civilopedia pages (discovery history / solar energy) (#60)
- Parking/feral docs match live parking model

### Ops & infra
- **Telemetry (#61):** completed games POST log + meta to droplet; HMAC \`player_id\` (no raw IPs); flat files under \`/var/www/heliopoly/logs/\`
- Genesis injection log line for Heliopolis callsign seed funding

### Meta
- Default rocket name **Venture**; version **0.0.8**
- Ops Manual **Project** section: live README + CHANGELOG from repo Markdown

## [0.0.7] — 2026-07-26

### Public release prep

- Repo public: [github.com/diagonalcounty/heliopoly](https://github.com/diagonalcounty/heliopoly)
- Live site messaging + contribute links; duel punchy placeholder invites GitHub suggestions
- Charter alerts: **round**-based cadence (5-round gap, 50% then midpoint toward 100%)
- Lunar range **daily table** for alert RNG seed (third letter × range cm)
- H₂ leaks on **landing** only; leak also **skips next turn** for repair
- Parking feral: cumulative no-move parks; 50% at 5, doubles after
- Station hub rent (railroad-style ×1/×2/×4)
- Rocket names (not pilot names); Rival rockets handbook + icons
- AI difficulty: normal / difficult break behavior
- Gravity Duel result as **in-panel footer** (names stay visible)
- Turn clock (\`gameTurn\`), end-screen exit turns, Lab scenarios
- Ops Manual sections (Lore / Gameplay / Rival rockets) + pixel icons
- Heliopolis callsign cheat: 4× starting cash

## [0.0.6] — 2026-07-21

### Notes

- Board path 0.0.6 systems; feral/depots; play until elimination

## [0.0.5] — 2026-07-21

### Added

- Orbital rings + bodies on ring layout
- Rankings (net worth ⍼) and end-of-turn deltas
- Quit + King’s Quest–inspired end screen
- Setup collapses in-game
- Gravity Duel (dice mini-game on transit)
- Per-roll ephemeris seed

## [0.0.4] — 2026-07-21

### Added

- Ship movement animation
- Shared \`walkMovePath\` for rules + UI

## [0.0.2] — 2026-07-21

### Added

- Currency display \`⍼N\`
- Gravity leave-burns; land free / leave costs fuel
- Propellant CH₄ / H₂
- Heliopoly branding + Helios Ops Manual

## [0.0.1] — 2026-07-21

### Added

- Initial POC: pure TS core, canvas UI, AI, self-play, handbook shell
`,Qs=`# Heliopoly

**Orbital Economics**

A browser game of solar-system property, propellant, and rival rockets. Launch a ship, buy claims from Mercury to the Saturn moons, and stay solvent long enough to be the **last rocket flying**.

**[Play on heliopoly.live](https://heliopoly.live/)** · [Source](https://github.com/diagonalcounty/heliopoly) · MIT · 1.1.0

---

## The pitch

The solar system is open for enterprise. You name a **rocket**, pick **methane or hydrogen**, and compete against AI-flown ships for deeds, depots, and cash on the **AIL (Automated Interplanetary Asset Ledger)**, settled in **Angzarr** (**⍼**).

There is **no turn limit**. You win by eliminating every other rocket — bankruptcy, stranding, or abandonment — not by hitting a round cap.

## How an expedition feels

- **Path** — One circuit: Earth → Venus → Mercury → Mars system → belt → Jupiter → Saturn → home to Earth  
- **Claims** — Buy planets and moons; own a full system and **rent doubles**  
- **Stations** — Elon, Holst, and Daktulios work as major trade hubs and tollbooths: more hubs you own, higher hub rent  
- **Fuel** — Landing is free; **leaving** a gravity well costs propellant. Break spaces off a roll to land short (costs fuel too)  
- **Propellant** — CH₄ is stable. H₂ leaves cheaper but can **leak on landing** (half tanks + a turn to repair). Strike rich ice or methane seas with a fuel depot for a one-time cash windfall  
- **Parking** — Sit still too often and unpatched software causes claims to go **feral** (returning to the bank)  
- **Gravity Duel** — Meet another rocket on a blank lane: secret Low/High, 2d6, winner takes the edge  

In-game **Helios Ops Manual** (top right) has the full rules, glossary (turn / round / rotation), and rival-rocket civilopedia.

## Play

| | |
|--|--|
| **Live** | https://heliopoly.live/ (Sunday 00:01 UTC unlock — #98) |
| **Preview** | https://preview.heliopoly.live/ (next Sunday’s staged game — #134) |
| **Simulation** | https://simulation.heliopoly.live/ (Sim Lab — #91 / #134) |
| **Local** | \`npm install && npm run dev\` → http://localhost:5173/ |

Name your rocket, choose propellant and game difficulty, **Launch**.

## Screenshots / vibe

Pixel Ops Manual art, orbital board, dice duels, Oregon Trail–style ledger alerts. Built for desktop and LAN iPad play (same Vite dev server).

## Stack (brief)

TypeScript + Vite. Pure rules engine in \`src/core/\` (no DOM); canvas shell in \`src/main.ts\`. Static deploy only — no game server.

\`\`\`bash
npm run typecheck
npm run build      # → dist/
npm run selfplay -- 10 4          # quick win counts to stdout
npm run sim -- --games 100        # batch JSON sim (balance / AI / direction)
\`\`\`

### Local Sim Lab & batch balance tools

**Not deployed to heliopoly.live** — Mac/terminal only. Same TypeScript rules engine as production.

\`\`\`bash
# Browser UI: pick experiment, human skill vs AI pack skill, run thousands of games
npm run sim-lab
# → http://127.0.0.1:5174/

# CLI equivalent
npm run sim -- --games 2000 --human-difficulty easy --pack-difficulty expert
python3 scripts/sim_report.py sim-results/<run-folder>
\`\`\`

**What it’s for:** direction experiments (pro/retro), launch-order bias, **which properties yield the highest ROI**, and **human-proxy vs AI pack** skill gaps (easy/normal/hard/expert on the same heuristic scale as the live game).

**Design note:** When every seat uses the **same** AI skill, win rates stay near fair share (~25% in a 4-player game). That evenness is **good** — clone AIs don’t invent a fake first-player monopoly; dice and economy still matter. Use **Human level ≠ AI pack level** when you want “does a novice have a chance against experts?”

Full guide: **[scripts/README-sim.md](scripts/README-sim.md)** · issues [#89](https://github.com/diagonalcounty/heliopoly/issues/89) · [#91](https://github.com/diagonalcounty/heliopoly/issues/91) · [#127](https://github.com/diagonalcounty/heliopoly/issues/127).

### Board look previews (static HTML)

- **Duration meter (#94):** [tools/board-previews/difficulty-duration.html](tools/board-previews/difficulty-duration.html)

Design sandboxes for map paint (not served by the game or .live). Open in a browser:

- [tools/board-previews/elliptical-lanes.html](tools/board-previews/elliptical-lanes.html) — curved Mainline (#99)
- [tools/board-previews/ring-colors.html](tools/board-previews/ring-colors.html) — system ring bands (#101)

\`\`\`bash
open tools/board-previews/ring-colors.html
# after board geometry / constant changes:
node --import tsx tools/board-previews/generate.ts
\`\`\`

See [tools/board-previews/README.md](tools/board-previews/README.md).
`,Zs=`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Heliopoly Privacy Policy</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0b1020;
        --text: #e8eef8;
        --muted: #9aa8c7;
        --accent: #ffc857;
        --link: #6ec8ff;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: var(--bg);
        color: var(--text);
        line-height: 1.55;
      }
      main {
        max-width: 40rem;
        margin: 0 auto;
        padding: 2rem 1.25rem 4rem;
      }
      h1 {
        font-size: 1.75rem;
        color: var(--accent);
        letter-spacing: 0.04em;
        margin-bottom: 0.25rem;
      }
      .sub {
        color: var(--muted);
        margin-bottom: 2rem;
      }
      h2 {
        font-size: 1.1rem;
        margin-top: 1.75rem;
        color: var(--accent);
      }
      a {
        color: var(--link);
      }
      ul {
        padding-left: 1.2rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Heliopoly Privacy Policy</h1>
      <p class="sub">Last updated: 14 August 2026 · Orbital Economics</p>

      <p>
        Heliopoly is a single-device strategy game available on the web at
        <a href="https://heliopoly.live/">heliopoly.live</a> and as a native
        iPad app. This policy explains what data we handle.
      </p>

      <h2>Summary</h2>
      <ul>
        <li>No accounts or sign-in.</li>
        <li>No advertising SDKs and no sale of personal data.</li>
        <li>
          The iPad app plays fully offline from content bundled in the app.
        </li>
        <li>
          Game progress lives on your device (browser storage or app storage).
        </li>
      </ul>

      <h2>Native iPad app</h2>
      <p>
        The App Store build loads a packaged offline game. It does not require
        a network connection to play. We do not collect personal information
        through the native app for analytics, advertising, or tracking.
      </p>

      <h2>Website (heliopoly.live)</h2>
      <p>
        The browser game runs in your browser. Local game state may be stored
        on your device (for example localStorage) so a session can continue.
        Standard web server logs (IP address, user agent, timestamps) may be
        recorded by the host for security and operations.
      </p>
      <p>
        Optional, anonymous game-end telemetry may be sent to our servers when
        enabled on the web product. That data is used to improve balance and
        reliability. It is not used to identify you across apps or websites for
        advertising, and it is not sold.
      </p>

      <h2>Children</h2>
      <p>
        Heliopoly is a general-audience strategy game. We do not knowingly
        collect personal information from children.
      </p>

      <h2>Open source</h2>
      <p>
        Our code is fully open source (MIT) and available to audit at
        <a href="https://github.com/diagonalcounty/heliopoly"
          >https://github.com/diagonalcounty/heliopoly</a
        >. Anyone can inspect how the game works and what the web client sends
        when optional telemetry is enabled.
      </p>

      <h2>Third parties</h2>
      <p>
        Source hosting is on GitHub
        (<a href="https://github.com/diagonalcounty/heliopoly"
          >diagonalcounty/heliopoly</a
        >). Visiting GitHub or Apple’s App Store is governed by those services’
        own policies.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or the app: open an issue at
        <a href="https://github.com/diagonalcounty/heliopoly/issues"
          >github.com/diagonalcounty/heliopoly/issues</a
        >.
      </p>

      <h2>Changes</h2>
      <p>
        If our practices change (for example if the native app later enables
        optional telemetry), we will update this page and the App Store privacy
        labels before shipping that change.
      </p>

      <p class="sub">
        <a href="https://heliopoly.live/">← Back to Heliopoly</a>
      </p>
    </main>
  </body>
</html>
\`\`\``;function At(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function qe(e){let n=At(e);return n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>'),n=n.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),n=n.replace(/__([^_]+)__/g,"<strong>$1</strong>"),n=n.replace(new RegExp("(?<!\\*)\\*([^*]+)\\*(?!\\*)","g"),"<em>$1</em>"),n=n.replace(new RegExp("(?<!_)_([^_]+)_(?!_)","g"),"<em>$1</em>"),n}function el(e){const n=e.replace(/\r\n/g,`
`).split(`
`),t=[];let o=0,r=!1,a=[],i=null,s=!1,l=[];const c=()=>{i&&(t.push(i==="ul"?"</ul>":"</ol>"),i=null)},p=()=>{l.length&&(t.push('<table class="glossary">'),l.forEach((m,h)=>{const E=h===0?"th":"td";t.push(`<tr>${m.map(b=>`<${E}>${qe(b.trim())}</${E}>`).join("")}</tr>`)}),t.push("</table>"),l=[],s=!1)};for(;o<n.length;){const m=n[o];if(m.startsWith("```")){c(),p(),r?(t.push(`<pre class="md-pre"><code>${At(a.join(`
`))}</code></pre>`),r=!1,a=[]):(r=!0,a=[]),o++;continue}if(r){a.push(m),o++;continue}if(m.trim().startsWith("|")&&m.trim().endsWith("|")){c();const f=m.trim().slice(1,-1).split("|").map(S=>S.trim());if(/^[\s|:-]+$/.test(m)){o++;continue}s=!0,l.push(f),o++;continue}else s&&p();if(/^---+\s*$/.test(m.trim())||/^\*\*\*+\s*$/.test(m.trim())){c(),t.push("<hr/>"),o++;continue}const h=/^(#{1,4})\s+(.+)$/.exec(m);if(h){c();const f=h[1].length;t.push(`<h${f}>${qe(h[2])}</h${f}>`),o++;continue}const E=/^[-*+]\s+(.+)$/.exec(m);if(E){i!=="ul"&&(c(),t.push("<ul>"),i="ul"),t.push(`<li>${qe(E[1])}</li>`),o++;continue}const b=/^(\d+)\.\s+(.+)$/.exec(m);if(b){i!=="ol"&&(c(),t.push("<ol>"),i="ol"),t.push(`<li>${qe(b[2])}</li>`),o++;continue}if(m.trim()===""){c(),o++;continue}c();const u=[m];for(o++;o<n.length&&n[o].trim()!==""&&!/^#{1,4}\s/.test(n[o])&&!/^[-*+]\s/.test(n[o])&&!/^\d+\.\s/.test(n[o])&&!n[o].startsWith("```")&&!n[o].trim().startsWith("|");)u.push(n[o]),o++;t.push(`<p>${qe(u.join(" "))}</p>`)}return c(),p(),r&&t.push(`<pre class="md-pre"><code>${At(a.join(`
`))}</code></pre>`),`<div class="md-doc">${t.join(`
`)}</div>`}function Ao(e,n,t){return{id:e,title:n,html:el(t)}}function nl(e,n,t){const r=(t.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]??t).replace(/<p class="sub">\s*<a href="https:\/\/heliopoly\.live\/">[\s\S]*?<\/p>/,"").replace(/<a href="(https?:[^"]+)"([^>]*)>/gi,(a,i,s)=>/target\s*=/i.test(s)?`<a href="${i}"${s}>`:`<a href="${i}" target="_blank" rel="noopener"${s}>`).trim();return{id:e,title:n,html:r}}function tl(){return{id:"project-docs",title:"Project",topics:[Ao("readme","README",Qs),Ao("changelog","CHANGELOG",Xs),nl("privacy","Privacy",Zs)]}}const Ar=[{id:"earth",name:"Earth",kind:"planet",system:"Terran"},{id:"venus",name:"Venus",kind:"planet",system:"Venus"},{id:"mercury",name:"Mercury",kind:"planet",system:"Mercury"},{id:"elon",name:"Elon",kind:"station",system:"Mars"},{id:"mars",name:"Mars",kind:"planet",system:"Mars"},{id:"phobos",name:"Phobos",kind:"moon",system:"Mars"},{id:"deimos",name:"Deimos",kind:"moon",system:"Mars"},{id:"holst",name:"Holst Space Station",kind:"station",system:"Jupiter"},{id:"io",name:"Io",kind:"moon",system:"Jupiter"},{id:"europa",name:"Europa",kind:"moon",system:"Jupiter"},{id:"ganymede",name:"Ganymede",kind:"moon",system:"Jupiter"},{id:"callisto",name:"Callisto",kind:"moon",system:"Jupiter"},{id:"daktulios",name:"Daktulios",kind:"station",system:"Saturn"},{id:"titan",name:"Titan",kind:"moon",system:"Saturn"},{id:"enceladus",name:"Enceladus",kind:"moon",system:"Saturn"},{id:"iapetus",name:"Iapetus",kind:"moon",system:"Saturn"},{id:"mimas",name:"Mimas",kind:"moon",system:"Saturn"},{id:"rhea",name:"Rhea",kind:"moon",system:"Saturn"},{id:"dione",name:"Dione",kind:"moon",system:"Saturn"},{id:"tethys",name:"Tethys",kind:"moon",system:"Saturn"}],Lr={earth:{hook:"Homeworld — third rock from the Sun.",discovered:"Always known",discoverer:"—",distanceAu:"1.000",insolation:"~1 361",insolationEarth:"1.00×",body:`
<p>Earth is the ledger's home dock. No deed changes hands here — the homeworld is the starting gate and the only resupply point for every rocket on the Mainline. Its gravity well (class 3) demands expensive leave burns, but every full circuit home pays ledger cash and fresh depots.</p>
<p>The <strong>solar constant</strong> at Earth's orbit defines the unit: ~1 361 W/m² at 1 AU. All other insolation figures on this page are ratios against this baseline. Earth's atmosphere and magnetic field make it the most habitable body in the system — which is why expeditions start here and never buy the planet.</p>`},venus:{hook:"Twin of Earth — identical size, lethal atmosphere.",discovered:"Prehistoric (ancient observed as Morning/Evening Star)",discoverer:"Known to Sumerians ~3000 BCE; first probe: Mariner 2 (1962)",distanceAu:"0.723",insolation:"~2 605",insolationEarth:"1.91×",body:`
<p><strong>Venus</strong> is the hottest planet in the system despite being farther from the Sun than Mercury. A runaway greenhouse atmosphere of CO₂ at 92 bar surface pressure cooks the surface to 462 °C. Venus is valuable real estate for <strong>orbital refineries</strong> — close to the Sun, short transit time to Earth, and enough solar flux to power industrial batch processing.</p>
<p><strong>Insolation:</strong> ~2 605 W/m² (1.91× Earth). Solar panels here produce almost twice the power per square meter as Earth orbit, making Venus stations attractive for energy-intensive propellant cracking.</p>`},mercury:{hook:"Innermost planet — a scorched, airless rock.",discovered:"Prehistoric (ancient observed as morning/evening object)",discoverer:"Known to Sumerians ~3000 BCE; first probe: Mariner 10 (1974)",distanceAu:"0.387",insolation:"~9 086",insolationEarth:"6.67×",body:`
<p><strong>Mercury</strong> orbits the Sun every 88 days at 0.387 AU — the innermost deed on the board. Without atmosphere, its surface swings from −180 °C at night to 430 °C in daytime. The <strong>Caloris Basin</strong>, a 1 550 km impact crater, marks the hottest longitude.</p>
<p><strong>Insolation:</strong> ~9 086 W/m² (6.67× Earth). Any pilot who lands here bathes in nearly seven times Earth's sunlight. The solar flux makes Mercury an ideal location for <strong>power-beaming</strong> and orbital smelters, but the gravity well (class 2) and extreme thermal cycling mean only well-funded operations survive.</p>`},elon:{hook:"Mars-orbit hub — gateway to the outer system.",discovered:"Built 2038–2041 (first commercial orbital habitat at Mars)",discoverer:"Multiple private consortiums led by Heliopolis Ventures",distanceAu:"1.524",insolation:"~586",insolationEarth:"0.43×",body:`
<p><strong>Elon</strong> is not a natural body but a <strong>station hub</strong> in Mars orbit, named for the era that crashed per-kilogram launch cost and made commercial solar access imaginable. It serves as the first deep-space refueling and trade stop after the inner planets — a refining choke point where ice from Mars's moons is processed into propellant.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Solar arrays at Mars orbit capture less than half the light available near Earth. Station operations rely on a mix of local solar and regular fuel-ship deliveries from the inner system.</p>`},mars:{hook:"The Red Planet — the first major colony frontier.",discovered:"Prehistoric (ancient observed as wandering star)",discoverer:"Known to Egyptians ~2000 BCE; first probe: Mariner 4 (1965)",distanceAu:"1.524",insolation:"~586",insolationEarth:"0.43×",body:`
<p><strong>Mars</strong> is the largest solid body beyond Earth and the centerpiece of the Mars system monopoly (Elon + Mars + Phobos + Deimos). Its thin CO₂ atmosphere (0.6% of Earth's pressure), rusted regolith, and extinct volcano <strong>Olympus Mons</strong> (21.9 km — nearly three Everests) make it the most studied planet after Earth.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Mars receives less than half the solar energy of Earth. Combined with its moderate gravity well (class 2), it demands careful leave-burn planning — but its ice and potential hydrogen strikes make it a lucrative deed.</p>`},phobos:{hook:"Mars's inner moon — a captured asteroid.",discovered:"1877",discoverer:"Asaph Hall (US Naval Observatory)",distanceAu:"1.524",insolation:"~586",insolationEarth:"0.43×",body:`
<p><strong>Phobos</strong> is the larger of Mars's two moons (27 × 22 × 18 km), an irregular lump that orbits just 6 000 km above the Martian surface — the closest moon to its planet in the system. It completes an orbit in 7.7 hours, rising and setting twice per Martian day. Its low gravity (class 1) makes it an easy departure point.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth — same as Mars). Phobos shares Mars's distance from the Sun. Its value to a pilot is low purchase price and minimal leave fuel, not solar harvest.</p>`},deimos:{hook:"Mars's outer moon — a quieter, more distant rock.",discovered:"1877",discoverer:"Asaph Hall (US Naval Observatory)",distanceAu:"1.524",insolation:"~586",insolationEarth:"0.43×",body:`
<p><strong>Deimos</strong> (15 × 12 × 11 km) orbits Mars at 23 500 km, about four times farther out than Phobos. Both moons were likely <strong>captured D-type asteroids</strong> from the outer belt. Deimos has a smoother surface than Phobos because its more distant orbit collects less impact ejecta from Mars.</p>
<p><strong>Insolation:</strong> ~586 W/m² (0.43× Earth). Like Phobos, its solar flux matches Mars orbit. The twin moons form the cheapest deeds in the Mars system, useful for blocking opponents from monopoly.</p>`},holst:{hook:"Jupiter-orbit station — the chemical refinery of the system.",discovered:"Built 2044–2049 (international consortium)",discoverer:"Jupiter Operations Group (ESA, CNSA, Heliopolis)",distanceAu:"5.200",insolation:"~50",insolationEarth:"0.037×",body:`
<p><strong>Holst Space Station</strong> hangs in Jupiter orbit, named for Gustav Holst (1874–1934), whose orchestral suite <em>The Planets</em> gave Jupiter a cultural presence long before industry arrived. The station is the outer system's primary <strong>chemical refinery</strong> — ice from Callisto and Ganymede is processed here into hydrogen and oxygen for the long haul to Saturn and back.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). At 5.2 AU, sunlight is a dim glow. Holst relies on <strong>nuclear reactors</strong> and periodic fuel-ship deliveries rather than solar panels for its industrial power.</p>`},io:{hook:"The most volcanically active body in the system.",discovered:"1610",discoverer:"Galileo Galilei",distanceAu:"5.200",insolation:"~50",insolationEarth:"0.037×",body:`
<p><strong>Io</strong> is the innermost of Jupiter's four Galilean moons, slightly larger than Earth's Moon. Tidal flexing from Jupiter's immense gravity keeps its interior molten — over <strong>400 active volcanoes</strong> constantly resurface the moon with sulfur and silicate lava. The surface is colored in patchwork yellows, reds, and greens from allotropes of sulfur.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). The same dim light as all Jupiter bodies. But Io's volcanic heat makes it geologically rich — <strong>hydrogen strikes</strong> are possible here.</p>`},europa:{hook:"Ice moon with a subsurface ocean — the best hope for life.",discovered:"1610",discoverer:"Galileo Galilei",distanceAu:"5.200",insolation:"~50",insolationEarth:"0.037×",body:`
<p><strong>Europa</strong> is the smoothest solid body in the system — a global crust of water ice crisscrossed by dark fractures, hiding a <strong>liquid saltwater ocean</strong> 60–150 km deep under 15–25 km of ice. Tidal heating keeps the ocean liquid. Europa is a target for both astrobiology and <strong>ice mining</strong> — water is propellant mass waiting to be processed.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Its surface temperature never rises above −160 °C. Despite the cold, <strong>hydrogen strikes</strong> are possible here — the ice ocean is a resource asset.</p>`},ganymede:{hook:"The largest moon in the system — bigger than Mercury.",discovered:"1610",discoverer:"Galileo Galilei",distanceAu:"5.200",insolation:"~50",insolationEarth:"0.037×",body:`
<p><strong>Ganymede</strong> (5 268 km diameter) is the ninth-largest object in the system — larger than Pluto and Mercury. It is the only moon known to generate its own <strong>magnetic field</strong>, likely from a liquid iron core. A fractured ice crust covers a subsurface ocean, layered between two or more ice phases.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Ganymede is useful as a high-rent deed (⍼90) in the Jupiter system monopoly. Its size and magnetic field make it a candidate for permanent research habitats.</p>`},callisto:{hook:"The outermost Galilean moon — a cratered relic.",discovered:"1610",discoverer:"Galileo Galilei",distanceAu:"5.200",insolation:"~50",insolationEarth:"0.037×",body:`
<p><strong>Callisto</strong> is the most distant of Jupiter's large moons (1.9 million km from Jupiter's center). Its surface is the oldest in the system — <strong>ancient cratered ice</strong> with no signs of volcanic or tectonic resurfacing. The <strong>Valhalla</strong> multi-ring basin (4 000 km across) dominates the trailing hemisphere.</p>
<p><strong>Insolation:</strong> ~50 W/m² (0.037× Earth). Callisto's low rent (⍼75) makes it an affordable entry point into the Jupiter system. Its stable, radiation-quiet orbit is attractive for long-term infrastructure.</p>`},daktulios:{hook:"Saturn-orbit hub — the ring-station transit port.",discovered:"Built 2051–2056 (Heliopolis-led consortium)",discoverer:"Saturn Operations Group (Heliopolis, JAXA, Roscosmos)",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Daktulios</strong> (from the Greek <em>daktylios</em> — “ring”) is the outermost station hub, anchored in Saturn's system. Where Holst refines ice from Jupiter's moons, Daktulios warehouses and transships volatiles from Saturn's rich moon system — especially Titan's methane seas and Enceladus's cryovolcanic plumes.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). At 9.5 AU, sunlight is barely brighter than a full moon on Earth. All station power comes from <strong>nuclear fission</strong> and orbital fuel deliveries. The station's remote location makes it the most expensive deed on the board (⍼800).</p>`},titan:{hook:"Saturn's largest moon — a world with weather and seas.",discovered:"1655",discoverer:"Christiaan Huygens",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Titan</strong> (5 150 km diameter) is the second-largest moon in the system after Ganymede. It is the only moon with a <strong>thick atmosphere</strong> (1.5 bar, mostly N₂ with methane clouds) and stable surface liquids — methane and ethane rivers, lakes, and seas in the polar regions. The Huygens probe landed there in 2005, revealing a cold world with drainage channels and rounded ice pebbles.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Titan's thick haze blocks most of the already-dim sunlight. But its <strong>methane seas</strong> make it a premier resource strike location — claim + depot here can trigger a methane gusher worth ⍼2 500.</p>`},enceladus:{hook:"Ice moon with cryovolcanic plumes — water from the deep.",discovered:"1789",discoverer:"William Herschel",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Enceladus</strong> (504 km diameter) is one of the brightest objects in the system — its fresh ice surface reflects nearly 100% of incoming sunlight. The Cassini probe discovered <strong>cryovolcanic plumes</strong> erupting from the south polar region, fed by a subsurface liquid water ocean under 30–40 km of ice.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Despite its tiny size and remoteness, Enceladus is one of the most valuable resource nodes on the board: it qualifies for <strong>both methane and hydrogen strikes</strong>, the only body on the board with dual gusher eligibility.</p>`},iapetus:{hook:"Saturn's two-toned moon — a walnut in the sky.",discovered:"1671",discoverer:"Giovanni Domenico Cassini",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Iapetus</strong> (1 469 km diameter) is famous for its dramatic <strong>two-tone coloration</strong>: the leading hemisphere is dark as asphalt (albedo 0.03–0.05) while the trailing hemisphere is bright ice (albedo ~0.6). Cassini himself observed that he could only see Iapetus on one side of Saturn. The dark material is likely lag deposit from sublimating ice, coated with organic tholins.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Iapetus orbits at 3.5 million km from Saturn — the most distant large moon in the system. Its moderate rent (⍼50) makes it a mid-tier Saturn deed.</p>`},mimas:{hook:"The Death Star moon — a 139 km impact scar.",discovered:"1789",discoverer:"William Herschel",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Mimas</strong> (396 km diameter) is the smallest round moon in the system. Its distinguishing feature is the <strong>Herschel Crater</strong> (139 km wide — nearly a third of the moon's diameter), giving it a striking resemblance to a certain fictional space station. The impact that formed it nearly shattered Mimas; fracture lines (chasms) run across the opposite hemisphere.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Mimas is the cheapest deed in the Saturn system (⍼280). Its low gravity (class 1) makes leave burns trivial — useful as a budget claim.</p>`},rhea:{hook:"Saturn's second-largest moon — a dirty snowball.",discovered:"1672",discoverer:"Giovanni Domenico Cassini",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Rhea</strong> (1 527 km diameter) is Saturn's second-largest moon after Titan. It is mostly water ice with a small rocky core. In 2010, the Cassini mission found evidence of a <strong>tenuous oxygen–carbon dioxide atmosphere</strong> — the first detection of an O₂ atmosphere on an icy moon. Rhea may also have a faint ring system of its own, the only moon known to do so.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Rhea carries the highest rent (⍼60) among Saturn's non-Titan moons, reflecting its size and resource potential.</p>`},dione:{hook:"Saturn's fourth-largest moon — tectonics and traces.",discovered:"1684",discoverer:"Giovanni Domenico Cassini",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Dione</strong> (1 123 km diameter) orbits at 377 000 km from Saturn, with a density suggesting roughly equal parts water ice and rock. Its surface includes both heavily cratered terrain and bright ice cliffs (wispy terrains), indicating past tectonic activity. Cassini flybys detected a <strong>tenuous exosphere</strong> of molecular oxygen, likely from radiation splitting surface ice.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). At ⍼55 rent, Dione is a solid mid-tier Saturn deed.</p>`},tethys:{hook:"Saturn's icy moon with a giant canyon.",discovered:"1684",discoverer:"Giovanni Domenico Cassini",distanceAu:"9.500",insolation:"~15",insolationEarth:"0.011×",body:`
<p><strong>Tethys</strong> (1 062 km diameter) is dominated by two immense features: the <strong>Odysseus Crater</strong> (445 km — so large the impact's central peak is gone because the crust relaxed) and <strong>Ithaca Chasma</strong>, a 2 000 km-long canyon running nearly three-quarters of the moon's circumference. Both features suggest Tethys was once warmer and more geologically active.</p>
<p><strong>Insolation:</strong> ~15 W/m² (0.011× Earth). Tethys closes the Saturn system at ⍼48 rent — the last purchasable body before the Homeward lane returns pilots to Earth.</p>`}};function ol(e,n){return`
<p class="pilot-hook"><em>${n.hook}</em></p>
<table class="body-data">
  <tr><th>Discovery</th><td>${n.discovered}${n.discoverer!=="—"?` · ${n.discoverer}`:""}</td></tr>
  <tr><th>System</th><td>${e.system}</td></tr>
  <tr><th>Distance from Sun</th><td>${n.distanceAu} AU</td></tr>
  <tr><th>Solar insolation</th><td>${n.insolation} W/m² (${n.insolationEarth} Earth)</td></tr>
</table>
${n.body}
<p class="pilot-foot mono">${e.kind.charAt(0).toUpperCase()+e.kind.slice(1)} · ${e.system} system · see also The Mainline</p>
`}function rl(){return{id:"planetoids-overview",title:"Overview",html:`
<p>Every <strong>body on the Mainline</strong> has a page. First, why you care. Then, if you want it, the numbers (distance, sunlight).</p>
<p>Bodies are listed in <strong>board order</strong>. Each entry notes:</p>
<ul>
  <li>Discovery date and discoverer</li>
  <li>Distance from the Sun (AU)</li>
  <li>Sunlight (W/m² and × Earth)</li>
  <li>Why it matters on the ledger</li>
</ul>
<p class="hint">Open a body entry below to read its full article.</p>
<ul class="pilot-index">${Ar.map(n=>{const t=n.kind.charAt(0).toUpperCase()+n.kind.slice(1),o=Lr[n.id];return`<li><strong>${n.name}</strong> — ${t} · ${n.system} system · ${o?.insolation??"—"}</li>`}).join("")}</ul>
`}}function al(){return Ar.map(e=>{const n=Lr[e.id];return{id:`body-${e.id}`,title:e.name,html:ol(e,n)}})}const il=[{id:"welcome",title:"Read this first",html:`
<p><strong>Heliopoly</strong> — <em>Orbital Economics</em> (1.1.0).</p>
<p>You fly a rocket. You buy claims. You try not to go broke.</p>
<p>Every buy, every rent, every duel is written to the <strong>ledger</strong>. The ledger is the official book of the Mainline. It is a contract book. It is also a history book.</p>
<p>When you are the last rocket flying, the ledger writes your name as one of the <strong>greatest of all kind</strong>.</p>
<p>There is no timer. Last rocket flying wins.</p>
<p>Source: <a href="https://github.com/diagonalcounty/heliopoly" target="_blank" rel="noopener">github.com/diagonalcounty/heliopoly</a>.</p>
<p>Close this manual with <kbd>Esc</kbd>, <strong>✕</strong>, or the dim backdrop.</p>
`},{id:"ledger",title:"The ledger & Angzarr (⍼)",html:`
<p>On old Earth, people kept public <strong>ledgers</strong> — books of who paid whom. <strong>Ethereum</strong> was one of those books. It stored transactions.</p>
<p>Then quantum computers learned to break those books.</p>
<p>Money on the Mainline is <strong>Angzarr</strong>. You see it as <strong>⍼</strong> in front of the number (like ⍼150). Angzarr is <em>post-quantum</em> crypto: new math those machines cannot crack. It still keeps a <strong>ledger</strong>.</p>
<p>The book itself is the <strong>AIL</strong> — Automated Interplanetary Asset Ledger. The AIL writes down two kinds of truth:</p>
<ol>
  <li><strong>Contracts</strong> — who owns which world, who is owed rent, who paid for fuel.</li>
  <li><strong>History</strong> — every expedition, every crash, every name that lasted.</li>
</ol>
<p>Nothing on the board counts until the ledger says so. If the ledger drops your deed, the claim goes back to the bank.</p>
<p>Start cash is not a glitch. It is your first line in the book — a funded launch.</p>
`},{id:"path",title:"The Mainline",html:`
<p>Rockets fly one path. That path is the <strong>Mainline</strong>. You do not pick a shortcut.</p>
<p>The circuit:</p>
<ol>
  <li><strong>Earth</strong> → Venus → Mercury</li>
  <li><strong>Mars system</strong> — Elon → Mars → Phobos → Deimos</li>
  <li><strong>Asteroid belt</strong> — blank transit lanes (Gravity Duel country)</li>
  <li><strong>Jupiter</strong> — Holst Space Station + Io, Europa, Ganymede, Callisto + blanks</li>
  <li><strong>Saturn</strong> — Daktulios + Titan, Enceladus, Iapetus, Mimas, Rhea, Dione, Tethys + blanks</li>
  <li>Homeward → <strong>Earth</strong></li>
</ol>
<p>One full loop home is a <strong>rotation</strong>.</p>
<p>Blank lanes cost no leave fuel. They are not safe. Another rocket already there means a <strong>Gravity Duel</strong>.</p>
`},{id:"stations-lore",title:"Hub stations",html:`
<p><strong>Elon</strong>, <strong>Holst</strong>, and <strong>Daktulios</strong> are stations, not worlds. They sit off the heavy wells. Ice and ore go through them. Own the hubs and you own the tollbooths.</p>
<p>Stations can move. That is why a rogue Tesla never hits them. A fuel pod on a moon cannot move.</p>
<ul>
  <li><strong>Elon (Mars)</strong> — named for the era that crashed per-kilogram launch cost and made commercial solar access imaginable.</li>
  <li><strong>Holst (Jupiter)</strong> — after Gustav Holst; <em>The Planets</em> gave Jupiter a cultural boom long before a station hung in its sky.</li>
  <li><strong>Daktulios (Saturn)</strong> — from the Greek for “ring”: the ring-station transit hub anchored in Saturn’s system.</li>
</ul>
<p>Own <strong>2</strong> hubs → hub rent <strong>×2</strong>. Own all <strong>3</strong> → hub rent <strong>×4</strong>. That stacks with a system monopoly.</p>
`}],sl=[{id:"how-to-win",title:"How to win",html:`
<p><strong>Last rocket flying wins.</strong> The others go bankrupt, get stranded, or quit.</p>
<p>The ledger then writes your name into its history as one of the <strong>greatest of all kind</strong>.</p>
<p>There is no round limit. There is no “enough money.” Last one standing is the record.</p>
<p>When a rocket leaves, its deeds go back to the <strong>bank</strong>. Fuel depots on those deeds are gone.</p>
<p>See <strong>Glossary</strong> for <em>turn</em>, <em>round</em>, and <em>rotation</em>. Ledger events use <strong>rounds</strong>. Full list: <strong>Ledger events</strong>.</p>
`},{id:"glossary",title:"Glossary",html:`
<p>Words we use the same way every time:</p>
<table class="glossary">
  <thead><tr><th>Term</th><th>Meaning</th><th>In code / UI</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Turn</strong></td>
      <td>One rocket’s seat at the table: from becoming current through end turn (roll + move, or skip, or park). Skipped seats still count as a turn for the seat clock.</td>
      <td><code>gameTurn</code> · “Turn N” in the log</td>
    </tr>
    <tr>
      <td><strong>Round</strong></td>
      <td>Everyone has had a seat turn — a full pass through the player order (including skips / parks).</td>
      <td><code>round</code> · “Round N” in the log</td>
    </tr>
    <tr>
      <td><strong>Rotation</strong></td>
      <td>One rocket completes a full circuit of the board path (leaves Earth and returns). Personal to that rocket.</td>
      <td>Circuit complete log · <code>boardRotations</code> (global count of circuits finished)</td>
    </tr>
    <tr>
      <td><strong>Park</strong></td>
      <td>A seat turn where that rocket does <em>not</em> move (camp, full break, failed leave, duel skip). Cumulative park count drives feral risk.</td>
      <td><code>parkCount</code></td>
    </tr>
    <tr>
      <td><strong>Ledger event</strong></td>
      <td>A timed popup that the ledger writes mid-game. Fires on <em>round</em> boundaries. See <strong>Ledger events</strong>.</td>
      <td>Ledger event card · log lines</td>
    </tr>
    <tr>
      <td><strong>Warp</strong></td>
      <td>Board-wide teleport charge: instead of rolling, click any beacon. No en-route stops, rent, or duels; landing rules still apply at the destination.</td>
      <td>Warp charges · King’s Quest / Strong Bad Email alerts</td>
    </tr>
  </tbody>
</table>
`},{id:"ledger-alerts",title:"Ledger events",html:`
<p>The ledger sometimes writes a surprise. These are <strong>ledger events</strong> — popups that break up the grind. They fire on <strong>round</strong> boundaries, not every seat turn. Each type fires <strong>at most once</strong> per expedition.</p>

<h3>Cadence (standard pool)</h3>
<ol>
  <li>Wait <strong>5 rounds</strong> after game start or after the last alert fires.</li>
  <li>Then each round rolls <strong>50%</strong> to fire; each <em>real</em> miss moves the chance halfway toward 100% (50% → 75% → 87.5% …).</li>
  <li>On fire, wait 5 rounds again. Open popups do not burn midpoints without a roll.</li>
</ol>
<p><strong>Who</strong> is not always the whole table. The table below is the live rule. <strong>Insight</strong> never lets a − event hit the human seat (Tesla and Karen only land on AI).</p>

<h3>Standard pool</h3>
<table class="glossary">
  <thead><tr><th>Alert</th><th>Tone</th><th>Trigger</th><th>Who</th><th>Effect</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Monolith on Earth’s Moon</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>One-time <strong>⍼300</strong> on that rocket’s <em>next</em> Earth land or pass.</td>
    </tr>
    <tr>
      <td><strong>Blue and brown M&amp;Ms are back</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>One <strong>free brake</strong> on that rocket’s next seat turn (unused token expires end of the turn).</td>
    </tr>
    <tr>
      <td><strong>King’s Quest speed-run record</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 warp charge</strong> (click any beacon instead of rolling). Landing rules still apply where they arrive.</td>
    </tr>
    <tr>
      <td><strong>Strong Bad answers your email</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>Same warp as King’s Quest (separate card — both can fire in one expedition).</td>
    </tr>
    <tr>
      <td><strong>Arcadia on the Mainline</strong> (Captain Harlock)</td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+4 fuel</strong> (capped at tank max).</td>
    </tr>
    <tr>
      <td><strong>Belt ice survey</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td><strong>+1 fuel depot</strong> in hand.</td>
    </tr>
    <tr>
      <td><strong>Quantum ledger dividend</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td><strong>+⍼250</strong> cash now.</td>
    </tr>
    <tr>
      <td><strong>Comet dust trail</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Next <strong>leave burn</strong> from a gravity well costs <strong>0 fuel</strong> once.</td>
    </tr>
    <tr>
      <td><strong>Port authority holiday</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>Every active rocket</td>
      <td>Next <strong>rent that rocket would pay</strong> is waived once.</td>
    </tr>
    <tr>
      <td><strong>Rogue Tesla Roadster</strong></td>
      <td>−</td>
      <td>Pool, only if a Jupiter or Saturn planetoid is owned (not hubs, not Mars, not inner system). Insight: only AI-owned planetoids count.</td>
      <td>One random matching owner</td>
      <td>That deed is gone, and any fuel depot on it.</td>
    </tr>
    <tr>
      <td><strong>Olbers’ paradox, Netflix optional</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round (chooser)</td>
      <td>Chooser warps to a station hub (Elon · Holst · Daktulios — not Earth) and collects <strong>⍼350</strong>. Human clicks the hub; AI auto-picks.</td>
    </tr>
    <tr>
      <td><strong>Karen in the comments</strong></td>
      <td>−</td>
      <td>Pool from <strong>round 30</strong>. Insight: only if an AI is still flying.</td>
      <td>One random active rocket (Insight: AI only)</td>
      <td>That rocket <strong>loses one full seat turn</strong>.</td>
    </tr>
    <tr>
      <td><strong>Invalid claim on the ledger</strong></td>
      <td>+ / −</td>
      <td>Pool, only if an opponent still holds a deed</td>
      <td>One random rocket this round (chooser). Victim is the previous owner. Insight: cannot steal from the human.</td>
      <td>Chooser takes one opponent claim. Planet/moon: free fuel depot. Hubs: deed only — no depot (hubs cannot host pods).</td>
    </tr>
    <tr>
      <td><strong>Hot microphone</strong></td>
      <td>−</td>
      <td>Pool. Insight: only if an AI is still flying.</td>
      <td>One rocket (Insight: AI only)</td>
      <td>Sings a Disney song into a live mic. Pay <strong>50</strong> and <strong>miss the next seat turn</strong>.</td>
    </tr>
    <tr>
      <td><strong>The Tuesday boy paradox</strong></td>
      <td>+</td>
      <td>Pool</td>
      <td>One random rocket this round</td>
      <td>They prove it is <strong>13/27</strong>. Park count −1 (feral is one park further away).</td>
    </tr>
    <tr>
      <td><strong>Error 47: not an object</strong></td>
      <td>−</td>
      <td>Pool. Insight: only if an AI is still flying.</td>
      <td>One rocket (Insight: AI only)</td>
      <td>The terminal dumps <strong>2 fuel</strong>.</td>
    </tr>
  </tbody>
</table>

<h3>Rare (outside the normal pool)</h3>
<table class="glossary">
  <thead><tr><th>Alert</th><th>Tone</th><th>Trigger</th><th>Who</th><th>Effect</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Kostka</strong></td>
      <td>+</td>
      <td>Own clock. After <strong>5 Earth transits</strong> this charter (any rocket, land or pass), the <strong>next Earth landing</strong> rolls <strong>30%</strong>. Each later Earth landing +<strong>10%</strong> (30 → 40 → 50 …). Not in the round pool. Fires at most once.</td>
      <td>The rocket that just landed on Earth</td>
      <td>They adopt a dog named Kostka. <strong>+200</strong>.</td>
    </tr>
    <tr>
      <td><strong>You vibe-coded the rules</strong></td>
      <td>+ / −</td>
      <td>First time the expedition reaches <strong>round 60</strong>, one <strong>50%</strong> roll (hit or miss — never retries). Not in the standard pool.</td>
      <td>Living human, else the lead AI (chooser). Victim is an AI rival.</td>
      <td>Chooser <strong>kicks one AI rocket</strong> off the ledger. Human: click that rocket in standings.</td>
    </tr>
  </tbody>
</table>

<h3>Picks &amp; UI</h3>
<ul>
  <li>When an alert needs a choice (Olbers, blockchain, vibe-kick), a hint appears under standings. Normal Roll / Move buttons stay locked until you finish the pick.</li>
  <li><strong>Warp charges</strong> (King’s Quest or Strong Bad) stack; each charge is one teleport. Telemetry shows remaining warps when you have them.</li>
  <li>Resource strikes (gusher), H₂ leaks, and Gravity Duel are <em>not</em> ledger events — different systems.</li>
</ul>
`},{id:"turn-flow",title:"Roll, break, move & sell",html:`
<ol>
  <li><strong>Roll</strong> — 2d6 is your <em>maximum</em> travel (no move yet).</li>
  <li><strong>Break</strong> — optional: shave spaces (−1 space = 0.5 fuel, −2 = 1 fuel, …). Stepper still works as fallback.</li>
  <li><strong>Path preview</strong> — after you roll, a <em>thin line in your rocket color</em> shows full range. <strong>Click or tap a stop</strong> on that line to land there (sets break + moves). Hover a <em>path segment</em> for break fuel cost — planetoid hover inspect is separate.</li>
  <li><strong>Move</strong> — travel (dice − break). Button switches from Roll → Move (or path click lands immediately).</li>
  <li>After landing: <strong>Buy</strong> / <strong>Sell claim</strong> (½ price, depot scrapped) / Depot / End turn.</li>
</ol>
  <p><strong>Remote sell:</strong> you do not have to be on the claim. Click a rocket on <strong>On the ledger</strong> (any of that seat’s text) to open its dossier. On <em>your</em> turn you can <strong>sell</strong> any of your claims or <strong>auction</strong> it to the table at a reserve of your choosing. Each claim may be auctioned <strong>once per turn</strong>; you may list different claims in the same turn. If nobody meets your reserve, the auction is withdrawn — you may then sell that claim or keep it, but you cannot list it again this turn.</p>
<p><strong>Buy window:</strong> you may claim an <em>unowned</em> deed underfoot when you land <em>or</em> later while you are still on it (before you leave) — e.g. after rent income on a following turn makes the price affordable.</p>
<p>Landing is free. Leaving a gravity well costs fuel. Failed leave on an enemy claim charges rent again.</p>
<p><strong>Earth pay</strong> is written to the ledger: <strong>⍼400</strong> when you <em>land</em> on Earth, <strong>⍼200</strong> when you <em>pass</em> Earth on a multi-space move (intermediate stop). Each completed board <strong>rotation</strong> adds <strong>⍼10</strong> to both amounts thereafter. Completing rotation <strong>10, 20, 30…</strong> also pays a one-time <strong>⍼1000</strong> decade bonus. Full circuit still resupplies fuel depots (+3 in hand).</p>
<p><strong>Warp</strong> (from <strong>Ledger events</strong> — King’s Quest or Strong Bad Email): when you have a warp charge, <strong>click any board node</strong> instead of rolling. You teleport. No stops on the way. Landing rules still apply where you arrive.</p>
`},{id:"legend",title:"Board legend",html:`
<div class="legend-grid">
  <div class="legend-item"><img src="/handbook/legend-planet.svg" alt="" width="48" height="48"/><div><strong>Painted planets</strong><br/>Earth, Mars, Venus, Mercury (distinct surface art)</div></div>
  <div class="legend-item"><img src="/handbook/legend-moon-orange.svg" alt="" width="48" height="48"/><div><strong>Orange moons</strong><br/>Jupiter system (Io, Europa, Ganymede, Callisto)</div></div>
  <div class="legend-item"><img src="/handbook/legend-moon-yellow.svg" alt="" width="48" height="48"/><div><strong>Yellow moons</strong><br/>Saturn system (Titan, Enceladus, …)</div></div>
  <div class="legend-item"><img src="/handbook/legend-station.svg" alt="" width="48" height="48"/><div><strong>Ring stations</strong><br/>Elon, Holst, Daktulios — hub habitats, not plain circles</div></div>
  <div class="legend-item"><img src="/handbook/legend-blank.svg" alt="" width="48" height="48"/><div><strong>Diamond pips</strong><br/>Blank belt/transit (red-tint = Gravity Duel lanes)</div></div>
  <div class="legend-item"><img src="/handbook/legend-claim.svg" alt="" width="48" height="48"/><div><strong>Colored halo</strong><br/>Your claim (rocket color)</div></div>
  <div class="legend-item"><img src="/handbook/fuel-depot.png" alt="" width="48" height="48"/><div><strong>Fuel depot</strong><br/>Player-built tank badge on a body you own</div></div>
  <div class="legend-item"><img src="/handbook/legend-ship.svg" alt="" width="48" height="48"/><div><strong>Rocket</strong><br/>Your ship (gold outline while hopping)</div></div>
  <div class="legend-item"><img src="/handbook/legend-rings.svg" alt="" width="48" height="48"/><div><strong>Dashed circles</strong><br/>Orbital rings from the Sun</div></div>
</div>
`},{id:"monopoly",title:"Systems & monopoly",html:`
<p>Own <strong>every deed in a system</strong> → <strong>rent doubles</strong> on any landing there.</p>
<ul>
  <li><strong>Mercury / Venus</strong> — single planet each</li>
  <li><strong>Mars</strong> — Elon + Mars + Phobos + Deimos</li>
  <li><strong>Jupiter</strong> — Holst + four moons</li>
  <li><strong>Saturn</strong> — Daktulios + seven moons</li>
</ul>
<p><strong>Space stations</strong> (Elon · Holst Space Station · Daktulios) also form a railroad-style set of their own:</p>
<ul>
  <li>Own <strong>2</strong> hubs → rent <strong>×2</strong> on those hubs</li>
  <li>Own <strong>all 3</strong> → rent <strong>×4</strong> on those hubs</li>
</ul>
<p>System monopoly and the station network <em>stack</em> (e.g. full Mars + all hubs multiplies Elon by both).</p>
<p>Earth is never a deed.</p>
`},{id:"claims-ledger",title:"Dossier, ROI & selling",html:`
<p>Click a rocket on <strong>On the ledger</strong> — name, cash, fuel, claims, anywhere on that seat’s row — to open its <strong>dossier</strong>. You get cash, fuel, claims grouped by system, current rent, and how much each claim has earned this owner (rent + fuel strikes vs cash you put in).</p>
<p>Rival dossiers are public. The board already shows who owns what; the dossier is the books.</p>
<p>When the ledger closes, the winning story names up to three held claims by ROI (“Best books”) — claims sold, lost, or taken without cash down are not ranked.</p>
<h3>Sell</h3>
<p>Sell for <strong>half the deed price</strong>. The claim goes unowned. Any <strong>depot is scrapped</strong>. Use this when you would rather the body sit empty than go to a rival.</p>
<h3>Auction</h3>
<p>Put a claim up to the table and <strong>set your own reserve</strong>. Three prices matter:</p>
<ul>
  <li><strong>Deed price (MSRP)</strong> — the board list price of the claim.</li>
  <li><strong>Mark</strong> — half the deed. What the bank pays on a dump; the guaranteed floor.</li>
  <li><strong>Reserve</strong> — your ask. Defaults to the mark; raise it up to the deed price when the table is flush (hub, monopoly piece, a depot that survives auction). The bank still pays only the mark if you later dump.</li>
</ul>
<p>Highest bid at or above your reserve wins. Ties go to the next seat after the seller.</p>
<ul>
  <li>You get the cash.</li>
  <li>The buyer takes the claim. A <strong>depot stays</strong> with it.</li>
  <li>You keep <strong>docking rights</strong>: the next time you <em>land</em> on that body, rent is free (failed leave still charges).</li>
</ul>
<p>If nobody meets the reserve, the auction is <strong>withdrawn</strong> — the claim stays yours, and you may still dump it for the mark. Dumping is a separate choice.</p>
<p>Each claim may be auctioned <strong>once per turn</strong>; other claims can still list. After a withdrawn auction you may sell that claim or keep it. Sales are only before you roll or after you have landed (not while a path is in the air).</p>
`},{id:"depots",title:"Fuel depots",html:`
<p>You start with <strong>3 fuel depots</strong> in hand. Place them on <strong>planets or moons you own</strong> (planetoids only — <strong>not</strong> hub space stations like Holst / Elon / Daktulios).</p>
<p>Depots boost rent and enable free refuel on that body (for you).</p>
<p><strong>Cash cost (per circuit):</strong> your <strong>first</strong> depot after game start or after finishing a board rotation is <strong>free</strong>. Each additional depot that circuit costs <strong>10%</strong> of that body’s purchase price (e.g. a ⍼200 claim → ⍼20 to place the 2nd+ depot). Completing a circuit resets the free first placement.</p>
<p><strong>Earth resupply:</strong> each full board circuit home grants <strong>+3 depots</strong> in hand again. Placed depots stay until feral/elimination.</p>
<p>If a claim goes feral or you are eliminated, depots on those claims are <strong>destroyed</strong>.</p>
`},{id:"propellant",title:"Propellant",html:`
<p><strong>Methane (CH₄)</strong> — stable tanks, no leaks: the conservative operator’s choice. Claim + fuel depot on <strong>Titan</strong> or <strong>Enceladus</strong> can fire a one-time <strong>resource strike</strong> (½ starting cash) — e.g. “You've struck liquid methane!”</p>
<p><strong>Hydrogen (H₂)</strong> — cheaper leave burns, higher risk. <strong>Landing</strong> on a real body can rupture tanks: <strong>half your fuel</strong> and <strong>lose next turn</strong> to repair. Balanced by ice-strike potential on <strong>Enceladus, Mars, Europa, Ganymede</strong> (claim + depot).</p>
<p>Strike pop-ups are sudden and short. The ledger records the strike the same as a deed.</p>
`},{id:"duel",title:"Gravity Duel",html:`
<p>In the blank transit lanes — diamonds on the belt and other empty path nodes — Earth’s polite traffic rules do not apply. When two rockets try to share the same slingshot, they fight a <strong>Gravity Duel</strong> for the lane.</p>

<h4>When does a duel start?</h4>
<ul>
  <li>You <strong>land</strong> on a <strong>blank / space</strong> node (not a planet, moon, or hub station).</li>
  <li>Another living rocket is already there, or the lane has a remembered defender from a prior fight.</li>
  <li>You are the <strong>challenger</strong> (arriver). The other pilot is the <strong>defender</strong>.</li>
</ul>
<p>No duel on planets, moons, hubs, or Earth — only those empty transit pips.</p>

<h4>How to play (human steps)</h4>
<ol>
  <li><strong>Pick a secret stance</strong> — <strong>Low</strong> or <strong>High</strong>. The opponent does the same. Neither of you sees the other’s choice yet.</li>
  <li><strong>Roll 2d6</strong> when prompted (both sides roll).</li>
  <li><strong>Reveal</strong> — stances and totals show together. The game picks a winner (or a tie) from the rules below.</li>
  <li>Read the result on the same duel panel (names and dice stay visible), then continue.</li>
</ol>

<h4>How the winner is decided</h4>
<p>Both pilots always roll <strong>2d6</strong>. What “good” means depends on the stance pair:</p>
<table class="glossary">
  <thead><tr><th>Your stances</th><th>Who wins</th></tr></thead>
  <tbody>
    <tr>
      <td><strong>Both Low</strong></td>
      <td>The <strong>lower</strong> dice total wins (gentler burn / tighter slot).</td>
    </tr>
    <tr>
      <td><strong>Both High</strong></td>
      <td>The <strong>higher</strong> dice total wins (harder burn / bigger swing).</td>
    </tr>
    <tr>
      <td><strong>Mixed</strong> (one Low, one High)</td>
      <td>Whichever total is <strong>closer to the running mean</strong> of all 2d6 rolls so far this game wins. (If no history yet, the mean defaults to <strong>7</strong>.)</td>
    </tr>
  </tbody>
</table>
<p>If totals (or distances to the mean) are equal → <strong>tie</strong> (see stakes).</p>
<p><strong>Tip:</strong> Low is a bet on rolling small; High on rolling large. Mixed turns the fight into “who is nearer average,” so a mid roll can beat a dramatic high or low.</p>

<h4>Stakes</h4>
<ul>
  <li><strong>Loser</strong> — skips their <strong>next full seat turn</strong> (that skip also counts as a <strong>park</strong> for feral risk) <strong>and</strong> is <strong>knocked back one space</strong> on the Mainline (toward the previous beacon). Knockback can charge rent / Earth pay / leak at the new node; it does not start a second duel.</li>
  <li><strong>Winner</strong> — gains a one-time <strong>rent waiver</strong> against the loser: the next time the winner would pay rent to that pilot’s claims, the fee is free (waiver consumed).</li>
  <li><strong>Tie</strong> — both hold the lane; nobody skips, no knockback, no waiver. The next arrival may face the last roller as defender.</li>
  <li>If the loser is already on <strong>Earth</strong>, they cannot be shoved further back.</li>
</ul>

<h4>What the panel is showing you</h4>
<p>Your rocket is usually on the right when you are human; the rival on the left. Use <strong>Low</strong> / <strong>High</strong>, then <strong>Roll</strong>. AI seats lock and roll automatically. The result splash keeps the matchup context — it does not throw you into a blank full-screen with no names.</p>

<p class="handbook-note">Realtime / animated duels are not in this build yet (see “Not yet”). The rules above are the live dice duel.</p>
`},{id:"ai-difficulty",title:"Expedition",html:`
<p>This is the <strong>expedition</strong> setting, chosen at <strong>New game</strong> and locked at Launch. It sets how involved the table is, how kind the ledger is, and how hard rivals play.</p>
<table class="glossary">
  <thead>
    <tr>
      <th>Expedition</th>
      <th>Session</th>
      <th>Ledger</th>
      <th>Rivals</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Insight</strong></td>
      <td>A look</td>
      <td>− events never hit you (Tesla, Karen, hot mic, Error 47). Rivals cannot steal your deeds.</td>
      <td>Soft. They land where the dice put them.</td>
    </tr>
    <tr>
      <td><strong>Curiosity</strong></td>
      <td>Stay and poke (default)</td>
      <td>Full pool. Prize cards go to one random rocket each fire.</td>
      <td>Default table.</td>
    </tr>
    <tr>
      <td><strong>Voyager</strong></td>
      <td>The long haul</td>
      <td>Full pool.</td>
      <td>Sharper — they play for deeds, hubs, and Earth.</td>
    </tr>
    <tr>
      <td><strong>Opportunity</strong></td>
      <td>The long game</td>
      <td>Full pool.</td>
      <td>The table hunts monopolies and Earth landings.</td>
    </tr>
  </tbody>
</table>
<p>Prize cards — King’s Quest, M&amp;Ms, Strong Bad, Belt ice, Tuesday boy, Olbers, steal — go to <strong>one random rocket that round</strong>, not the lead seat. See <strong>Ledger events</strong> for Who / Effect.</p>
<p>Header <strong>Speed</strong> is animation only. Minigames in the charter come later; practice them in the <strong>Lab</strong>.</p>
`},{id:"feral",title:"Parking & feral claims",html:`
<p>Claims go <strong>feral</strong> because the software rots. The pods throw errors. If you sit still, nobody pushes a patch. The <strong>ledger</strong> then drops the deed and marks the hardware junk.</p>
<p>If your rocket <strong>does not move</strong> on a seat turn — camp, full break, failed leave, or duel skip — that is a <strong>park</strong>. Parks add up for the whole expedition. Moving later does <em>not</em> clear the count.</p>
<ul>
  <li>Parks <strong>1–4</strong> — no feral check yet.</li>
  <li>Park <strong>5</strong> — <strong>each</strong> of your claims rolls: <strong>50%</strong> chance to go <strong>feral</strong>.</li>
  <li>Each park after that closes <strong>half the remaining gap</strong> to 100% (75% → 87.5% → 93.75% …). Risk asymptotes toward certainty without a hard 100% cliff on park 6.</li>
</ul>
<p><strong>Feral outcome:</strong> claim returns to the bank (unowned). Any fuel depot on it is <strong>destroyed</strong>. Other pilots may buy it again.</p>
<p>Moving on a turn avoids adding a park <em>that turn</em>. Park count never resets. Check your park count on the turn panel.</p>
`},{id:"lab",title:"The Lab",html:`
<p><strong>The Lab</strong> (header button) is the minigame and drill bay — practice and testing, not the live charter. It is on every build, including the live site and the iPhone header next to Book.</p>
<ul>
  <li>Tap a <strong>category</strong> (Which is larger?, Minigames, End screens, Economy) to expand it; tap again to collapse.</li>
  <li><strong>Which is larger?</strong> — one line per numbering system (Western, Eastern Arabic, Chinese, Korean, Hebrew, binary…). Only shipped packs run; others show <em>Soon</em>. Closing a drill returns you to the Lab. Your expedition is untouched.</li>
  <li><strong>Minigames</strong> — e.g. a single <strong>Gravity Duel</strong> practice setup.</li>
  <li><strong>End screens / economy</strong> — canned board states for UI and balance checks.</li>
</ul>
<p>Game scenarios that replace the board (duel, end screens, economy) swap out the current expedition. Pure drills (Which is larger?) do not.</p>
<p>We keep Lab visible on purpose — it is part of the product, not a dev-only cheat panel. Putting drills into Opportunity (and the shorter expeditions) is a later charter change; until then, Lab is how you try them.</p>
`},{id:"not-in-build",title:"Not yet",html:`
<ul>
  <li>Purchasable transfer nodes between rings</li>
  <li>Player trading</li>
  <li>Fuel prices by location (Earth cheapest is direction only; full matrix later)</li>
  <li>Realtime Gravity Duel</li>
  <li>Named transit lanes (figures not used as rival rockets — see design notes)</li>
</ul>
`}],ll=zs(),dl={...ll,title:"Overview"},ue=[{id:"lore",title:"Lore",topics:il},{id:"gameplay",title:"Gameplay",topics:sl},{id:"rival-pilots",title:"Rival rockets",topics:[dl,...Js()]},{id:"bodies",title:"Bodies",topics:[rl(),...al()]},tl()],cl=ue.flatMap(e=>e.topics);function In(e){return cl.find(n=>n.id===e)}function ze(e){return ue.find(n=>n.topics.some(t=>t.id===e))}const Je="welcome",ul={lore:"/handbook/lore.png",gameplay:"/handbook/gameplay.png","rival-pilots":"/handbook/rival-rockets.png",bodies:"/handbook/legend-planet.svg","project-docs":"/handbook/badge-rocket.png"},hl={welcome:"/ops-manual-icon.png",ledger:"/handbook/cash-alert.png",path:"/handbook/lore.png","stations-lore":"/handbook/legend-station.svg","how-to-win":"/handbook/badge-rocket.png",glossary:"/handbook/gameplay.png","charter-alerts":"/handbook/cash-alert.png","ledger-alerts":"/handbook/cash-alert.png","turn-flow":"/handbook/dice-break.png",legend:"/handbook/badge-rocket.png",monopoly:"/handbook/vault-key.png","claims-ledger":"/handbook/cash-alert.png",depots:"/handbook/fuel-depot.png",propellant:"/handbook/molecule.png",duel:"/handbook/duel-rockets.png","ai-difficulty":"/handbook/rival-rockets.png",feral:"/handbook/rocket-debris.png",lab:"/handbook/dice-break.png","not-in-build":"/handbook/lock.png",readme:"/handbook/badge-rocket.png",changelog:"/handbook/gameplay.png",privacy:"/handbook/lock.png",rent:"/handbook/cash-alert.png","planetoids-overview":"/handbook/legend-planet.svg","body-earth":"/handbook/legend-planet.svg","body-venus":"/handbook/legend-planet.svg","body-mercury":"/handbook/legend-planet.svg","body-elon":"/handbook/legend-station.svg","body-mars":"/handbook/legend-planet.svg","body-phobos":"/handbook/legend-moon-orange.svg","body-deimos":"/handbook/legend-moon-orange.svg","body-holst":"/handbook/legend-station.svg","body-io":"/handbook/legend-moon-orange.svg","body-europa":"/handbook/legend-moon-orange.svg","body-ganymede":"/handbook/legend-moon-orange.svg","body-callisto":"/handbook/legend-moon-orange.svg","body-daktulios":"/handbook/legend-station.svg","body-titan":"/handbook/legend-moon-yellow.svg","body-enceladus":"/handbook/legend-moon-yellow.svg","body-iapetus":"/handbook/legend-moon-yellow.svg","body-mimas":"/handbook/legend-moon-yellow.svg","body-rhea":"/handbook/legend-moon-yellow.svg","body-dione":"/handbook/legend-moon-yellow.svg","body-tethys":"/handbook/legend-moon-yellow.svg","rival-pilots-overview":"/handbook/rival-rockets.png","pilot-recorde":"/handbook/recorde.png","pilot-k127":"/handbook/k127.png","pilot-turing":"/handbook/turing.png","pilot-ada":"/handbook/ada.png","pilot-sagan":"/handbook/sagan.png","pilot-asimov":"/handbook/asimov.png","pilot-clarke":"/handbook/clarke.png","pilot-goddard":"/handbook/goddard.png","pilot-von-braun":"/handbook/von-braun.png"};function pl(e){return ul[e]}function Lo(e){return hl[e]}const _o="solarquest.handbook.topic",kt="solarquest.handbook.section";function ml(e){let n=!1,t=Po(Bo(_o)??Je),o=Bo(kt)??ze(t)?.id??ue[0].id,r=null;e.innerHTML=`
    <div class="handbook-backdrop" data-handbook-close tabindex="-1"></div>
    <div
      class="handbook-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="handbook-title"
    >
      <header class="handbook-header">
        <div class="handbook-header-brand">
          <img
            class="ops-manual-icon handbook-header-icon"
            src="/ops-manual-icon.png"
            alt=""
            width="56"
            height="56"
            decoding="async"
          />
          <div>
            <p class="handbook-kicker">Heliopoly · Orbital Economics</p>
            <h2 id="handbook-title">Helios Ops Manual</h2>
          </div>
        </div>
        <button type="button" class="handbook-close" aria-label="Close handbook">✕</button>
      </header>
      <div class="handbook-section-tabs" role="tablist" aria-label="Manual sections"></div>
      <div class="handbook-body">
        <nav class="handbook-toc" aria-label="Topics in this section"></nav>
        <article class="handbook-article"></article>
      </div>
    </div>
  `;const a=e.querySelector(".handbook-section-tabs"),i=e.querySelector(".handbook-toc"),s=e.querySelector(".handbook-article"),l=e.querySelector(".handbook-close"),c=e.querySelector(".handbook-backdrop"),p=e.querySelector(".handbook-panel"),m=new Map;for(const y of ue)m.set(y.id,y.topics[0]?.id??Je);const h=ze(t);h&&(o=h.id,m.set(h.id,t));for(const y of ue){const v=document.createElement("button");v.type="button",v.className="handbook-section-tab",v.role="tab",v.dataset.sectionId=y.id,v.id=`handbook-tab-${y.id}`,v.setAttribute("aria-controls","handbook-topic-panel");const C=pl(y.id);if(C){const T=document.createElement("img");T.src=C,T.alt="",T.className="handbook-tab-icon",T.width=22,T.height=22,T.decoding="async",v.appendChild(T)}const R=document.createElement("span");R.textContent=y.title,v.appendChild(R),v.addEventListener("click",()=>f(y.id)),a.appendChild(v)}i.id="handbook-topic-panel",i.setAttribute("role","tabpanel");function E(){return ue.find(y=>y.id===o)??ue[0]}function b(){const y=E();i.innerHTML="",i.setAttribute("aria-labelledby",`handbook-tab-${y.id}`);for(const v of y.topics){const C=document.createElement("button");C.type="button",C.className="handbook-toc-item",C.dataset.topicId=v.id;const R=Lo(v.id);if(R){const B=document.createElement("img");B.src=R,B.alt="",B.className="handbook-toc-icon",B.width=28,B.height=28,B.decoding="async",C.appendChild(B)}const T=document.createElement("span");T.className="handbook-toc-label",T.textContent=v.title,C.appendChild(T),C.addEventListener("click",()=>S(v.id)),i.appendChild(C)}}function u(){a.querySelectorAll(".handbook-section-tab").forEach(y=>{const v=y,C=v.dataset.sectionId===o;v.classList.toggle("active",C),v.setAttribute("aria-selected",C?"true":"false"),v.tabIndex=C?0:-1})}function f(y){const v=ue.find(T=>T.id===y);if(!v)return;o=v.id,vt(kt,o);const C=m.get(v.id)??v.topics[0]?.id??Je,R=v.topics.some(T=>T.id===C)?C:v.topics[0].id;b(),u(),S(R)}function S(y){let v=In(y);v||(v=In(Je),y=v.id);const C=ze(v.id);C&&C.id!==o&&(o=C.id,vt(kt,o),b(),u()),t=v.id,m.set(o,t),vt(_o,t);const R=E(),T=Lo(v.id),B=T?`<div class="handbook-article-title-row">
          <img class="handbook-article-icon" src="${T}" alt="" width="72" height="72" decoding="async" />
          <div>
            <p class="handbook-article-section">${R.title}</p>
            <h3>${v.title}</h3>
          </div>
        </div>`:`<p class="handbook-article-section">${R.title}</p><h3>${v.title}</h3>`;s.innerHTML=`${B}${v.html}`,i.querySelectorAll(".handbook-toc-item").forEach(W=>{W.classList.toggle("active",W.dataset.topicId===t)}),s.scrollTop=0}function A(){const y=document.getElementById("duel-root"),v=document.getElementById("lab-root"),C=document.getElementById("end-root"),R=document.getElementById("eac-root");return!!y&&!y.classList.contains("hidden")||!!v&&!v.classList.contains("hidden")||!!C&&!C.classList.contains("hidden")||!!R&&!R.classList.contains("hidden")}function x(y){n=y,e.classList.toggle("hidden",!n),e.setAttribute("aria-hidden",n?"false":"true"),document.body.classList.toggle("handbook-open",n||A()),n?(r=document.activeElement,In(t)||(t=Je),o=ze(t)?.id??ue[0].id,b(),u(),S(t),l.focus()):r&&typeof r.focus=="function"&&r.focus()}function $(y){if(n){if(y.key==="Escape"){y.preventDefault(),x(!1);return}if(y.key==="ArrowLeft"||y.key==="ArrowRight"){const v=[...a.querySelectorAll(".handbook-section-tab")],C=v.findIndex(B=>B===document.activeElement);if(C<0)return;y.preventDefault();const R=y.key==="ArrowRight"?(C+1)%v.length:(C-1+v.length)%v.length,T=v[R];T.focus(),f(T.dataset.sectionId)}}}return l.addEventListener("click",()=>x(!1)),c.addEventListener("click",()=>x(!1)),p.addEventListener("click",y=>y.stopPropagation()),document.addEventListener("keydown",$),b(),u(),x(!1),{open(y){if(y&&In(y)){t=Po(y);const v=ze(t);v&&(o=v.id)}x(!0)},close(){x(!1)},isOpen(){return n}}}function Po(e){return e==="rival-pilots"?"rival-pilots-overview":e==="charter-alerts"?"ledger-alerts":e}function Bo(e){try{return localStorage.getItem(e)}catch{return null}}function vt(e,n){try{localStorage.setItem(e,n)}catch{}}function rn(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function gl(e,n){let t=!1,o=null,r=null;e.classList.add("handbook","dossier"),e.innerHTML=`
    <div class="handbook-backdrop" data-dossier-close tabindex="-1"></div>
    <div
      class="handbook-panel dossier-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
    >
      <header class="handbook-header">
        <div class="handbook-header-brand">
          <span class="dossier-swatch" id="dossier-swatch" aria-hidden="true"></span>
          <div>
            <p class="handbook-kicker">On the ledger</p>
            <h2 id="dossier-title">Rocket</h2>
          </div>
        </div>
        <button type="button" class="handbook-close" data-dossier-close aria-label="Close dossier">✕</button>
      </header>
      <div id="dossier-body" class="dossier-body"></div>
    </div>
  `;const a=e.querySelector("#dossier-title"),i=e.querySelector("#dossier-swatch"),s=e.querySelector("#dossier-body");function l(){t=!1,r=null,e.classList.add("hidden"),e.setAttribute("aria-hidden","true"),document.getElementById("handbook-root")?.classList.contains("hidden")&&document.getElementById("lab-root")?.classList.contains("hidden")&&document.body.classList.remove("handbook-open")}function c(){t=!0,e.classList.remove("hidden"),e.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),p()}function p(){const m=n.getState();if(!m||!o){s.innerHTML='<p class="hint">No expedition on the board.</p>';return}const h=Ea(m,o,q);if(!h){s.innerHTML='<p class="hint">That rocket is not on this charter.</p>';return}a.textContent=h.name,i.style.background=h.color,s.innerHTML=bl(h,r);const E=s.querySelector("[data-auction-form]");if(E){const b=E.querySelector("[data-dossier-reserve-input]"),u=E.querySelector("[data-dossier-auction-go]");b?.addEventListener("input",()=>{if(!b||!u)return;const f=Number(b.min),S=Number(b.max);let A=Math.floor(Number(b.value));(!Number.isFinite(A)||A<f)&&(A=f),Number.isFinite(S)&&A>S&&(A=S),u.textContent=`Ask ${g(A)}`})}}return e.addEventListener("click",m=>{const h=m.target;if(!h)return;if(h.closest("[data-dossier-close]")){l();return}const E=h.closest("[data-dossier-handbook]");if(E){const A=E.getAttribute("data-dossier-handbook");A&&n.onOpenHandbook(A);return}const b=h.closest("[data-dossier-sell]");if(b){const A=b.getAttribute("data-dossier-sell");A&&n.onSell(A);return}const u=h.closest("[data-dossier-auction]");if(u){const A=u.getAttribute("data-dossier-auction");A&&(r=A,p());return}if(h.closest("[data-dossier-auction-cancel]")){r=null,p();return}const S=h.closest("[data-dossier-auction-go]");if(S){const A=S.getAttribute("data-dossier-auction-go"),x=S.closest("[data-auction-form]")?.querySelector("[data-dossier-reserve-input]"),$=Math.floor(Number(x?.value));A&&Number.isFinite($)&&(r=null,n.onAuction(A,$))}}),document.addEventListener("keydown",m=>{if(t&&m.key==="Escape"){if(!document.getElementById("handbook-root")?.classList.contains("hidden"))return;l()}}),{open:m=>{o=m,c()},close:l,isOpen:()=>t,refresh:()=>{t&&p()},openedPlayerId:()=>t?o:null}}function fl(e){const n=ti(e);return n?`pilot-${n.id}`:"rival-pilots-overview"}function bl(e,n){const t=de[e.propellant].short,o=fl(e.name),r=o==="rival-pilots-overview"?"Rival rockets":"Ops Manual",a=e.landingRights.length?`<p class="dossier-rights">Docking rights: ${e.landingRights.map(l=>`${rn(l.name)}${l.remaining>1?` ×${l.remaining}`:""}`).join(" · ")}</p>`:"",i=e.canSell?'<p class="hint">Sell pays half the deed and scraps the depot. Auction lets you set a reserve at or above that half-price mark (up to the deed price); a winning bid keeps the depot and grants you one free landing. Each claim may be auctioned once per turn.</p>':"",s=e.groups.length?e.groups.map(l=>yl(l,e,n)).join(""):'<p class="hint">No claims on the ledger.</p>';return`
    <div class="dossier-vitals">
      <p class="dossier-meta">
        <span class="cash">${g(e.cash)} cash</span>
        · NW ${g(e.netWorth)}
        · ${t}
        · ${e.fuel}/${e.maxFuel} fuel
        · at ${rn(e.positionName)}
        ${e.eliminated?" · OUT":""}
      </p>
      <p class="dossier-meta">
        Deeds ${g(e.deedValue)}
        · depots ${g(e.depotValue)}
        · ${e.circuits} rotation${e.circuits===1?"":"s"}
        · park ${e.parkCount}
        · ${Ca(e.hubCount)} (${ke.length} hubs)
      </p>
      <p class="dossier-tools">
        <button type="button" class="dossier-bio" data-dossier-handbook="${o}">${r}</button>
      </p>
      ${a}
      ${i}
    </div>
    <div class="dossier-claims">${s}</div>
  `}function yl(e,n,t){const o=e.monopoly?" · MONOPOLY rent ×2":"",r=e.rows.map(a=>{const i=a.hasDepot?" · depot":"",s=a.isHub?a.hubMult>1?` · hub ×${a.hubMult}`:" · hub":"",l=n.auctionedThisTurn.includes(a.nodeId);let c="";return n.canSell&&(c=t===a.nodeId?`<div class="dossier-row-actions dossier-auction-form" data-auction-form="${a.nodeId}">
              <label class="auction-bid-field">Reserve
                <input
                  type="number"
                  inputmode="numeric"
                  min="${a.bankValue}"
                  max="${a.listPrice}"
                  step="25"
                  value="${a.bankValue}"
                  data-dossier-reserve-input
                />
              </label>
              <span class="dossier-row-sub">mark ${g(a.bankValue)} · deed ${g(a.listPrice)}</span>
              <button type="button" class="primary" data-dossier-auction-go="${a.nodeId}">Ask ${g(a.bankValue)}</button>
              <button type="button" data-dossier-auction-cancel>Cancel</button>
            </div>`:`<div class="dossier-row-actions">
              <button type="button" data-dossier-sell="${a.nodeId}">Sell ${g(a.bankValue)}</button>
              <button type="button" class="primary" data-dossier-auction="${a.nodeId}" ${l?"disabled":""}>${l?"Listed this turn":"Auction"}</button>
            </div>`),`<li class="dossier-row">
      <div class="dossier-row-main">
        <strong>${rn(a.name)}</strong>
        <span class="dossier-row-sub">${g(a.listPrice)} deed · rent now ${g(a.rentNow)}${i}${s}</span>
        <span class="dossier-row-roi">${rn(Sa(a))}</span>
      </div>
      ${c}
    </li>`});return`<section class="dossier-group">
    <h3>${rn(e.title)} <span class="dossier-count">${e.owned}/${e.total}${o}</span></h3>
    <ul>${r.join("")}</ul>
  </section>`}const kl=["which-is-larger","minigame","end","economy"],vl={"which-is-larger":"Which is larger?",minigame:"Minigames",end:"End screens",economy:"Economy"},wl={"which-is-larger":"Literacy drills: pick the larger of two numbers in a target numbering system.",minigame:"Standalone practice modes (e.g. Gravity Duel).",end:"Canned end screens for UI / copy checks.",economy:"Economy and risk edge cases."};function Lt(e){return e.available!==!1}function Xe(e=2){return qt({playerCount:e,humanSeat:!0,humanName:"Venture",humanPropellant:"methane",seed:(Date.now()^427)>>>0})}function Qe(e,n){return e.log.push(`—— Lab: ${n} ——`),e.turnDeltas=[`Lab · ${n}`],e}const _r=[{id:"eastern-arabic-compare",title:"Eastern Arabic (٠–٩)",blurb:"Pick which of two numbers is larger. One-, two-, then three-digit ladder; hints don’t count toward progress. Up to 12 tries.",group:"which-is-larger",kind:"standalone",available:!0,standaloneId:"eastern-arabic-compare"},{id:"chinese-compare",title:"Chinese (〇–九)",blurb:"Same ladder with Chinese digit characters per place (〇一二三四五六七八九).",group:"which-is-larger",kind:"standalone",available:!0,standaloneId:"chinese-compare"},{id:"korean-compare",title:"Korean Sino (영–구)",blurb:"Same ladder with Sino-Korean digit words per place (영 일 이 삼 사 오 육 칠 팔 구).",group:"which-is-larger",kind:"standalone",available:!0,standaloneId:"korean-compare"},{id:"hebrew-compare",title:"Hebrew (א–ט)",blurb:"Same ladder with Hebrew letter-numerals (א=1 … ט=9; ○ for 0) per place.",group:"which-is-larger",kind:"standalone",available:!0,standaloneId:"hebrew-compare"},{id:"binary-compare",title:"Binary",blurb:"Same ladder; numbers shown as base-2 bit strings (e.g. 13 → 1101).",group:"which-is-larger",kind:"standalone",available:!0,standaloneId:"binary-compare"},{id:"duel-you-challenger",title:"Gravity Duel",blurb:"You arrive on a belt blank occupied by an AI pilot. Stance (Low/High), then roll. Replaces the current expedition with this duel setup.",group:"minigame",kind:"game",available:!0,build:()=>{const e=Xe(2),n=e.players[0],t=e.players[1];return as(e,n.id,t.id,"belt2"),Qe(e,`Duel ${n.name} (challenger) vs ${t.name}`)}},{id:"end-you-win",title:"End screen — you prevail",blurb:"All other pilots eliminated; opens the end screen with the winner's best-books ROI line.",group:"end",kind:"game",build:()=>{const e=Xe(4),n=e.players[0];let t=8;for(const o of e.players)o.id!==n.id&&(o.eliminated=!0,o.eliminatedOnTurn=t,o.eliminatedOnRound=Math.max(1,Math.floor(t/4)),o.eliminatedReason="lab elimination",o.cash=0,o.properties=[],t+=5);return e.gameTurn=t,e.round=Math.max(1,Math.floor(t/4)),e.winnerId=n.id,e.phase="game_over",e.endReason=`${n.name} is the last pilot flying.`,oe(e,n.id,"enceladus",{rentCollected:756}),oe(e,n.id,"venus",{rentCollected:900}),oe(e,n.id,"elon",{rentCollected:500}),oe(e,n.id,"ganymede",{rentCollected:0}),e.log.push(`Winner: ${n.name} (lab)`),Qe(e,`End · ${n.name} wins`)}},{id:"end-ai-wins",title:"End screen — AI prevails",blurb:"Human out; one AI remains (grammar / postmortem check).",group:"end",kind:"game",build:()=>{const e=Xe(3),n=e.players[0],t=e.players[1];return n.eliminated=!0,n.eliminatedOnTurn=12,n.eliminatedOnRound=4,n.eliminatedReason="lab elimination",n.cash=0,e.players[2].eliminated=!0,e.players[2].eliminatedOnTurn=20,e.players[2].eliminatedOnRound=7,e.players[2].eliminatedReason="lab elimination",e.players[2].cash=0,e.gameTurn=24,e.round=8,e.winnerId=t.id,e.phase="game_over",e.endReason=`${t.name} is the last pilot flying.`,Qe(e,`End · ${t.name} wins`)}},{id:"going-under-warnings",title:"Going-under warnings",blurb:"You're stranded on a rival's claim with no fuel and low cash — standings show ⚠ risk badges.",group:"economy",kind:"game",build:()=>{const e=Xe(2),n=e.players[0],t=e.players[1];return e.owners.europa=t.id,e.owners.callisto=t.id,t.properties=["europa","callisto"],n.position="europa",n.fuel=0,n.cash=10,t.position="earth",t.fuel=25,Qe(e,"Going-under risk badges (standings)")}},{id:"claim-ledger",title:"Claim ledger / remote sell",blurb:"You're on Earth with Elon (almost paid back) and Venus. Cash is tight. Click your name on the ledger — sell or auction Elon (a rival holds the rest of Mars).",group:"economy",kind:"game",build:()=>{const e=Xe(3),n=e.players[0],t=e.players[1],o=e.players[2];return n.position="earth",n.cash=80,n.fuel=18,oe(e,n.id,"elon",{rentCollected:400}),oe(e,n.id,"venus",{rentCollected:0}),oe(e,t.id,"mars",{rentCollected:90,depot:!0}),oe(e,t.id,"phobos",{rentCollected:40}),oe(e,t.id,"deimos",{rentCollected:20}),t.cash=1200,t.position="earth",oe(e,o.id,"europa",{rentCollected:30}),o.cash=220,o.position="earth",e.phase="await_action",Qe(e,"Claim ledger / remote sell")}}],$l=["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"],El=["〇","一","二","三","四","五","六","七","八","九"],Sl=["영","일","이","삼","사","오","육","칠","팔","구"],Cl=["○","א","ב","ג","ד","ה","ו","ז","ח","ט"];function ro(e,n){if(!Number.isFinite(e)||e<0||!Number.isInteger(e))throw new RangeError(`${n} expects non-negative integer, got ${e}`)}function ao(e,n,t){return ro(e,t),String(e).split("").map(o=>n[Number(o)]).join("")}function Il(e){return ao(e,$l,"toEasternArabic")}function Ml(e){return ao(e,El,"toChineseDigits")}function Tl(e){return ro(e,"toKoreanSino"),String(e).split("").map(n=>Sl[Number(n)]).join(e>=10?" ":"")}function Rl(e){return ao(e,Cl,"toHebrewLetters")}function Al(e){return ro(e,"toBinary"),e.toString(2)}const Mn=e=>e===1?"Level 1 · one digit":e===2?"Level 2 · two digits":"Level 3 · three digits",Ll=e=>e===1?"Level 1 · values 0–9":e===2?"Level 2 · values 10–99":"Level 3 · values 100–999",rt={"eastern-arabic":{id:"eastern-arabic",title:"Eastern Arabic (٠–٩)",shortName:"Eastern Arabic",format:Il,levelLabel:Mn,hintLead:"Two numbers appear in Eastern Arabic digits. Choose the larger one by tapping it, or use the arrow keys / < > to point at that side."},chinese:{id:"chinese",title:"Chinese (〇–九)",shortName:"Chinese",format:Ml,levelLabel:Mn,hintLead:"Two numbers appear as Chinese digit characters (〇一二三四五六七八九), one character per place. Choose the larger value."},korean:{id:"korean",title:"Korean Sino (영–구)",shortName:"Korean",format:Tl,levelLabel:Mn,hintLead:"Two numbers appear in Sino-Korean digit words (영 일 이 삼 사 오 육 칠 팔 구), one word per place. Choose the larger value."},hebrew:{id:"hebrew",title:"Hebrew (א–ט)",shortName:"Hebrew",format:Rl,levelLabel:Mn,hintLead:"Two numbers appear as Hebrew letter-numerals (א=1 … ט=9; ○ for 0), one mark per place. Choose the larger value."},binary:{id:"binary",title:"Binary",shortName:"Binary",format:Al,levelLabel:Ll,hintLead:"Two numbers appear in binary (base 2). Read the bit string as an integer and choose the larger value."}};function _l(e,n){return rt[e].format(n)}const Pl={"eastern-arabic-compare":"eastern-arabic","chinese-compare":"chinese","korean-compare":"korean","hebrew-compare":"hebrew","binary-compare":"binary"},Oe=12;function Pr(e,n){if(e===n)throw new Error("largerSide requires unequal values");return e>n?"left":"right"}function Bl(e){return e===1?{min:0,max:9}:e===2?{min:10,max:99}:{min:100,max:999}}function wt(e,n,t){return e+Math.floor(t()*(n-e+1))}function Dl(e,n=Math.random){const{min:t,max:o}=Bl(e),r=wt(t,o,n);let a=wt(t,o,n),i=0;for(;a===r&&i++<32;)a=wt(t,o,n);return a===r&&(a=r>=o?r-1:r+1),{left:r,right:a}}function Ln(e,n,t,o){const{left:r,right:a}=Dl(e,o);return{round:e,left:r,right:a,phase:"playing",attempts:n,hintUsed:!1,hintSide:null,cleanClears:t}}function io(e=Math.random){return Ln(1,0,[],e)}function Ol(e,n=Math.random){if(e.phase!=="playing"||e.hintUsed)return e;const t=n()<.5?"left":"right";return{...e,hintUsed:!0,hintSide:t}}function xl(e){return[...e.cleanClears,{round:e.round,left:e.left,right:e.right,larger:Pr(e.left,e.right)}]}function Nl(e,n,t=Math.random){if(e.phase!=="playing")return e;const o=e.attempts+1,r=Pr(e.left,e.right);if(n!==r){const l=Ln(1,o,[],t);return o>=Oe?{...l,phase:"lost"}:l}if(e.hintUsed){const l=Ln(e.round,o,e.cleanClears,t);return o>=Oe?{...l,phase:"lost"}:l}const a=xl(e);if(e.round===3)return{...e,attempts:o,phase:"won",hintUsed:!1,hintSide:null,cleanClears:a};const i=e.round+1,s=Ln(i,o,a,t);return o>=Oe?{...s,phase:"lost",cleanClears:[]}:s}function Hl(e=Math.random){return io(e)}function Wl(e=Math.random){return io(e)}const Do="/api/game-log";let Oo=null;function Gl(e){const n=e.players.find(t=>t.id===e.winnerId);return{v:1,log:e.log.slice(-4e3),meta:{playerCount:e.players.length,aiDifficulty:e.config.aiDifficulty,humanSeat:e.config.humanSeat,humanPropellant:e.config.humanPropellant,propellants:e.players.map(t=>`${t.name}:${de[t.propellant].short}`),seed:e.config.seed??null,round:e.round,gameTurn:e.gameTurn,winnerId:e.winnerId,winnerName:n?.name??null,endReason:e.endReason,boardRotations:e.boardRotations,client:typeof location<"u"&&location.protocol==="file:"?"heliopoly-ios":"heliopoly-web"}}}function Fl(e){if(e.phase!=="game_over")return;const n=`${e.config.seed??"?"}-${e.gameTurn}-${e.winnerId??"none"}-${e.round}`;if(Oo===n)return;Oo=n;const t=JSON.stringify(Gl(e));try{if(typeof navigator<"u"&&navigator.sendBeacon){const o=new Blob([t],{type:"application/json"});if(navigator.sendBeacon(Do,o))return}}catch{}fetch(Do,{method:"POST",headers:{"Content-Type":"application/json"},body:t,keepalive:!0,credentials:"omit"}).catch(()=>{})}let d=null,ve={},U=!1,cn=null,Be=null,Q=null;const jl=420,Ul=140,Kl=280,Yl=90,Vl=160,ql=55,zl=12,Br="heliopoly-anim-speed",Jl={slow:1.65,normal:1,fast:.42,instant:0};function Dr(e){return e==="slow"||e==="normal"||e==="fast"||e==="instant"}function Xl(){try{const e=localStorage.getItem(Br);if(Dr(e))return e}catch{}return"normal"}let un=Xl();function Ql(e){un=e;try{localStorage.setItem(Br,e)}catch{}}const Or="heliopoly-ring-opacity-v3";function Zl(){try{const e=localStorage.getItem(Or);if(e==null)return Mo;const n=Number(e);if(Number.isFinite(n))return Math.min(1,Math.max(0,n))}catch{}return Mo}let Un=Zl();function ed(e){Un=Math.min(1,Math.max(0,e));try{localStorage.setItem(Or,String(Un))}catch{}}function nd(){const e=document.getElementById("ring-opacity");e&&(e.value=String(Math.round(Un*100)))}function td(e){const n=Jl[un];return n<=0||e<=0?0:Math.max(0,Math.round(e*n))}function od(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}const so=ml(document.getElementById("handbook-root")),xr=gl(document.getElementById("dossier-root"),{getState:()=>d,onSell:e=>{if(!d)return;const n=I(d.board,e),o=te(d).sellClaims.find(r=>r.nodeId===e);o&&confirm(`Sell ${n.name} for ${g(o.value)}? Any depot on it is scrapped.`)&&N({type:"sell",nodeId:e})},onAuction:(e,n)=>{if(!d)return;const t=te(d),o=t.sellClaims.find(a=>a.nodeId===e);if(!o||!t.canAuction)return;const r=Number.isFinite(n)?Math.max(o.value,Math.floor(n)):o.value;N({type:"auction_start",nodeId:e,reserve:r})},onOpenHandbook:e=>so.open(e)}),J=document.getElementById("board"),k=J.getContext("2d"),Tn=document.getElementById("log"),Ie=document.getElementById("btn-copy-log"),Kn=document.getElementById("rankings"),_t=document.getElementById("fleet-card"),rd=document.getElementById("standings-panel"),ad=document.getElementById("setup-body"),z=document.getElementById("setup-toggle"),at=document.getElementById("btn-quit"),Rn=document.getElementById("anim-speed");Rn&&(Rn.value=un,Rn.addEventListener("change",()=>{const e=Rn.value;Dr(e)&&Ql(e)}));nd();const xo=document.getElementById("ring-opacity");xo?.addEventListener("input",()=>{const e=Number(xo.value);ed(Number.isFinite(e)?Math.min(100,Math.max(0,e))/100:1),$e()});(()=>{const e=Bd();Ko(e),document.querySelectorAll('input[name="ai-difficulty"]').forEach(n=>{n.addEventListener("change",()=>{if(d&&d.phase!=="game_over")return;const t=n.value,o=bn(t);Ko(o);try{localStorage.setItem(ho,o)}catch{}})})})();const j=document.getElementById("duel-root"),id=document.getElementById("duel-matchup"),sd=document.getElementById("duel-status"),ld=document.getElementById("duel-dice"),dd=document.getElementById("die-l1"),cd=document.getElementById("die-l2"),ud=document.getElementById("die-r1"),hd=document.getElementById("die-r2"),pd=document.getElementById("dice-label-l"),md=document.getElementById("dice-label-r"),gd=document.getElementById("duel-actions-left"),fd=document.getElementById("duel-actions-right"),we=document.getElementById("duel-result"),Yn=document.getElementById("duel-result-footer"),bd=document.getElementById("duel-result-headline"),yd=document.getElementById("duel-result-punchy"),kd=document.getElementById("duel-result-summary");function lo(e){gd.classList.toggle("hidden",!e),fd.classList.toggle("hidden",!e)}const ce=document.getElementById("body-tooltip"),Vn=document.getElementById("end-root"),vd=document.getElementById("end-title"),wd=document.getElementById("end-story"),$d=document.getElementById("end-ranks"),Fe=document.getElementById("lab-root"),No=document.getElementById("lab-scenarios"),Ae=document.getElementById("eac-root"),$t=document.getElementById("eac-round"),Ed=document.getElementById("eac-attempts"),Sd=document.getElementById("eac-play"),Cd=document.getElementById("eac-end"),Ho=document.getElementById("eac-end-title"),Wo=document.getElementById("eac-end-blurb"),yn=document.getElementById("eac-left"),Nr=document.getElementById("eac-right"),_n=document.getElementById("eac-left-glyph"),Pn=document.getElementById("eac-right-glyph"),Id=document.getElementById("eac-left-west"),Md=document.getElementById("eac-right-west"),Hr=document.getElementById("eac-hint"),Td=document.getElementById("eac-reset"),be=document.getElementById("eac-recap"),Wr=document.getElementById("btn-new"),Gr=document.getElementById("btn-selfplay"),Pt=document.getElementById("btn-refuel"),Bn=document.getElementById("btn-roll"),ge=document.getElementById("btn-buy"),Ze=document.getElementById("btn-sell"),re=document.getElementById("btn-station"),Bt=document.getElementById("btn-end"),Go=document.getElementById("telemetry"),Fo=document.getElementById("break-row"),Rd=document.getElementById("break-count"),ie=document.getElementById("break-cost"),Fr=document.getElementById("btn-break-minus"),jr=document.getElementById("btn-break-plus"),Et=document.getElementById("dir-row"),jo=document.getElementById("dir-hint"),_e=document.getElementById("btn-dir-fwd"),Pe=document.getElementById("btn-dir-back"),Me=document.getElementById("player-count"),Ur=document.getElementById("pilot-count-chips");function co(){const e=String(Math.min(6,Math.max(2,Number(Me.value)||4)));Me.value!==e&&(Me.value=e),Ur?.querySelectorAll("[data-players]").forEach(n=>{const t=n.getAttribute("data-players")===e;n.classList.toggle("selected",t),n.setAttribute("aria-pressed",t?"true":"false")})}Ur?.addEventListener("click",e=>{const n=e.target.closest("[data-players]");n instanceof HTMLElement&&(Me.value=n.getAttribute("data-players")??"4",co())});Me.addEventListener("change",co);co();const kn=document.getElementById("include-human"),an=document.getElementById("pilot-name"),Uo=document.getElementById("pilot-name-label"),Dt="heliopoly.pilotName";function Ad(){try{const e=localStorage.getItem(Dt);if(e&&/^captain$/i.test(e.trim())){localStorage.removeItem(Dt),an.value="",an.placeholder="Venture";return}e&&(an.value=e)}catch{}}function Ld(){const e=ur(an.value,"Venture");try{localStorage.setItem(Dt,e)}catch{}return e}function Kr(){const e=kn.checked;Uo&&Uo.classList.toggle("hidden",!e),an.disabled=!e}Ad();Kr();kn.addEventListener("change",()=>Kr());function uo(e){const n=td(e);return n<=0?Promise.resolve():new Promise(t=>setTimeout(t,n))}function _d(){return document.querySelector('input[name="propellant"]:checked')?.value==="hydrogen"?"hydrogen":"methane"}const ho="heliopoly-ai-difficulty";function Pd(){const e=document.querySelector('input[name="ai-difficulty"]:checked');return bn(e?.value)}function Ko(e){const n=document.querySelector(`input[name="ai-difficulty"][value="${e}"]`);n&&(n.checked=!0);try{localStorage.setItem(ho,e)}catch{}}function Bd(){try{return bn(localStorage.getItem(ho))}catch{return"normal"}}function Yr(e){document.querySelectorAll('input[name="ai-difficulty"]').forEach(n=>{n.disabled=e})}const it=document.getElementById("announce-root"),Yo=document.getElementById("announce-card"),Dd=document.getElementById("announce-kicker"),Od=document.getElementById("announce-title"),xd=document.getElementById("announce-body");let Ot=[];function Nd(e){const n=e.title.toLowerCase();return e.kind==="gusher"||n.includes("struck")||n.includes("ice")?"/handbook/cards/banners/clerk-gusher.jpg":e.kind==="leak"||n.includes("leak")?"/handbook/cards/banners/clerk-leak.jpg":e.kind==="out"?"/handbook/cards/banners/clerk-out.jpg":n.includes("tesla")||n.includes("roadster")?"/handbook/cards/banners/clerk-tesla.jpg":n.includes("monolith")?"/handbook/cards/banners/clerk-monolith.jpg":n.includes("dividend")?"/handbook/cards/banners/clerk-dividend.jpg":n.includes("kostka")?"/handbook/cards/banners/clerk-kostka.jpg":n.includes("microphone")||n.includes("disney")?"/handbook/cards/banners/clerk-hotmic.jpg":n.includes("tuesday")?"/handbook/cards/banners/clerk-tuesday.jpg":n.includes("error 47")||n.includes("not an object")?"/handbook/cards/banners/clerk-error47.jpg":"/handbook/cards/banners/clerk-canonical.jpg"}function Hd(e){const n=e.pendingAnnouncement;if(!n)return!1;it.classList.remove("hidden"),Yo.classList.remove("kind-gusher","kind-leak","kind-info","kind-out"),Yo.classList.add(`kind-${n.kind}`),Dd.textContent=n.kind==="gusher"?"Resource strike":n.kind==="leak"?"Propellant failure":n.kind==="out"?"Elimination":n.title==="Won"||n.title==="Outbid"||n.title==="Claim sold"||n.title==="Auction withdrawn"?"Claim auction":"Ledger event",Od.textContent=n.title,xd.textContent=n.body;const t=document.getElementById("announce-art");return t&&(t.hidden=!1,t.style.backgroundImage=`url("${Nd(n)}")`),!0}function Wd(){it.classList.add("hidden"),d?.pendingAnnouncement&&(d={...d,pendingAnnouncement:null});const e=Ot;Ot=[];for(const n of e)n()}function Gd(){return it.classList.contains("hidden")?Promise.resolve():new Promise(e=>{Ot.push(e)})}async function Te(e){return e.pendingAnnouncement?(d=e,G(),Hd(e)&&await Gd(),d??e):e}const Vo=document.getElementById("auction-root"),Fd=document.getElementById("auction-title"),jd=document.getElementById("auction-body"),ae=document.getElementById("auction-amount"),Vr=document.getElementById("auction-bid"),Ud=document.getElementById("auction-pass");function qr(){if(!d||!ot(d)||!d.pendingAuction){Vo.classList.add("hidden");return}const e=d.pendingAuction,n=I(d.board,e.nodeId),t=d.players.find(s=>s.id===e.sellerId),o=d.players.find(s=>s.agent==="human"&&!s.eliminated);Fd.textContent=n.name,jd.textContent=`${t?.name??"A rival"} is auctioning ${n.name}. Reserve ${g(e.reserve)}. You have ${g(o?.cash??0)}.`,ae.min=String(e.reserve),ae.max=String(o?.cash??0),ae.value||(ae.value=String(e.reserve));const r=o?.cash??0,a=Number(ae.value);(!ae.value||Number.isNaN(a)||a<e.reserve)&&(ae.value=String(e.reserve));const i=Number(ae.value);Vr.disabled=r<e.reserve||i<e.reserve||i>r,Vo.classList.remove("hidden")}Ud?.addEventListener("click",()=>{N({type:"auction_bid",amount:0})});Vr?.addEventListener("click",()=>{N({type:"auction_bid",amount:Number(ae.value)||0})});ae?.addEventListener("input",()=>qr());function Ke(e){_t.classList.toggle("mode-standings",e),_t.classList.toggle("mode-setup",!e),rd.hidden=!e,ad.hidden=e,Yr(!!d&&d.phase!=="game_over"),e?(z.classList.remove("hidden"),z.textContent="New game",z.title="New game setup",z.setAttribute("aria-label","Open new game setup"),z.setAttribute("aria-expanded","false")):!!d?(z.classList.remove("hidden"),z.textContent="Standings",z.title="Back to the ledger",z.setAttribute("aria-label","Back to the ledger"),z.setAttribute("aria-expanded","true")):(z.classList.add("hidden"),z.setAttribute("aria-expanded","true"))}function fe(e){U=e,e||mo()}function zr(e,n){return ve[e]??n}async function Kd(e,n,t){if(n.length===0)return;const o=t?Kl:jl,r=t?Yl:Ul;for(const a of n)ve[e]=a.nodeId,$e(),await uo(a.passThrough?r:o);delete ve[e]}function Jr(e){const n=e.pendingDuel;if(!n||e.phase!=="await_duel")return!1;const t=e.players.find(r=>r.id===n.challengerId),o=e.players.find(r=>r.id===n.defenderId);return!!(t.agent==="human"&&(n.challengerStance===null||n.challengerStance&&n.defenderStance&&n.challengerRoll===null)||o.agent==="human"&&(n.defenderStance===null||n.challengerStance&&n.defenderStance&&n.defenderRoll===null))}const Yd={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};function F(e,n,t=!1){e.classList.toggle("rolling",t);const o=typeof n=="number"?n:n==="?"||n===""?0:Number.parseInt(String(n),10);if(!Number.isFinite(o)||o<1||o>6){e.dataset.face="",e.setAttribute("aria-label","Die face unknown"),e.innerHTML='<span class="die-unknown" aria-hidden="true">?</span>';return}e.dataset.face=String(o),e.setAttribute("aria-label",`Die showing ${o}`);const r=new Set(Yd[o]??[]);e.innerHTML=Array.from({length:9},(a,i)=>`<span class="pip${r.has(i)?" on":""}" aria-hidden="true"></span>`).join("")}async function ye(e,n,t){if(un==="instant"){F(e,t.d1,!1),F(n,t.d2,!1);return}const o=un==="fast"?6:zl;for(let r=0;r<o;r++)F(e,1+Math.floor(Math.random()*6),!0),F(n,1+Math.floor(Math.random()*6),!0),await uo(ql);F(e,t.d1,!1),F(n,t.d2,!1)}function Ye(e,n,t){const o=e.players.find(a=>a.id===n),r=e.players.find(a=>a.id===t);return o?.agent==="human"?{left:"defender",right:"challenger"}:r?.agent==="human"?{left:"challenger",right:"defender"}:{left:"challenger",right:"defender"}}function Vd(e,n,t){const o=e.players.find(a=>a.name===n),r=e.players.find(a=>a.name===t);return Ye(e,o?.id??"",r?.id??"")}function je(e,n){return(e.left===n?"left":"right")==="left"?[dd,cd]:[ud,hd]}function qn(e,n,t,o,r,a){id.textContent=`${n} vs ${t} · ${o}`;const i=r&&a?Ye(e,r,a):Vd(e,n,t),s=l=>l==="challenger"?n:t;pd.textContent=s(i.left),md.textContent=s(i.right)}function qd(e){const n=e.lastDuelResult;if(!n)return;j.classList.remove("hidden"),j.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),lo(!1),Yn.classList.remove("hidden"),Yn.classList.toggle("is-tie",n.outcome==="tie"),qn(e,n.challengerName,n.defenderName,n.nodeName),bd.textContent=n.outcome==="tie"?"Draw — both hold the lane":Ha(n.winnerName??"Winner");const t=e.players.find(a=>a.agent==="human")?.name??null,o=t!==null&&(t===n.challengerName||t===n.defenderName),r=t!==null&&t===n.winnerName;yd.textContent=qa(n.outcome,r,o),kd.textContent=[`${n.challengerName} [${n.challengerStance.toUpperCase()}] ${n.challengerRoll.total} · ${n.defenderName} [${n.defenderStance.toUpperCase()}] ${n.defenderRoll.total}`,n.summary].join(`
`),we.classList.remove("hidden")}function Xr(){Yn.classList.add("hidden"),lo(!0),we.classList.add("hidden"),j.classList.add("hidden"),j.setAttribute("aria-hidden","true"),document.body.classList.remove("handbook-open"),d?.lastDuelResult&&(d={...d,lastDuelResult:null});const e=xt;xt=[];for(const n of e)n()}function qo(){return!!d?.lastDuelResult&&!we.classList.contains("hidden")}function zd(e,n,t){const o=e.players.find(i=>i.id===n.challengerId),r=e.players.find(i=>i.id===n.defenderId),a=!!(n.challengerRoll&&n.defenderRoll);for(const i of["left","right"]){const s=i==="left"?t.left:t.right,l=s==="challenger"?o:r,c=s==="challenger"?n.challengerStance:n.defenderStance,p=s==="challenger"?n.challengerRoll:n.defenderRoll,m=l.agent==="human",h=m&&c===null&&!U,E=m&&!U&&n.challengerStance!==null&&n.defenderStance!==null&&p===null;for(const u of j.querySelectorAll(`button[data-visual="${i}"][data-stance]`)){const f=u.dataset.stance;u.disabled=!h;const S=m&&c===f||a&&c===f;u.classList.toggle("selected",!!S)}const b=j.querySelector(`button[data-visual="${i}"][data-roll]`);b&&(b.disabled=!E)}}function zn(e,n,t,o){return je(Ye(e,n,t),o)}function An(e,n,t){const o=e.players.find(a=>a.name===n.challengerName),r=e.players.find(a=>a.name===n.defenderName);return je(o&&r?Ye(e,o.id,r.id):{left:"challenger"},t)}function Jd(e,n){for(const t of["challenger","defender"]){const[o,r]=je(e,t),a=t==="challenger"?n.challengerRoll:n.defenderRoll;a?(F(o,a.d1),F(r,a.d2)):(F(o,"?"),F(r,"?"))}}function Xd(e){if(e?.lastDuelResult&&qo()){const s=e.lastDuelResult;j.classList.remove("hidden"),j.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),qn(e,s.challengerName,s.defenderName,s.nodeName);return}if(!e||e.phase!=="await_duel"||!e.pendingDuel){qo()||(j.classList.add("hidden"),j.setAttribute("aria-hidden","true"),e?.lastDuelResult||document.body.classList.remove("handbook-open"));return}const n=e.pendingDuel,t=e.players.find(s=>s.id===n.challengerId),o=e.players.find(s=>s.id===n.defenderId),r=Ye(e,t.id,o.id);j.classList.remove("hidden"),j.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),lo(!0),qn(e,t.name,o.name,I(e.board,n.nodeId).name,t.id,o.id);const a=yr(e);sd.textContent=[`Mean of game 2d6 totals: ${a.toFixed(2)}`,"Stances hidden until both have rolled",n.challengerStance&&n.defenderStance?"Both stances locked — roll when ready":"Choose High or Low on your side"].join(`
`),zd(e,n,r),Jd(r,n);const i=[];n.challengerRoll&&n.defenderRoll&&n.challengerStance&&n.defenderStance&&i.push(`Stances: ${t.name}=${n.challengerStance} · ${o.name}=${n.defenderStance}`),ld.textContent=i.join(`
`)}async function Qd(e){if(!e.lastDuelResult)return;j.classList.remove("hidden"),j.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),Yn.classList.add("hidden");const n=e.lastDuelResult;qn(e,n.challengerName,n.defenderName,n.nodeName);const t=e.players.find(c=>c.name===n.challengerName),o=e.players.find(c=>c.name===n.defenderName),r=t&&o?Ye(e,t.id,o.id):{left:"challenger"};we.classList.remove("hidden");const[a,i]=je(r,"challenger"),[s,l]=je(r,"defender");F(a,"?",!0),F(i,"?",!0),F(s,"?",!0),F(l,"?",!0),await ye(a,i,n.challengerRoll),await ye(s,l,n.defenderRoll),qd(e)}function Zd(e,n){const t=n.lastDuelResult;if(!t)return!1;const o=e.lastDuelResult;return o?t.summary!==o.summary||t.winnerName!==o.winnerName||t.loserName!==o.loserName||t.challengerRoll.total!==o.challengerRoll.total||t.defenderRoll.total!==o.defenderRoll.total||t.challengerName!==o.challengerName||t.defenderName!==o.defenderName||n.gameTurn!==e.gameTurn:!0}async function Jn(e,n){if(!Zd(e,n)||!n.lastDuelResult)return n;d=n,G(),await Qd(n),await ec();const t={...d??n,lastDuelResult:null};return d=t,t}let xt=[];function ec(){return we.classList.contains("hidden")?Promise.resolve():new Promise(e=>{xt.push(e)})}function nc(e,n){const t=e.endReason??"Among the orbital lanes, one enterprise outlasted the rest.",o=` The ledger ran ${e.round} round${e.round===1?"":"s"}.`;if(!n)return t+o;const r=g(q(e,n)),a=n.properties.length,i=n.properties.filter(p=>e.stations[p]).length,s=` The ledger writes ${n.name} as one of the greatest of all kind.`,l=a>0||i>0?` Closing books: ${r} net worth · ${a} claim${a===1?"":"s"} · ${i} depot${i===1?"":"s"}.`:` Closing books: ${r} net worth.`,c=ka(e,n.id);return t+s+o+l+(c?` ${c}`:"")}function xe(e){Fl(e);const n=e.players.find(i=>i.id===e.winnerId),t=document.querySelector(".end-kicker");t&&(t.textContent=n?"Greatest of all kind":"The ledger records"),vd.textContent=n?Na(n):"The ledger closes",wd.textContent=nc(e,n);const o=e.players.filter(i=>!i.eliminated).sort((i,s)=>q(e,s)-q(e,i)),r=e.players.filter(i=>i.eliminated).sort((i,s)=>{const l=i.eliminatedOnRound??e.round,c=s.eliminatedOnRound??e.round;if(l!==c)return l-c;const p=i.eliminatedOnTurn??Number.MAX_SAFE_INTEGER,m=s.eliminatedOnTurn??Number.MAX_SAFE_INTEGER;return p!==m?p-m:i.name.localeCompare(s.name)}),a=[...o,...r];$d.innerHTML=a.map((i,s)=>{const l=i.id===e.winnerId?" ★":"";if(i.eliminated){const c=i.eliminatedOnRound!=null?`round ${i.eliminatedOnRound}`:i.eliminatedOnTurn!=null?`round ? (turn ${i.eliminatedOnTurn})`:"round ?",p=i.eliminatedReason?` · ${i.eliminatedReason}`:"";return`<div>${s+1}. ${i.name}${l} — out ${c}${p}</div>`}return`<div>${s+1}. ${i.name}${l} — ${g(q(e,i))} · flying</div>`}).join(""),Vn.classList.remove("hidden"),Vn.setAttribute("aria-hidden","false")}function st(){Vn.classList.add("hidden"),Vn.setAttribute("aria-hidden","true")}async function Nt(e,n){const t=O(e),o=t.position;let r=Ge(e,n);if(n.type==="move"){const i=r.players.find(p=>p.id===t.id).position!==o,s=e.breakSpaces,l=e.lastRoll?.total??0,c=Math.max(0,l-s);if(i&&c>0){const p=Re(e.board,o,c,t.moveDirection);await Kd(t.id,p.frames,t.agent==="ai")}}if(n.type==="duel_roll"&&r.pendingDuel?.challengerRoll&&e.pendingDuel&&!e.pendingDuel.challengerRoll){const a=r.pendingDuel,[i,s]=zn(r,a.challengerId,a.defenderId,"challenger");await ye(i,s,r.pendingDuel.challengerRoll)}if(n.type==="duel_roll"&&r.pendingDuel?.defenderRoll&&e.pendingDuel&&!e.pendingDuel.defenderRoll){const a=r.pendingDuel,[i,s]=zn(r,a.challengerId,a.defenderId,"defender");await ye(i,s,r.pendingDuel.defenderRoll)}return r=dn(r),r=await Jn(e,r),r=await Te(r),r}async function Dn(e){let n=e,t=0;for(;t++<600&&n.phase!=="game_over";){const o=n;if(n=dn(n),n=await Jn(o,n),n=await Te(n),n.phase==="game_over"||Jr(n)||!we.classList.contains("hidden")||!it.classList.contains("hidden")||ot(n))break;if(n.pendingCharterChoice){if(n.players.find(s=>s.id===n.pendingCharterChoice.chooserId)?.agent==="human")break;n=$s(n),d=n,G();continue}const r=O(n);if(!r.eliminated&&r.agent==="human"&&n.phase!=="await_duel")break;if(r.eliminated){n=Ge(n,{type:"end_turn"}),d=n,G();continue}if(n.phase==="await_duel"){const i=n,s=Fn(n);if(n=Ge(n,s),n=dn(n),n=await Jn(i,n),n=await Te(n),d=n,G(),!we.classList.contains("hidden"))break;continue}const a=Fn(n);n=await Nt(n,a),d=n,G(),a.type!=="roll"&&await uo(Vl)}return n}async function Qr(e){if(po(),d=e,Ke(!0),at.classList.remove("hidden"),st(),G(),d.phase!=="game_over"){fe(!0);try{d=await Dn(d)}finally{fe(!1)}}G(),d.phase==="game_over"&&(d=await Te(d),xe(d))}async function N(e){if(!d||d.phase==="game_over"||U)return;if(e.type==="auction_bid"){if(!ot(d))return;fe(!0);try{d=await Nt(d,e),G(),d.phase!=="game_over"&&(d=await Dn(d))}finally{fe(!1)}G(),d?.phase==="game_over"&&(d=await Te(d),xe(d));return}if(e.type==="duel_stance"||e.type==="duel_roll"){fe(!0);try{let t=d;if(t.pendingDuel){const a=t.pendingDuel,i=t.players.find(p=>p.id===a.challengerId),s=t.players.find(p=>p.id===a.defenderId);let l=t.players[t.currentPlayerIndex].id;e.type==="duel_stance"?i.agent==="human"&&a.challengerStance===null?l=i.id:s.agent==="human"&&a.defenderStance===null&&(l=s.id):i.agent==="human"&&a.challengerStance&&a.defenderStance&&a.challengerRoll===null?l=i.id:s.agent==="human"&&a.challengerStance&&a.defenderStance&&a.defenderRoll===null&&(l=s.id);const c=t.players.findIndex(p=>p.id===l);c>=0&&(t={...t,currentPlayerIndex:c})}const o=t;let r=Ge(t,e);if(e.type==="duel_roll"&&o.pendingDuel&&r.pendingDuel){const a=o.pendingDuel,i=r.pendingDuel;if(!a.challengerRoll&&i.challengerRoll){const[s,l]=zn(r,i.challengerId,i.defenderId,"challenger");await ye(s,l,i.challengerRoll)}if(!a.defenderRoll&&i.defenderRoll){const[s,l]=zn(r,i.challengerId,i.defenderId,"defender");await ye(s,l,i.defenderRoll)}}else if(e.type==="duel_roll"&&o.pendingDuel&&r.lastDuelResult){const a=r.lastDuelResult,[i,s]=An(r,a,"challenger"),[l,c]=An(r,a,"defender");await ye(i,s,a.challengerRoll),await ye(l,c,a.defenderRoll)}if(r=dn(r),r.lastDuelResult&&o.pendingDuel&&!o.lastDuelResult){const a=r.lastDuelResult,[i,s]=An(r,a,"challenger"),[l,c]=An(r,a,"defender");F(i,a.challengerRoll.d1),F(s,a.challengerRoll.d2),F(l,a.defenderRoll.d1),F(c,a.defenderRoll.d2)}r=await Jn(o,r),d=r,G(),d.phase!=="game_over"&&!Jr(d)&&we.classList.contains("hidden")&&(d=await Dn(d))}finally{fe(!1)}G(),d?.phase==="game_over"&&(d=await Te(d),xe(d));return}if(O(d).agent==="human"){fe(!0);try{d=await Nt(d,e),G(),d.phase!=="game_over"&&(d=await Dn(d))}finally{fe(!1)}G(),d?.phase==="game_over"&&(d=await Te(d),xe(d))}}function po(){document.getElementById("welcome-card")?.classList.add("hidden")}function Zr(e){U||(po(),ve={},Qr(qt({playerCount:Number(Me.value)||4,humanSeat:e,humanName:e?Ld():"Venture",humanPropellant:_d(),aiDifficulty:Pd(),seed:Date.now()>>>0})))}document.getElementById("btn-handbook-header")?.addEventListener("click",()=>so.open());document.getElementById("btn-duel-handbook")?.addEventListener("click",e=>{e.stopPropagation(),so.open("duel")});function tc(){return d?.log.length?d.log.filter(e=>!/↺|^\s*seed\[/i.test(e)).join(`
`):""}function zo(e,n){e.classList.add("copied");const t=e.textContent;e.textContent="Copied",window.setTimeout(()=>{e.classList.remove("copied"),e.textContent=t||n},1600)}async function ea(e){const n=tc();if(!n)return;const t=e??Ie;try{await navigator.clipboard.writeText(n),zo(t,t===Ie?"Copy":"Copy log")}catch{const o=document.createElement("textarea");o.value=n,o.setAttribute("readonly",""),o.style.position="fixed",o.style.left="-9999px",document.body.appendChild(o),o.select();try{document.execCommand("copy"),zo(t,t===Ie?"Copy":"Copy log")}finally{document.body.removeChild(o)}}}Ie.addEventListener("click",()=>{ea(Ie)});const Jo=document.getElementById("end-copy-log");Jo?.addEventListener("click",()=>{ea(Jo)});function na(e){return e.target?.closest?.(".rank-row")??null}function ta(e){if(!d||U)return;const n=d.pendingCharterChoice,t=e.getAttribute("data-kick-id");if(n?.kind==="vibe_kick"&&t&&d.players.find(a=>a.id===n.chooserId)?.agent==="human"){N({type:"charter_kick",targetPlayerId:t});return}const o=e.getAttribute("data-dossier-id");o&&xr.open(o)}Kn.addEventListener("click",e=>{const n=na(e);n&&(e.preventDefault(),ta(n))});Kn.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;const n=na(e);n&&(e.preventDefault(),ta(n))});function oa(){Fe.classList.remove("hidden"),Fe.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open")}function lt(){Fe.classList.add("hidden"),Fe.setAttribute("aria-hidden","true"),j.classList.contains("hidden")&&Ae.classList.contains("hidden")&&document.getElementById("handbook-root")?.classList.contains("hidden")&&document.body.classList.remove("handbook-open")}let D=null,V="eastern-arabic";const Xo=document.querySelector(".eac-hint"),Qo=document.getElementById("eac-title"),Zo=document.querySelector("#eac-root .handbook-kicker");function er(){return!Ae.classList.contains("hidden")}function Xn(e){return _l(V,e)}function nr(e,n){if(n===null){e.textContent="",e.classList.add("hidden");return}e.textContent=String(n),e.classList.remove("hidden")}function oc(){const e=rt[V];Qo&&(Qo.textContent=`Which is larger? · ${e.shortName}`),Zo&&(Zo.textContent=`Lab · ${e.shortName}`),Xo&&(Xo.innerHTML=`${e.hintLead}
      You win by finishing three levels in a row without help on those steps.
      Need a hand? <strong>Hint</strong> reveals one number in familiar
      Western digits, but that try won’t advance you; you’ll need to clear
      the level again without a hint.
      You have up to ${Oe} tries. <strong>Reset</strong> starts over anytime.`),Ae.dataset.script=V,_n.classList.toggle("eac-glyph-binary",V==="binary"),Pn.classList.toggle("eac-glyph-binary",V==="binary"),_n.classList.toggle("eac-glyph-cjk",V==="chinese"||V==="korean"),Pn.classList.toggle("eac-glyph-cjk",V==="chinese"||V==="korean"),_n.classList.toggle("eac-glyph-hebrew",V==="hebrew"),Pn.classList.toggle("eac-glyph-hebrew",V==="hebrew")}function rc(){if(!D||D.phase!=="won"||D.cleanClears.length===0){be.innerHTML="",be.classList.add("hidden");return}be.classList.remove("hidden");const e=rt[V];be.innerHTML=D.cleanClears.map(n=>{const t=Xn(n.left),o=Xn(n.right),r=n.larger==="left"?" is-larger":"",a=n.larger==="right"?" is-larger":"";return`<div class="eac-recap-row">
        <p class="eac-recap-label">${e.levelLabel(n.round)}</p>
        <div class="eac-recap-pair">
          <span class="eac-recap-side${r}">
            <span class="eac-recap-east">${t}</span>
            <span class="eac-recap-west">${n.left}</span>
          </span>
          <span class="eac-recap-vs">vs</span>
          <span class="eac-recap-side${a}">
            <span class="eac-recap-east">${o}</span>
            <span class="eac-recap-west">${n.right}</span>
          </span>
        </div>
      </div>`}).join("")}function vn(){if(!D)return;const e=rt[V],n=D.phase==="won"||D.phase==="lost";if(Sd.classList.toggle("hidden",n),Cd.classList.toggle("hidden",!n),Ed.textContent=`${D.attempts} / ${Oe}`,D.phase==="won"){$t.textContent="Complete",Ho.textContent="Nice work",Wo.textContent="You finished all three levels without using a hint on those steps. Here’s what you saw, with Western numbers alongside:",rc();return}if(D.phase==="lost"){$t.textContent="Out of tries",Ho.textContent="That’s all for this run",Wo.textContent=`You used all ${Oe} tries before finishing the three levels. Play again when you’re ready.`,be.innerHTML="",be.classList.add("hidden");return}be.innerHTML="",be.classList.add("hidden"),$t.textContent=e.levelLabel(D.round);const t=Xn(D.left),o=Xn(D.right);_n.textContent=t,Pn.textContent=o;const r=D.hintSide==="left",a=D.hintSide==="right";nr(Id,r?D.left:null),nr(Md,a?D.right:null),yn.setAttribute("aria-label",r?`Left number ${t} (${D.left})`:`Left number ${t}`),Nr.setAttribute("aria-label",a?`Right number ${o} (${D.right})`:`Right number ${o}`),Hr.disabled=D.hintUsed}function ac(e){V=e,D=io(),oc(),vn(),Ae.classList.remove("hidden"),Ae.setAttribute("aria-hidden","false"),document.body.classList.add("handbook-open"),yn.focus()}function dt(){Ae.classList.add("hidden"),Ae.setAttribute("aria-hidden","true"),D=null,j.classList.contains("hidden")&&Fe.classList.contains("hidden")&&document.getElementById("handbook-root")?.classList.contains("hidden")&&document.body.classList.remove("handbook-open")}function Qn(e){!D||D.phase!=="playing"||(D=Nl(D,e),document.activeElement instanceof HTMLElement&&document.activeElement.blur(),vn())}function ra(){!D||D.phase!=="playing"||(D=Ol(D),vn())}function aa(){D=Hl(),vn(),yn.focus()}function ic(){D=Wl(),vn(),yn.focus()}let St=null;function ia(){const e=new Map;for(const n of _r){const t=e.get(n.group)??[];t.push(n),e.set(n.group,t)}No.innerHTML="";for(const n of kl){const t=e.get(n);if(!t?.length)continue;const o=St===n,r=document.createElement("div");r.className="lab-group"+(o?" is-open":""),r.dataset.group=n;const a=document.createElement("button");a.type="button",a.className="lab-group-toggle",a.setAttribute("aria-expanded",o?"true":"false"),a.setAttribute("aria-controls",`lab-group-items-${n}`);const i=t.filter(c=>Lt(c)).length,s=i===t.length?`${t.length}`:`${i}/${t.length} ready`;a.innerHTML=`
      <span class="lab-group-toggle-main">
        <span class="lab-group-toggle-title">${vl[n]}</span>
        <span class="lab-group-toggle-blurb">${wl[n]}</span>
      </span>
      <span class="lab-group-toggle-meta">
        <span class="lab-group-count">${s}</span>
        <span class="lab-group-chevron" aria-hidden="true">${o?"▾":"▸"}</span>
      </span>`,a.addEventListener("click",()=>{St=St===n?null:n,ia()}),r.appendChild(a);const l=document.createElement("div");if(l.id=`lab-group-items-${n}`,l.className="lab-group-items",l.hidden=!o,o)for(const c of t){const p=Lt(c),m=document.createElement("button");m.type="button",m.className="lab-scenario"+(p?"":" is-coming-soon"),m.dataset.scenario=c.id,m.disabled=!p,m.innerHTML=`
          <span class="lab-scenario-title-row">
            <span class="lab-scenario-title">${c.title}</span>
            ${p?"":'<span class="lab-scenario-badge">Soon</span>'}
          </span>
          <span class="lab-scenario-blurb">${c.blurb}</span>`,p&&m.addEventListener("click",()=>{sc(c.id)}),l.appendChild(m)}r.appendChild(l),No.appendChild(r)}}async function sc(e){if(U)return;const n=_r.find(o=>o.id===e);if(!n||!Lt(n))return;if(n.kind==="standalone"){const o=Pl[n.standaloneId];o&&ac(o);return}lt(),st(),Xr(),j.classList.add("hidden"),ve={};const t=n.build();await Qr(t)}document.getElementById("btn-lab")?.addEventListener("click",()=>oa());document.getElementById("lab-close")?.addEventListener("click",()=>lt());document.getElementById("lab-backdrop")?.addEventListener("click",()=>lt());document.getElementById("eac-close")?.addEventListener("click",()=>dt());document.getElementById("eac-backdrop")?.addEventListener("click",()=>dt());document.getElementById("eac-again")?.addEventListener("click",()=>ic());document.getElementById("eac-done")?.addEventListener("click",()=>{dt(),oa()});Hr.addEventListener("click",()=>ra());Td.addEventListener("click",()=>aa());yn.addEventListener("click",()=>Qn("left"));Nr.addEventListener("click",()=>Qn("right"));document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(er()){e.preventDefault(),dt();return}Fe.classList.contains("hidden")||lt();return}if(!(!er()||!D||D.phase!=="playing")){if(e.key==="ArrowLeft"||e.key==="<"||e.key===",")e.preventDefault(),Qn("left");else if(e.key==="ArrowRight"||e.key===">"||e.key===".")e.preventDefault(),Qn("right");else if(e.key==="h"||e.key==="H")e.preventDefault(),ra();else if(e.key==="r"||e.key==="R"){if(e.metaKey||e.ctrlKey||e.altKey)return;e.preventDefault(),aa()}}});ia();z.addEventListener("click",()=>{const e=_t.classList.contains("mode-standings");Ke(!e)});Wr.addEventListener("click",()=>Zr(kn.checked));Gr.addEventListener("click",()=>{if(U)return;po(),kn.checked=!1,ve={};let e=qt({playerCount:Number(Me.value)||4,humanSeat:!1,seed:Date.now()>>>0});for(let n=0;n<100&&e.phase!=="game_over"&&(e=dn(e),e.phase!=="game_over");n++){if(e.phase==="await_duel"){e=Ge(e,Fn(e));continue}e=Ge(e,Fn(e))}d=e,Ke(!0),at.classList.remove("hidden"),G(),e.phase==="game_over"&&xe(e)});at.addEventListener("click",()=>{if(!d||U||!confirm("Quit this expedition? The ledger will not write a winner."))return;const e=d.players.find(n=>n.agent==="human");d=Es(d,e?.id??d.players[0].id),G(),xe(d)});document.getElementById("end-again")?.addEventListener("click",()=>{st(),Ke(!1),Zr(kn.checked)});document.getElementById("end-close")?.addEventListener("click",()=>{st(),d=null,at.classList.add("hidden"),Ke(!1),G()});document.getElementById("duel-result-ok")?.addEventListener("click",()=>{Xr(),G()});document.getElementById("announce-ok")?.addEventListener("click",()=>{Wd(),G()});Pt.addEventListener("click",()=>{if(!d)return;const e=te(d);N({type:"refuel",amount:Math.min(e.refuelMax,10)})});Bn.addEventListener("click",()=>{d&&(d.phase==="await_move"?N({type:"move"}):N({type:"roll"}))});ge.addEventListener("click",()=>{N({type:"buy"})});Ze.addEventListener("click",()=>{if(!d)return;const e=te(d);e.sell&&e.sellNodeId&&N({type:"sell",nodeId:e.sellNodeId})});re.addEventListener("click",()=>{N({type:"place_station"})});Bt.addEventListener("click",()=>{N({type:"end_turn"})});Fr.addEventListener("click",()=>{!d||d.phase!=="await_move"||N({type:"set_break",spaces:Math.max(0,d.breakSpaces-1)})});jr.addEventListener("click",()=>{!d||d.phase!=="await_move"||!d.lastRoll||N({type:"set_break",spaces:Math.min(d.lastRoll.total,d.breakSpaces+1)})});function sa(e){if(!d)return;const n=O(d);!te(d).setDirection||!n.canBidirectional||n.directionLocked||n.moveDirection!==e&&N({type:"set_direction",direction:e})}_e.addEventListener("click",()=>sa("forward"));Pe.addEventListener("click",()=>sa("backward"));for(const e of document.querySelectorAll("#duel-root button[data-stance]"))e.addEventListener("click",()=>{if(e.disabled)return;const n=e.dataset.stance;N({type:"duel_stance",stance:n})});for(const e of document.querySelectorAll("#duel-root button[data-roll]"))e.addEventListener("click",()=>{e.disabled||N({type:"duel_roll"})});function lc(e,n,t=10){const o=Math.max(1,n),r=Math.round(Math.min(1,Math.max(0,e/o))*t*2);let a=Math.floor(r/2),i=r%2;a>=t&&(a=t,i=0);const s=Math.max(0,t-a-i);return`${"●".repeat(a)}${i?"◐":""}${"○".repeat(s)}`}function dc(){return typeof window>"u"||!window.matchMedia?!1:window.matchMedia("(max-width: 900px)").matches||window.matchMedia("(max-width: 1180px) and (orientation: portrait)").matches}function cc(){const e=document.getElementById("board"),n=document.querySelector(".top"),t=document.querySelector(".layout"),o=document.querySelector(".board-panel"),r=document.querySelector(".board-stage");if(!e||!n)return;const a=window.visualViewport,i=a?.height??window.innerHeight,s=a?.width??window.innerWidth,c=(a?.offsetTop??0)+i,p=n.getBoundingClientRect(),h=Math.floor(c-p.bottom-16),b=s>i&&i<=1100,u=e.getBoundingClientRect().bottom>c-2;if(!b&&!u||h<120){e.style.removeProperty("width"),e.style.removeProperty("height"),e.style.removeProperty("max-width"),e.style.removeProperty("max-height"),r?.style.removeProperty("width"),r?.style.removeProperty("height"),o?.style.removeProperty("max-height"),o?.style.removeProperty("height"),t?.style.removeProperty("height"),t?.style.removeProperty("max-height"),document.documentElement.style.removeProperty("--board-fit"),document.documentElement.style.removeProperty("--header-bottom");return}document.documentElement.style.setProperty("--header-bottom",`${Math.ceil(p.bottom)}px`);const f=Math.max(160,h);t&&(t.style.height=`${f}px`,t.style.maxHeight=`${f}px`,t.style.minHeight="0",t.style.overflow="hidden"),o&&(o.style.height="100%",o.style.maxHeight="100%",o.style.minHeight="0",o.style.overflow="hidden");let S=Math.floor(s*.65);if(o){const $=o.getBoundingClientRect();$.width>48&&(S=Math.floor($.width))}const A=o&&o.clientHeight>40?o.clientHeight:f,x=Math.max(140,Math.min(S,A,f));r&&(r.style.width=`${x}px`,r.style.height=`${x}px`),e.style.setProperty("width","100%","important"),e.style.setProperty("height","100%","important"),e.style.setProperty("max-width","100%","important"),e.style.setProperty("max-height","100%","important"),document.documentElement.style.setProperty("--board-fit",`${x}px`)}function la(){cc();const e=document.querySelector(".board-panel"),n=document.getElementById("pilot-controls"),t=document.querySelector(".log-card");if(!e||!n||!t)return;if(dc()){t.style.height="120px",t.style.maxHeight="120px",t.style.flex="0 0 auto";return}const o=10,r=e.getBoundingClientRect().bottom,a=n.getBoundingClientRect().bottom,i=r-a-o,s=Math.max(80,i);t.style.height=`${s}px`,t.style.maxHeight=`${s}px`,t.style.flex="0 0 auto"}function G(){$e(),mo(),la(),Xd(d),Yr(!!d&&d.phase!=="game_over"),xr.refresh(),qr()}function mo(){if(!d){Tn.textContent="",Kn.textContent="—",Ie.disabled=!0;for(const u of[Pt,Bn,ge,Ze,re,Bt])u.disabled=!0;return}Ie.disabled=d.log.length===0;const e=O(d),n=te(d),t=qi(d),o=d.players.filter(u=>u.eliminated).sort((u,f)=>{const S=u.eliminatedOnRound??d.round,A=f.eliminatedOnRound??d.round;if(S!==A)return S-A;const x=u.eliminatedOnTurn??0,$=f.eliminatedOnTurn??0;return x-$}),r=[...t.map(u=>({pl:u.player,worth:u.worth,rankLabel:`#${u.rank}`})),...o.map(u=>({pl:u,worth:q(d,u),rankLabel:"OUT"}))],a=d.config.maxFuel,i=!!d.pendingCharterChoice&&d.pendingCharterChoice.kind==="vibe_kick"&&d.players.find(u=>u.id===d.pendingCharterChoice.chooserId)?.agent==="human";Kn.innerHTML=r.map(({pl:u,worth:f,rankLabel:S})=>{const A=u.id===e.id&&d.phase!=="game_over",x=S==="#1"?" lead":"",$=de[u.propellant].short,y=zr(u.id,u.position),v=I(d.board,y).name,C=!u.eliminated&&u.skipTurns?" · skip":"",R=xs(d,u),T=R.atRisk?`<span class="at-risk-badge" title="Going under: ${R.reasons.join(" · ")}" role="img" aria-label="Going under">⚠</span>`:"",B=lc(u.fuel,a),W=u.eliminated||u.fuel<=1?" fuel-bar-red":u.fuel<=3?" fuel-bar-amber":"",X=i&&!u.eliminated&&u.agent==="ai"?" vibe-kickable":"",Z=od(u.name),Se=X!==""?`Kick ${Z} off the ledger`:`Open ${Z}'s ledger`,ut=X!==""?` data-kick-id="${u.id}"`:"";return`<div class="rank-row rank-open${x}${A?" active":""}${u.eliminated?" out":""}${R.atRisk?" at-risk":""}${X}" data-dossier-id="${u.id}"${ut} role="button" tabindex="0" title="${Se}" aria-label="${Se}"><div class="swatch" style="background:${u.color}" aria-hidden="true"></div><div class="rank-body"><div class="rank-top"><span class="rank-id">${S} ${Z}${C} · <span class="rank-prop">${$}</span>${T}</span><span class="rank-money"><span class="cash">${g(u.cash)} cash</span> · NW ${g(f)}</span></div><div class="rank-detail"><span class="fuel-bar${W}" title="Fuel ${u.fuel} / ${a}" aria-label="Fuel ${u.fuel} of ${a}">${B}</span> <span class="fuel-n">${u.fuel}</span> fuel · ${u.properties.length} claims · ${v}</div></div></div>`}).join("");const s=document.getElementById("charter-choice-hint");if(s){const u=d.pendingCharterChoice,f=u&&d.players.find(S=>S.id===u.chooserId)?.agent==="human";u&&f?(s.classList.remove("hidden"),s.textContent=u.kind==="vibe_kick"?"Vibe-code authority: click an AI rocket in standings to remove them.":u.kind==="olbers_station"?"Olbers award: click a station hub (Elon · Holst · Daktulios) on the board.":"Blockchain reassignment: click an opponent claim on the board."):(s.classList.add("hidden"),s.textContent="")}const l=!!d.pendingCharterChoice&&d.players.find(u=>u.id===d.pendingCharterChoice.chooserId)?.agent==="human",c=!U&&!l&&!ot(d)&&e.agent==="human"&&d.phase!=="game_over"&&d.phase!=="await_duel";Pt.disabled=!c||!n.refuel;const p=d.phase==="await_move"?n.move:n.roll;Bn.disabled=!c||!p,Bn.textContent=d.phase==="await_move"?`Move (${(d.lastRoll?.total??0)-n.breakSpaces})`:"Roll",ge.disabled=!c||!n.buy,Ze.disabled=!c||!n.sell,re.disabled=!c||!n.placeStation,Bt.disabled=!c||!n.endTurn,Wr.disabled=U,Gr.disabled=U;const m=I(d.board,e.position),h=[];if(d.phase==="game_over")h.push("STATUS: GAME OVER"),h.push("");else if(e.eliminated)h.push("STATUS: ELIMINATED"),h.push("");else if(U)h.push("STATUS: MOVING"),h.push("");else if(d.phase==="await_duel")h.push("STATUS: DUEL"),h.push("");else if(d.phase==="await_move"&&d.lastRoll){const u=d.lastRoll,f=u.total-n.breakSpaces;h.push(`DICE ${u.d1}+${u.d2}=${u.total} · break ${n.breakSpaces} · move ${f}`),h.push(e.freeLeavePending&&n.leaveBurnPreview===0?"leave burn FREE (comet dust)":`leave burn ~${n.leaveBurnPreview}`)}else if(d.phase==="await_post_land"){const u=H(m)&&!d.owners[m.id]?`claim available ${g(m.price??0)}`:d.owners[m.id]===e.id?"you own this body":d.owners[m.id]?`owned by ${d.players.find(f=>f.id===d.owners[m.id])?.name??"?"}`:"insertion free";h.push(`LANDED: ${m.name}`),h.push(u)}else d.phase==="await_action"?n.warp&&e.warpCharges>0&&e.agent==="human"?(h.push(`WARP ×${e.warpCharges} — click a board node`),h.push("or Roll for normal transit")):e.warpCharges>0?(h.push(`STATUS: READY · WARP ×${e.warpCharges}`),h.push(`FUEL ${e.fuel}/${d.config.maxFuel} · CLAIMS ${e.properties.length}`)):!e.rolledThisTurn&&e.parkCount>0?(h.push("STATUS: PARKED"),h.push(`park count ${e.parkCount}`)):(h.push("STATUS: READY"),h.push(`FUEL ${e.fuel}/${d.config.maxFuel} · CLAIMS ${e.properties.length}`)):(h.push(`STATUS: ${d.phase}`),h.push(`FUEL ${e.fuel}/${d.config.maxFuel}`));if(Go.className=`telemetry${e.fuel<=1?" fuel-red":e.fuel<=3?" fuel-amber":""}`,Go.innerHTML=h.map((u,f)=>`<div${f===1?' class="line2"':""}>${u}</div>`).join(""),c&&e.canBidirectional&&!e.directionLocked&&(d.phase==="await_move"||d.phase==="await_action")?(Et.classList.remove("hidden-vis"),_e.disabled=!1,Pe.disabled=!1,_e.classList.toggle("selected",e.moveDirection==="forward"),Pe.classList.toggle("selected",e.moveDirection==="backward"),jo.textContent=e.moveDirection==="backward"?"retrograde":"prograde"):e.canBidirectional&&e.directionLocked&&c?(Et.classList.remove("hidden-vis"),_e.disabled=!0,Pe.disabled=!0,_e.classList.toggle("selected",e.moveDirection==="forward"),Pe.classList.toggle("selected",e.moveDirection==="backward"),jo.textContent=e.moveDirection==="backward"?"locked ◀":"locked ▶"):(Et.classList.add("hidden-vis"),_e.disabled=!0,Pe.disabled=!0),d.phase==="await_move"&&d.lastRoll?(Fo.classList.remove("hidden-vis"),Rd.textContent=String(n.breakSpaces),n.breakSpaces>0&&e.freeBreakPending?ie.textContent="FREE (M&Ms)":n.breakSpaces>0?ie.textContent=`−${n.breakFuelCost} fuel`:e.freeBreakPending?ie.textContent="free brake ready":ie.textContent="0 fuel",c&&e.agent==="human"?(ie.title="Click/tap a stop on your rocket-color path to land there",n.breakSpaces===0&&!e.freeBreakPending&&(ie.textContent="0 fuel · path click to land")):ie.title="",Fr.disabled=!c||n.breakSpaces<=0,jr.disabled=!c||n.breakSpaces>=n.maxBreak):(Fo.classList.add("hidden-vis"),Q!==null&&(Q=null)),n.sell?Ze.textContent=`Sell (${g(n.sellValue)})`:Ze.textContent="Sell claim",n.buy)ge.textContent=`Buy (${g(n.buyPrice)})`;else{const u=I(d.board,e.position),f=d.owners[u.id];if(f&&f!==e.id){const S=d.players.find(A=>A.id===f);ge.textContent=`Owned by ${S?.name??"?"}`}else H(u)&&e.cash<(u.price??0)?ge.textContent=`Need ${g(u.price??0)}`:H(u)?ge.textContent="Buy":ge.textContent="Not for sale"}if(n.placeStation){const u=n.placeStationCost;re.textContent=u>0?`Fuel depot ${g(u)} (${e.stationsInHand} left)`:`Fuel depot free (${e.stationsInHand} left)`}else{const u=I(d.board,e.position);d.owners[u.id]!==e.id?re.textContent="Depot (must own)":d.stations[u.id]?re.textContent="Depot built":e.stationsInHand<=0?re.textContent="No depots left":u.kind!=="planet"&&u.kind!=="moon"?re.textContent="Depot (moons/planets only)":e.depotsPlacedThisCircuit>0&&e.cash<ln(e.depotsPlacedThisCircuit,u.price)?re.textContent=`Need ${g(ln(e.depotsPlacedThisCircuit,u.price))} for depot`:re.textContent="Place depot"}Tn.textContent="";const b=Math.max(0,d.log.length-60);for(let u=d.log.length-1;u>=b;u--){const f=d.log[u];if(/↺|^\s*seed\[/i.test(f))continue;const S=document.createElement("div");/Winner|claims|collects|Heliopoly|wins Gravity|auctions |bids |docking rights|sells /i.test(f)?S.className="ok":/eliminated|bankruptcy|stranded|cannot leave|boil-off|forfeit|TIE/i.test(f)?S.className="bad":/rolls|Round|burns|Duel/i.test(f)&&(S.className="warn");const A=u.toString(16).padStart(2,"0").toUpperCase();S.textContent=`${A}:${f}`,Tn.appendChild(S)}Tn.scrollTop=0}function uc(e,n,t){const o=Wt(e);let r=.5,a=.5,i=.5,s=.5;for(const f of o)r=Math.min(r,f.x),a=Math.min(a,f.y),i=Math.max(i,f.x),s=Math.max(s,f.y);for(const f of e.rings)r=Math.min(r,.5-f),a=Math.min(a,.5-f),i=Math.max(i,.5+f),s=Math.max(s,.5+f);const l=Math.max(.01,i-r),c=Math.max(.01,s-a),p=48,m=Math.min((n-2*p)/l,(t-2*p)/c),h=(n-m*l)/2-m*r,E=(t-m*c)/2-m*a,b=(f,S)=>({x:h+m*f,y:E+m*S}),u=b(.5,.5);return{project:b,sun:u,scale:m}}function ct(){return!d||U?!1:O(d).agent==="human"&&d.phase==="await_move"&&!!d.lastRoll&&d.lastRoll.total>0}function hc(e,n,t,o,r,a){const i=r-t,s=a-o,l=i*i+s*s;if(l<1e-9)return Math.hypot(e-t,n-o);let c=((e-t)*i+(n-o)*s)/l;return c=Math.max(0,Math.min(1,c)),Math.hypot(e-(t+c*i),n-(o+c*s))}function da(e,n){if(!Be)return null;const t=16;let o=null,r=t*t;for(const s of Be.stops){const l=(s.x-e)**2+(s.y-n)**2;l<=r&&(r=l,o=s)}if(o)return o;let a=null,i=12;for(const s of Be.segs){const l=hc(e,n,s.x1,s.y1,s.x2,s.y2);l<=i&&(i=l,a=Be.stops[s.stopIndex]??null)}return a}function pc(e,n,t,o,r){e.save(),e.translate(n,t),e.beginPath(),e.moveTo(0,-11),e.bezierCurveTo(2.8,-11,4.2,-6,4,1.2),e.bezierCurveTo(5.8,2.4,7.4,5,7.4,8),e.bezierCurveTo(5.6,6.8,4,6,2.6,5.6),e.bezierCurveTo(2.4,7.2,1.4,8.8,0,9.6),e.bezierCurveTo(-1.4,8.8,-2.4,7.2,-2.6,5.6),e.bezierCurveTo(-4,6,-5.6,6.8,-7.4,8),e.bezierCurveTo(-7.4,5,-5.8,2.4,-4,1.2),e.bezierCurveTo(-4.2,-6,-2.8,-11,0,-11),e.closePath(),e.fillStyle=o,e.fill(),e.strokeStyle=r?"#ffc857":"#fff",e.lineWidth=r?2:1.15,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore()}function $e(){const e=J.width,n=J.height;k.clearRect(0,0,e,n),k.fillStyle="#050814",k.fillRect(0,0,e,n),k.fillStyle="rgba(255,255,255,0.4)";for(let $=0;$<120;$++){const y=$*97%e+$%7,v=$*53%n+$%11;k.fillRect(y,v,$%6===0?2:1,$%6===0?2:1)}const t=d?.board??tr(),{project:o,sun:r,scale:a}=uc(t,e,n);cn={project:o,board:t},Be=null;const i=r.x,s=r.y,l=t.rings.map($=>$*a),c=Un,p=Sn(Ds,c);if(p>0)for(const $ of l)Ro(k,i,s,$,[110,180,255],p,1.5);for(let $=t.rings.length-1;$>=0;$--){const y=To.find(R=>R.ringIndex===$);if(!y)continue;const v=l[$]??0,C=$===0?(l[0]??0)*.35:l[$-1]??0;Os(k,i,s,v,C,y.rgb,Sn(Tr,c),Sn(Rr,c))}for(const $ of To){const y=l[$.ringIndex];y!=null&&Ro(k,i,s,y,$.rgb,Sn(Bs,c),1.75)}const m=Math.max(18,28*(a/900)),h=k.createRadialGradient(i,s,3,i,s,m*1.6);h.addColorStop(0,"#fff8d0"),h.addColorStop(.35,"#ffc857"),h.addColorStop(1,"rgba(255,140,40,0)"),k.fillStyle=h,k.beginPath(),k.arc(i,s,m*1.6,0,Math.PI*2),k.fill();const E=Wt(t),b=$=>o($.x,$.y).x,u=$=>o($.x,$.y).y;k.strokeStyle=_s(),k.lineWidth=Ls,k.lineCap="round",k.lineJoin="round";let f=0;const S=new Map;for(const $ of E)for(const y of $.next){const v=t.nodes[y];if(!v)continue;const C=`${$.id}->${y}`;S.set(C,f);const R=Mr({x:b($),y:u($)},{x:b(v),y:u(v)},r,f);f+=1,k.beginPath(),k.moveTo(R[0].x,R[0].y);for(let T=1;T<R.length;T++)k.lineTo(R[T].x,R[T].y);k.stroke()}if(d&&ct()){const $=O(d),y=d.lastRoll.total,v=Re(d.board,$.position,y,$.moveDirection),C=t.nodes[$.position],R=[];C&&R.push({x:b(C),y:u(C)});for(const M of v.frames){const Y=t.nodes[M.nodeId];Y&&R.push({x:b(Y),y:u(Y)})}let T=0;if(C&&v.frames[0]){const M=`${C.id}->${v.frames[0].nodeId}`;T=S.get(M)??0}const B=Ps(R,r,T),W=[];for(let M=0;M<v.stops.length;M++){const Y=v.stops[M],ee=t.nodes[Y];if(!ee)continue;const Le=M+1,wn=y-Le,me=De($.freeBreakPending,wn);W.push({stopIndex:M,nodeId:Y,moveSteps:Le,breakSpaces:wn,breakFuel:me,affordable:$.fuel+1e-9>=me,x:b(ee),y:u(ee)})}const X=[];let Z=C?b(C):0,Se=C?u(C):0;for(const M of W)X.push({stopIndex:M.stopIndex,x1:Z,y1:Se,x2:M.x,y2:M.y}),Z=M.x,Se=M.y;if(Be={color:$.color,selectedBreak:d.breakSpaces,total:y,stops:W,segs:X,poly:B},B.length>=2){k.save(),k.lineCap="round",k.lineJoin="round",k.strokeStyle=$.color,k.globalAlpha=.28,k.lineWidth=5.25,k.beginPath(),k.moveTo(B[0].x,B[0].y);for(let M=1;M<B.length;M++)k.lineTo(B[M].x,B[M].y);k.stroke(),k.globalAlpha=.95,k.lineWidth=1.7,k.beginPath(),k.moveTo(B[0].x,B[0].y);for(let M=1;M<B.length;M++)k.lineTo(B[M].x,B[M].y);k.stroke(),k.restore()}const ut=d.breakSpaces;for(const M of W){const Y=M.breakSpaces===ut,ee=Q===M.stopIndex,Le=ee||Y?7:4.5;k.beginPath(),k.arc(M.x,M.y,Le,0,Math.PI*2),M.affordable?(k.fillStyle=Y||ee?$.color:"rgba(10,14,28,0.85)",k.strokeStyle=$.color):(k.fillStyle="rgba(80,80,90,0.55)",k.strokeStyle="rgba(140,140,150,0.7)"),k.lineWidth=Y?2.5:1.5,k.fill(),k.stroke()}if(Q!==null){const M=W.find(ee=>ee.stopIndex===Q),Y=M?X[M.stopIndex]:void 0;if(M&&Y){const ee=M.affordable?M.breakSpaces===0?`Full roll · ${M.moveSteps} spaces · 0 fuel`:M.breakFuel===0&&$.freeBreakPending?`Break −${M.breakSpaces} · FREE (M&Ms)`:`Break −${M.breakSpaces} · ${M.breakFuel} fuel`:`Break −${M.breakSpaces} · need ${M.breakFuel} fuel`,Le=(Y.x1+M.x)/2,wn=(Y.y1+M.y)/2-14;k.save(),k.font="bold 11px system-ui",k.textAlign="center",k.textBaseline="middle";const me=k.measureText(ee).width+14,Ve=18,ht=Math.max(me/2+4,Math.min(e-me/2-4,Le)),pt=Math.max(Ve/2+4,Math.min(n-Ve/2-4,wn));k.fillStyle="rgba(8,12,24,0.92)",k.strokeStyle=M.affordable?$.color:"rgba(255,107,122,0.85)",k.lineWidth=1.5;const go=me/2,fo=Ve/2;k.beginPath(),typeof k.roundRect=="function"?k.roundRect(ht-go,pt-fo,me,Ve,6):k.rect(ht-go,pt-fo,me,Ve),k.fill(),k.stroke(),k.fillStyle=M.affordable?"#e8eefc":"#ff9aa5",k.fillText(ee,ht,pt),k.restore()}}}const A=new Set(Object.values(ve)),x=!!d&&d.phase==="await_action"&&!U&&O(d).agent==="human"&&O(d).warpCharges>0&&te(d).warp;for(const $ of E){const y=b($),v=u($),C=to($);x&&$.id!==O(d).position&&(k.beginPath(),k.arc(y,v,C+12,0,Math.PI*2),k.strokeStyle="rgba(120, 220, 255, 0.85)",k.lineWidth=2,k.setLineDash([5,4]),k.stroke(),k.setLineDash([])),A.has($.id)&&(k.beginPath(),k.arc(y,v,C+10,0,Math.PI*2),k.strokeStyle="rgba(255,200,87,0.95)",k.lineWidth=2.5,k.stroke());const R=d?.owners[$.id],T=R?d?.players.find(Se=>Se.id===R):void 0;T&&(k.beginPath(),k.arc(y,v,C+6,0,Math.PI*2),k.strokeStyle=T.color,k.lineWidth=3.5,k.stroke());const B=Us(k,$,y,v);d?.stations[$.id]&&Ks(k,y+B*.55,v-B*.55),k.font="bold 11px system-ui",k.textAlign="center",k.textBaseline="top";let W=$.kind==="space"?"":$.name;W&&T&&(W=`${W} · ${T.name}`);const X=Math.min(n-4,v+B+6),Z=Math.max(4,Math.min(e-4,y));W&&(k.strokeStyle="rgba(5,8,20,0.9)",k.lineWidth=3,k.strokeText(W,Z,X),k.fillStyle=T?T.color:"rgba(232,238,252,0.96)",k.fillText(W,Z,X))}if(d){const $=new Map;for(const y of d.players){if(y.eliminated)continue;const v=zr(y.id,y.position),C=$.get(v)??[];C.push(y),$.set(v,C)}for(const[y,v]of $){const C=t.nodes[y];C&&v.forEach((R,T)=>{const B=T/Math.max(v.length,1)*Math.PI*2,W=b(C)+Math.cos(B)*18,X=u(C)+Math.sin(B)*18,Z=ve[R.id]!==void 0;pc(k,W,X,R.color,Z)})}}}function ca(e,n){if(!cn)return null;const t=J.getBoundingClientRect();return{sx:(e-t.left)*(J.width/t.width),sy:(n-t.top)*(J.height/t.height)}}function Ht(e,n){if(!cn)return null;const{project:t,board:o}=cn;let r=null;for(const a of Wt(o)){const i=t(a.x,a.y),s=(i.x-e)**2+(i.y-n)**2,l=to(a)+14;s<=l*l&&(!r||s<r.d)&&(r={id:a.id,d:s})}return r?.id??null}function ua(){if(!d||U)return!1;const e=O(d);return e.agent!=="human"||d.phase!=="await_action"?!1:e.warpCharges>0&&te(d).warp}async function mc(e){if(!(!d||!ct())){if(!e.affordable){gc(`Need ${e.breakFuel} fuel to break −${e.breakSpaces} spaces`);return}Q=null,await N({type:"set_break",spaces:e.breakSpaces}),!(!d||d.phase!=="await_move")&&await N({type:"move"})}}function gc(e){const n=document.getElementById("path-flash");if(n){n.textContent=e,n.classList.remove("hidden"),window.setTimeout(()=>n.classList.add("hidden"),2200);return}ie.textContent=e,ie.classList.add("break-cost-warn"),window.setTimeout(()=>ie.classList.remove("break-cost-warn"),2200)}J.addEventListener("mousemove",e=>{if(!cn||!d){ce.classList.add("hidden"),J.style.cursor="default",Q!==null&&(Q=null,$e());return}const n=ca(e.clientX,e.clientY);if(!n){ce.classList.add("hidden");return}const{sx:t,sy:o}=n,r=ct()?da(t,o):null,a=r?.stopIndex??null;if(a!==Q&&(Q=a,$e()),r){ce.classList.add("hidden"),J.style.cursor=r.affordable?"pointer":"not-allowed";return}const i=Ht(t,o),s=ua();if(J.style.cursor=s&&i&&i!==O(d).position?"pointer":s?"crosshair":"default",!i){ce.classList.add("hidden");return}const l=d.players.find(f=>f.agent==="human")??O(d),c=Ys(d,i,l),p=s&&i!==O(d).position?'<div class="tip-line hot">Click to WARP here</div>':"";ce.innerHTML=`<h4>${c.title}</h4>${p}${c.lines.map(f=>`<div class="tip-line${/Owner|MONOPOLY|BUY|FERAL|Leave fuel|Rent|depot/i.test(f)?" hot":""}">${f}</div>`).join("")}`,ce.classList.remove("hidden");const m=12;let h=e.clientX+16,E=e.clientY+16;const b=300,u=220;h+b>window.innerWidth-m&&(h=e.clientX-b-8),E+u>window.innerHeight-m&&(E=e.clientY-u-8),ce.style.left=`${h}px`,ce.style.top=`${E}px`});J.addEventListener("mouseleave",()=>{ce.classList.add("hidden"),J.style.cursor="default",Q!==null&&(Q=null,$e())});J.addEventListener("click",e=>{if(!d||U)return;const n=ca(e.clientX,e.clientY);if(!n)return;const t=d.pendingCharterChoice;if(t){const r=d.players.find(a=>a.id===t.chooserId);if(r?.agent==="human"){const a=Ht(n.sx,n.sy);if(!a)return;if(t.kind==="olbers_station"&&gr(a)){N({type:"charter_olbers",stationId:a});return}if(t.kind==="blockchain_steal"&&He(d,r.id).includes(a)){N({type:"charter_steal",nodeId:a});return}return}}if(ct()){const r=da(n.sx,n.sy);if(r){mc(r);return}}if(!ua())return;const o=Ht(n.sx,n.sy);o&&o!==O(d).position&&N({type:"warp",destination:o})});function hn(){la(),$e()}window.addEventListener("resize",hn);window.addEventListener("orientationchange",()=>{window.setTimeout(hn,200)});window.visualViewport?.addEventListener("resize",hn);(function(){try{const n=typeof location<"u"?location.protocol:"",t=n==="file:"||n==="heliopoly:"||typeof navigator<"u"&&!!navigator.standalone,o=typeof window<"u"&&!!window.matchMedia?.("(pointer: coarse)").matches;t&&document.documentElement.classList.add("native-shell"),o&&document.documentElement.classList.add("touch-ui")}catch{}})();Ke(!1);$e();mo();requestAnimationFrame(()=>{hn(),requestAnimationFrame(hn)});
//# sourceMappingURL=index-CaCLVGJD.js.map
