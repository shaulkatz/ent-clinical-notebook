'use strict';
// איורים סכמטיים שצוירו לאתר, בנוסף לאיורים מהמצגות.
const diagramFigures = [
  ['sinuses', '0', {src:'media/diagrams/sinus-drainage.svg', title:'לאן מתנקז כל סינוס', caption:'הדופן הצידית של האף במבט מהצד. למיאטוס האמצעי מתנקזים שלושה סינוסים: הפרונטלי, המקסילרי והאתמואיד הקדמי. צינור הדמעות נפתח למיאטוס התחתון.'}],
  ['sinuses', '2', {src:'media/diagrams/chandler.svg', title:'חמשת שלבי Chandler', caption:'מבט מלמעלה על הארובה. כל עוד הזיהום לפני הספטום (שלב 1), תנועות העיניים והראייה תקינות. משלב 2 והלאה הזיהום בתוך הארובה.'}],
  ['ear', 'hearing', {src:'media/diagrams/weber-rinne.svg', title:'Weber ו־Rinne בירידת שמיעה חד־צדדית', caption:'בירידה הולכתית הקול ב־Weber נשמע באוזן הפגועה ו־Rinne שלילי. בירידה תחושתית־עצבית הקול נשמע באוזן הבריאה ו־Rinne חיובי.'}],
  ['throat', 'larynx', {src:'media/diagrams/larynx-levels.svg', title:'שלוש הקומות של הלרינקס', caption:'מיתרי הקול נמצאים בתוך סחוס התירואיד. מעליהם הסופראגלוטיס, מתחתם הסובגלוטיס עד הקריקואיד. הממברנה הקריקו־תירואידית, בין שני הסחוסים, היא מקום הקוניוטומיה.'}],
  ['emergency', '0', {src:'media/diagrams/larynx-levels.svg', title:'גובה החסימה ומקום הקוניוטומיה', caption:'סוג הסטרידור מכוון לגובה החסימה. בחירום, כשאינטובציה נכשלת, נכנסים לנתיב האוויר דרך הממברנה הקריקו־תירואידית, בין סחוס התירואיד לקריקואיד.'}]
];
for (const [topic, section, fig] of diagramFigures) {
  const figures = chapters[topic].figures ??= {};
  (figures[section] ??= []).push(fig);
}
