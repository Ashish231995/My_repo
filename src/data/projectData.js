export const projectData = {
  project: {
    name: 'Project Atlas',
    subtitle: 'Customer portal launch',
    phase: 'Build & Validate',
    health: 'On track',
    confidence: 81,
    daysToLaunch: 24,
    targetDate: 'July 23, 2026',
    owner: 'Maya Chen',
  },
  metrics: [
    { label: 'Completed', value: '68%', detail: '34 of 50 deliverables', trend: '+8% this week', tone: 'violet' },
    { label: 'Team velocity', value: '42', detail: 'points this sprint', trend: '+12% vs. average', tone: 'green' },
    { label: 'Open risks', value: '3', detail: '1 needs attention', trend: '2 mitigated', tone: 'amber' },
  ],
  milestones: [
    { title: 'Product definition', date: 'May 14', status: 'done', progress: 100 },
    { title: 'Experience design', date: 'Jun 06', status: 'done', progress: 100 },
    { title: 'Build & integration', date: 'Jul 08', status: 'active', progress: 72 },
    { title: 'Launch readiness', date: 'Jul 19', status: 'next', progress: 18 },
    { title: 'Go live', date: 'Jul 23', status: 'future', progress: 0 },
  ],
  priorities: [
    { id: 'ATL-128', title: 'Finalize SSO integration', owner: 'Jon Bell', initials: 'JB', due: 'Today', status: 'In review', color: '#7967e8' },
    { id: 'ATL-142', title: 'Approve launch email sequence', owner: 'Priya Shah', initials: 'PS', due: 'Tomorrow', status: 'In progress', color: '#ee8a69' },
    { id: 'ATL-151', title: 'Resolve mobile checkout defects', owner: 'Noah Kim', initials: 'NK', due: 'Jul 02', status: 'At risk', color: '#4a9c81' },
  ],
  risks: [
    {
      id: 'RSK-09',
      title: 'Identity provider latency',
      impact: 'Could delay SSO acceptance testing by 2 days.',
      owner: 'Jon Bell',
      severity: 'High',
      mitigation: 'Vendor escalation is open; fallback test tenant prepared.',
    },
    {
      id: 'RSK-12',
      title: 'Mobile regression capacity',
      impact: 'QA coverage is 18% below plan for the current sprint.',
      owner: 'Noah Kim',
      severity: 'Medium',
      mitigation: 'Reassign one web QA engineer after Tuesday release cut.',
    },
    {
      id: 'RSK-14',
      title: 'Legal copy approval',
      impact: 'Final privacy language is still awaiting regional review.',
      owner: 'Priya Shah',
      severity: 'Low',
      mitigation: 'Decision checkpoint booked for July 1.',
    },
  ],
  activity: [
    { person: 'Priya Shah', initials: 'PS', action: 'approved', target: 'Launch campaign brief', time: '18m ago', color: '#ee8a69' },
    { person: 'Noah Kim', initials: 'NK', action: 'flagged a risk on', target: 'Mobile checkout', time: '42m ago', color: '#4a9c81' },
    { person: 'Jon Bell', initials: 'JB', action: 'completed', target: 'Auth service load test', time: '1h ago', color: '#7967e8' },
  ],
  team: [
    { name: 'Jon Bell', initials: 'JB', role: 'Engineering', load: 92, color: '#7967e8' },
    { name: 'Priya Shah', initials: 'PS', role: 'Go-to-market', load: 74, color: '#ee8a69' },
    { name: 'Noah Kim', initials: 'NK', role: 'Quality', load: 88, color: '#4a9c81' },
    { name: 'Elena Rossi', initials: 'ER', role: 'Design', load: 61, color: '#cf6fa8' },
  ],
  decisions: [
    { title: 'Keep password login as launch fallback', date: 'Jun 28', owner: 'Maya Chen', status: 'Decided' },
    { title: 'Move regional analytics to phase two', date: 'Jun 26', owner: 'Priya Shah', status: 'Decided' },
    { title: 'Extend mobile test matrix', date: 'Jul 01', owner: 'Noah Kim', status: 'Pending' },
  ],
};

const includesAny = (input, words) => words.some((word) => input.includes(word));

export function answerFromProjectData(question) {
  const input = question.toLowerCase();
  const { project, priorities, risks, team, decisions } = projectData;

  if (includesAny(input, ['risk', 'blocker', 'blocking', 'concern'])) {
    const urgent = risks[0];
    return {
      eyebrow: 'Risk analysis',
      text: `There are ${risks.length} open risks. The one to watch is ${urgent.title.toLowerCase()}: ${urgent.impact} ${urgent.mitigation}`,
      sources: ['Risk register', 'Sprint plan'],
    };
  }

  if (includesAny(input, ['status', 'health', 'track', 'progress', 'summary'])) {
    return {
      eyebrow: 'Live project status',
      text: `${project.name} is ${project.health.toLowerCase()} with ${project.confidence}% confidence. Delivery is 68% complete, with ${project.daysToLaunch} days until the ${project.targetDate} launch. SSO latency is the only item needing immediate attention.`,
      sources: ['Delivery plan', 'Risk register', 'Team updates'],
    };
  }

  if (includesAny(input, ['today', 'priority', 'focus', 'next'])) {
    return {
      eyebrow: 'Recommended focus',
      text: `Today, close “${priorities[0].title}”, confirm ownership for “${priorities[1].title}”, and protect QA time for “${priorities[2].title}”. I would escalate the identity-provider response before the 3 PM checkpoint.`,
      sources: ['Priority queue', 'Calendar', 'Risk register'],
    };
  }

  if (includesAny(input, ['team', 'capacity', 'workload', 'overload', 'busy'])) {
    const loaded = [...team].sort((a, b) => b.load - a.load)[0];
    return {
      eyebrow: 'Capacity check',
      text: `${loaded.name} has the highest allocation at ${loaded.load}%. Noah Kim is also elevated at 88% because of mobile regression work. Elena Rossi has the most room and could absorb a lightweight review task.`,
      sources: ['Capacity plan', 'Sprint assignments'],
    };
  }

  if (includesAny(input, ['decision', 'approval', 'decided'])) {
    const pending = decisions.find((decision) => decision.status === 'Pending');
    return {
      eyebrow: 'Decision log',
      text: `${decisions.length - 1} recent decisions are closed. One is pending: “${pending.title}”, owned by ${pending.owner} and due ${pending.date}.`,
      sources: ['Decision log'],
    };
  }

  if (includesAny(input, ['deadline', 'launch', 'date', 'milestone', 'when'])) {
    return {
      eyebrow: 'Launch plan',
      text: `Go-live is ${project.targetDate}, ${project.daysToLaunch} days away. Build and integration closes July 8, followed by launch readiness on July 19. Current confidence is ${project.confidence}%.`,
      sources: ['Milestone plan'],
    };
  }

  return {
    eyebrow: 'Project synthesis',
    text: `${project.name} is moving well: 68% of deliverables are complete and velocity is up 12%. I’d keep the team focused on SSO acceptance and mobile regression coverage—the two threads most likely to affect the launch path.`,
    sources: ['Delivery plan', 'Team updates', 'Risk register'],
  };
}
