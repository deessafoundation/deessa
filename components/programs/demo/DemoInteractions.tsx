'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, RotateCcw, Heart, Sun, Droplets, Apple, House, Hand, Smile, Volume2 } from 'lucide-react'
import s from './program-demo.module.css'

export function DemoAction({ label, message }: { label: string; message: string }) {
  const [open, setOpen] = useState(false)
  return <div className={s.actionWrap}>
    <button className={s.button} onClick={() => setOpen(!open)} aria-expanded={open}>{label}<ArrowUpRight size={18} aria-hidden="true" /></button>
    {open && <p className={s.feedback} role="status"><Check size={18} aria-hidden="true" />{message} This is a design preview; nothing has been submitted.</p>}
  </div>
}

export function CampaignContribution() {
  const [amount, setAmount] = useState(1500)
  const [confirmed, setConfirmed] = useState(false)
  return <div className={s.contribution}>
    <span className={s.kicker}>A SMALL ACT. A SHARED POSSIBILITY.</span>
    <h3>Be part of the next chapter.</h3>
    <p>Choose an example contribution to explore the campaign experience.</p>
    <div className={s.amounts} role="group" aria-label="Example contribution in Nepalese rupees">
      {[500, 1500, 3000].map(value => <button key={value} aria-pressed={amount === value} onClick={() => { setAmount(value); setConfirmed(false) }}>Rs {value.toLocaleString('en-US')}</button>)}
    </div>
    <button className={s.button} onClick={() => setConfirmed(true)}>Continue with Rs {amount.toLocaleString('en-US')}<ArrowUpRight size={18} aria-hidden="true" /></button>
    <p className={s.fineprint}>Demo only · No payment will be collected</p>
    {confirmed && <p className={s.feedback} role="status">Your example selection is Rs {amount.toLocaleString('en-US')}. The real campaign would continue to its secure donation form.</p>}
  </div>
}

const words = [
  { label: 'I want', icon: Hand, color: '#e1e8f7' }, { label: 'water', icon: Droplets, color: '#d9edf6' },
  { label: 'food', icon: Apple, color: '#fae8d8' }, { label: 'play', icon: Sun, color: '#fcf1c6' },
  { label: 'home', icon: House, color: '#e3eddd' }, { label: 'help', icon: Heart, color: '#f2dfeb' },
  { label: 'happy', icon: Smile, color: '#fcf1c6' }, { label: 'more', icon: Hand, color: '#e1e8f7' },
]

export function CommunicationBoard() {
  const [sentence, setSentence] = useState<string[]>([])
  return <div className={s.board}>
    <div className={s.boardTop}><span><span className={s.boardDot} /> companion</span><span>COMMUNICATION BOARD</span></div>
    <div className={s.boardGreeting}><span>Little choices. Big expressions.</span><h3>What’s on your mind?</h3></div>
    <div className={s.sentence} role="status" aria-live="polite"><Volume2 size={20} aria-hidden="true" /><span>{sentence.length ? sentence.join(' ') : 'Tap a card to build a phrase'}</span></div>
    <div className={s.wordGrid}>{words.map(({ label, icon: Icon, color }) => <button key={label} style={{ background: color }} onClick={() => setSentence(old => [...old.slice(-7), label])}><Icon size={30} strokeWidth={1.6} aria-hidden="true" /><span>{label}</span></button>)}</div>
    <div className={s.boardBottom}><span>Interactive concept · Tap to try</span><button onClick={() => setSentence([])} aria-label="Clear phrase"><RotateCcw size={15} aria-hidden="true" />Reset</button></div>
  </div>
}
