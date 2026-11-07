'use strict';
const main = document.querySelector('main');
const key = 'ent-clinical-notebook-v1';
let state = {history:{},runs:{}};
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && saved.history && typeof saved.history === 'object') state = saved;
} catch {}
state.runs ??= state.run ? {ear:state.run} : {};
delete state.run;
let activeTopic = "ear";
const byId = new Map(questions.map(q=>[q.id,q]));
function safe(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{document.querySelector('.site-footer span:last-child').textContent='השמירה בדפדפן אינה זמינה כרגע';}}
function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}return list;}
const letters = 'אבגדה';
const sectionName = id => chapters[activeTopic]?.sections.find(section=>section[0]===id)?.[1] || '';
function home(){
  const rows=topics.map(([id,title,description],i)=>'<li><a class="topic-row" href="#topic/'+id+'"><span class="number">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+safe(title)+'</strong><small>'+safe(description)+'</small></span><span class="row-status">'+'סיכום ותרגול'+' <b aria-hidden="true">←</b></span></a></li>').join('');
  main.innerHTML='<section class="opening"><div><p class="eyebrow">מחברת לקראת הסבב והבחינה</p><h1>רפואת אף,<br>אוזן וגרון</h1><p class="lede">סיכומים לקריאה ותרגול לפי נושא, עם דגש על ההחלטות שמקבלים במרפאה ובמיון.</p><a class="primary" href="#topic/neck">להתחלת הלימוד <span aria-hidden="true">←</span></a></div><figure class="cover" aria-hidden="true"><svg viewBox="0 0 420 315" fill="none"><circle cx="210" cy="153" r="122"/><path d="M191 60C234 46 270 63 285 98c8 18 8 31 10 45l27 33c4 5 1 11-5 12l-20 3-2 30c-1 17-13 24-27 24h-28l-5 36M150 283l18-53c-5-21-22-38-31-62-17-44-3-88 38-105m-7 91c-6-24 16-39 34-29 16 9 12 27 1 37-6 6-5 15-14 18-12 3-23-7-17-16m13-15c-1-9 9-12 14-5m63 8 26-2m-28 13 25 1m-30 31 26 4m-51 29 12 23"/><path class="guide-lines" d="M42 150h120m137 13h76m-128 61h105"/><circle class="point" cx="42" cy="150" r="4"/><circle class="point" cx="375" cy="163" r="4"/><circle class="point" cx="352" cy="224" r="4"/></svg><figcaption>אוזן · אף · גרון</figcaption></figure></section><div class="home-grid"><section><h2>נושאי הקורס</h2><ol class="topic-list">'+rows+'</ol></section><aside class="exam-panel"><p class="eyebrow">מסלול תרגול</p><h2>שחזורי בחינות</h2><p>בחרו טופס לפי מועד או נוסח. בסוף כל שאלה מופיעה הפניה למקור.</p><a href="#exams">למסך השחזורים <span aria-hidden="true">←</span></a></aside></div>';
}
function presentationPath(){
  const courseResources = {neck:'218427',pediatric:'218461'};
  if(courseResources[activeTopic]){
    if(document.documentElement.dataset.preview)return 'local-sources/'+activeTopic+'.pptx';
    return 'https://moodle.tau.ac.il/mod/resource/view.php?id='+courseResources[activeTopic];
  }
  return (document.documentElement.dataset.preview ? 'dist/' : '')+'sources/'+activeTopic+'.pptx';
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
  return (chapters[activeTopic].figures[id] || []).map(f=>'<figure class="clinical-figure"><img src="'+safe(f.src)+'" alt="'+safe(f.title)+'" loading="lazy"><figcaption><strong>'+safe(f.title)+'</strong><span>'+safe(f.caption)+'</span>'+(f.slide?'<small class="source">מצגת הקורס · שקופית '+f.slide+'</small>':'')+'</figcaption></figure>').join('');
}
function readingSection(id,paragraphs){
  if((activeTopic==='neck'&&id==='map')||(activeTopic==='sinuses'&&id==='0')){
    return sectionBody(paragraphs.slice(0,1))+figure(id)+sectionBody(paragraphs.slice(1));
  }
  return sectionBody(paragraphs)+figure(id);
}
function topic(id,tab){
  const entry=topics.find(t=>t[0]===id);
  if(!entry){home();return;}
  const title=safe(entry[1]);
  const header='<a class="back" href="#home">חזרה לנושאים</a><header class="chapter-header"><p class="eyebrow">פרק '+String(topics.indexOf(entry)+1).padStart(2,'0')+'</p><h1>'+title+'</h1></header>';
  activeTopic=id;
  const chapter=chapters[id];
  const tabs='<nav class="tabs" aria-label="תצוגת הפרק"><a '+(!tab?'aria-current="page"':'')+' href="#topic/'+id+'">סיכום</a><a '+(tab?'aria-current="page"':'')+' href="#topic/'+id+'/practice">תרגול</a></nav>';
  main.innerHTML=header+tabs+(tab?'<div id="practice"></div>':'<div class="reading"><aside class="contents"><strong>בפרק הזה</strong>'+chapters[activeTopic].sections.map(([id,title])=>'<button type="button" data-section="'+id+'">'+safe(title)+'</button>').join('')+'</aside><article><p class="lede">'+safe(chapter.intro)+'</p>'+chapters[activeTopic].sections.map(([id,title,paragraphs])=>'<section id="'+id+'" tabindex="-1"><h2>'+safe(title)+'</h2>'+readingSection(id,paragraphs)+'</section>').join('')+'<p class="source"><a href="'+presentationPath()+'" download>מצגת הפרק (PowerPoint)</a></p><a class="primary" href="#topic/'+id+'/practice">לתרגול הפרק ←</a></article></div>');
  if(tab)practice();
  else main.querySelectorAll('[data-section]').forEach(button=>button.onclick=()=>{
    const section=document.getElementById(button.dataset.section);
    section.focus({preventScroll:true});section.scrollIntoView({block:'start'});
  });
}
function exams(id){
  const exam=reconstructionSets.find(item=>item.id===id);
  if(exam&&questions.some(q=>q.topic===exam.id)){
    activeTopic=exam.id;
    main.innerHTML='<a class="back" href="#exams">חזרה לשחזורים</a><header class="chapter-header"><h1>'+safe(exam.title)+'</h1><p>'+safe(exam.origin)+'</p><p>זהו תרגול מעובד מתוך השחזור. המספור במשוב מפנה לשאלה המקורית.</p></header><div id="practice"></div>';
    practice();
    return;
  }
  const cards=items=>items.map(item=>{
    const count=questions.filter(q=>q.topic===item.id).length;
    const status=count ? count+' שאלות מעובדות'+(item.total?' מתוך '+item.total+' במקור':'') : 'המקור אותר וממתין לקליטה';
    return '<section class="exam-panel"><h3>'+safe(item.title)+'</h3><p>'+safe(item.origin)+'</p><p>'+status+'</p>'+(count?'<a class="primary" href="#exams/'+item.id+'">'+(item.opening?'לתרגול בוחן הפתיחה':'לתרגול השחזור')+' ←</a> ':'')+'<a href="'+safe(item.url)+'" target="_blank" rel="noopener">תיקיית המקור ב־Drive</a></section>';
  }).join('');
  main.innerHTML='<a class="back" href="#home">חזרה לנושאים</a><header class="chapter-header"><h1>שחזורי בחינות</h1><p>בחרו בוחן פתיחה או שחזור לפי המועד והנוסח. הגישה לתיקיות המקור כפופה להרשאות ב־Drive.</p></header><section><h2>בחני פתיחה</h2><div class="recon-list">'+cards(reconstructionSets.filter(item=>item.opening))+'</div></section><section><h2>שחזורים נוספים</h2><div class="recon-list">'+cards(reconstructionSets.filter(item=>!item.opening))+'</div></section>';
}
function settings(stage){
  const chapter=chapters[activeTopic];
  const intro=chapter
    ? '<p>לבדיקת הכיסוי של הפרק, בחרו את כל תתי־הנושאים ואת כל השאלות המתאימות. בסיום יופיע פירוט לפי תת־נושא.</p>'
    : '<p>הסבב כולל שאלות מהשחזור שבחרת, לפי הסדר שבו הופיעו במקור.</p>';
  const sectionFilter=chapter
    ? '<label>תת־נושא<select name="section"><option value="">כל תתי־הנושאים</option>'+chapter.sections.filter(([id])=>questions.some(q=>q.topic===activeTopic&&q.section===id)).map(([id,title])=>'<option value="'+id+'">'+safe(title)+'</option>').join('')+'</select></label>'
    : '';
  stage.innerHTML='<section class="quiz"><h2>בחירת סבב</h2>'+intro+'<form id="quiz-form">'+sectionFilter+'<label>סוג התרגול<select name="mode"><option value="all">כל השאלות</option><option value="new">שאלות שטרם נענו</option><option value="wrong">חזרה על טעויות</option></select></label><label>מספר שאלות<select name="size"><option value="all">כל השאלות המתאימות</option><option value="4">4 שאלות</option></select></label><p id="available" aria-live="polite"></p><button type="submit" class="primary">התחלת סבב ←</button></form></section>';
  const form=stage.querySelector('form');
  function pool(){
    const {section,mode}=Object.fromEntries(new FormData(form));
    return questions.filter(q=>q.topic===activeTopic&&(!section||section===q.section)&&(mode==='all'||(mode==='new'?!Object.hasOwn(state.history,q.id):state.history[q.id]===false)));
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
    if(!chapter)selected.sort((a,b)=>a.number-b.number);
    const availableIds=selected.map(q=>q.id);
    const ids=(chapter?shuffle(availableIds):availableIds).slice(0,Number(new FormData(form).get('size'))||Infinity);
    if(!ids.length)return;
    state.runs[activeTopic]={ids,idx:0,picks:[]};save();practice();focusQuestion();
  };
}
function focusQuestion(){document.getElementById('question')?.focus();}
function answer(index){
  const run=state.runs[activeTopic];
  if(run.picks.length>run.idx)return;
  const position={left:window.scrollX,top:window.scrollY,behavior:'instant'};
  const id=run.ids[run.idx];
  run.picks.push(index);state.history[id]=index===byId.get(id).k;save();practice();
  document.querySelector('.answers').focus({preventScroll:true});
  window.scrollTo(position);
}
function feedback(q){
  const exam=reconstructionSets.find(item=>item.id===q.topic);
  const source=exam
    ? '<p class="source">שאלה '+q.number+' במקור'+(q.page?', עמ׳ '+q.page:'')+(exam.url?' · <a href="'+safe(exam.url)+'" target="_blank" rel="noopener">תיקיית המקור</a>':'')+'</p>'
    : '<p class="source"><a href="'+presentationPath()+'" download>מצגת הפרק (PowerPoint)</a></p>';
  return '<section class="feedback"><p class="explanation">'+safe(q.e)+'</p>'+(q.clarification?'<p class="explanation">'+safe(q.clarification)+'</p>':'')+'<h3>הסבר לכל אפשרות</h3><ol class="review">'+q.a.map((a,i)=>'<li><strong>'+letters[i]+'. '+safe(a)+'</strong><p>'+safe(q.x[i])+'</p></li>').join('')+'</ol>'+source+'</section>';
}
function runBreakdown(run){
  const chapter=chapters[activeTopic];
  if(!chapter)return '';
  const chapterQuestions=questions.filter(q=>q.topic===activeTopic);
  const resultById=new Map(run.ids.map((id,index)=>[id,byId.get(id).k===run.picks[index]]));
  const rows=chapter.sections.map(([id,title])=>{
    const available=chapterQuestions.filter(q=>q.section===id);
    if(!available.length)return '';
    const attempted=available.filter(q=>resultById.has(q.id));
    const correct=attempted.filter(q=>resultById.get(q.id)).length;
    const unseen=available.length-attempted.length;
    const answerText=attempted.length?correct+' מתוך '+attempted.length:'לא נבדק בסבב';
    return '<tr><th scope="row">'+safe(title)+'</th><td>'+answerText+'</td><td>'+unseen+'</td></tr>';
  }).join('');
  return '<h3>כיסוי לפי תת־נושא</h3><div class="table-scroll" tabindex="0" role="region" aria-label="כיסוי לפי תת־נושא"><table><thead><tr><th scope="col">תת־נושא</th><th scope="col">נכונות בסבב</th><th scope="col">שאלות שלא נכללו</th></tr></thead><tbody>'+rows+'</tbody></table></div><p>הפירוט מתייחס לשאלות במאגר. תת־נושא שלא נבדק בסבב עדיין דורש תרגול.</p>';
}
function practice(){
  const stage=document.getElementById('practice');
  const run=state.runs[activeTopic];
  if(!run?.ids?.length||!run.ids.every(id=>byId.get(id)?.topic===activeTopic)){settings(stage);return;}
  if(run.idx>=run.ids.length){
    const score=run.ids.filter((id,i)=>byId.get(id).k===run.picks[i]).length;
    stage.innerHTML='<section class="quiz"><h2 tabindex="-1" id="question">סיכום הסבב</h2><p class="score">'+score+' מתוך '+run.ids.length+'</p><p>תשובות נכונות</p>'+runBreakdown(run)+'<button class="primary" id="reset">בחירת סבב נוסף ←</button></section>';
    stage.querySelector('#reset').onclick=()=>{state.runs[activeTopic]=null;save();practice();stage.querySelector('select').focus();};return;
  }
  const q=byId.get(run.ids[run.idx]),selected=run.picks[run.idx],done=Number.isInteger(selected);
  stage.innerHTML='<section class="quiz"><div class="quiz-top"><span>'+safe(sectionName(q.section))+'</span><span>שאלה '+(run.idx+1)+' מתוך '+run.ids.length+'</span></div><progress max="'+run.ids.length+'" value="'+(run.idx+(done?1:0))+'" aria-label="התקדמות בסבב"></progress><h2 tabindex="-1" id="question">'+safe(q.q)+'</h2><div class="answers" tabindex="-1" role="group" aria-label="'+(done?'התשובה הנכונה היא '+letters[q.k]:'אפשרויות התשובה')+'">'+q.a.map((a,i)=>{
    const correct=done&&i===q.k,chosen=done&&i===selected;
    return '<button type="button" class="answer '+(correct?'correct':chosen?'incorrect':'')+'" '+(done?'disabled':'')+' data-answer="'+i+'"><b>'+letters[i]+'</b><span>'+safe(a)+(correct||chosen?'<small>'+(correct?'תשובה נכונה':'')+(correct&&chosen?' · ':'')+(chosen?'הבחירה שלך':'')+'</small>':'')+'</span></button>';
  }).join('')+'</div>'+(done?feedback(q)+'<button class="primary" id="next">'+(run.idx+1===run.ids.length?'לסיכום הסבב':'לשאלה הבאה')+' ←</button>':'')+'</section>';
  stage.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));
  if(done)stage.querySelector('#next').onclick=()=>{run.idx++;save();practice();focusQuestion();};
}
function render(){
  const [page,id,tab]=location.hash.slice(1).split('/');
  for(const link of document.querySelectorAll('.site-header nav a')){
    if(link.hash===(page==='exams'?'#exams':'#home'))link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  if(page==='topic')topic(id,tab==='practice');
  else if(page==='exams')exams(id);
  else home();
}
document.querySelector('.skip').addEventListener('click',event=>{
  event.preventDefault();main.focus();main.scrollIntoView({block:'start'});
});
window.addEventListener('hashchange',()=>{
  render();main.focus({preventScroll:true});window.scrollTo(0,0);
});
render();
