const data = window.WORLD_CUP_DATA;
const liveData = window.WORLD_CUP_LIVE_DATA || { groupMatches: [], warmups: [] };
const liveGroupMatches = (liveData.groupMatches || []).map((match) => ({
  ...match,
  group: findGroupForMatch(match.home, match.away),
})).filter((match) => match.group);
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const groupsEl = document.querySelector('#groups');
const warmupsEl = document.querySelector('#warmups');
const liveUpdatedEl = document.querySelector('#live-updated');
const resetBtn = document.querySelector('#reset-view');
const langButtons = document.querySelectorAll('.lang-btn');
let selectedTeam = null;
let currentLang = localStorage.getItem('wc-lang') || 'en';

const copy = {
  en: {
    eyebrow: 'World Cup 2026',
    title: 'World Cup 2026 Dashboard',
    lead: 'Real 2026 FIFA World Cup groups, standings, match schedule, Round of 32 slots, knockout path, and country squads in one fast table-first dashboard.',
    adTitle: 'Ad slot',
    adSub: 'AdSense placeholder',
    statusTitle: 'Real groups + official knockout slots',
    statusDesc: 'Check group tables, match results, Round of 32 slots, and each country’s path through the 2026 bracket.',
    warmupTitle: 'Warm-up watch',
    warmupDesc: 'Recent and upcoming international friendlies involving qualified 2026 World Cup teams, shown in your browser’s local time.',
    localTimeNote: 'Times shown in your local timezone',
    liveUpdated: 'Live feed updated',
    source: 'Source',
    seoTitle: '2026 FIFA World Cup standings, schedule, and bracket',
    seoDesc: 'Use this page to check every real group table, match result, upcoming fixture, Round of 32 slot, knockout path, and national team squad for the 2026 FIFA World Cup. The dashboard is designed for quick search and reading before and during matchdays.',
    seoPointOne: 'Group standings: rank, points, W-D-L record, goals for, goals against, and goal difference.',
    seoPointTwo: 'Match information: live-ready World Cup results plus pre-tournament international friendly results.',
    seoPointThree: 'Tournament path: official Round of 32 slots through the final, with team squads and country guides.',
    reset: 'View all standings',
    groupsTitle: 'Group standings',
    groupsDesc: 'Compare each group by rank, points, W-D-L record, goals for, goals against, goal difference, and recent form.',
    popularTitle: 'Popular teams',
    countryGuidesTitle: 'Country guides',
    guideSubGroup: 'Group path + squad',
    guideSubHost: 'Host path + squad',
    koreaGuide: 'Korea 2026 guide',
    usaGuide: 'USA 2026 guide',
    brazilGuide: 'Brazil 2026 guide',
    argentinaGuide: 'Argentina 2026 guide',
    japanGuide: 'Japan 2026 guide',
    footerNote: 'Unofficial 2026 FIFA World Cup information page. No FIFA or association official logos are used.',
    selectKicker: 'Tournament dashboard',
    tapFlag: 'Real bracket slots',
    panelDesc: 'Start with the 48-team group table, then follow the Round of 32 slots and each country page for squad and path details.',
    panelStatTeams: 'Teams',
    panelStatGroups: 'Groups',
    panelStatKnockout: 'Round of 32 matches',
    openBracket: 'Open Round of 32 bracket',
    navRound: 'Round of 32',
    navAbout: 'About',
    navPrivacy: 'Privacy',
    navContact: 'Contact',
    navDisclaimer: 'Disclaimer',
    groupSlot: 'Group slot',
    updated: 'Updated',
    finalSquad: 'Final squad',
    players: 'players',
    caps: 'caps',
    goals: 'goals',
    clubTba: 'Club TBA',
    openTeam: 'Open national team page',
    tbd: 'TBD',
    scrollHint: 'Scroll horizontally for Final →',
    rank: 'Rank',
    team: 'Team',
    record: 'W-D-L',
    goalDiff: 'GF-GA',
    points: 'Pts',
    form: 'Result',
    played: 'P',
    notStarted: 'Not started',
    advancing: 'Advancing',
    bubble: 'Bubble',
    eliminated: 'Out',
  },
  ko: {
    eyebrow: '월드컵 2026',
    title: '2026 월드컵 대시보드',
    lead: '2026 FIFA 월드컵 실제 조편성, 순위표, 경기 일정, 32강 대진 슬롯, 토너먼트 경로, 국가별 선수명단을 한 화면에서 빠르게 확인하세요.',
    adTitle: '광고 영역',
    adSub: 'AdSense 자리',
    statusTitle: '실제 조편성 + 공식 토너먼트 슬롯',
    statusDesc: '조별 순위, 경기 결과, 32강 슬롯, 국가별 토너먼트 경로를 한눈에 확인할 수 있습니다.',
    warmupTitle: '예열 경기 체크',
    warmupDesc: '2026 월드컵 본선 진출팀이 포함된 최근·예정 친선경기 결과를 브라우저 로컬시간 기준으로 보여줍니다.',
    localTimeNote: '시간은 현재 기기의 로컬 시간 기준',
    liveUpdated: '실시간 데이터 갱신',
    source: '출처',
    seoTitle: '2026 FIFA 월드컵 순위와 경기 일정',
    seoDesc: '이 페이지에서는 2026 FIFA 월드컵 실제 조편성, 조별 순위표, 경기 일정, 실시간 스코어, 32강 대진 슬롯, 토너먼트 경로, 국가별 선수명단을 한 번에 확인할 수 있습니다. 경기 전에는 친선경기 결과로 각 팀의 흐름을 먼저 살펴볼 수 있습니다.',
    seoPointOne: '조별 순위: 순위, 승점, 승-무-패, 득점, 실점, 득실차를 빠르게 비교합니다.',
    seoPointTwo: '경기 정보: 월드컵 본선 결과와 개막 전 친선경기 결과를 함께 확인합니다.',
    seoPointThree: '대진 흐름: 32강부터 결승까지 공식 토너먼트 슬롯과 국가별 선수명단을 연결해 봅니다.',
    reset: '전체 순위 보기',
    groupsTitle: '조별 순위표',
    groupsDesc: '각 조의 순위, 승점, 승-무-패, 득점, 실점, 득실차, 최근 흐름과 진출권을 비교할 수 있습니다.',
    popularTitle: '인기 국가',
    countryGuidesTitle: '국가별 가이드',
    guideSubGroup: '조별 경로 + 선수명단',
    guideSubHost: '개최국 경로 + 선수명단',
    koreaGuide: '대한민국 2026 가이드',
    usaGuide: '미국 2026 가이드',
    brazilGuide: '브라질 2026 가이드',
    argentinaGuide: '아르헨티나 2026 가이드',
    japanGuide: '일본 2026 가이드',
    footerNote: '2026 FIFA 월드컵 정보를 빠르게 확인하기 위한 비공식 페이지입니다. FIFA/각 협회 공식 로고는 사용하지 않습니다.',
    selectKicker: '대회 대시보드',
    tapFlag: '실제 대진 슬롯',
    panelDesc: '48개 팀 조별 순위표에서 시작해 32강 대진 슬롯, 국가별 선수명단과 토너먼트 경로까지 이어서 확인할 수 있습니다.',
    panelStatTeams: '참가국',
    panelStatGroups: '조',
    panelStatKnockout: '32강 경기',
    openBracket: '32강 대진표 열기',
    navRound: '32강 대진표',
    navAbout: '소개',
    navPrivacy: '개인정보',
    navContact: '문의',
    navDisclaimer: '고지사항',
    groupSlot: '조 배정',
    updated: '업데이트',
    finalSquad: '최종 선수명단',
    players: '명',
    caps: '경기',
    goals: '골',
    clubTba: '소속팀 미정',
    openTeam: '국가대표 페이지 열기',
    tbd: '미정',
    scrollHint: '결승까지 보려면 가로로 스크롤 →',
    rank: '순위',
    team: '팀',
    record: '승-무-패',
    goalDiff: '득-실',
    points: '승점',
    form: '결과',
    played: '경기',
    notStarted: '시작 전',
    advancing: '진출권',
    bubble: '3위 경쟁',
    eliminated: '탈락권',
  },
};

function t(key) {
  return copy[currentLang][key] || copy.en[key] || key;
}

function getTeam(code) {
  return data.teams[code];
}

function findGroupForMatch(home, away) {
  return Object.entries(data.groups || {}).find(([, codes]) => codes.includes(home) && codes.includes(away))?.[0] || null;
}

function allGroupMatches() {
  return [...(data.groupMatches || []), ...liveGroupMatches];
}

function teamName(team) {
  return currentLang === 'ko' ? team.nameKo : team.name;
}

function teamStatus(team) {
  return currentLang === 'ko' ? (team.statusKo || team.status) : team.status;
}

function flagMarkup(code, extraClass = '') {
  const team = getTeam(code);
  return `<span class="flag ${extraClass}" aria-hidden="true">${team.flag}</span>`;
}

const teamPageSlugs = {
  KOR: 'korea',
  USA: 'usa',
  BIH: 'bosnia-herzegovina',
  COD: 'dr-congo',
  CIV: 'ivory-coast',
};

function slugifyTeamName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function teamPagePath(code) {
  const team = getTeam(code);
  if (!team) return '#';
  return `./teams/${teamPageSlugs[code] || slugifyTeamName(team.name)}.html`;
}

function openTeamPage(code) {
  const href = teamPagePath(code);
  if (href && href !== '#') window.location.href = href;
}

function scrollToGroup(group) {
  const target = document.querySelector(`#group-${group}`);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.classList.add('pulse');
    window.setTimeout(() => target.classList.remove('pulse'), 1100);
  }
}

function slotLabel(slot) {
  if (currentLang === 'ko') {
    return slot
      .replace(/Winner Group ([A-L])/g, '$1조 1위')
      .replace(/Runner-up Group ([A-L])/g, '$1조 2위')
      .replace(/3rd Group ([A-L/]+)/g, '$1조 3위 후보')
      .replace(/Winner Match (\d+)/g, 'M$1 승자')
      .replace(/Loser Match (\d+)/g, 'M$1 패자');
  }
  return slot
    .replace(/Winner Group ([A-L])/g, 'Group $1 winner')
    .replace(/Runner-up Group ([A-L])/g, 'Group $1 runner-up')
    .replace(/3rd Group ([A-L/]+)/g, '3rd-place candidate: Group $1')
    .replace(/Winner Match (\d+)/g, 'Winner M$1')
    .replace(/Loser Match (\d+)/g, 'Loser M$1');
}

function slotCandidateGroups(slot) {
  const direct = slot.match(/(?:Winner|Runner-up) Group ([A-L])/);
  if (direct) return [direct[1]];
  const third = slot.match(/3rd Group ([A-L/]+)/);
  if (third) return third[1].split('/');
  return [];
}

function slotCandidates(slot) {
  const groups = slotCandidateGroups(slot);
  if (!groups.length) return '';
  const groupsText = groups.map((group) => {
    const teams = (data.groups[group] || [])
      .map((code) => getTeam(code))
      .filter(Boolean)
      .map((team) => `${team.flag} ${teamName(team)}`)
      .join(', ');
    return `${group}: ${teams}`;
  }).join(' · ');
  const prefix = currentLang === 'ko' ? '가능 팀' : 'Candidates';
  return `${prefix}: ${groupsText}`;
}

function posClass(pos) {
  return `pos-${String(pos || 'na').toLowerCase()}`;
}

const posOrder = { GK: 0, DF: 1, MF: 2, FW: 3 };

function squadByPosition(squad) {
  return [...squad].sort((a, b) => {
    const aRank = posOrder[a.pos] ?? 99;
    const bRank = posOrder[b.pos] ?? 99;
    return aRank - bRank;
  });
}

function renderTeamButton(code, match) {
  const team = getTeam(code);
  const isSlot = !team;
  const isWinner = match.winner && match.winner === code;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = ['team-row', isWinner ? 'winner' : '', selectedTeam === code ? 'selected' : '', isSlot ? 'placeholder' : ''].filter(Boolean).join(' ');
  const candidateText = isSlot ? slotCandidates(code) : '';
  const candidateGroups = isSlot ? slotCandidateGroups(code) : [];
  button.disabled = isSlot && !candidateGroups.length;
  button.innerHTML = isSlot
    ? `<span class="slot-name">${slotLabel(code)}${candidateText ? `<small>${candidateText}</small>` : ''}</span><span class="seed">${candidateGroups.length ? (currentLang === 'ko' ? '조 보기' : 'Group') : (currentLang === 'ko' ? '미정' : 'Open')}</span>`
    : `<span>${flagMarkup(code)}<strong>${teamName(team)}</strong></span><span class="seed">${teamStatus(team)}</span>`;
  if (isSlot && candidateGroups.length) {
    button.setAttribute('aria-label', `${slotLabel(code)} ${currentLang === 'ko' ? '관련 조 순위표로 이동' : 'show related group standings'}`);
    button.addEventListener('click', () => scrollToGroup(candidateGroups[0]));
  }
  if (!isSlot) {
    button.setAttribute('aria-label', `Open ${teamName(team)} World Cup 2026 page`);
    button.addEventListener('click', () => openTeamPage(code));
  }
  return button;
}

function renderBracket() {
  bracketEl.innerHTML = '';
  data.rounds.forEach((round) => {
    const roundEl = document.createElement('div');
    roundEl.className = 'round';
    const title = currentLang === 'ko' ? (round.titleKo || round.title) : round.title;
    roundEl.innerHTML = `<h2 class="round-title">${title}</h2>`;

    round.matches.forEach((match) => {
      const matchEl = document.createElement('article');
      matchEl.className = ['match', match.winner ? 'winner-set' : ''].filter(Boolean).join(' ');
      matchEl.innerHTML = `<div class="match-label"><span>${match.label}</span><span>${match.time || ''}</span></div>`;
      match.teams.forEach((code) => matchEl.appendChild(renderTeamButton(code, match)));
      roundEl.appendChild(matchEl);
    });

    bracketEl.appendChild(roundEl);
  });
}

function emptyStanding(code, group, index) {
  return {
    code,
    group,
    slot: index + 1,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    form: [],
  };
}

function computeGroupStandings(group, codes) {
  const rows = new Map(codes.map((code, index) => [code, emptyStanding(code, group, index)]));
  const matches = allGroupMatches().filter((match) => match.group === group && match.played && rows.has(match.home) && rows.has(match.away));

  matches.forEach((match) => {
    const home = rows.get(match.home);
    const away = rows.get(match.away);
    const homeGoals = Number(match.homeGoals || 0);
    const awayGoals = Number(match.awayGoals || 0);
    home.played += 1;
    away.played += 1;
    home.gf += homeGoals;
    home.ga += awayGoals;
    away.gf += awayGoals;
    away.ga += homeGoals;

    if (homeGoals > awayGoals) {
      home.wins += 1; home.points += 3; home.form.push('W');
      away.losses += 1; away.form.push('L');
    } else if (homeGoals < awayGoals) {
      away.wins += 1; away.points += 3; away.form.push('W');
      home.losses += 1; home.form.push('L');
    } else {
      home.draws += 1; away.draws += 1;
      home.points += 1; away.points += 1;
      home.form.push('D'); away.form.push('D');
    }
  });

  return [...rows.values()].map((row) => ({ ...row, gd: row.gf - row.ga })).sort((a, b) =>
    b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.slot - b.slot
  );
}

function advancementLabel(rank) {
  if (rank <= 2) return t('advancing');
  if (rank === 3) return t('bubble');
  return t('eliminated');
}

function renderForm(row) {
  if (!row.form.length) return `<span class="form-empty">${t('notStarted')}</span>`;
  return row.form.slice(-3).map((result) => `<span class="form-pill form-${result.toLowerCase()}">${result}</span>`).join('');
}

function renderGroups() {
  if (!groupsEl) return;
  groupsEl.innerHTML = '';
  Object.entries(data.groups).forEach(([group, codes]) => {
    const standings = computeGroupStandings(group, codes);
    const card = document.createElement('article');
    card.id = `group-${group}`;
    card.className = 'group-card standings-card';
    card.innerHTML = `
      <div class="group-card-head">
        <h3>${currentLang === 'ko' ? `${group}조` : `Group ${group}`}</h3>
        <span>${standings.reduce((sum, row) => sum + row.played, 0) / 2} / 6</span>
      </div>
      <div class="standings-table" role="table" aria-label="${currentLang === 'ko' ? `${group}조 순위표` : `Group ${group} standings`}">
        <div class="standings-row standings-head" role="row">
          <span>${t('rank')}</span><span>${t('team')}</span><span>${t('record')}</span><span>${t('goalDiff')}</span><span>${t('points')}</span><span>${t('form')}</span>
        </div>
        ${standings.map((row, index) => {
          const team = getTeam(row.code);
          return `<button type="button" class="standings-row ${selectedTeam === row.code ? 'selected' : ''}" data-team="${row.code}" role="row">
            <span class="rank-cell"><strong>${index + 1}</strong><small>${advancementLabel(index + 1)}</small></span>
            <span class="team-cell">${flagMarkup(row.code)}<strong>${teamName(team)}</strong><small>${teamStatus(team)}</small></span>
            <span>${row.wins}-${row.draws}-${row.losses}</span>
            <span>${row.gf}-${row.ga}</span>
            <span class="points-cell">${row.points}</span>
            <span class="form-cell">${renderForm(row)}</span>
          </button>`;
        }).join('')}
      </div>
    `;
    card.querySelectorAll('.standings-row[data-team]').forEach((button) => {
      button.addEventListener('click', () => openTeamPage(button.dataset.team));
    });
    groupsEl.appendChild(card);
  });
}

function viewerTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
}

function formatMatchDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat(currentLang === 'ko' ? 'ko-KR' : 'en', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short',
  }).format(new Date(iso));
}

function liveTeamMarkup(side) {
  const team = getTeam(side.code);
  const label = team ? teamName(team) : side.name;
  const flag = team ? team.flag : '•';
  return `<span class="warmup-team"><span class="flag">${flag}</span><strong>${label}</strong></span>`;
}

function warmupScore(event) {
  const completed = event.status?.completed;
  if (!completed) return currentLang === 'ko' ? '예정' : 'Upcoming';
  return `${event.home.score} - ${event.away.score}`;
}

function renderWarmups() {
  if (!warmupsEl) return;
  const warmups = [...(liveData.warmups || [])]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 18);
  if (liveUpdatedEl) {
    liveUpdatedEl.textContent = liveData.updatedAt ? `${t('liveUpdated')}: ${formatMatchDate(liveData.updatedAt)} · ${viewerTimeZone()}` : '';
  }
  warmupsEl.innerHTML = warmups.map((event) => `
    <article class="warmup-card ${event.status?.completed ? 'done' : 'upcoming'}">
      <div class="warmup-meta"><span title="${t('localTimeNote')}: ${viewerTimeZone()}">${formatMatchDate(event.date)}</span><span>${event.status?.description || ''}</span></div>
      <div class="warmup-scoreline">
        ${liveTeamMarkup(event.home)}
        <strong>${warmupScore(event)}</strong>
        ${liveTeamMarkup(event.away)}
      </div>
      <small>${[event.venue, liveData.source?.name].filter(Boolean).join(' · ')}</small>
    </article>
  `).join('');
}

function findTeamGroup(code) {
  return Object.entries(data.groups).find(([, codes]) => codes.includes(code));
}

function currentStandingFor(code) {
  const groupEntry = findTeamGroup(code);
  if (!groupEntry) return null;
  const [group, codes] = groupEntry;
  const standings = computeGroupStandings(group, codes);
  const index = standings.findIndex((row) => row.code === code);
  return index >= 0 ? { ...standings[index], rank: index + 1 } : null;
}

function renderSquad(team) {
  return squadByPosition(team.squad).map((player) => `
    <li class="squad-player ${posClass(player.pos)}">
      <span class="player-pos">${player.pos || '-'}</span>
      <span class="player-main"><strong>${player.name}</strong><small>${player.club || t('clubTba')}</small></span>
      <span class="player-meta">${player.caps || 0} ${t('caps')} · ${player.goals || 0} ${t('goals')}</span>
    </li>
  `).join('');
}

function renderPanelEmpty() {
  panelEl.innerHTML = `
    <p class="panel-kicker">${t('selectKicker')}</p>
    <div class="panel-flag">🏆</div>
    <h2>${t('tapFlag')}</h2>
    <p class="panel-desc">${t('panelDesc')}</p>
    <div class="panel-stat-grid" aria-label="Tournament summary">
      <div><strong>48</strong><span>${t('panelStatTeams')}</span></div>
      <div><strong>12</strong><span>${t('panelStatGroups')}</span></div>
      <div><strong>16</strong><span>${t('panelStatKnockout')}</span></div>
    </div>
    <a class="squad-link secondary" href="./round-of-32.html">${t('openBracket')}</a>
  `;
}

function selectTeam(code) {
  const team = getTeam(code);
  if (!team) return;
  const standing = currentStandingFor(code);
  selectedTeam = code;
  panelEl.innerHTML = `
    <p class="panel-kicker">${team.confed}</p>
    <div class="panel-flag">${team.flag}</div>
    <h2>${teamName(team)}</h2>
    <div class="meta-list">
      <div><span>${t('groupSlot')}</span><strong>${teamStatus(team)}</strong></div>
      ${standing ? `<div><span>${t('rank')}</span><strong>${standing.rank} · ${standing.wins}-${standing.draws}-${standing.losses} · ${standing.points}${currentLang === 'ko' ? '점' : ' pts'}</strong></div>` : ''}
      <div><span>${t('updated')}</span><strong>${data.updatedAt}</strong></div>
    </div>
    <div class="squad-header"><strong>${t('finalSquad')}</strong><span>${team.squad.length} ${t('players')}</span></div>
    <ul class="squad-list">${renderSquad(team)}</ul>
    <a class="squad-link" href="${teamPagePath(code)}">${t('openTeam')}</a>
  `;
  renderBracket();
  renderGroups();
}

function renderCards() {
  const popular = ['KOR', 'MEX', 'CAN', 'USA', 'BRA', 'ARG', 'FRA', 'ENG', 'JPN', 'GER', 'ESP', 'POR'];
  cardsEl.innerHTML = '';
  popular.forEach((code) => {
    const team = getTeam(code);
    const button = document.createElement('a');
    button.className = 'team-card';
    button.href = teamPagePath(code);
    button.innerHTML = `${flagMarkup(code)}<strong>${teamName(team)}</strong><small>${teamStatus(team)}</small>`;
    cardsEl.appendChild(button);
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('wc-lang', lang);
  document.documentElement.lang = lang;
  document.body.dataset.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  langButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });
  document.documentElement.style.setProperty('--scroll-hint', JSON.stringify(t('scrollHint')));
  if (selectedTeam) {
    selectTeam(selectedTeam);
  } else {
    renderPanelEmpty();
    renderBracket();
    renderGroups();
  }
  renderCards();
  renderWarmups();
}

function clearSelection(scrollToStandings = false) {
  selectedTeam = null;
  renderPanelEmpty();
  renderBracket();
  renderGroups();
  renderCards();
  renderWarmups();
  document.querySelector('.bracket-wrap')?.scrollTo({ left: 0, behavior: 'smooth' });
  if (scrollToStandings) {
    document.querySelector('.groups-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

resetBtn.addEventListener('click', () => clearSelection(true));

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);
