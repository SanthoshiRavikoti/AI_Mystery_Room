import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check, ChevronRight, CircleHelp, Clock3, FileSearch, Fingerprint, FolderOpen, Lightbulb, LockKeyhole, Menu, Search, Shield, Sparkles, X } from 'lucide-react'
import { api } from './api.js'

const cx = (...classes) => classes.filter(Boolean).join(' ')
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', people: '03', clues: '05', hints: '02', note: 'A first case', mark: '●' },
  { id: 'medium', label: 'Medium', people: '04', clues: '07', hints: '03', note: 'A closer look', mark: '◆' },
  { id: 'hard', label: 'Hard', people: '05', clues: '09', hints: '03', note: 'For the sharpest eye', mark: '✳' },
]

function Header({ light = false }) {
  const [menu, setMenu] = useState(false)
  return <header className={cx('topbar', light && 'topbar-light')}>
    <Link className="brand" to="/"><span className="brand-mark"><Fingerprint size={19} /></span><span>CASEFILE<span className="brand-sub">A MYSTERY ROOM</span></span></Link>
    <button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X size={20} /> : <Menu size={20} />}</button>
    <nav className={cx('topnav', menu && 'topnav-open')}><Link to="/create" onClick={() => setMenu(false)}>New investigation</Link><a href="/#how" onClick={() => setMenu(false)}>How it works</a><span className="nav-status"><i /> SYSTEM ONLINE</span></nav>
  </header>
}

function Footer() { return <footer className="footer"><span>CASEFILE <span className="muted">· FICTIONAL INVESTIGATIONS ONLY</span></span><span className="footer-right">THE TRUTH IS IN THE DETAILS <span>✳</span></span></footer> }
function PageFrame({ children }) { return <div className="app-shell"><Header />{children}<Footer /></div> }
function Eyebrow({ children, icon: Icon }) { return <div className="eyebrow">{Icon && <Icon size={14} />}{children}</div> }
function Loading({ label = 'Working on your case…' }) { return <div className="loading-wrap"><span className="spinner" /><span>{label}</span></div> }
function Notice({ message, onRetry }) { return <div className="notice" role="alert"><CircleHelp size={19} /><div><strong>We hit a snag</strong><p>{message}</p>{onRetry && <button className="text-button" onClick={onRetry}>Try again <ArrowRight size={14} /></button>}</div></div> }
function Button({ children, to, variant = 'primary', className = '', ...props }) { const classes = cx('button', `button-${variant}`, className); return to ? <Link className={classes} to={to}>{children}</Link> : <button className={classes} {...props}>{children}</button> }

function Home() {
  return <PageFrame><main>
    <section className="hero container"><div className="hero-copy"><Eyebrow icon={Sparkles}>AN INTERACTIVE DETECTIVE STORY</Eyebrow><h1>Every mystery<br />leaves a <em>trace.</em></h1><p className="hero-lead">A quiet room. A story that doesn’t quite add up. Your job is to notice what everyone else missed.</p><Button to="/create">Open a new case <ArrowRight size={17} /></Button><div className="hero-caption"><span className="caption-rule" /> NO EXPERIENCE REQUIRED. CURIOSITY HELPS.</div></div>
      <div className="hero-art" aria-label="Illustration of a detective's case file"><div className="art-grain" /><div className="art-top"><span>DEPARTMENT OF UNFINISHED STORIES</span><span>FILE NO. 027</span></div><div className="file-card"><div className="file-card-top"><span className="stamp">CONFIDENTIAL</span><span className="file-icon"><FolderOpen size={25} /></span></div><div className="case-label">THE LAST KNOWN<br />HOUR</div><div className="file-line" /><div className="file-meta"><span>STATUS <b>OPEN</b></span><span>LEAD DETECTIVE <b>YOU</b></span></div><div className="red-thread thread-one" /><div className="red-thread thread-two" /><div className="pin pin-one" /><div className="pin pin-two" /><div className="evidence-note"><span>FIELD NOTE / 01</span><p>Someone remembers the evening differently.</p></div><div className="photo-card"><span>EXHIBIT<br />A</span><Fingerprint size={40} /></div></div><div className="art-bottom"><span>OBSERVE CLOSELY</span><span>✳ &nbsp; CASEFILE ARCHIVES</span></div></div>
    </section>
    <section className="ticker"><div>READ BETWEEN THE LINES <span>✳</span> QUESTION THE ALIBI <span>✳</span> FOLLOW THE EVIDENCE <span>✳</span> TRUST YOUR INSTINCT <span>✳</span> READ BETWEEN THE LINES <span>✳</span></div></section>
    <section className="intro-section container" id="how"><div><Eyebrow icon={BookOpen}>YOUR DESK IS WAITING</Eyebrow><h2>A good detective<br />doesn’t guess.<br /><em>They investigate.</em></h2></div><div className="intro-right"><p>Start with a premise. Get a complete fictional case built around it: a cast of suspects, a desk full of evidence, and one truth hiding in plain sight.</p><p>Take your time. Read the statements. Follow the timeline. Then make your call.</p><div className="how-steps"><div><span>01</span><b>SET THE SCENE</b><small>Give us the beginning of a mystery.</small></div><div><span>02</span><b>FOLLOW THE TRAIL</b><small>Study suspects and uncover evidence.</small></div><div><span>03</span><b>NAME YOUR SUSPECT</b><small>Build your case. Deliver your verdict.</small></div></div></div></section>
    <section className="home-cta"><div className="container cta-inner"><Eyebrow icon={FileSearch}>THE NEXT FILE IS YOURS</Eyebrow><h2>So. What happened?</h2><Button to="/create" variant="light">Start investigating <ArrowRight size={17} /></Button><span className="cta-stamp">OPEN<br />CASE</span></div></section>
  </main></PageFrame>
}

function CreatePage() {
  const [premise, setPremise] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  async function submit(event) {
    event.preventDefault(); setError('')
    if (premise.trim().length < 12) { setError('Add a little more detail to your premise (at least 12 characters).'); return }
    setLoading(true)
    try { const data = await api('/cases', { method: 'POST', body: { premise: premise.trim(), difficulty } }); navigate(`/case/${data.case.id}`) }
    catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  return <PageFrame><main className="create-page container"><Link className="back-link" to="/"><ArrowLeft size={15} /> BACK TO THE FRONT DESK</Link><div className="create-heading"><Eyebrow icon={FolderOpen}>NEW CASE INTAKE <span className="eyebrow-dot">/</span> FORM 01</Eyebrow><h1>Every case starts<br />with a <em>what if.</em></h1><p>Give us the first thread. We’ll build a mystery worth pulling apart.</p></div>
    <form onSubmit={submit} className="intake-card"><div className="form-section-head"><span>01</span><div><h2>Set the scene</h2><p>What happened? Keep it fictional, keep us curious.</p></div></div><label htmlFor="premise">THE STARTING POINT <span>REQUIRED</span></label><textarea id="premise" maxLength={800} value={premise} onChange={(e) => setPremise(e.target.value)} placeholder="A priceless painting disappears during the museum’s midnight gala. The doors were locked from the inside…" />{error && <div className="form-error" role="alert">{error}</div>}<div className="field-foot"><span>One or two sentences is plenty.</span><span className={premise.length > 740 ? 'count-warn' : ''}>{premise.length} / 800</span></div>
      <div className="form-divider" /><div className="form-section-head"><span>02</span><div><h2>Choose your difficulty</h2><p>There’s no wrong way to start. There is a culprit.</p></div></div><div className="difficulty-grid" role="radiogroup" aria-label="Mystery difficulty">{DIFFICULTIES.map((item) => <button type="button" role="radio" aria-checked={difficulty === item.id} className={cx('difficulty-option', difficulty === item.id && 'selected')} onClick={() => setDifficulty(item.id)} key={item.id}><span className="diff-top"><span>{item.mark} &nbsp; {item.label}</span>{difficulty === item.id && <Check size={16} />}</span><span className="diff-note">{item.note}</span><span className="diff-counts"><span>{item.people}<small>PEOPLE</small></span><span>{item.clues}<small>CLUES</small></span><span>{item.hints}<small>HINTS</small></span></span></button>)}</div><div className="form-bottom"><span><LockKeyhole size={14} /> The solution stays sealed until your accusation.</span><Button type="submit" disabled={loading}>{loading ? 'Building your case…' : 'Build my case'} {loading ? <span className="tiny-spinner" /> : <ArrowRight size={16} />}</Button></div></form>
    <div className="create-aside"><span>INTAKE NOTE</span><p>Our stories are works of fiction, generated for your entertainment. No real people or real cases involved.</p><span className="aside-mark">✳ &nbsp; CLASSIFIED ENOUGH</span></div>
  </main></PageFrame>
}

function CasePage() {
  const { id } = useParams()
  const [gameCase, setGameCase] = useState(null)
  const [revealed, setRevealed] = useState({})
  const [hints, setHints] = useState([])
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  async function load() { setError(''); setLoading(true); try { const data = await api(`/cases/${id}`); setGameCase(data.case); setHints(data.case.usedHints || []); if (data.case.status === 'completed') navigate(`/case/${id}/result`, { replace: true }) } catch (e) { setError(e.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [id])
  async function discover(clueId) { setError(''); setAction(clueId); try { const data = await api(`/cases/${id}/clues/${clueId}/discover`, { method: 'POST' }); setGameCase(data.case); setRevealed((old) => ({ ...old, [clueId]: data.clue })) } catch (e) { setError(e.message) } finally { setAction('') } }
  async function requestHint() { setError(''); setAction('hint'); try { const data = await api(`/cases/${id}/hints`, { method: 'POST' }); setGameCase(data.case); setHints((old) => [...old, data.hint]) } catch (e) { setError(e.message) } finally { setAction('') } }
  if (loading) return <PageFrame><Loading label="Pulling the file…" /></PageFrame>
  if (error && !gameCase) return <PageFrame><main className="container state-page"><Notice message={error} onRetry={load} /></main></PageFrame>
  if (!gameCase) return null
  const discovered = gameCase.discoveredClueIds.length
  const progress = Math.round(discovered / gameCase.clues.length * 100)
  return <PageFrame><main className="investigation container"><div className="case-toolbar"><Link className="back-link" to="/"><ArrowLeft size={15} /> CASE DESK</Link><span><i className="live-dot" /> ACTIVE INVESTIGATION</span><span>FILE {id.slice(-6).toUpperCase()}</span></div>
    <section className="case-heading"><div><Eyebrow icon={FolderOpen}>{gameCase.difficulty.toUpperCase()} CASE <span className="eyebrow-dot">/</span> OPEN FILE</Eyebrow><h1>{gameCase.title}</h1><p>{gameCase.premise}</p></div><div className="case-progress"><div className="progress-label"><span>INVESTIGATION</span><b>{discovered} <small>/ {gameCase.clues.length}</small></b></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><span>{progress === 100 ? 'ALL EVIDENCE UNCOVERED' : 'EVIDENCE EXAMINED'}</span></div></section>
    {error && <Notice message={error} onRetry={() => setError('')} />}
    <div className="investigation-grid"><div className="main-column"><section className="paper-panel story-panel"><div className="section-label"><span><BookOpen size={15} /> CASE BRIEF</span><span>FIELD REPORT / 01</span></div><p>{gameCase.story}</p></section>
      <section className="evidence-section"><div className="section-title"><div><Eyebrow icon={FileSearch}>THE EVIDENCE DESK</Eyebrow><h2>Every detail counts.</h2></div><span>{String(discovered).padStart(2, '0')} / {String(gameCase.clues.length).padStart(2, '0')} FOUND</span></div><div className="clue-list">{gameCase.clues.map((clue, index) => { const open = revealed[clue.id]; return <article className={cx('clue-card', clue.discovered && 'clue-found')} key={clue.id}><div className="clue-index">E-{String(index + 1).padStart(2, '0')}</div><div className="clue-content"><div className="clue-heading"><h3>{clue.title}</h3><span className={cx('evidence-status', clue.discovered ? 'found' : '')}>{clue.discovered ? 'EXAMINED' : 'UNEXAMINED'}</span></div><p>{clue.description}</p>{open && <div className="clue-reveal"><span>RECOVERED EVIDENCE</span><p>{open.content}</p></div>}</div><button className="clue-action" disabled={!!action} onClick={() => discover(clue.id)} aria-label={`${clue.discovered ? 'Review' : 'Examine'} ${clue.title}`}>{action === clue.id ? <span className="tiny-spinner" /> : clue.discovered ? <Search size={17} /> : <ArrowRight size={17} />}</button></article> })}</div></section>
    </div><aside className="side-column"><section className="side-card"><div className="section-label"><span><Fingerprint size={15} /> PERSONS OF INTEREST</span><span>{String(gameCase.suspects.length).padStart(2, '0')}</span></div><div className="suspect-list">{gameCase.suspects.map((suspect, index) => <details className="suspect-row" key={suspect.id}><summary><span className="suspect-number">0{index + 1}</span><span className="suspect-name">{suspect.name}<small>{suspect.motive}</small></span><ChevronRight size={16} /></summary><div className="suspect-details"><p>{suspect.profile}</p><div><b>OPPORTUNITY</b><p>{suspect.opportunity || 'Under investigation.'}</p></div><div><b>THEIR ALIBI</b><p>{suspect.alibi}</p></div></div></details>)}</div></section>
      <section className="hint-card"><div className="hint-icon"><Lightbulb size={17} /></div><div className="section-label"><span>WHEN YOU NEED A NUDGE</span><span>{gameCase.hintsAvailable} LEFT</span></div><h3>Stuck on a detail?</h3><p>Hints get clearer each time. Each one costs 10 points.</p>{hints.map((hint, i) => <div className="hint-reveal" key={`${i}-${hint}`}><span>HINT 0{i + 1}</span>{hint}</div>)}<button className="hint-button" onClick={requestHint} disabled={!!action || !gameCase.hintsAvailable}>{action === 'hint' ? 'Finding a hint…' : gameCase.hintsAvailable ? 'Request a hint' : 'No hints remaining'} {action === 'hint' ? <span className="tiny-spinner" /> : <ArrowRight size={15} />}</button></section>
      {gameCase.timeline?.length > 0 && <section className="timeline-card"><div className="section-label"><span><Clock3 size={15} /> KNOWN TIMELINE</span></div>{gameCase.timeline.map((item, i) => <div className="timeline-item" key={`${i}-${item}`}><i /><p>{item}</p></div>)}</section>}
      <section className="accuse-card"><Eyebrow icon={Shield}>WHEN YOU’RE READY</Eyebrow><h3>Make your call.</h3><p>Once you accuse, the case closes and the truth comes out.</p><Button to={`/case/${id}/accuse`} variant="light">Review suspects & accuse <ArrowRight size={15} /></Button><span className="accuse-lock"><LockKeyhole size={12} /> IRREVERSIBLE DECISION</span></section>
    </aside></div>
  </main></PageFrame>
}

function AccusePage() {
  const { id } = useParams(); const navigate = useNavigate()
  const [gameCase, setGameCase] = useState(null); const [selected, setSelected] = useState(''); const [confirm, setConfirm] = useState(false); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  async function load() { setLoading(true); setError(''); try { const data = await api(`/cases/${id}`); setGameCase(data.case); if (data.case.status === 'completed') navigate(`/case/${id}/result`, { replace: true }) } catch (e) { setError(e.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [id])
  async function submit() { if (!selected) return; setSaving(true); setError(''); try { await api(`/cases/${id}/accuse`, { method: 'POST', body: { suspectId: selected } }); navigate(`/case/${id}/result`) } catch (e) { setError(e.message); setConfirm(false) } finally { setSaving(false) } }
  if (loading) return <PageFrame><Loading label="Preparing your accusation…" /></PageFrame>
  if (!gameCase) return <PageFrame><main className="container state-page"><Notice message={error} onRetry={load} /></main></PageFrame>
  const suspect = gameCase.suspects.find((s) => s.id === selected)
  return <PageFrame><main className="accusation-page container"><Link className="back-link" to={`/case/${id}`}><ArrowLeft size={15} /> BACK TO INVESTIGATION</Link><div className="accuse-heading"><Eyebrow icon={Shield}>CASE RESOLUTION <span className="eyebrow-dot">/</span> FINAL STATEMENT</Eyebrow><h1>Who do you<br /><em>believe did it?</em></h1><p>You’ve read the accounts. Examined the evidence. Now make your case.</p></div>{error && <Notice message={error} onRetry={() => setError('')} />}
    <div className="accusation-layout"><div className="suspect-choices" role="radiogroup" aria-label="Select a suspect">{gameCase.suspects.map((item, i) => <button role="radio" aria-checked={selected === item.id} className={cx('choice-card', selected === item.id && 'choice-selected')} key={item.id} onClick={() => { setSelected(item.id); setConfirm(false) }}><span className="choice-number">0{i + 1}</span><span className="choice-main"><b>{item.name}</b><small>{item.profile}</small></span><span className="choice-check">{selected === item.id && <Check size={17} />}</span></button>)}</div><aside className="final-statement"><span className="statement-icon"><BadgeCheck size={20} /></span><Eyebrow>YOUR FINAL STATEMENT</Eyebrow><h2>{suspect ? suspect.name : 'The choice is yours.'}</h2><p>{suspect ? `You’re naming ${suspect.name} as the person responsible. Review the evidence in your own mind. Once you submit, the sealed file opens.` : 'Select the person you believe is responsible. The case file will open after you make your accusation.'}</p><div className="statement-facts"><span><Check size={14} /> The truth is sealed until now</span><span><Check size={14} /> Your score is based on evidence and hints</span></div>{confirm ? <div className="confirm-box"><b>Ready to close the case?</b><p>This accusation can’t be changed.</p><div><button className="cancel-button" onClick={() => setConfirm(false)} disabled={saving}>Go back</button><button className="confirm-button" onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit accusation'} {!saving && <ArrowRight size={14} />}</button></div></div> : <Button disabled={!selected} onClick={() => setConfirm(true)}>{selected ? 'Make this accusation' : 'Choose a suspect first'} <ArrowRight size={15} /></Button>}</aside></div>
  </main></PageFrame>
}

function ResultPage() {
  const { id } = useParams(); const navigate = useNavigate(); const [result, setResult] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  async function load() { setError(''); setLoading(true); try { setResult(await api(`/cases/${id}/result`)) } catch (e) { if (e.message.includes('Submit your accusation')) navigate(`/case/${id}`, { replace: true }); else setError(e.message) } finally { setLoading(false) } }
  useEffect(() => { load() }, [id])
  if (loading) return <PageFrame><Loading label="Opening the sealed file…" /></PageFrame>
  if (!result) return <PageFrame><main className="container state-page"><Notice message={error} onRetry={load} /></main></PageFrame>
  const correct = result.verdict === 'correct'; const score = result.scoreBreakdown
  return <PageFrame><main className="result-page container"><div className="result-top"><Eyebrow icon={LockKeyhole}>SEALED FILE <span className="eyebrow-dot">/</span> CASE RESOLVED</Eyebrow><span>FILE {id.slice(-6).toUpperCase()}</span></div><section className={cx('verdict-card', correct && 'verdict-correct')}><div className="verdict-mark">{correct ? <Check size={22} /> : <X size={22} />}</div><span className="verdict-kicker">{correct ? 'A DETECTIVE’S INSTINCT' : 'THE CASE IS CLOSED'}</span><h1>{correct ? 'You found the truth.' : 'The truth was hiding elsewhere.'}</h1><p>{correct ? 'Your read of the evidence was right.' : 'Let’s look at what the evidence was telling us.'}</p><div className="score-result"><span>FINAL SCORE</span><b>{score.finalScore}<small> PTS</small></b></div><span className="verdict-watermark">{correct ? 'CASE CLOSED' : 'THE END'}</span></section>
    <section className="resolution-grid"><div className="culprit-card"><Eyebrow icon={Fingerprint}>THE PERSON RESPONSIBLE</Eyebrow><h2>{result.culprit.name}</h2><p>{result.culprit.profile}</p><div className="culprit-alibi"><span>THE MOTIVE</span><p>{result.culprit.motive}</p></div><div className="culprit-alibi"><span>THE ALIBI</span><p>{result.culprit.alibi}</p></div></div><div className="explanation-card"><Eyebrow icon={FileSearch}>HOW THE EVIDENCE FITS</Eyebrow><p className="solution-copy">{result.explanation}</p><div className="rationale-list">{result.clueRationale.map((item, i) => <div key={`${i}-${item}`}><span>0{i + 1}</span><p>{item}</p></div>)}</div></div></section>
    <section className="score-breakdown"><div><span>Correct accusation</span><b>{score.basePoints > 0 ? `+${score.basePoints}` : '0'} <small>PTS</small></b></div><div><span>Clues uncovered</span><b>+{score.cluePoints} <small>PTS</small></b></div><div><span>Hints used</span><b className="negative">−{score.hintPenalty} <small>PTS</small></b></div><div className="score-total"><span>YOUR SCORE</span><b>{score.finalScore} <small>PTS</small></b></div></section><div className="new-case-row"><span><span className="live-dot" /> FILE ARCHIVED. READY WHEN YOU ARE.</span><Button to="/create">Open another case <ArrowRight size={16} /></Button></div>
  </main></PageFrame>
}

export default function App() {
  return <Routes><Route path="/" element={<Home />} /><Route path="/create" element={<CreatePage />} /><Route path="/case/:id" element={<CasePage />} /><Route path="/case/:id/accuse" element={<AccusePage />} /><Route path="/case/:id/result" element={<ResultPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>
}
