'use strict';
// איורים ריאליסטיים ממקורות חופשיים (Wikimedia Commons), עם קרדיט לפי דרישת הרישיון.
const commons = (file, text, license) => ({page: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(file.replace(/ /g, '_')), text, license});

const realisticFigures = [
  ['neck', 'map', {src:'media/commons/gray385.jpg', title:'שרירי הצוואר במבט מהצד',
    caption:'שריר ה־SCM (Sterno-cleido-mastoideus) עובר באלכסון מאחורי האוזן אל עצם החזה ועצם הבריח. המשולש הקדמי נמצא לפניו, בינו לבין קו האמצע והלסת. המשולש האחורי נמצא מאחוריו, בינו לבין הטרפז (Trapezius), מעל עצם הבריח.',
    credit: commons('Gray385.png', 'תוויות בעברית נוספו · Gray’s Anatomy, 1918 · H. V. Carter', 'נחלת הכלל'), replaces:'media/neck/triangles.svg'}],
  ['sinuses', '0', {src:'media/commons/gray856.jpg', title:'פתחי הניקוז בדופן הצידית של האף',
    caption:'הקונכיות נחתכו כדי לחשוף את הפתחים, והמוטות הדקים מסמנים אותם. מתחת לקונכייה האמצעית: ה־hiatus semilunaris, שאליו נפתחים הסינוס המקסילרי והאתמואיד הקדמי, ודרך ה־infundibulum גם הסינוס הפרונטלי. מתחת לקונכייה העליונה: תאי האתמואיד האחוריים. למעלה מאחור: הסינוס הספנואידלי. מתחת לקונכייה התחתונה: צינור הדמעות (nasolacrimal canal).',
    credit: commons('Gray856.png', 'תוויות בעברית נוספו · Gray’s Anatomy, 1918 · H. V. Carter', 'נחלת הכלל')}],
  ['sinuses', '2', {src:'media/commons/preseptal-cellulitis.jpg', title:'צלוליטיס פרה־ספטלית',
    caption:'בצקת ואודם של העפעפיים בעין שמאל, בלי בלט של העין. בשלב הזה הזיהום עדיין לפני הספטום, ולכן הראייה ותנועות העיניים תקינות. אם מופיעים בלט, הגבלה בתנועות או ירידה בראייה, הזיהום עבר לארובה.',
    credit: commons('Celulitis Periorbitaria (Preseptal).JPG', 'תוויות בעברית נוספו · Afrodriguezg', 'CC BY-SA 3.0')}],
  ['ear', 'hearing', {src:'media/commons/weber-test.jpg', title:'בדיקת Weber',
    caption:'מקישים על הקולן ומניחים אותו על קודקוד הראש, ושואלים באיזו אוזן הקול נשמע חזק יותר. בירידה הולכתית הקול נשמע באוזן הפגועה. בירידה תחושתית־עצבית הוא נשמע באוזן הבריאה.',
    credit: commons('Weber Test.jpg', 'DrSaltMD', 'CC BY-SA 4.0')}],
  ['ear', 'hearing', {src:'media/commons/rinne-test.jpg', title:'בדיקת Rinne',
    caption:'משווים בין הולכה דרך העצם (הקולן על המסטואיד) להולכה דרך האוויר (הקולן מול פתח האוזן). באוזן תקינה, וגם בירידה תחושתית־עצבית, האוויר נשמע טוב יותר (Rinne חיובי). בירידה הולכתית העצם נשמעת טוב יותר (Rinne שלילי).',
    credit: commons('Rinneversuch.png', 'Ziyun518', 'CC0')}],
  ['throat', 'larynx', {src:'media/commons/gray951.jpg', title:'הלרינקס במבט מלפנים',
    caption:'למעלה עצם ההיואיד, מתחתיה סחוס התירואיד (thyroid cartilage) עם החריץ העליון. מיתרי הקול נמצאים בתוך סחוס התירואיד. מתחתיו הרצועה הקריקו־תירואידית (middle cricothyroid ligament), אחריה סחוס הקריקואיד (cricoid cartilage) ואז טבעות הקנה.',
    credit: commons('Gray951.png', 'תוויות בעברית נוספו · Gray’s Anatomy, 1918 · H. V. Carter', 'נחלת הכלל')}],
  ['emergency', '0', {src:'media/commons/cricothyrotomy.jpg', title:'קוניוטומיה מול טרכאוסטומיה',
    caption:'המספרים במקור: (1) סחוס התירואיד, (2) הממברנה הקריקו־תירואידית, (3) סחוס הקריקואיד, (4) הקנה. קוניוטומיה (A) מבוצעת בחירום דרך הממברנה, שטחית ומתחת למיתרי הקול. טרכאוסטומיה (B) מבוצעת נמוך יותר, בטבעות הקנה, כנתיב אוויר לטווח ארוך.',
    credit: commons('Cricothyrotomy.png', 'תוויות בעברית נוספו · PhilippN', 'CC BY-SA 3.0')}],
  ['pediatric', '4', {src:'media/commons/thyroglossal-cyst.jpg', title:'ציסטה תירוגלוסלית',
    caption:'גוש עגול ורך בקו האמצע של הצוואר, בגובה עצם ההיואיד. בבדיקה הוא עולה כשהמטופל מוציא לשון או בולע.',
    credit: commons('Thyreoglossal duct cyst.jpg', 'תוויות בעברית נוספו · Klaus D. Peter', 'CC BY 3.0 de')}]
];
for (const [topic, section, fig] of realisticFigures) {
  const figures = chapters[topic].figures ??= {};
  const list = figures[section] ??= [];
  const old = fig.replaces ? list.findIndex(f => f.src === fig.replaces) : -1;
  if (old >= 0) list.splice(old, 1, fig); else list.push(fig);
}
