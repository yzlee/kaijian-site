/* ══════════════════════════════════════════════════════════════════════
   快剪辑 官网交互
   - 零依赖、零构建：直接丢给 Cloudflare Pages 即可
   - 所有示例文本都是编的（真实项目里是别人的访谈内容，不放公开页面）
   ══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CFG = window.SITE_CONFIG || {};

  /* ── 发布配置接线：链接没填就退化成「即将放出」，不给死链 ────────── */
  function wireConfig() {
    const y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
    if (CFG.version) {
      const ch = $('#dlChannel');
      if (ch) ch.textContent = `${CFG.channel ? CFG.channel + '版 ' : ''}${CFG.version}`;
    }
    if (CFG.sizeLabel) { const n = $('#dlSize'); if (n) n.textContent = CFG.sizeLabel; }
    if (CFG.runtimeLabel) { const n = $('#dlRuntime'); if (n) n.textContent = CFG.runtimeLabel; }

    const dl = $$('.js-download');
    if (CFG.downloadUrl) {
      dl.forEach((a) => { a.href = CFG.downloadUrl; a.removeAttribute('aria-disabled'); });
      $$('.js-dl-pending').forEach((n) => { n.hidden = true; });
    } else {
      // 顶栏那颗仍然滚到下载区（有用），下载区那颗禁掉，避免点了没反应
      dl.forEach((a) => {
        if (a.getAttribute('href') === '#download') return;
        a.setAttribute('aria-disabled', 'true');
        a.style.opacity = '.55';
        a.style.pointerEvents = 'none';
      });
    }
    const mirror = $('.js-mirror');
    if (mirror && CFG.mirrorUrl) { mirror.href = CFG.mirrorUrl; mirror.hidden = false; }
    const repo = $('.js-repo');
    if (repo && CFG.repoUrl) { repo.href = CFG.repoUrl; repo.hidden = false; }
    const contact = $('.js-contact');
    if (contact && CFG.contact) { contact.href = CFG.contact; contact.hidden = false; }
  }

  /* ── 导航：滚动态 + 阅读进度条 ─────────────────────────────────── */
  function wireNav() {
    const nav = $('#nav'), prog = $('#navProgress');
    let ticking = false;
    const paint = () => {
      const y = scrollY;
      nav.classList.toggle('stuck', y > 12);
      const h = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = h > 0 ? `${Math.min(100, (y / h) * 100)}%` : '0';
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    paint();
  }

  /* ── 滚动揭示 ──────────────────────────────────────────────────── */
  function wireReveal() {
    const items = $$('.reveal, .steps li');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add('in'), Math.min(i * 60, 240));
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: .05 });
    items.forEach((n) => io.observe(n));

    // 兜底：底边收缩 + 超高视口（或页面根本滚不动）时，最后一屏可能永远进不了
    // 观察阈值，内容就一直停在 opacity:0。谁已经在视野里就直接放出来，宁可少一次动画
    // 也不能让人看不见文字。
    const sweep = () => items.forEach((n) => {
      if (!n.classList.contains('in') && n.getBoundingClientRect().top < innerHeight * 1.05) {
        n.classList.add('in'); io.unobserve(n);
      }
    });
    addEventListener('load', sweep);
    addEventListener('resize', sweep, { passive: true });
    setTimeout(sweep, 1500);
  }

  /* ── 卡片跟随光标的高光 ────────────────────────────────────────── */
  function wireSpotlight() {
    if (reduced) return;
    $$('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ══════════════ 首屏界面示意：数据 ══════════════ */
  const MOCK = [
    { t: '00:11.2', who: '主持', txt: '你说你上个月开始把这套流程自动化了，具体是怎么做的？', k: 'mid' },
    { t: '00:12.5', who: '嘉宾', txt: '这件事情，我一开始就觉得是不存在的', k: 'viral' },
    { t: '00:15.8', who: '嘉宾', txt: '嗯…就是那种，你懂我意思吧', k: 'dim' },
    { t: '00:17.0', who: '嘉宾', txt: '我这个月的收入是上个月的两倍', k: 'viral' },
    { t: '00:21.4', who: '嘉宾', txt: '但代价是我把三个客户全退了', k: 'good' },
    { t: '00:26.9', who: '主持', txt: '退掉客户不心疼吗？', k: 'mid' },
    { t: '00:28.3', who: '嘉宾', txt: '心疼。可留着他们，我永远做不到今天这个数', k: 'good' },
    { t: '00:33.7', who: '嘉宾', txt: '呃，这个怎么说呢', k: 'dim' },
    { t: '00:35.1', who: '嘉宾', txt: '第一条做教程的视频就爆了，我当时人都是懵的', k: 'good' },
    { t: '00:40.6', who: '嘉宾', txt: '所以我的结论是：只要做就火，别等准备好', k: 'viral' },
    { t: '00:45.0', who: '主持', txt: '那你现在一天工作几个小时？', k: 'mid' },
    { t: '00:46.8', who: '嘉宾', txt: '四个小时，剩下的时间我在跑步', k: 'good' },
  ];
  // 播放头在 0–52 秒之间循环，句子按 sec 命中高亮
  const CUES = MOCK.map((m) => {
    const [mm, ss] = m.t.split(':');
    return { ...m, sec: Number(mm) * 60 + Number(ss) };
  });

  function buildMock() {
    const list = $('#mkScript');
    if (!list) return null;
    list.innerHTML = CUES.map((c, i) => `
      <li class="k-${c.k}" data-i="${i}">
        <span></span>
        <span class="tc">${c.t}</span>
        <span class="txt"><span class="who">${c.who}</span>${c.txt}</span>
      </li>`).join('');

    const ruler = $('#mkRuler');
    ruler.innerHTML = Array.from({ length: 12 }, (_, i) => `<span>${i % 4 === 0 ? `00:${String(i * 5).padStart(2, '0')}` : ''}</span>`).join('');

    // 时间线：把「进了成片」的句子摆成片段，宽度按时长（示意值）
    const picked = CUES.filter((c) => c.k === 'viral' || c.k === 'good');
    const trackV = $('#mkTrackV');
    const trackS = $('#mkTrackS');
    let x = 0.5;
    const clips = picked.map((c, i) => {
      const w = 8 + (i % 3) * 4.5;
      const seg = { left: x, width: w, c };
      x += w + 0.6;
      return seg;
    });
    trackV.insertAdjacentHTML('beforeend', clips.map((s, i) => `
      <div class="clip${i === 1 ? ' sel' : ''}" style="left:${s.left}%;width:${s.width}%">
        <span class="cn">#${i + 1}</span>
        <span class="wave">${bars(s.width)}</span>
      </div>`).join(''));
    trackS.innerHTML = clips.map((s) => `
      <div class="cue" style="left:${s.left}%;width:${s.width}%">${s.c.txt.slice(0, 9)}</div>`).join('');

    return { list, head: $('#mkHead'), sub: $('#mkSub'), tc: $('#mkTc'), frame: $('#mkFrame') };
  }

  function bars(widthPct) {
    // 波形柱：确定性伪随机，保证每次刷新形状一致
    const n = Math.max(6, Math.round(widthPct * 2.6));
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = 22 + Math.abs(Math.sin(i * 1.7) * 62) + (i % 3) * 4;
      out += `<i style="left:${(i / n) * 100}%;height:${Math.min(96, h)}%"></i>`;
    }
    return out;
  }

  function animateMock(mk) {
    if (!mk) return;
    const TOTAL = 52;
    if (reduced) {
      mk.head.style.left = '34%';
      mk.list.children[3].classList.add('act');
      return;
    }
    let t0 = null, running = true, last = -1;
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; }, { threshold: .05 });
    io.observe(mk.frame.closest('.app'));

    const tick = (ts) => {
      requestAnimationFrame(tick);
      if (!running) { t0 = ts - (last >= 0 ? last * 1000 : 0); return; }
      if (t0 === null) t0 = ts;
      const sec = ((ts - t0) / 1000 * 1.35) % TOTAL;
      mk.head.style.left = `${(sec / TOTAL) * 100}%`;
      mk.tc.textContent = fmt(sec);

      let idx = 0;
      for (let i = 0; i < CUES.length; i++) if (sec >= CUES[i].sec) idx = i;
      if (idx !== last) {
        last = idx;
        [...mk.list.children].forEach((li, i) => li.classList.toggle('act', i === idx));
        mk.sub.textContent = CUES[idx].txt;
        mk.sub.style.opacity = CUES[idx].k === 'dim' ? '.45' : '1';
        // 让当前句滚进视野
        const li = mk.list.children[idx];
        const top = li.offsetTop - mk.list.clientHeight / 2 + li.clientHeight / 2;
        mk.list.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    };
    requestAnimationFrame(tick);
  }

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${ss.toFixed(3).padStart(6, '0')}`;
  };

  /* ══════════════ 演示 1：逐句评级 ══════════════ */
  const RATE = [
    {
      t: '00:12.5', who: '嘉宾', k: 'viral', label: '可能爆',
      txt: '这件事情，我一开始就觉得是不存在的',
      why: '开口就否定一个共识，听的人必须听下去才知道否定的是什么——信息缺口拉满。规则本身认不出这句里的「主张」，是模型分兜的底；所以规则只排序、不判决。',
      dims: [['信息缺口', 9], ['自足性', 8], ['反差', 7], ['前置度', 9], ['方法', 2], ['经历', 3], ['重复惩罚', 0]]
    },
    {
      t: '00:17.0', who: '嘉宾', k: 'viral', label: '可能爆',
      txt: '我这个月的收入是上个月的两倍',
      why: '有具体数字、单独拎出来也成立，适合放开头。但它不带方法，后面必须紧跟「怎么做到的」，否则观众三秒后就走。',
      dims: [['信息缺口', 7], ['自足性', 9], ['反差', 6], ['前置度', 8], ['方法', 1], ['经历', 5], ['重复惩罚', 0]]
    },
    {
      t: '00:21.4', who: '嘉宾', k: 'good', label: '有意思',
      txt: '但代价是我把三个客户全退了',
      why: '「代价」型句子，接在上一句后面形成选择—代价结构。单独拿出来做钩子会缺主语，所以它属于上一句那一组，整组一起搬。',
      dims: [['信息缺口', 6], ['自足性', 4], ['反差', 8], ['前置度', 5], ['方法', 3], ['经历', 6], ['重复惩罚', 0]]
    },
    {
      t: '00:15.8', who: '嘉宾', k: 'dim', label: '无聊',
      txt: '嗯…就是那种，你懂我意思吧',
      why: '纯语气词加填充语，没有任何主张。自动标删除线，切缝只吃这一段静音，不会伤到前后两句的字头字尾。',
      dims: [['信息缺口', 0], ['自足性', 0], ['反差', 0], ['前置度', 0], ['方法', 0], ['经历', 0], ['重复惩罚', 0]]
    },
    {
      t: '00:40.6', who: '嘉宾', k: 'viral', label: '可能爆',
      txt: '所以我的结论是：只要做就火，别等准备好',
      why: '0.9 秒、十来个字，按「太短＝碎片」的老规则会被直接毙掉——但它有完整主张，是典型的收口金句。判据因此改成「有没有主张」，不是「够不够长」。',
      dims: [['信息缺口', 5], ['自足性', 9], ['反差', 7], ['前置度', 6], ['方法', 6], ['经历', 2], ['重复惩罚', 0]]
    },
    {
      t: '00:45.0', who: '主持', k: 'mid', label: '一般',
      txt: '那你现在一天工作几个小时？',
      why: '主持人的问句本身分不高，但它是一个问答块的入口。段落由问句开启，答句才有上下文——所以它跟着答案一起进片，不参与「按分挑句」。',
      dims: [['信息缺口', 3], ['自足性', 7], ['反差', 1], ['前置度', 4], ['方法', 0], ['经历', 0], ['重复惩罚', 0]]
    },
    {
      t: '00:46.8', who: '嘉宾', k: 'good', label: '有意思',
      txt: '四个小时，剩下的时间我在跑步',
      why: '与「收入翻倍」形成反差，适合放在正片中段做二次钩子。每 20–30 秒需要一个这样的点，否则中途流失。',
      dims: [['信息缺口', 6], ['自足性', 7], ['反差', 8], ['前置度', 5], ['方法', 2], ['经历', 5], ['重复惩罚', 0]]
    }
  ];

  function wireRateDemo() {
    const list = $('#demoScript'), detail = $('#demoDetail');
    if (!list) return;
    list.innerHTML = RATE.map((r, i) => `
      <li class="k-${r.k}" data-i="${i}" tabindex="0" role="button">
        <span class="tc">${r.t}</span>
        <span><span class="who">${r.who}</span>${r.txt}</span>
        <span class="tag t-${r.k}">${r.label}</span>
      </li>`).join('');

    const show = (i) => {
      const r = RATE[i];
      $$('li', list).forEach((li, j) => li.classList.toggle('on', i === j));
      detail.innerHTML = `
        <h4>AI 为什么这么判 <span class="tag t-${r.k}">${r.label}</span></h4>
        <p class="quote">「${r.txt}」</p>
        <div class="dims">${r.dims.map(([n, v]) => `
          <div class="dim"><span>${n}</span><span class="rail"><i style="width:${v * 10}%"></i></span><span class="v">${v}</span></div>`).join('')}
        </div>
        <p class="why">${r.why}</p>`;
    };
    list.addEventListener('click', (e) => {
      const li = e.target.closest('li'); if (li) show(+li.dataset.i);
    });
    list.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const li = e.target.closest('li'); if (li) { e.preventDefault(); show(+li.dataset.i); }
    });
    show(0);
  }

  /* ══════════════ 演示 2：构图安全 ══════════════ */
  // 画面 16:9；示意人物头顶在画面高度的 16.7% 处
  const HEAD_TOP = 16.7;
  const CROPS = {
    '16:9': {
      w: 100, top: 0, bottom: 0, ok: true, title: '原比例直出',
      note: '不裁剪，整帧输出，色彩标签照抄源片。'
    },
    '9:16': {
      w: 25.3, top: 4, bottom: 16, ok: true, title: '竖版 · 头部安全顶部对齐',
      note: '竖屏需要放大才能让人物占满，放大后画面装不下整幅高度。此时<b>向顶部对齐</b>而不是居中——居中会先切掉头顶。预览和导出用的是同一个公式，所见即所得。'
    },
    '1:1': {
      w: 50.6, top: 3, bottom: 7, ok: true, title: '方版 · 同一套顶部对齐',
      note: '换任何比例都走同一条 faceSafe 逻辑，不是每个比例各写一套。'
    },
    bad: {
      w: 25.3, top: 22, bottom: -2, ok: false, title: '这一版导不出去',
      note: '裁剪框上沿落到了头顶下方。导出前的 <code>validateEdl</code> 会硬校验每一段的构图，违规<b>直接报错终止</b>——宁可不给成片，也不给一片没有头顶的脸。修的是画面变换，不是把校验阈值调松。'
    }
  };

  function wireCropDemo() {
    const box = $('#cropBox'), guide = $('#cropGuide'), label = $('#cropLabel'), detail = $('#cropDetail');
    if (!box) return;
    guide.style.top = `${HEAD_TOP}%`;

    const apply = (key) => {
      const c = CROPS[key];
      box.style.width = `${c.w}%`;
      box.style.top = `${Math.max(0, c.top)}%`;
      box.style.bottom = `${Math.max(0, c.bottom)}%`;
      box.classList.toggle('bad', !c.ok);
      label.textContent = key === 'bad' ? '越界' : key;
      detail.innerHTML = `
        <h4>${c.title}</h4>
        <p class="why">${c.note}</p>
        <p class="note">虚线是人物头顶位置。判据：裁剪框上沿必须在它<b>上方</b>，且画面里必须有人。</p>
        <p style="margin-top:14px;color:${c.ok ? 'var(--good-text)' : '#FF9385'};font-size:14px;font-weight:700">
          ${c.ok ? '✓ 构图校验通过，可以导出' : '✗ 构图校验失败，导出被拦下'}
        </p>`;
    };
    $$('.seg button').forEach((b) => b.addEventListener('click', () => {
      $$('.seg button').forEach((o) => o.classList.toggle('on', o === b));
      apply(b.dataset.ratio);
    }));
    apply('16:9');
  }

  /* ══════════════ 演示 3：钩子按组确认 ══════════════ */
  const HOOKS = [
    {
      id: 'h1', main: '我这个月的收入是上个月的两倍',
      grouped: '垫话：「说出来你可能不信」 · 后续：「但代价是我把三个客户全退了」',
      score: '信息缺口 7 · 自足 9'
    },
    {
      id: 'h2', main: '这件事情，我一开始就觉得是不存在的',
      grouped: '后续：「直到我自己踩了一遍」',
      score: '信息缺口 9 · 自足 8'
    },
    {
      id: 'h3', main: '只要做就火，别等准备好',
      grouped: '前句：「所以我的结论是」（垫话，一起搬走才通顺）',
      score: '0.9 秒 / 5 个字，仍是主张'
    }
  ];
  const BASE_RINGS = [
    { k: '开场', t: '自我介绍与背景' },
    { k: '问答', t: '为什么决定一个人做' },
    { k: '问答', t: '第一年是怎么活下来的' },
    { k: '证据', t: '具体做了哪三件事' },
    { k: '收口', t: '给现在想开始的人的建议' }
  ];

  function wireHookDemo() {
    const wrap = $('#hookList'), rings = $('#ringList');
    if (!wrap) return;
    const done = new Set();

    const paintRings = () => {
      const front = HOOKS.filter((h) => done.has(h.id))
        .map((h) => ({ k: '钩子', t: h.main, hot: true }));
      const all = [...front, ...BASE_RINGS];
      rings.innerHTML = all.map((r) => `
        <li class="${r.hot ? 'hot' : ''}"><b>${r.k}</b><span>${r.t}</span></li>`).join('');
    };
    const paintCards = () => {
      wrap.innerHTML = HOOKS.map((h) => `
        <div class="hook-card ${done.has(h.id) ? 'done' : ''}" data-id="${h.id}">
          <p class="main">「${h.main}」</p>
          <p class="grouped">${h.grouped}</p>
          <div class="row">
            <button class="mini">${done.has(h.id) ? '✓ 已确认，已排到最前' : '确认这组'}</button>
            <span class="score">${h.score}</span>
          </div>
        </div>`).join('');
    };
    wrap.addEventListener('click', (e) => {
      const card = e.target.closest('.hook-card'); if (!card) return;
      const id = card.dataset.id;
      done.has(id) ? done.delete(id) : done.add(id);
      paintCards(); paintRings();
    });
    paintCards(); paintRings();
  }

  /* ══════════════ Tabs ══════════════ */
  function wireTabs() {
    const tabs = $$('[role="tab"]');
    if (!tabs.length) return;
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        const p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        const next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus(); select(next);
      });
    });
  }

  /* ── 启动 ─────────────────────────────────────────────────────── */
  wireConfig();
  wireNav();
  wireReveal();
  wireSpotlight();
  wireTabs();
  wireRateDemo();
  wireCropDemo();
  wireHookDemo();
  animateMock(buildMock());
})();
