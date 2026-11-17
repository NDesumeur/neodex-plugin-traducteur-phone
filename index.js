// Traducteur : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap wide\">\n      <div class=\"agHead\"><span class=\"label\">Traducteur</span><span class=\"hint\" id=\"trInfo\"></span></div>\n      <div class=\"trMain\">\n        <div class=\"sysCard px\"><select class=\"f\" id=\"trFrom\"></select><textarea class=\"f trBox\" id=\"trIn\" placeholder=\"Écris ou colle un texte…\"></textarea><div class=\"hint\" id=\"trCount\"></div></div>\n        <button class=\"btn px\" id=\"trSwap\" title=\"Inverser les langues\">⇄</button>\n        <div class=\"sysCard px\"><select class=\"f\" id=\"trTo\"></select><textarea class=\"f trBox\" id=\"trOut\" readonly placeholder=\"Traduction\"></textarea><div class=\"row\"><button class=\"btn px\" id=\"trCopy\">Copier</button></div></div>\n      </div>\n      <div class=\"hint\">Service MyMemory : gratuit et sans compte, environ 5 000 caractères par jour.</div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.trMain{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:clamp(12px,1.2vw,22px);align-items:stretch}
#trSwap{align-self:center;height:clamp(46px,3.4vw,60px);width:clamp(46px,3.4vw,60px);font-size:clamp(20px,1.6vw,28px)}
.trBox{min-height:clamp(240px,calc(100vh - 360px),720px);resize:vertical;font-size:clamp(17px,1.2vw,22px);line-height:1.55}
.trMain select{font-size:16px}
.trMain .hint,.trMain .btn,.trMain+.hint{font-size:15px}
.trMain>.sysCard{justify-content:flex-start}
@media (max-width:900px){.trMain{grid-template-columns:minmax(0,1fr)}#trSwap{justify-self:center}}/* téléphone : les deux zones de texte tiennent ensemble à l'écran, le bouton d'échange entre les deux */
@media (max-width:600px){
  .trMain{gap:8px}
  .trBox{min-height:0;height:clamp(120px,24vh,220px);resize:none;font-size:17px}
  .trMain select{min-height:44px;width:100%}
  #trSwap{height:48px;width:48px;margin:-2px auto}
}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = ctx.host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
  view.innerHTML = HTML;
  const $ = id => id === "transApp" ? view : view.querySelector('#' + id);  // les identifiants de ta vue, sans toucher à ceux du reste de NeoDex
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  // ---- ton code d'origine ----
  /* ---------- Traducteur app: MyMemory (free, no account, about 5000 characters a day), long texts cut into sentences ---------- */
  const TR_LANGS = {auto: 'Détecter', fr: 'Français', en: 'Anglais', es: 'Espagnol', de: 'Allemand', it: 'Italien', pt: 'Portugais', nl: 'Néerlandais', ja: 'Japonais', ko: 'Coréen', zh: 'Chinois', ru: 'Russe', ar: 'Arabe', pl: 'Polonais', tr: 'Turc', sv: 'Suédois', uk: 'Ukrainien'};
  let trTimer = null, trSeq = 0;
  function trInit() {
    if ($('trFrom').options.length) return;
    for (const [k, n] of Object.entries(TR_LANGS)) { $('trFrom').append(new Option(n, k)); if (k !== 'auto') $('trTo').append(new Option(n, k)); }
    $('trFrom').value = 'auto'; $('trTo').value = 'en';
  }
  const trChunks = t => { const out = []; let cur = ''; for (const s of t.match(/[^.!?\n]+[.!?\n]*|\n/g) || [t]) { if ((cur + s).length > 450 && cur) { out.push(cur); cur = ''; } cur += s; } if (cur) out.push(cur); return out; };
  async function trRun() {
    const text = $('trIn').value, from = $('trFrom').value, to = $('trTo').value, seq = ++trSeq;
    $('trCount').textContent = text.length + ' caractères';
    if (!text.trim()) { $('trOut').value = ''; $('trInfo').textContent = ''; return; }
    $('trInfo').textContent = 'Traduction…';
    try {
      const parts = [];
      let detected = '';
      for (const c of trChunks(text)) {
        if (!c.trim()) { parts.push(c); continue; }
        const d = await fetch('https://api.mymemory.translated.net/get?langpair=' + encodeURIComponent((from === 'auto' ? 'autodetect' : from) + '|' + to) + '&q=' + encodeURIComponent(c)).then(r => r.json());
        if (d.responseStatus !== 200 && d.responseStatus !== '200') throw new Error(d.responseDetails || 'service indisponible');
        detected ||= d.responseData.detectedLanguage || '';
        parts.push(d.responseData.translatedText + (c.endsWith('\n') ? '\n' : ' '));
      }
      if (seq !== trSeq) return;  // a newer text was typed meanwhile
      const tx = document.createElement('textarea'); tx.innerHTML = parts.join('').trim(); $('trOut').value = tx.value;  // decodes &#39; and friends
      $('trInfo').textContent = from === 'auto' && detected ? 'Langue détectée : ' + (TR_LANGS[detected.slice(0, 2).toLowerCase()] || detected) : '';
    } catch (e) { if (seq === trSeq) $('trInfo').textContent = 'Traduction impossible : ' + e.message; }
  }
  $('trIn').oninput = () => { clearTimeout(trTimer); trTimer = setTimeout(trRun, 700); };
  $('trFrom').onchange = $('trTo').onchange = trRun;
  $('trSwap').onclick = () => { if ($('trFrom').value === 'auto') $('trFrom').value = $('trTo').value === 'fr' ? 'en' : 'fr'; const a = $('trFrom').value; $('trFrom').value = $('trTo').value; $('trTo').value = a; const t = $('trOut').value; if (t) $('trIn').value = t; trRun(); };
  $('trCopy').onclick = () => { navigator.clipboard.writeText($('trOut').value); toast('Traduction copiée'); };
  // ---- fin ----
  ctx.onOpen(() => { trInit(); setTimeout(() => $('trIn').focus()); });
  ctx.onClose(() => { clearTimeout(trTimer); });
}
