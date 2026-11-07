'use strict';
const main = document.querySelector('main');
const key = 'ent-clinical-notebook-v1';
let state = {history:{},runs:{},read:{}};
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && saved.history && typeof saved.history === 'object') state = saved;
} catch {}
state.runs ??= state.run ? {ear:state.run} : {};
state.read ??= {};
delete state.run;
let activeTopic = 'ear';
const byId = new Map(questions.map(q=>[q.id,q]));
const topicIds = topics.map(t=>t[0]);
const isTopic = id => topicIds.includes(id);
const keyPointsData = typeof keyPoints==='object' ? keyPoints : {};
function safe(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{const s=document.getElementById('save-status');if(s)s.textContent='השמירה בדפדפן אינה זמינה כרגע';}}
function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
const letters = 'אבגדה';
const pct = (a,b) => b ? Math.round(100*a/b) : 0;
function scopeTitle(id){
  if(id==='mixed')return 'תרגול מעורב';
  const t=topics.find(t=>t[0]===id);if(t)return t[1];
  return reconstructionSets.find(s=>s.id===id)?.title || '';
}
function stats(list){
  let answered=0,correct=0;
  for(const q of list){if(Object.hasOwn(state.history,q.id)){answered++;if(state.history[q.id])correct++;}}
  return {total:list.length,answered,correct,wrong:answered-correct};
}
const questionsOf = id => questions.filter(q=>q.topic===id);
const sectionName = q => chapters[q.topic]?.sections.find(section=>section[0]===q.section)?.[1] || '';
function meter(s,label){
  const done=pct(s.answered,s.total),ok=pct(s.correct,s.total);
  return '<span class="meter" role="img" aria-label="'+safe(label)+': נענו '+s.answered+' מתוך '+s.total+', '+s.correct+' נכונות"><i class="meter-done" style="width:'+done+'%"></i><i class="meter-ok" style="width:'+ok+'%"></i></span>';
}
function statLine(s){
  if(!s.answered)return 'טרם התחלת · '+s.total+' שאלות';
  return s.answered+'/'+s.total+' נענו · '+pct(s.correct,s.answered)+'% נכון';
}
function activeRun(){
  let best=null;
  for(const [scope,run] of Object.entries(state.runs||{})){
    if(!run?.ids?.length||run.idx>=run.ids.length||!run.ids.every(id=>byId.has(id)))continue;
    if(!best||(run.t||0)>(best.run.t||0))best={scope,run};
  }
  return best;
}
function scopeHref(scope){
  if(scope==='mixed')return '#practice';
  if(isTopic(scope))return '#topic/'+scope+'/practice';
  return '#exams/'+scope;
}
function ring(value){
  const r=52,c=2*Math.PI*r,off=c*(1-value/100);
  return '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-track" cx="60" cy="60" r="'+r+'"/><circle class="ring-value" cx="60" cy="60" r="'+r+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg>';
}
function progressPanel(){
  const all=stats(questions);
  const readCount=topicIds.filter(id=>state.read[id]).length;
  const answeredPct=pct(all.answered,all.total);
  const run=activeRun();
  const actions=[];
  if(run)actions.push('<a class="primary" href="'+scopeHref(run.scope)+'">המשך סבב: '+safe(scopeTitle(run.scope))+' · שאלה '+(run.run.idx+1)+' מתוך '+run.run.ids.length+' ←</a>');
  if(all.wrong)actions.push('<a class="secondary" href="#practice/wrong">חזרה על '+all.wrong+' טעויות</a>');
  actions.push('<a class="secondary" href="#practice">תרגול מעורב מכל הנושאים</a>');
  return '<section class="progress-panel" aria-labelledby="progress-title"><div class="ring-wrap">'+ring(answeredPct)+'<div class="ring-label"><strong>'+answeredPct+'%</strong><span>מהשאלות נענו</span></div></div><div class="progress-body"><h2 id="progress-title">ההתקדמות שלך</h2><dl class="facts"><div><dt>שאלות שנענו</dt><dd>'+all.answered+' <small>מתוך '+all.total+'</small></dd></div><div><dt>תשובות נכונות</dt><dd>'+all.correct+' <small>'+(all.answered?pct(all.correct,all.answered)+'% מהנענות':'—')+'</small></dd></div><div><dt>פרקים שנקראו</dt><dd>'+readCount+' <small>מתוך '+topicIds.length+'</small></dd></div><div><dt>לחזרה</dt><dd>'+all.wrong+' <small>טעויות</small></dd></div></dl><div class="actions">'+actions.join('')+'</div>'+(all.answered||readCount?'<button type="button" class="link-button" id="reset-progress">איפוס ההתקדמות</button>':'')+'</div></section>';
}
function home(){
  const rows=topics.map(([id,title,description],i)=>{
    const s=stats(questionsOf(id));
    return '<li><a class="topic-row" href="#topic/'+id+'"><span class="number">'+String(i+1).padStart(2,'0')+'</span><span class="topic-main"><strong>'+safe(title)+(state.read[id]?' <em class="read-badge">נקרא ✓</em>':'')+'</strong><small>'+safe(description)+'</small>'+meter(s,title)+'<small class="topic-stat">'+statLine(s)+'</small></span><span class="row-status">סיכום ותרגול <b aria-hidden="true">←</b></span></a></li>';
  }).join('');
  const sets=reconstructionSets.filter(set=>questionsOf(set.id).length).map(set=>{
    const s=stats(questionsOf(set.id));
    return '<li><a href="#exams/'+set.id+'"><span>'+safe(set.title)+'</span>'+meter(s,set.title)+'<small>'+statLine(s)+'</small></a></li>';
  }).join('');
  main.innerHTML='<section class="opening"><div><p class="eyebrow">מחברת לקראת הסבב והבחינה</p><h1>רפואת אף,<br>אוזן וגרון</h1><p class="lede">סיכומים לקריאה ותרגול לפי נושא, עם דגש על ההחלטות שמקבלים במרפאה ובמיון.</p><a class="primary" href="#topic/neck">להתחלת הלימוד <span aria-hidden="true">←</span></a></div><figure class="cover" aria-hidden="true"><svg viewBox="0 0 420 315" fill="none"><circle cx="210" cy="153" r="122"/><path d="M191 60C234 46 270 63 285 98c8 18 8 31 10 45l27 33c4 5 1 11-5 12l-20 3-2 30c-1 17-13 24-27 24h-28l-5 36M150 283l18-53c-5-21-22-38-31-62-17-44-3-88 38-105m-7 91c-6-24 16-39 34-29 16 9 12 27 1 37-6 6-5 15-14 18-12 3-23-7-17-16m13-15c-1-9 9-12 14-5m63 8 26-2m-28 13 25 1m-30 31 26 4m-51 29 12 23"/><path class="guide-lines" d="M42 150h120m137 13h76m-128 61h105"/><circle class="point" cx="42" cy="150" r="4"/><circle class="point" cx="375" cy="163" r="4"/><circle class="point" cx="352" cy="224" r="4"/></svg><figcaption>אוזן · אף · גרון</figcaption></figure></section>'+progressPanel()+'<div class="home-grid"><section><h2>נושאי הקורס</h2><ol class="topic-list">'+rows+'</ol></section><aside class="exam-panel"><p class="eyebrow">מסלול תרגול</p><h2>שחזורי בחינות</h2><p>בחני פתיחה ושחזורים, לפי הסדר שבו הופיעו במקור. בסוף כל שאלה מופיעה הפניה למקור.</p><ul class="set-list">'+sets+'</ul><a href="#exams">לכל השחזורים <span aria-hidden="true">←</span></a></aside></div>';
  const reset=document.getElementById('reset-progress');
  if(reset)reset.onclick=()=>{
    if(!confirm('למחוק את כל ההתקדמות, התשובות והסימונים שנשמרו בדפדפן הזה?'))return;
    state={history:{},runs:{},read:{}};save();home();
  };
}
function presentationPath(topicId=activeTopic){
  const courseResources = {neck:'218427',pediatric:'218461'};
  if(courseResources[topicId]){
    if(document.documentElement.dataset.preview)return 'local-sources/'+topicId+'.pptx';
    return 'https://moodle.tau.ac.il/mod/resource/view.php?id='+courseResources[topicId];
  }
  return (document.documentElement.dataset.preview ? 'dist/' : '')+'sources/'+topicId+'.pptx';
}
function presentationLink(topicId=activeTopic){
  const moodle=presentationPath(topicId).startsWith('https://');
  return moodle
    ? '<a href="'+presentationPath(topicId)+'" target="_blank" rel="noopener">מצגת הפרק במודל</a> <small>(דורש התחברות לחשבון האוניברסיטה)</small>'
    : '<a href="'+presentationPath(topicId)+'" download>הורדת מצגת הפרק (PowerPoint)</a>';
}
function sectionBody(blocks){
  let output='', tableOpen=false;
  for(const block of blocks){
    if(block.startsWith('|')){
      const cells=block.slice(1,-1).split('|');
      const tag=tableOpen?'td':'th';
      if(!tableOpen)output+='<div class="table-scroll" tabindex="0" role="region" aria-label="טבלת השוואה"><table>';
      output+='<tr>'+cells.map(cell=>'<'+tag+(tag==='th'?' scope="col"':'')+'>'+safe(cell)+'</'+tag+'>').join('')+'</tr>';
      tableOpen=true;
    } else {
      if(tableOpen)output+='</table></div>';
      tableOpen=false;
      output+='<p>'+safe(block)+'</p>';
    }
  }
  return output+(tableOpen?'</table></div>':'');
}
function figure(id){
  return (chapters[activeTopic].figures?.[id] || []).map(f=>'<figure class="clinical-figure"><img src="'+safe(f.src)+'" alt="'+safe(f.title)+'" loading="lazy" decoding="async"><figcaption><strong>'+safe(f.title)+'</strong><span>'+safe(f.caption)+'</span>'+(f.slide?'<small class="source">מצגת הקורס · שקופית '+f.slide+'</small>':'')+'</figcaption></figure>').join('');
}
function readingSection(id,paragraphs){
  if((activeTopic==='neck'&&id==='map')||(activeTopic==='sinuses'&&id==='0')){
    return sectionBody(paragraphs.slice(0,1))+figure(id)+sectionBody(paragraphs.slice(1));
  }
  return sectionBody(paragraphs)+figure(id);
}
function keyPointsBox(id){
  const points=keyPointsData[id];
  if(!points?.length)return '';
  return '<section id="keypoints" class="keypoints" tabindex="-1"><h2>נקודות מפתח לבחינה</h2><ul>'+points.map(p=>'<li>'+safe(p)+'</li>').join('')+'</ul></section>';
}
function topic(id,tab){
  const entry=topics.find(t=>t[0]===id);
  if(!entry){home();return;}
  activeTopic=id;
  const title=safe(entry[1]);
  const index=topics.indexOf(entry);
  const s=stats(questionsOf(id));
  const header='<a class="back" href="#home">חזרה לנושאים</a><header class="chapter-header"><p class="eyebrow">פרק '+String(index+1).padStart(2,'0')+' מתוך '+topics.length+'</p><h1>'+title+'</h1><div class="chapter-progress">'+meter(s,entry[1])+'<span>'+statLine(s)+(state.read[id]?' · הסיכום נקרא ✓':'')+'</span></div></header>';
  const chapter=chapters[id];
  const tabs='<nav class="tabs" aria-label="תצוגת הפרק"><a '+(!tab?'aria-current="page"':'')+' href="#topic/'+id+'">סיכום</a><a '+(tab?'aria-current="page"':'')+' href="#topic/'+id+'/practice">תרגול <small>('+s.total+')</small></a></nav>';
  const prev=topics[index-1],next=topics[index+1];
  const pager='<nav class="pager" aria-label="מעבר בין פרקים">'+(prev?'<a href="#topic/'+prev[0]+'"><small>הפרק הקודם</small>→ '+safe(prev[1])+'</a>':'<span></span>')+(next?'<a href="#topic/'+next[0]+'"><small>הפרק הבא</small>'+safe(next[1])+' ←</a>':'<span></span>')+'</nav>';
  const kp=keyPointsData[id]?.length;
  const contents='<aside class="contents"><strong>בפרק הזה</strong>'+(kp?'<button type="button" data-section="keypoints">נקודות מפתח</button>':'')+chapter.sections.map(([sid,stitle])=>'<button type="button" data-section="'+sid+'">'+safe(stitle)+'</button>').join('')+'</aside>';
  const readButton='<button type="button" class="secondary read-toggle" aria-pressed="'+(state.read[id]?'true':'false')+'">'+(state.read[id]?'✓ סימנת שקראת את הפרק':'סימון הפרק כנקרא')+'</button>';
  main.innerHTML=header+tabs+(tab?'<div id="practice"></div>':'<div class="reading">'+contents+'<article><p class="lede">'+safe(chapter.intro)+'</p>'+keyPointsBox(id)+chapter.sections.map(([sid,stitle,paragraphs])=>'<section id="'+sid+'" tabindex="-1"><h2>'+safe(stitle)+'</h2>'+readingSection(sid,paragraphs)+'</section>').join('')+'<p class="source">'+presentationLink(id)+'</p><div class="chapter-end">'+readButton+'<a class="primary" href="#topic/'+id+'/practice">לתרגול הפרק ←</a></div>'+pager+'</article></div>');
  if(tab){practice();return;}
  main.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>{
    const section=document.getElementById(button.dataset.section);
    section.focus({preventScroll:true});section.scrollIntoView({block:'start',behavior:'smooth'});
  });
  main.querySelector('.read-toggle').onclick=()=>{
    if(state.read[id])delete state.read[id];else state.read[id]=true;
    save();
    const y=window.scrollY;topic(id,false);window.scrollTo(0,y);
    main.querySelector('.read-toggle').focus({preventScroll:true});
  };
}
function exams(id){
  const exam=reconstructionSets.find(item=>item.id===id);
  if(exam&&questions.some(q=>q.topic===exam.id)){
    activeTopic=exam.id;
    const s=stats(questionsOf(exam.id));
    main.innerHTML='<a class="back" href="#exams">חזרה לשחזורים</a><header class="chapter-header"><h1>'+safe(exam.title)+'</h1><p>'+safe(exam.origin)+'</p><p>זהו תרגול מעובד מתוך השחזור. המספור במשוב מפנה לשאלה המקורית.</p><div class="chapter-progress">'+meter(s,exam.title)+'<span>'+statLine(s)+'</span></div></header><div id="practice"></div>';
    practice();
    return;
  }
  const cards=items=>items.map(item=>{
    const list=questionsOf(item.id),count=list.length,s=stats(list);
    const status=count ? count+' שאלות מעובדות'+(item.total?' מתוך '+item.total+' במקור':'') : 'המקור אותר וממתין לקליטה';
    return '<section class="exam-panel"><h3>'+safe(item.title)+'</h3><p>'+safe(item.origin)+'</p><p>'+status+'</p>'+(count?'<div class="chapter-progress">'+meter(s,item.title)+'<span>'+statLine(s)+'</span></div>':'')+(count?'<a class="primary" href="#exams/'+item.id+'">'+(item.opening?'לתרגול בוחן הפתיחה':'לתרגול השחזור')+' ←</a> ':'')+(item.url?'<a href="'+safe(item.url)+'" target="_blank" rel="noopener">תיקיית המקור ב־Drive</a>':'')+'</section>';
  }).join('');
  main.innerHTML='<a class="back" href="#home">חזרה לנושאים</a><header class="chapter-header"><h1>שחזורי בחינות</h1><p>בחרו בוחן פתיחה או שחזור לפי המועד והנוסח. הגישה לתיקיות המקור כפופה להרשאות ב־Drive.</p></header><section><h2>בחני פתיחה</h2><div class="recon-list">'+cards(reconstructionSets.filter(item=>item.opening))+'</div></section><section><h2>שחזורים נוספים</h2><div class="recon-list">'+cards(reconstructionSets.filter(item=>!item.opening))+'</div></section>';
}
function mixedPage(mode){
  activeTopic='mixed';
  const s=stats(questions);
  main.innerHTML='<a class="back" href="#home">חזרה לנושאים</a><header class="chapter-header"><p class="eyebrow">כל המאגר</p><h1>תרגול מעורב</h1><p>שאלות מכל הפרקים, השחזורים ובחני הפתיחה. אפשר לצמצם לפרק אחד, לבחור רק שאלות חדשות או לחזור על טעויות.</p><div class="chapter-progress">'+meter(s,'כל המאגר')+'<span>'+statLine(s)+'</span></div></header><div id="practice"></div>';
  practice(mode);
}
function inMixedScope(q,topicFilter){
  if(!topicFilter)return true;
  if(topicFilter==='recon')return !isTopic(q.topic);
  return q.topic===topicFilter;
}
function settings(stage,presetMode){
  const mixed=activeTopic==='mixed';
  const chapter=mixed?null:chapters[activeTopic];
  const intro=mixed
    ? '<p>הסבב נבנה באקראי מתוך השאלות שבחרתם.</p>'
    : chapter
    ? '<p>לבדיקת הכיסוי של הפרק, בחרו את כל תתי־הנושאים ואת כל השאלות המתאימות. בסיום יופיע פירוט לפי תת־נושא.</p>'
    : '<p>הסבב כולל שאלות מהשחזור שבחרת, לפי הסדר שבו הופיעו במקור.</p>';
  const topicFilter=mixed
    ? '<label>מקור השאלות<select name="topic"><option value="">כל השאלות במאגר</option>'+topics.map(([id,title])=>'<option value="'+id+'">'+safe(title)+'</option>').join('')+'<option value="recon">שחזורים ובחני פתיחה</option></select></label>'
    : '';
  const sectionFilter=chapter
    ? '<label>תת־נושא<select name="section"><option value="">כל תתי־הנושאים</option>'+chapter.sections.filter(([id])=>questions.some(q=>q.topic===activeTopic&&q.section===id)).map(([id,title])=>'<option value="'+id+'">'+safe(title)+'</option>').join('')+'</select></label>'
    : '';
  const sizes=mixed?'<option value="10">10 שאלות</option><option value="20">20 שאלות</option><option value="all">כל השאלות המתאימות</option>':'<option value="all">כל השאלות המתאימות</option><option value="4">4 שאלות</option><option value="10">10 שאלות</option>';
  stage.innerHTML='<section class="quiz"><h2>בחירת סבב</h2>'+intro+'<form id="quiz-form">'+topicFilter+sectionFilter+'<label>סוג התרגול<select name="mode"><option value="all">כל השאלות</option><option value="new">שאלות שטרם נענו</option><option value="wrong">חזרה על טעויות</option></select></label><label>מספר שאלות<select name="size">'+sizes+'</select></label><p id="available" aria-live="polite"></p><button type="submit" class="primary">התחלת סבב ←</button></form></section>';
  const form=stage.querySelector('form');
  if(presetMode==='wrong')form.mode.value='wrong';
  function pool(){
    const {section,mode,topic}=Object.fromEntries(new FormData(form));
    return questions.filter(q=>(mixed?inMixedScope(q,topic):q.topic===activeTopic)&&(!section||section===q.section)&&(mode==='all'||(mode==='new'?!Object.hasOwn(state.history,q.id):state.history[q.id]===false)));
  }
  function update(){
    const count=pool().length;
    stage.querySelector('#available').textContent=count?count+' שאלות מתאימות':'אין שאלות שמתאימות לבחירה הזאת';
    form.querySelector('button').disabled=!count;
  }
  form.onchange=update;update();
  form.onsubmit=event=>{
    event.preventDefault();
    const selected=pool();
    const ordered=!chapter&&!mixed;
    if(ordered)selected.sort((a,b)=>a.number-b.number);
    const availableIds=selected.map(q=>q.id);
    const ids=(ordered?availableIds:shuffle(availableIds)).slice(0,Number(new FormData(form).get('size'))||Infinity);
    if(!ids.length)return;
    startRun(ids);
  };
}
function startRun(ids){
  state.runs[activeTopic]={ids,idx:0,picks:[],t:Date.now()};save();practice();focusQuestion();
}
function focusQuestion(){document.getElementById('question')?.focus();}
function answer(index){
  const run=state.runs[activeTopic];
  if(run.picks.length>run.idx)return;
  const position={left:window.scrollX,top:window.scrollY,behavior:'instant'};
  const id=run.ids[run.idx];
  run.picks.push(index);run.t=Date.now();state.history[id]=index===byId.get(id).k;save();practice();
  document.querySelector('.answers').focus({preventScroll:true});
  window.scrollTo(position);
}
function feedback(q){
  const exam=reconstructionSets.find(item=>item.id===q.topic);
  const source=exam
    ? '<p class="source">שאלה '+q.number+' במקור'+(q.page?', עמ׳ '+q.page:'')+(exam.url?' · <a href="'+safe(exam.url)+'" target="_blank" rel="noopener">תיקיית המקור</a>':'')+'</p>'
    : '<p class="source">'+presentationLink(q.topic)+' · <a href="#topic/'+q.topic+'">לסיכום הפרק</a></p>';
  return '<section class="feedback"><p class="explanation">'+safe(q.e)+'</p>'+(q.clarification?'<p class="explanation">'+safe(q.clarification)+'</p>':'')+'<h3>הסבר לכל אפשרות</h3><ol class="review">'+q.a.map((a,i)=>'<li'+(i===q.k?' class="is-correct"':'')+'><strong>'+letters[i]+'. '+safe(a)+'</strong><p>'+safe(q.x[i])+'</p></li>').join('')+'</ol>'+source+'</section>';
}
function breakdownTable(caption,rows){
  return '<h3>'+caption+'</h3><div class="table-scroll" tabindex="0" role="region" aria-label="'+caption+'"><table><thead><tr><th scope="col">נושא</th><th scope="col">נכונות בסבב</th><th scope="col">שאלות שלא נכללו</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function runBreakdown(run){
  const resultById=new Map(run.ids.map((id,index)=>[id,byId.get(id).k===run.picks[index]]));
  if(activeTopic==='mixed'){
    const groups=[...new Set(run.ids.map(id=>byId.get(id).topic))];
    const rows=groups.map(g=>{
      const ids=run.ids.filter(id=>byId.get(id).topic===g);
      const correct=ids.filter(id=>resultById.get(id)).length;
      return '<tr><th scope="row">'+safe(scopeTitle(g))+'</th><td>'+correct+' מתוך '+ids.length+'</td><td>'+(questionsOf(g).length-ids.length)+'</td></tr>';
    }).join('');
    return breakdownTable('פירוט לפי מקור',rows);
  }
  const chapter=chapters[activeTopic];
  if(!chapter)return '';
  const chapterQuestions=questionsOf(activeTopic);
  const rows=chapter.sections.map(([id,title])=>{
    const available=chapterQuestions.filter(q=>q.section===id);
    if(!available.length)return '';
    const attempted=available.filter(q=>resultById.has(q.id));
    const correct=attempted.filter(q=>resultById.get(q.id)).length;
    const unseen=available.length-attempted.length;
    const answerText=attempted.length?correct+' מתוך '+attempted.length:'לא נבדק בסבב';
    return '<tr><th scope="row">'+safe(title)+'</th><td>'+answerText+'</td><td>'+unseen+'</td></tr>';
  }).join('');
  return breakdownTable('כיסוי לפי תת־נושא',rows)+'<p>הפירוט מתייחס לשאלות במאגר. תת־נושא שלא נבדק בסבב עדיין דורש תרגול.</p>';
}
function practice(presetMode){
  const stage=document.getElementById('practice');
  const run=state.runs[activeTopic];
  const valid=run?.ids?.length&&run.ids.every(id=>byId.has(id)&&(activeTopic==='mixed'||byId.get(id).topic===activeTopic));
  if(!valid){settings(stage,presetMode);return;}
  if(run.idx>=run.ids.length){
    const results=run.ids.map((id,i)=>byId.get(id).k===run.picks[i]);
    const score=results.filter(Boolean).length;
    const wrongIds=run.ids.filter((id,i)=>!results[i]);
    const list='<h3>השאלות בסבב</h3><ol class="run-list">'+run.ids.map((id,i)=>'<li class="'+(results[i]?'ok':'no')+'"><span class="mark" aria-hidden="true">'+(results[i]?'✓':'✗')+'</span><span>'+safe(byId.get(id).q)+'<small>'+(results[i]?'נכון':'התשובה הנכונה: '+letters[byId.get(id).k]+'. '+safe(byId.get(id).a[byId.get(id).k]))+'</small></span></li>').join('')+'</ol>';
    stage.innerHTML='<section class="quiz"><h2 tabindex="-1" id="question">סיכום הסבב</h2><p class="score">'+score+' מתוך '+run.ids.length+'</p><p>תשובות נכונות ('+pct(score,run.ids.length)+'%)</p><div class="actions">'+(wrongIds.length?'<button class="primary" id="retry">חזרה על '+wrongIds.length+' הטעויות מהסבב ←</button>':'')+'<button class="'+(wrongIds.length?'secondary':'primary')+'" id="reset">בחירת סבב נוסף</button></div>'+runBreakdown(run)+list+'</section>';
    stage.querySelector('#reset').onclick=()=>{state.runs[activeTopic]=null;save();practice();stage.querySelector('select')?.focus();};
    const retry=stage.querySelector('#retry');
    if(retry)retry.onclick=()=>startRun(shuffle([...wrongIds]));
    return;
  }
  const q=byId.get(run.ids[run.idx]),selected=run.picks[run.idx],done=Number.isInteger(selected);
  const label=activeTopic==='mixed'?scopeTitle(q.topic)+(sectionName(q)&&isTopic(q.topic)?' · '+sectionName(q):''):sectionName(q);
  const hint=!done&&matchMedia('(hover:hover)').matches?'<p class="kbd-hint">אפשר לענות גם במקלדת: 1–'+q.a.length+'</p>':'';
  stage.innerHTML='<section class="quiz"><div class="quiz-top"><span>'+safe(label)+'</span><span>שאלה '+(run.idx+1)+' מתוך '+run.ids.length+' · <button type="button" class="link-button" id="quit">יציאה מהסבב</button></span></div><progress max="'+run.ids.length+'" value="'+(run.idx+(done?1:0))+'" aria-label="התקדמות בסבב"></progress><h2 tabindex="-1" id="question">'+safe(q.q)+'</h2><div class="answers" tabindex="-1" role="group" aria-label="'+(done?'התשובה הנכונה היא '+letters[q.k]:'אפשרויות התשובה')+'">'+q.a.map((a,i)=>{
    const correct=done&&i===q.k,chosen=done&&i===selected;
    return '<button type="button" class="answer '+(correct?'correct':chosen?'incorrect':'')+'" '+(done?'disabled':'')+' data-answer="'+i+'"><b>'+letters[i]+'</b><span>'+safe(a)+(correct||chosen?'<small>'+(correct?'תשובה נכונה':'')+(correct&&chosen?' · ':'')+(chosen?'הבחירה שלך':'')+'</small>':'')+'</span></button>';
  }).join('')+'</div>'+hint+(done?'<p class="verdict '+(selected===q.k?'ok':'no')+'" role="status">'+(selected===q.k?'נכון!':'לא נכון. התשובה הנכונה היא '+letters[q.k]+'.')+'</p>'+feedback(q)+'<button class="primary" id="next">'+(run.idx+1===run.ids.length?'לסיכום הסבב':'לשאלה הבאה')+' ←</button>':'')+'</section>';
  stage.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  stage.querySelector('#quit').onclick=()=>{
    if(run.idx>0&&!confirm('לצאת מהסבב? התשובות שכבר נתת נשמרות בהתקדמות.'))return;
    state.runs[activeTopic]=null;save();practice();
  };
  if(done)stage.querySelector('#next').onclick=()=>{run.idx++;run.t=Date.now();save();practice();focusQuestion();};
}
document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.metaKey||event.altKey)return;
  const target=event.target instanceof Element?event.target:document.body;
  if(target.closest('select,input,textarea'))return;
  const stage=document.getElementById('practice');
  if(!stage)return;
  const n=Number(event.key);
  const buttons=[...stage.querySelectorAll('[data-answer]:not(:disabled)')];
  if(buttons.length&&n>=1&&n<=buttons.length){event.preventDefault();buttons[n-1].click();return;}
  const next=stage.querySelector('#next');
  if(next&&event.key==='Enter'&&!target.closest('button,a')){event.preventDefault();next.click();}
});
function render(){
  const [page,id,tab]=location.hash.slice(1).split('/');
  const navTarget=page==='exams'?'#exams':page==='practice'?'#practice':'#home';
  for(const link of document.querySelectorAll('.site-header nav a')){
    if(link.hash===navTarget)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  if(page==='topic')topic(id,tab==='practice');
  else if(page==='exams')exams(id);
  else if(page==='practice')mixedPage(id);
  else home();
  const title=page==='topic'?scopeTitle(id):page==='exams'&&id?scopeTitle(id):page==='exams'?'שחזורי בחינות':page==='practice'?'תרגול מעורב':'';
  document.title=(title?title+' | ':'')+'אא״ג | מחברת קלינית';
}
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();main.focus();main.scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',()=>{
  render();main.focus({preventScroll:true});window.scrollTo(0,0);
});
render();
