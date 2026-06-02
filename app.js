const data = window.WORLD_CUP_DATA;
const bracketEl = document.querySelector('#bracket');
const panelEl = document.querySelector('#team-panel');
const cardsEl = document.querySelector('#team-cards');
const groupsEl = document.querySelector('#groups');
const resetBtn = document.querySelector('#reset-view');
const langButtons = document.querySelectorAll('.lang-btn');
let selectedTeam = null;
let currentLang = localStorage.getItem('wc-lang') || 'en';

const copy = {
  en: {
    eyebrow: 'World Cup 2026',
    title: 'World Cup Live Table',
    lead: 'Check live-ready 2026 World Cup group standings, W-D-L records, results, official knockout slots, and squads in a fast table-first view.',
    adTitle: 'Ad slot',
    adSub: 'AdSense placeholder',
    statusTitle: 'Live-ready group standings + knockout path',
    statusDesc: 'Built for quick reading: rank, W-D-L, points, recent results, and official knockout slots.',
    reset: 'Reset view',
    groupsTitle: 'Group standings',
    groupsDesc: 'Live table format: rank, W-D-L, goals, points, result status, and advancement line.',
    popularTitle: 'Popular teams',
    footerNote: 'Unofficial fan/information page. No FIFA or association official logos are used.',
    selectKicker: 'Select a team',
    tapFlag: 'Tap a flag',
    panelDesc: 'See group slot, final squad, and match path.',
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
    title: '월드컵 실시간 순위표',
    lead: '2026 월드컵 조별 순위, 승-무-패, 경기 결과, 공식 토너먼트 슬롯, 선수명단을 표 중심으로 빠르게 확인하세요.',
    adTitle: '광고 영역',
    adSub: 'AdSense 자리',
    statusTitle: '실시간 대응 조별 순위 + 토너먼트 경로',
    statusDesc: '순위, 승-무-패, 승점, 최근 결과, 공식 토너먼트 슬롯을 빠르게 읽는 구조입니다.',
    reset: '전체 보기',
    groupsTitle: '조별 순위표',
    groupsDesc: '실시간 반영용 표: 순위, 승-무-패, 득실, 승점, 결과 상태, 진출선을 함께 보여줍니다.',
    popularTitle: '인기 국가',
    footerNote: '비공식 팬/정보 페이지입니다. FIFA/각 협회 공식 로고를 사용하지 않습니다.',
    selectKicker: '국가 선택',
    tapFlag: '국기를 눌러보세요',
    panelDesc: '조 배정, 최종 선수명단, 경기 경로를 확인할 수 있습니다.',
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
  button.disabled = isSlot;
  button.dataset.team = code;
  button.innerHTML = isSlot
    ? `<span class="slot-name">${slotLabel(code)}</span><span class="seed">${t('tbd')}</span>`
    : `<span>${flagMarkup(code)}<strong>${teamName(team)}</strong></span><span class="seed">${teamStatus(team)}</span>`;
  if (!isSlot) {
    button.setAttribute('aria-label', `View ${teamName(team)} squad`);
    button.addEventListener('click', () => selectTeam(code));
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
  const matches = (data.groupMatches || []).filter((match) => match.group === group && match.played && rows.has(match.home) && rows.has(match.away));

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
      button.addEventListener('click', () => selectTeam(button.dataset.team));
    });
    groupsEl.appendChild(card);
  });
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
    ${team.squadUrl ? `<a class="squad-link" href="${team.squadUrl}" target="_blank" rel="noopener">${t('openTeam')}</a>` : ''}
  `;
  renderBracket();
  renderGroups();
}

function renderCards() {
  const popular = ['KOR', 'MEX', 'CAN', 'USA', 'BRA', 'ARG', 'FRA', 'ENG', 'JPN', 'GER', 'ESP', 'POR'];
  cardsEl.innerHTML = '';
  popular.forEach((code) => {
    const team = getTeam(code);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'team-card';
    button.innerHTML = `${flagMarkup(code)}<strong>${teamName(team)}</strong><small>${teamStatus(team)}</small>`;
    button.addEventListener('click', () => selectTeam(code));
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
}

resetBtn.addEventListener('click', () => {
  selectedTeam = null;
  renderPanelEmpty();
  renderBracket();
  renderGroups();
});

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

applyLanguage(currentLang);
