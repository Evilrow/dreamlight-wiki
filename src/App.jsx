import React, { useEffect, useMemo, useState } from 'react';

const SECTIONS = [
  { id: 'animaux', label: 'Animaux', icon: '🦊', key: 'animaux' },
  { id: 'objets', label: 'Objets & ingrédients', icon: '💎', key: 'objets' },
  { id: 'recettes', label: 'Recettes', icon: '🍲', key: 'recettes' },
  { id: 'quetes', label: 'Quêtes', icon: '📜', key: 'quetes' },
];

const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const haystack = (o) => norm(Object.entries(o).filter(([k]) => k !== 'id' && k !== 'extension')
  .map(([, v]) => (Array.isArray(v) ? v.join(' ') : v)).join(' '));
const matches = (o, q) => { if (!q) return true; const h = o._h ?? (o._h = haystack(o)); return q.split(/\s+/).every((w) => h.includes(w)); };

async function loadData() {
  if (window.api) return window.api.loadData();
  const r = await fetch('./ddv.json'); return r.json(); // mode navigateur (dev)
}
async function loadSettings() {
  if (window.api) return window.api.getSettings();
  try { return JSON.parse(localStorage.getItem('ddv-settings')) ?? { owned: ['base', 'rift', 'vale', 'ranch'] }; }
  catch { return { owned: ['base', 'rift', 'vale', 'ranch'] }; }
}
function saveSettings(s) {
  if (window.api) return window.api.setSettings(s);
  try { localStorage.setItem('ddv-settings', JSON.stringify(s)); } catch { /* ignore */ }
}

export default function App() {
  const [data, setData] = useState(null);
  const [owned, setOwned] = useState(null);
  const [section, setSection] = useState('accueil');
  const [query, setQuery] = useState('');

  useEffect(() => { loadData().then(setData); loadSettings().then((s) => setOwned(s.owned)); }, []);

  const toggleOwned = (id) => {
    const next = owned.includes(id) ? owned.filter((x) => x !== id) : [...owned, id];
    setOwned(next); saveSettings({ owned: next });
  };

  if (!data || !owned) return <div className="loading">✦ Chargement de la Vallée…</div>;

  const extMap = Object.fromEntries(data.extensions.map((e) => [e.id, e]));
  const q = norm(query.trim());
  const visible = (key) => data[key].filter((x) => owned.includes(x.extension));
  const goSearch = (text) => { setQuery(text); setSection('recherche'); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo" onClick={() => { setSection('accueil'); setQuery(''); }}>
          <span className="sparkle">✦</span> Dreamlight<br /><small>Wiki de la Vallée</small>
        </div>
        <nav>
          <button className={section === 'accueil' ? 'active' : ''} onClick={() => setSection('accueil')}>🏰 Accueil</button>
          {SECTIONS.map((s) => (
            <button key={s.id} className={section === s.id ? 'active' : ''} onClick={() => setSection(s.id)}>
              {s.icon} {s.label}
              <span className="count">{visible(s.key).filter((x) => matches(x, q)).length}</span>
            </button>
          ))}
        </nav>
        <div className="owned">
          <h4>Extensions possédées</h4>
          {data.extensions.map((e) => (
            <label key={e.id} className={owned.includes(e.id) ? '' : 'off'}>
              <input type="checkbox" checked={owned.includes(e.id)} onChange={() => toggleOwned(e.id)} />
              <span className="dot" style={{ background: e.couleur }} />
              <span>{e.nom}<small>{e.sousTitre}</small></span>
            </label>
          ))}
          <p className="hint">Le contenu des extensions décochées est masqué partout.</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div className="search">
            <span>🔎</span>
            <input
              placeholder="Rechercher un animal, un ingrédient, une recette, une quête, un personnage…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (e.target.value && section !== 'recherche') setSection('recherche'); }}
            />
            {query && <button className="clear" onClick={() => setQuery('')}>✕</button>}
          </div>
        </header>
        <div className="content">
          {section === 'accueil' && <Home data={data} owned={owned} toggleOwned={toggleOwned} go={setSection} />}
          {section === 'recherche' && <SearchResults q={q} query={query} visible={visible} extMap={extMap} go={setSection} onIngredient={goSearch} />}
          {section === 'animaux' && <Animaux items={visible('animaux').filter((x) => matches(x, q))} extensions={data.extensions} owned={owned} />}
          {section === 'objets' && <Objets items={visible('objets').filter((x) => matches(x, q))} extensions={data.extensions} owned={owned} />}
          {section === 'recettes' && <Recettes items={visible('recettes').filter((x) => matches(x, q))} extensions={data.extensions} owned={owned} onIngredient={goSearch} />}
          {section === 'quetes' && <Quetes items={visible('quetes').filter((x) => matches(x, q))} extensions={data.extensions} owned={owned} />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Accueil ---------- */
function Home({ data, owned, toggleOwned, go }) {
  return (
    <div>
      <section className="hero">
        <h1>Bienvenue dans la Vallée ✦</h1>
        <p>Toutes les solutions de Disney Dreamlight Valley, classées par extension. Coche à gauche les extensions que vous possédez : le reste disparaît pour éviter les surprises.</p>
      </section>
      <div className="ext-grid">
        {data.extensions.map((e) => {
          const n = (k) => data[k].filter((x) => x.extension === e.id).length;
          const on = owned.includes(e.id);
          return (
            <div key={e.id} className={`ext-card ${on ? '' : 'off'}`} style={{ '--c': e.couleur }}>
              <div className="ext-head">
                <div><h3>{e.nom}</h3><small>{e.sousTitre} · {e.payant ? 'payante' : 'gratuit'} · sortie {e.sortie.split('-').reverse().join('/')}</small></div>
                <button className="pill" onClick={() => toggleOwned(e.id)}>{on ? '✓ Possédée' : 'Non possédée'}</button>
              </div>
              <ul>
                {SECTIONS.map((s) => <li key={s.id} onClick={() => on && go(s.id)}><b>{n(s.key)}</b> {s.label.toLowerCase()}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="footnote">Données compilées depuis des guides FR (Gamosaurus, Millenium, Gamewave, Gameblog) et le wiki anglais — certains titres de quêtes récents sont des traductions. Les entrées marquées « incomplet » ont des étapes résumées.</p>
    </div>
  );
}

/* ---------- Recherche globale ---------- */
function SearchResults({ q, query, visible, extMap, go, onIngredient }) {
  if (!q) return <p className="empty">Tape quelque chose dans la barre de recherche.</p>;
  const groups = SECTIONS.map((s) => ({ ...s, list: visible(s.key).filter((x) => matches(x, q)) }));
  const total = groups.reduce((a, g) => a + g.list.length, 0);
  return (
    <div>
      <h2 className="title">Résultats pour « {query} » <small>{total}</small></h2>
      {total === 0 && <p className="empty">Rien trouvé dans les extensions possédées.</p>}
      {groups.filter((g) => g.list.length).map((g) => (
        <section key={g.id} className="result-group">
          <h3>{g.icon} {g.label} <small>{g.list.length}</small>
            {g.list.length > 12 && <button className="link" onClick={() => go(g.id)}>Tout voir →</button>}
          </h3>
          <div className="grid">
            {g.list.slice(0, 12).map((x) => {
              const ext = extMap[x.extension];
              if (g.id === 'animaux') return <AnimalCard key={x.id} a={x} ext={ext} />;
              if (g.id === 'objets') return <ObjetCard key={x.id} o={x} ext={ext} />;
              if (g.id === 'recettes') return <RecetteCard key={x.id} r={x} ext={ext} onIngredient={onIngredient} />;
              return <QueteCard key={x.id} qu={x} ext={ext} />;
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ---------- Briques communes ---------- */
const ExtBadge = ({ ext }) => <span className="badge" style={{ '--c': ext.couleur }}>{ext.nom}</span>;

function Chips({ options, value, onChange, all = 'Tous' }) {
  return (
    <div className="chips">
      <button className={value === null ? 'on' : ''} onClick={() => onChange(null)}>{all}</button>
      {options.map((o) => <button key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  );
}

function ByExtension({ items, extensions, owned, render, grid = true }) {
  const groups = extensions.filter((e) => owned.includes(e.id)).map((e) => ({ e, list: items.filter((x) => x.extension === e.id) })).filter((g) => g.list.length);
  if (!groups.length) return <p className="empty">Aucun résultat.</p>;
  return groups.map(({ e, list }) => (
    <section key={e.id} className="ext-section" style={{ '--c': e.couleur }}>
      <h3 className="ext-title"><span className="dot" style={{ background: e.couleur }} />{e.nom} <small>{e.sousTitre} · {list.length}</small></h3>
      <div className={grid ? 'grid' : 'list'}>{list.map((x) => render(x, e))}</div>
    </section>
  ));
}

const uniq = (arr) => [...new Set(arr.filter(Boolean))];

/* ---------- Animaux ---------- */
function AnimalCard({ a, ext }) {
  return (
    <article className="card">
      <div className="card-head"><h4>{a.nom}</h4><ExtBadge ext={ext} /></div>
      <p className="meta">{a.espece} · 📍 {a.biome || '—'}</p>
      {a.nourriture?.length > 0 && <p><b>Nourriture :</b> {a.nourriture.join(', ')}</p>}
      {a.apprivoisement && <p><b>Apprivoiser :</b> {a.apprivoisement}</p>}
      {a.notes && <p className="note">{a.notes}</p>}
    </article>
  );
}
function Animaux({ items, extensions, owned }) {
  const [espRaw, setEsp] = useState(null);
  const especes = uniq(items.map((x) => x.espece));
  const esp = especes.includes(espRaw) ? espRaw : null;
  const list = items.filter((x) => !esp || x.espece === esp);
  return (
    <div>
      <h2 className="title">🦊 Animaux compagnons <small>{list.length}</small></h2>
      <Chips options={especes} value={esp} onChange={setEsp} all="Toutes les espèces" />
      <ByExtension items={list} extensions={extensions} owned={owned} render={(a, e) => <AnimalCard key={a.id} a={a} ext={e} />} />
    </div>
  );
}

/* ---------- Objets ---------- */
function ObjetCard({ o, ext }) {
  return (
    <article className="card">
      <div className="card-head"><h4>{o.nom}</h4><ExtBadge ext={ext} /></div>
      <p className="meta">{o.type}{o.prix != null && <> · <span className="coin">✪ {o.prix}</span></>}</p>
      {o.ou?.length > 0 && <p>📍 {o.ou.join(' · ')}</p>}
      {o.details && <p className="note">{o.details}</p>}
    </article>
  );
}
function Objets({ items, extensions, owned }) {
  const [typeRaw, setType] = useState(null);
  const types = uniq(items.map((x) => x.type)).sort();
  const type = types.includes(typeRaw) ? typeRaw : null;
  const list = items.filter((x) => !type || x.type === type);
  return (
    <div>
      <h2 className="title">💎 Objets & ingrédients <small>{list.length}</small></h2>
      <Chips options={types} value={type} onChange={setType} />
      <ByExtension items={list} extensions={extensions} owned={owned} render={(o, e) => <ObjetCard key={o.id} o={o} ext={e} />} />
    </div>
  );
}

/* ---------- Recettes ---------- */
function RecetteCard({ r, ext, onIngredient }) {
  return (
    <article className="card">
      <div className="card-head"><h4>{r.nom}</h4><ExtBadge ext={ext} /></div>
      <p className="meta"><span className="stars">{'★'.repeat(r.etoiles)}<span>{'★'.repeat(5 - r.etoiles)}</span></span> · {r.categorie}</p>
      <div className="ingredients">
        {r.ingredients.map((i, k) => <button key={k} title="Chercher cet ingrédient" onClick={() => onIngredient(i.replace(/ au choix$/, ''))}>{i}</button>)}
      </div>
      <p className="meta small">⚡ {r.energie ?? '—'} énergie · <span className="coin">✪ {r.prix ?? '—'}</span></p>
    </article>
  );
}
function Recettes({ items, extensions, owned, onIngredient }) {
  const [cat, setCat] = useState(null);
  const [stars, setStars] = useState(null);
  const list = items.filter((x) => (!cat || x.categorie === cat) && (!stars || x.etoiles === Number(stars[0])));
  return (
    <div>
      <h2 className="title">🍲 Recettes <small>{list.length}</small></h2>
      <Chips options={["Hors-d'œuvre", 'Plat principal', 'Dessert']} value={cat} onChange={setCat} all="Toutes" />
      <Chips options={['1★', '2★', '3★', '4★', '5★']} value={stars} onChange={setStars} all="Toutes étoiles" />
      <ByExtension items={list} extensions={extensions} owned={owned} render={(r, e) => <RecetteCard key={r.id} r={r} ext={e} onIngredient={onIngredient} />} />
    </div>
  );
}

/* ---------- Quêtes ---------- */
function QueteCard({ qu, ext, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <article className={`card quest ${open ? 'open' : ''}`}>
      <div className="quest-head" onClick={() => setOpen(!open)}>
        <div>
          <h4>{qu.titre}{qu.incomplet && <span className="warn" title="Étapes résumées / incomplètes">incomplet</span>}</h4>
          <p className="meta">{qu.personnage || 'Sans personnage'} · {qu.type}{qu.niveau != null && <> · niveau {qu.niveau}</>}</p>
        </div>
        <div className="quest-right"><ExtBadge ext={ext} /><span className="chev">{open ? '▴' : '▾'}</span></div>
      </div>
      {open && (
        <div className="quest-body">
          <ol>{qu.etapes.map((s, i) => <li key={i}>{s}</li>)}</ol>
          {qu.recompense && <p>🎁 <b>Récompense :</b> {qu.recompense}</p>}
          {qu.note && <p className="note">{qu.note}</p>}
          {qu.titre_en && <p className="note">Titre anglais : {qu.titre_en}</p>}
        </div>
      )}
    </article>
  );
}
function Quetes({ items, extensions, owned }) {
  const [type, setType] = useState(null);
  const [persoRaw, setPerso] = useState('');
  const persos = uniq(items.map((x) => x.personnage)).sort((a, b) => a.localeCompare(b, 'fr'));
  const perso = persos.includes(persoRaw) ? persoRaw : '';
  const list = items.filter((x) => (!type || x.type === type) && (!perso || x.personnage === perso));
  return (
    <div>
      <h2 className="title">📜 Quêtes <small>{list.length}</small></h2>
      <div className="filters-row">
        <select value={perso} onChange={(e) => setPerso(e.target.value)}>
          <option value="">Tous les personnages</option>
          {persos.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Chips options={['Histoire', 'Déblocage', 'Royaume', 'Amitié', 'Autre']} value={type} onChange={setType} all="Tous types" />
      </div>
      <ByExtension items={list} extensions={extensions} owned={owned} grid={false}
        render={(qu, e) => <QueteCard key={qu.id} qu={qu} ext={e} defaultOpen={!!perso && list.length <= 3} />} />
    </div>
  );
}
