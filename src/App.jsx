import { useEffect, useState } from 'react'
import trip from './trip.json'
import narration from './narration.json'
const days = trip.map(day => ({ ...day, sections: day.sections.filter(section => section.id === 'shots') }))
const storageKey = 'kyushu-shot-checklist-v1'
const itemKey = (day, section, index) => `${day}-${section}-${index}`
const keysFor = day => day.sections.flatMap(s => s.items.map((_, i) => itemKey(day.day, s.id, i)))
const allKeys = days.flatMap(keysFor)
function readSaved() {
  try { const value = JSON.parse(localStorage.getItem(storageKey) || '{}'); return Object.fromEntries(allKeys.filter(k => value?.[k] === true).map(k => [k, true])) } catch { return {} }
}
function hashDay() { const value = Number(location.hash.replace('#day-', '')); return Number.isInteger(value) && value >= 1 && value <= 9 ? value - 1 : 0 }
export default function App() {
  const [selected, setSelected] = useState(hashDay)
  const [checked, setChecked] = useState(readSaved)
  const [unfinished, setUnfinished] = useState(false)
  const [saveError, setSaveError] = useState(false)
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(checked)); setSaveError(false) } catch { setSaveError(true) } }, [checked])
  useEffect(() => { const update = () => setSelected(hashDay()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update) }, [])
  const day = days[selected], dayKeys = keysFor(day)
  const done = dayKeys.filter(k => checked[k]).length, totalDone = allKeys.filter(k => checked[k]).length
  function selectDay(i) { setSelected(i); location.hash = `day-${i + 1}` }
  function toggle(key) { setChecked(previous => ({ ...previous, [key]: !previous[key] })) }
  return <>
    <header className="topbar"><a className="brand" href="#day-1"><span className="brand-icon">旅</span> KYUSHU JOURNAL</a><span className="edition">TRAVEL & FILM NOTES / 01</span></header>
    <main className="page"><section className="intro"><div><p className="eyebrow">九州・9 天 8 夜・10.05 — 10.13</p><h1>把旅途，一格格收藏。</h1><p className="muted">每日必拍清單，完成一項，就打個勾。</p></div><div className="trip-progress"><span>整趟旅程</span><strong>{totalDone}<small> / {allKeys.length}</small></strong><progress aria-label="整趟旅程完成進度" value={totalDone} max={allKeys.length}/></div></section>
    <div className="workspace"><aside><p className="eyebrow">旅程日曆 / YOUR DAYS</p><nav aria-label="選擇日期">{days.map((d, i) => { const keys = keysFor(d), count = keys.filter(k => checked[k]).length; return <button key={d.day} className={`day-tab ${selected === i ? 'active' : ''}`} onClick={() => selectDay(i)} aria-current={selected === i ? 'date' : undefined}><b>{String(d.day).padStart(2, '0')}</b><span><small>DAY {d.day} · {d.date}</small><span>{d.title}</span></span><em>{count === keys.length ? '✓' : `${count}/${keys.length}`}</em></button> })}</nav><p className="save-note" role="status">{saveError ? '目前無法儲存，關閉頁面可能遺失進度。' : '● 進度自動保存在此瀏覽器'}<br/><span>換裝置或清除瀏覽器資料不會保留進度。</span></p></aside>
    <div className="day-content"><section className="day-heading"><div><p className="eyebrow">DAY {String(day.day).padStart(2, '0')} / {day.date}</p><h2>{day.title}</h2><p>慢慢走、好好拍，今天的回憶一個也不漏。</p></div><div className="day-count"><strong>{Math.round(done / dayKeys.length * 100)}<small>%</small></strong><span>今日完成</span></div><div className="progress-footer"><span aria-live="polite">{done} / {dayKeys.length} 項已完成{done === dayKeys.length ? ' · 今天的任務全部完成！' : ''}</span><progress aria-label="今日完成進度" value={done} max={dayKeys.length}/></div></section>
    <div className="toolbar"><span>今日任務 <b>{dayKeys.length - done}</b> 項待完成</span><label><input type="checkbox" checked={unfinished} onChange={e => setUnfinished(e.target.checked)}/>只看未完成</label></div>
    <div className="cards">{day.sections.map((section) => { const sectionDone = section.items.filter((_, i) => checked[itemKey(day.day, section.id, i)]).length; return <section className={`check-card ${section.id}`} key={section.id}><div className="card-heading"><span className="section-icon">◎</span><div><p>SHOT LIST</p><h3>{section.title}</h3></div><span className="section-count">{sectionDone}/{section.items.length}</span></div><div className="check-list">{section.items.map((text, i) => { const key = itemKey(day.day, section.id, i); if (unfinished && checked[key]) return null; return <label className={`check-row ${checked[key] ? 'completed' : ''}`} key={key}><input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)}/><span>{text}</span></label> })}{unfinished && sectionDone === section.items.length && <p className="empty">✓ 這一區全部完成，做得好！</p>}</div></section> })}</div>
    <section className="narration-card" aria-labelledby="narration-title">
      <div className="card-heading"><span className="section-icon">“</span><div><p>VLOG SCRIPT</p><h3 id="narration-title">今日口白</h3></div></div>
      <div className="narration-body">
        <p className="narration-note">照著說，或換成自己的語氣；空白處留給當天的真實感受。</p>
        {Object.entries({ filmOpeningSuggestion: '全片片頭建議', filmOpening: '全片片頭口白', opening: '開場口白', closing: '收尾口白', filmClosing: '全片最後一句' }).map(([key, title]) => narration[day.day][key] && <div className="script-block" key={`${day.day}-${key}`}><h4>{title}</h4><blockquote>{narration[day.day][key]}</blockquote></div>)}
      </div>
    </section>
    <div className="bottom-nav"><button disabled={selected === 0} onClick={() => selectDay(selected - 1)}>← 前一天</button><span>{selected + 1} / 9 DAYS</span><button disabled={selected === 8} onClick={() => selectDay(selected + 1)}>下一天 →</button></div><footer>必拍清單依「必拍.pdf」整理，口白依「九州 YouTube 拍攝腳本」整理。</footer></div></div></main>
  </>
}
