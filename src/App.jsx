import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './components/Icon';
import { answerFromProjectData, projectData } from './data/projectData';

const navItems = [
  ['overview', 'Overview'],
  ['roadmap', 'Roadmap'],
  ['check', 'Work items'],
  ['risk', 'Risks'],
  ['users', 'Team'],
  ['decision', 'Decisions'],
];

const starterPrompts = ['What needs my attention?', 'Summarize project risks', 'How is team capacity?'];

function Avatar({ initials, color = '#7967e8', small = false }) {
  return <span className={`avatar ${small ? 'avatar--small' : ''}`} style={{ '--avatar': color }}>{initials}</span>;
}

function Sidebar({ collapsed, onToggle, active, onSelect }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark"><Icon name="spark" size={19} strokeWidth={2.1} /></div>
        <span className="brand-name">PM Copilot</span>
        <button className="icon-button sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <Icon name="chevron" size={17} />
        </button>
      </div>

      <nav className="nav-list" aria-label="Primary">
        <p className="nav-label">Workspace</p>
        {navItems.map(([icon, label]) => (
          <button key={label} className={`nav-item ${active === label ? 'nav-item--active' : ''}`} onClick={() => onSelect(label)}>
            <Icon name={icon} size={19} />
            <span>{label}</span>
            {label === 'Risks' && <span className="nav-badge">3</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="project-switcher">
          <span className="project-icon">A</span>
          <div>
            <strong>Project Atlas</strong>
            <small>Build & Validate</small>
          </div>
          <Icon name="dots" size={18} />
        </div>
        <div className="profile-row">
          <Avatar initials="MC" color="#2d405c" />
          <div>
            <strong>Maya Chen</strong>
            <small>Program manager</small>
          </div>
          <span className="online-dot" />
        </div>
      </div>
    </aside>
  );
}

function Header({ onOpenCopilot }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span>Workspace</span><Icon name="chevron" size={14} /><strong>Project Atlas</strong>
      </div>
      <div className="topbar-actions">
        <label className={`search ${searchOpen ? 'search--open' : ''}`}>
          <Icon name="search" size={18} />
          <input placeholder="Search project" onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)} />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-button notification" aria-label="Notifications"><Icon name="bell" size={19} /><span /></button>
        <button className="copilot-button" onClick={onOpenCopilot}><Icon name="spark" size={17} /> Ask Copilot</button>
      </div>
    </header>
  );
}

function Hero() {
  const { project } = projectData;
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="date-label">MONDAY · JUNE 29</span>
        <h1>Good afternoon, Maya.</h1>
        <p><span className="status-dot" /> {project.name} is on track, with <strong>{project.daysToLaunch} days</strong> until launch.</p>
        <div className="hero-actions">
          <button className="primary-button">View launch plan <Icon name="arrow" size={16} /></button>
          <button className="text-button"><Icon name="spark" size={16} /> Generate daily brief</button>
        </div>
      </div>
      <div className="confidence-card">
        <div className="confidence-ring" style={{ '--progress': project.confidence }}>
          <div><strong>{project.confidence}%</strong><span>confidence</span></div>
        </div>
        <div className="confidence-copy">
          <span>Launch health</span>
          <strong>Looking good</strong>
          <small>+4% since Friday</small>
        </div>
      </div>
    </section>
  );
}

function MetricCards() {
  return (
    <section className="metric-grid">
      {projectData.metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className={`metric-icon metric-icon--${metric.tone}`}>
            <Icon name={metric.label === 'Completed' ? 'check' : metric.label === 'Open risks' ? 'risk' : 'roadmap'} size={18} />
          </div>
          <div className="metric-main"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></div>
          <span className={`trend trend--${metric.tone}`}>{metric.trend}</span>
        </article>
      ))}
    </section>
  );
}

function BriefingCard({ onAsk }) {
  return (
    <article className="card briefing-card">
      <div className="card-heading">
        <div><span className="eyebrow"><Icon name="spark" size={14} /> Copilot briefing</span><h2>Three things to know today</h2></div>
        <button className="icon-button"><Icon name="dots" size={19} /></button>
      </div>
      <div className="brief-list">
        <button onClick={() => onAsk('What needs my attention?')}>
          <span className="brief-number brief-number--purple">01</span>
          <div><strong>SSO review needs a final push</strong><p>Vendor latency is tightening the acceptance window. An escalation before 3 PM keeps the milestone intact.</p></div>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => onAsk('How is team capacity?')}>
          <span className="brief-number brief-number--green">02</span>
          <div><strong>QA capacity is under pressure</strong><p>Noah is at 88% allocation. One temporary reassignment covers the mobile regression gap.</p></div>
          <Icon name="chevron" size={18} />
        </button>
        <button onClick={() => onAsk('What decisions are pending?')}>
          <span className="brief-number brief-number--orange">03</span>
          <div><strong>One decision is due Wednesday</strong><p>The expanded mobile test matrix needs approval at the July 1 checkpoint.</p></div>
          <Icon name="chevron" size={18} />
        </button>
      </div>
    </article>
  );
}

function TimelineCard() {
  return (
    <article className="card timeline-card">
      <div className="card-heading">
        <div><span className="eyebrow">Delivery timeline</span><h2>Path to launch</h2></div>
        <button className="quiet-button">Full roadmap <Icon name="arrow" size={15} /></button>
      </div>
      <div className="timeline">
        {projectData.milestones.map((item, index) => (
          <div className={`timeline-item timeline-item--${item.status}`} key={item.title}>
            <div className="timeline-rail">
              <span>{item.status === 'done' ? <Icon name="check" size={12} strokeWidth={2.6} /> : index + 1}</span>
              {index < projectData.milestones.length - 1 && <i />}
            </div>
            <div className="timeline-copy"><strong>{item.title}</strong><small>{item.date}</small></div>
            {item.status === 'active' && <span className="active-pill">72% · now</span>}
          </div>
        ))}
      </div>
      <div className="timeline-footer"><Icon name="clock" size={15} /><span>Next checkpoint: <strong>Integration review</strong> · Wednesday, 10:00 AM</span></div>
    </article>
  );
}

function PrioritiesCard() {
  return (
    <article className="card priorities-card">
      <div className="card-heading">
        <div><span className="eyebrow">Focus</span><h2>Priority work</h2></div>
        <button className="add-button"><Icon name="plus" size={15} /> Add</button>
      </div>
      <div className="priority-table">
        {projectData.priorities.map((item) => (
          <div className="priority-row" key={item.id}>
            <span className={`priority-check ${item.status === 'At risk' ? 'priority-check--risk' : ''}`} />
            <div className="priority-copy"><small>{item.id}</small><strong>{item.title}</strong></div>
            <Avatar initials={item.initials} color={item.color} small />
            <span className={`due ${item.due === 'Today' ? 'due--today' : ''}`}>{item.due}</span>
            <button className="icon-button"><Icon name="dots" size={17} /></button>
          </div>
        ))}
      </div>
      <button className="card-footer-button">View all 12 work items <Icon name="arrow" size={15} /></button>
    </article>
  );
}

function RiskCard({ onAsk }) {
  return (
    <article className="card risk-card">
      <div className="card-heading">
        <div><span className="eyebrow">Watchlist</span><h2>Risk pulse</h2></div>
        <span className="risk-count">3 open</span>
      </div>
      <div className="risk-highlight">
        <div className="risk-header"><span className="severity-dot" /><span>Needs attention</span><small>HIGH</small></div>
        <h3>Identity provider latency</h3>
        <p>Acceptance testing could slip by two days if the vendor response lands after today.</p>
        <div><Avatar initials="JB" color="#7967e8" small /><span>Jon Bell</span><button onClick={() => onAsk('Summarize project risks')}>View mitigation</button></div>
      </div>
      <div className="risk-compact"><span className="severity-dot severity-dot--amber" /><div><strong>Mobile regression capacity</strong><small>Medium · Noah Kim</small></div><Icon name="chevron" size={16} /></div>
      <div className="risk-compact"><span className="severity-dot severity-dot--gray" /><div><strong>Legal copy approval</strong><small>Low · Priya Shah</small></div><Icon name="chevron" size={16} /></div>
    </article>
  );
}

function ActivityCard() {
  return (
    <article className="card activity-card">
      <div className="card-heading"><div><span className="eyebrow">Live feed</span><h2>Recent activity</h2></div></div>
      <div className="activity-list">
        {projectData.activity.map((item) => (
          <div className="activity-row" key={item.person + item.time}>
            <Avatar initials={item.initials} color={item.color} small />
            <p><strong>{item.person}</strong> {item.action} <b>{item.target}</b><small>{item.time}</small></p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ChatPanel({ open, onClose, queuedQuestion }) {
  const initial = useMemo(() => ({
    role: 'assistant',
    ...answerFromProjectData('status summary'),
  }), []);
  const [messages, setMessages] = useState([initial]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const lastQueued = useRef('');

  const ask = (question) => {
    const clean = question.trim();
    if (!clean || thinking) return;
    setMessages((current) => [...current, { role: 'user', text: clean }]);
    setInput('');
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', ...answerFromProjectData(clean) }]);
      setThinking(false);
    }, 650);
  };

  useEffect(() => {
    if (queuedQuestion && queuedQuestion !== lastQueued.current) {
      lastQueued.current = queuedQuestion;
      ask(queuedQuestion.split('::')[0]);
    }
  }, [queuedQuestion]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  return (
    <aside className={`chat-panel ${open ? 'chat-panel--open' : ''}`} aria-hidden={!open}>
      <div className="chat-header">
        <div className="copilot-orb"><Icon name="spark" size={19} /></div>
        <div><strong>Project Copilot</strong><span><i /> Connected to Project Atlas</span></div>
        <button className="icon-button" onClick={onClose} aria-label="Close Copilot"><Icon name="close" size={19} /></button>
      </div>
      <div className="chat-context"><Icon name="link" size={14} /><span>Using 5 live project sources</span><small>Updated just now</small></div>
      <div className="chat-body">
        {messages.map((message, index) => message.role === 'user' ? (
          <div className="user-message" key={index}>{message.text}</div>
        ) : (
          <div className="assistant-message" key={index}>
            <div className="assistant-mark"><Icon name="spark" size={14} /></div>
            <div>
              <span className="answer-eyebrow">{message.eyebrow}</span>
              <p>{message.text}</p>
              <div className="sources">{message.sources.map((source) => <span key={source}>{source}</span>)}</div>
            </div>
          </div>
        ))}
        {thinking && <div className="assistant-message"><div className="assistant-mark"><Icon name="spark" size={14} /></div><div className="typing"><i /><i /><i /></div></div>}
        <div ref={bottomRef} />
      </div>
      {messages.length < 3 && (
        <div className="prompt-list">
          {starterPrompts.map((prompt) => <button key={prompt} onClick={() => ask(prompt)}>{prompt}<Icon name="arrow" size={14} /></button>)}
        </div>
      )}
      <form className="chat-input" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about this project…" rows="1" onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); ask(input); }
        }} />
        <button type="submit" disabled={!input.trim() || thinking} aria-label="Send"><Icon name="send" size={17} /></button>
        <small>Answers are grounded in your project data</small>
      </form>
    </aside>
  );
}

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [active, setActive] = useState('Overview');
  const [chatOpen, setChatOpen] = useState(true);
  const [queuedQuestion, setQueuedQuestion] = useState('');

  const askCopilot = (question) => {
    setQueuedQuestion(`${question}::${Date.now()}`);
    setChatOpen(true);
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'app-shell--collapsed' : ''} ${chatOpen ? 'app-shell--chat' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} active={active} onSelect={setActive} />
      <Header onOpenCopilot={() => setChatOpen(true)} />
      <main className="main-content">
        <div className="dashboard-wrap">
          <Hero />
          <MetricCards />
          <section className="content-grid">
            <BriefingCard onAsk={askCopilot} />
            <TimelineCard />
            <PrioritiesCard />
            <RiskCard onAsk={askCopilot} />
            <ActivityCard />
          </section>
          <footer className="dashboard-footer"><span>PM Copilot demo</span><span>Project data refreshed moments ago</span></footer>
        </div>
      </main>
      <button className={`floating-copilot ${chatOpen ? 'floating-copilot--hidden' : ''}`} onClick={() => setChatOpen(true)} aria-label="Open Copilot"><Icon name="spark" size={20} /></button>
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} queuedQuestion={queuedQuestion} />
      {chatOpen && <div className="mobile-scrim" onClick={() => setChatOpen(false)} />}
    </div>
  );
}
