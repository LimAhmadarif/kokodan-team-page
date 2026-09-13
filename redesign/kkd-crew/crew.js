/* ==========================================================================
   KKD-CREW — 코코단 팀원 소개 섹션 (팀 랜딩페이지용 독립 모듈)
   --------------------------------------------------------------------------
   <kkd-crew></kkd-crew> 태그를 넣으면 이 파일이 내용을 채우고,
   스크롤 등장 연출(GSAP ScrollTrigger)을 붙입니다.
   팀 페이지는 React(dc-runtime)로 그려지므로, 내용은 Shadow DOM 안에 넣어
   React 와 서로의 요소를 건드리지 않게 했습니다. (light DOM 에 넣으면 React 가
   우리 요소를 자기 것으로 착각해 지우려다 페이지 전체가 멈춥니다.)
   스타일(crew.css)도 Shadow DOM 안에서 불러와 팀 페이지 스타일과 섞이지 않습니다.
   ========================================================================== */
(function () {
  'use strict';

  /* ===== SECTION HEADER ===== */
  const HEAD = {
    label: 'FILE 02 — INTRUDER DATABASE',
    title: 'WANTED : 침입자 3인',
    sub: '스크롤하면 한 명씩 정체가 드러납니다 · SCROLL TO DECLASSIFY'
  };

  /* ===== TEAM INFORMATION =====
     photo 경로는 이 페이지(index.html) 기준입니다. 사진이 없으면 placeholder 표시. */
  const MEMBERS = [
    {
      id: 'ahmed', number: '01', nameEn: 'AHMED', nameKo: '아메드',
      codename: 'CODENAME: SPARK',
      role: 'The Instigator', roleKo: '일 벌이기 담당',
      specialty: '아무도 안 물어본 아이디어를 회의 시작 3분 만에 던지기',
      oneLiner: '일단 해보고, 설명은 나중에 할게요.',
      photo: 'assets/ahmed.png', accent: 'hot', theme: 'ink', entrance: 'slide',
      stats: [
        { label: '아이디어 발사 속도', value: 97 },
        { label: '회의록 작성 확률', value: 8 },
        { label: '근거 없는 자신감', value: 100, display: 'MAX' }
      ]
    },
    {
      id: 'dongkyu', number: '02', nameEn: 'DONGKYU', nameKo: '김동규',
      codename: 'CODENAME: BLUEPRINT',
      role: 'The Strategist', roleKo: '계획 담당',
      specialty: '혼돈을 깔끔한 표 한 장으로 바꾸는 능력',
      oneLiner: '그 변수, 이미 세 수 앞에서 계산해 뒀습니다.',
      photo: 'assets/dongkyu.png', accent: 'violet', theme: 'cream', entrance: 'zoom',
      stats: [
        { label: '계산 속도', value: 95 },
        { label: '표정 변화', value: 6 },
        { label: '플랜 B 보유량', value: 100, display: '∞' }
      ]
    },
    {
      id: 'gahyun', number: '03', nameEn: 'GAHYUN', nameKo: '이가현',
      codename: 'CODENAME: FINAL BOSS',
      role: 'The Finisher', roleKo: '마무리 담당',
      specialty: '"거의 다 됐어요"를 진짜 "다 됐어요"로 만드는 기술',
      oneLiner: '시작은 둘이 했고, 끝은 제가 냅니다.',
      photo: 'assets/gahyun.png', accent: 'acid', theme: 'ink', entrance: 'impact',
      stats: [
        { label: '완성도', value: 99 },
        { label: '디테일 집착', value: 98 },
        { label: '마감 앞 자비', value: 0, display: '0' }
      ]
    }
  ];

  const ACCENTS = {
    hot:    { c: 'var(--kc-hot)',    on: '#fff' },
    violet: { c: 'var(--kc-violet)', on: 'var(--kc-cream)' },
    acid:   { c: 'var(--kc-acid)',   on: 'var(--kc-ink)' }
  };

  // ===== MOTION POLICY =====
  // ?motion=off → 정적. '동작 줄이기' 설정 → 스크롤 연출은 유지, 흔들림 등 큰 움직임만 생략.
  const mq = (q) => window.matchMedia(q).matches;
  const REDUCE = /[?&]motion=off\b/.test(location.search);
  const GENTLE = mq('(prefers-reduced-motion: reduce)') && !/[?&]motion=full\b/.test(location.search);

  /* ---------- helpers ---------- */
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function loadImage(target, src, alt, className, onReady) {
    if (!src || !target) return;
    const img = new Image();
    img.className = className;
    img.alt = alt || '';
    img.decoding = 'async';
    img.onload = () => { target.appendChild(img); onReady && onReady(img); };
    img.src = src; // 파일이 없으면 onload 가 안 불리고 placeholder 유지
  }

  // 글자 단위 분리 (분리된 글자는 aria-hidden, 스크린리더용 원문은 따로 남김)
  function splitChars(el) {
    if (!el || el.dataset.split) return el ? $$('.char', el) : [];
    el.dataset.split = '1';
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    [...el.childNodes].forEach((child) => {
      if (child.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      [...child.textContent].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'char';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch === ' ' ? ' ' : ch;
        frag.appendChild(s);
      });
      el.replaceChild(frag, child);
    });
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    el.appendChild(sr);
    return $$('.char', el);
  }

  // 한 줄 대형 이름을 칼럼 폭에 맞춤 (CSS 크기보다 커지진 않음)
  function fitText(el, container) {
    if (!el || !container) return;
    el.style.fontSize = '';
    const avail = container.clientWidth;
    const w = el.scrollWidth;
    if (w > avail && avail > 0) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      el.style.fontSize = `${Math.floor(fs * (avail / w) * 0.985)}px`;
    }
  }

  /* ---------- templates ---------- */
  function silhouette(id) {
    const d = 'M200 64c54 0 94 42 94 100 0 46-23 84-55 101v20c90 19 152 73 161 155v60H0v-60c9-82 71-136 161-155v-20c-32-17-55-55-55-101 0-58 40-100 94-100Z';
    return `
      <svg class="sil" viewBox="0 0 400 500" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <defs>
          <pattern id="kc-ht-${id}" width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="4.5" cy="4.5" r="2" style="fill:var(--accent)"/>
          </pattern>
          <linearGradient id="kc-fade-${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#fff" stop-opacity="1"/>
          </linearGradient>
          <mask id="kc-m-${id}"><rect width="400" height="500" fill="url(#kc-fade-${id})"/></mask>
        </defs>
        <path class="sil__body" d="${d}"/>
        <path d="${d}" fill="url(#kc-ht-${id})" mask="url(#kc-m-${id})" opacity=".55"/>
      </svg>`;
  }
  function speedlines() {
    let lines = '';
    for (let i = 0; i < 11; i++) {
      const top = (6 + i * 8.4 + Math.random() * 4).toFixed(1);
      const w = (18 + Math.random() * 40).toFixed(0);
      const h = Math.random() > .7 ? 3 : 1;
      lines += `<i style="top:${top}%;width:${w}%;height:${h}px"></i>`;
    }
    return `<div class="speedlines" aria-hidden="true">${lines}</div>`;
  }
  const viewfinder = () => `
    <div class="viewfinder" aria-hidden="true">
      <i></i><i></i><i></i><i></i><b class="vf-cross"></b>
      <span class="vf-readout label">FOCUS <em>0.00</em> · CALCULATING</span>
    </div>`;
  const impactFx = () => '<div class="impact" aria-hidden="true"><span class="flash"></span><span class="burst"></span></div>';

  const headHTML = () => `
    <header class="kc-head">
      <p class="kc-label">${esc(HEAD.label)}</p>
      <h2 class="kc-title">${esc(HEAD.title)}</h2>
      <p class="kc-sub">${esc(HEAD.sub)}</p>
    </header>`;

  function memberHTML(m, i, total) {
    const a = ACCENTS[m.accent] || ACCENTS.hot;
    const flip = i % 2 === 1 ? ' member--flip' : '';
    const stats = (m.stats || []).map((s) => `
      <li>
        <span class="k">${esc(s.label)}</span>
        <span class="bar"><i style="--v:${Math.max(0, Math.min(100, s.value)) / 100}"></i></span>
        <b>${esc(s.display != null ? s.display : s.value)}</b>
      </li>`).join('');
    return `
    <article class="member member--${esc(m.id)} theme-${esc(m.theme || 'ink')}${flip}"
      id="kc-${esc(m.id)}" data-entrance="${esc(m.entrance)}"
      style="--accent:${a.c};--on-accent:${a.on}">
      <span class="member__num" aria-hidden="true">${esc(m.number)}</span>
      ${m.entrance === 'slide' ? speedlines() : ''}
      ${m.entrance === 'impact' ? impactFx() : ''}
      <div class="member__inner">
        <figure class="member__portrait">
          <div class="member__slab"></div>
          <div class="member__photo">
            <div class="member__ph">
              ${silhouette(m.id)}
              <span class="member__q">?</span>
              <span class="member__phlabel label">PHOTO PLACEHOLDER<code>${esc(m.photo)}</code></span>
            </div>
          </div>
          ${m.entrance === 'zoom' ? viewfinder() : ''}
          <figcaption class="member__tag label"><span>${esc(m.codename)}</span><span>FIG.${esc(m.number)}</span></figcaption>
        </figure>
        <div class="member__info">
          <p class="member__kicker label"><b>${esc(m.number)}</b><span>${esc(m.nameEn)}</span><span class="of">/ ${String(total).padStart(2, '0')}</span></p>
          <h3 class="member__name">
            <span class="en">${esc(m.nameEn)}</span>
            <span class="ko">${esc(m.nameKo)}</span>
          </h3>
          <dl class="member__spec">
            <div class="row"><dt>NAME</dt><dd>${esc(m.nameKo)} <span class="dim">· ${esc(m.nameEn)}</span></dd></div>
            <div class="row"><dt>ROLE</dt><dd><strong>${esc(m.role)}</strong> <span class="dim">${esc(m.roleKo)}</span></dd></div>
            <div class="row"><dt>SPECIALTY</dt><dd>${esc(m.specialty)}</dd></div>
          </dl>
          <blockquote class="member__quote">
            <span class="label">ONE-LINER</span>
            <p><span class="qm">“</span>${esc(m.oneLiner)}<span class="qm">”</span></p>
          </blockquote>
          <ul class="member__stats">${stats}</ul>
        </div>
      </div>
      ${m.entrance === 'impact' ? '<div class="member__stamp" aria-hidden="true">LAST BUT<br>NOT LEAST</div>' : ''}
    </article>`;
  }

  /* ---------- 등장 연출 ---------- */
  // 공통 정보 리빌 (kicker → 한글 이름 태그 → 스펙 → 한 줄 → 스탯)
  function infoIn(m, rowsFx) {
    const rows = $$('.member__spec .row', m);
    const tl = gsap.timeline();
    tl.from($('.member__kicker', m), { autoAlpha: 0, y: 12, duration: .5, ease: 'power3.out' })
      .from($('.member__name .ko', m), { scale: 0, rotate: -24, duration: .6, ease: 'back.out(2.6)' }, .25);
    if (rowsFx === 'clip') {
      tl.fromTo(rows, { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', stagger: .14, duration: .7, ease: 'power2.inOut' }, .2);
    } else {
      tl.from(rows, { autoAlpha: 0, y: 16, stagger: .07, duration: .55, ease: 'power3.out' }, .2);
    }
    tl.from($('.member__quote', m), { autoAlpha: 0, y: 20, duration: .6, ease: 'power3.out' }, .45)
      .from($$('.member__stats .bar i', m), { scaleX: 0, stagger: .09, duration: 1, ease: 'expo.out' }, .55);
    return tl;
  }

  // 01 · slide — 화면 밖에서 빠르게 슬라이드 (속도선 + 모션블러)
  function enterSlide(m, desktop) {
    const lines = $$('.speedlines i', m);
    const chars = splitChars($('.member__name .en', m));
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 62%', once: true } });
    if (desktop) {
      tl.fromTo(lines, { scaleX: 0, autoAlpha: .9, xPercent: 0 },
        { scaleX: 1, duration: .3, stagger: { each: .02, from: 'random' }, ease: 'power2.out' }, 0)
        .to(lines, { xPercent: -260, autoAlpha: 0, duration: .5, stagger: { each: .02, from: 'random' }, ease: 'power2.in' }, .25);
    }
    tl.from($('.member__portrait', m), { xPercent: desktop ? 130 : 60, skewX: desktop ? -14 : 0, duration: .9, ease: 'expo.out' }, .05)
      .fromTo($('.member__photo', m), { filter: `blur(${desktop ? 12 : 4}px)` }, { filter: 'blur(0px)', duration: .6 }, .1)
      .from($('.member__slab', m), { scaleY: 0, transformOrigin: '50% 100%', duration: .7, ease: 'expo.out' }, .3)
      .from(chars, { xPercent: 80, autoAlpha: 0, stagger: .035, duration: .6, ease: 'expo.out' }, .3)
      .add(infoIn(m), .4);
  }

  // 02 · zoom — 카메라 줌 인 + 초점 맞추기 (스크롤과 함께 천천히)
  function enterZoom(m, desktop) {
    const readout = $('.vf-readout em', m);
    const chars = splitChars($('.member__name .en', m));
    gsap.timeline({
      scrollTrigger: {
        trigger: m, start: 'top 90%', end: desktop ? 'center 55%' : 'top 25%', scrub: 1,
        onUpdate: (self) => {
          if (readout) readout.textContent = self.progress >= .99 ? 'LOCKED' : self.progress.toFixed(2);
        }
      }
    })
      .fromTo($('.member__portrait', m), { scale: 1.25 }, { scale: 1, ease: 'power2.out' }, 0)
      .fromTo([$('.member__slab', m), $('.member__photo', m)],
        { clipPath: 'inset(34% 28% 34% 28%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut' }, 0)
      .fromTo($('.member__photo', m), { filter: 'blur(14px)' }, { filter: 'blur(0px)', ease: 'power2.out' }, 0)
      .fromTo($('.viewfinder', m), { scale: 1.3, autoAlpha: .2 }, { scale: 1, autoAlpha: 1, ease: 'power2.out' }, 0);

    gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 40%', once: true } })
      .from(chars, { autoAlpha: 0, duration: .01, stagger: .07, ease: 'none' }) // 계산하듯 한 글자씩
      .add(infoIn(m, 'clip'), .1);
  }

  // 03 · impact — 마지막 멤버: 플래시 → 낙하 → 충격파 → (흔들림) → 도장
  function enterImpact(m, desktop) {
    const inner = $('.member__inner', m);
    const chars = splitChars($('.member__name .en', m));
    const tl = gsap.timeline({ scrollTrigger: { trigger: m, start: 'top 55%', once: true } });
    tl.fromTo($('.member__portrait', m),
      { autoAlpha: 0, scale: desktop ? 1.6 : 1.25, y: desktop ? -90 : -30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: .42, ease: 'expo.in' }, 0)
      .fromTo($('.impact .flash', m), { autoAlpha: 0 }, { autoAlpha: .85, duration: .06, ease: 'none' }, .4)
      .to($('.impact .flash', m), { autoAlpha: 0, duration: .5, ease: 'power2.out' }, .46)
      .fromTo($('.impact .burst', m), { scale: .2, autoAlpha: 1 }, { scale: 1.3, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, .42);
    if (desktop && !GENTLE) { // 화면 흔들림은 '동작 줄이기'면 생략
      tl.to(inner, { keyframes: { x: [-16, 13, -9, 6, -3, 0], y: [9, -11, 6, -4, 2, 0] }, duration: .45, ease: 'none' }, .42);
    }
    tl.from(chars, { yPercent: -140, autoAlpha: 0, stagger: .05, duration: .55, ease: 'back.out(3)' }, .55)
      .fromTo($('.member__stamp', m), { scale: 3, autoAlpha: 0, rotate: -32 },
        { scale: 1, autoAlpha: 1, rotate: -9, duration: .38, ease: 'expo.in' }, 1)
      .add(infoIn(m), .75);
  }

  function animate(root, desktop) {
    gsap.from($$('.kc-head > *', root), {
      autoAlpha: 0, y: 24, stagger: .08, duration: .8, ease: 'expo.out',
      scrollTrigger: { trigger: $('.kc-head', root), start: 'top 82%', once: true }
    });
    $$('.member', root).forEach((m) => {
      const base = desktop ? -50 : 0;
      // 거대한 번호 — 느린 패럴랙스
      gsap.fromTo($('.member__num', m), { yPercent: base, y: desktop ? 90 : 30 }, {
        yPercent: base, y: desktop ? -90 : -30, ease: 'none',
        scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true }
      });
      // 다음 장면으로 넘어갈 때 살짝 물러나는 깊이감
      if (desktop && !GENTLE) {
        gsap.fromTo($('.member__inner', m), { scale: 1, autoAlpha: 1 }, {
          scale: .94, autoAlpha: .3, ease: 'none',
          scrollTrigger: { trigger: m, start: 'bottom 70%', end: 'bottom top', scrub: true }
        });
      }
      const fx = { slide: enterSlide, zoom: enterZoom, impact: enterImpact }[m.dataset.entrance] || enterSlide;
      fx(m, desktop);
    });
  }

  /* ---------- 커스텀 엘리먼트 (내용은 Shadow DOM 안에) ---------- */
  // crew.css 는 이 스크립트와 같은 폴더 기준으로 찾음
  const CSS_URL = new URL('crew.css', (document.currentScript && document.currentScript.src) || location.href).href;

  class KkdCrew extends HTMLElement {
    connectedCallback() {
      if (this._mm) return;
      let root = this.shadowRoot;
      if (!root) {
        root = this.attachShadow({ mode: 'open' });
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_URL;
        this._cssReady = new Promise((res) => {
          link.addEventListener('load', res, { once: true });
          link.addEventListener('error', res, { once: true });
        });
        root.appendChild(link);
        const body = document.createElement('div');
        body.className = 'kc-root';
        body.innerHTML = headHTML() + MEMBERS.map((m, i) => memberHTML(m, i, MEMBERS.length)).join('');
        root.appendChild(body);
        MEMBERS.forEach((m) => {
          const fig = $(`#kc-${m.id} .member__portrait`, root);
          loadImage($('.member__photo', fig), m.photo, `${m.nameKo} (${m.nameEn})`, 'member__img',
            () => fig.classList.add('has-photo'));
        });
      }

      // 스타일·폰트가 준비된 뒤 이름 폭 맞춤 → 연출 등록 (최대 2.5초 대기)
      const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
      const ready = Promise.all([this._cssReady || Promise.resolve(), fonts]);
      Promise.race([ready, new Promise((r) => setTimeout(r, 2500))]).then(() => {
        if (!this.isConnected || this._mm) return;
        this.fitNames();
        if (!window.gsap || !window.ScrollTrigger || REDUCE) return;
        gsap.registerPlugin(ScrollTrigger);
        this._mm = gsap.matchMedia();
        this._mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' },
          (ctx) => { animate(root, ctx.conditions.desktop); });
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });

      let lastW = innerWidth;
      this._onResize = () => {
        clearTimeout(this._rt);
        this._rt = setTimeout(() => {
          if (innerWidth === lastW) return; // 모바일 주소창 높이 변화는 무시
          lastW = innerWidth;
          this.fitNames();
          window.ScrollTrigger && ScrollTrigger.refresh();
        }, 200);
      };
      addEventListener('resize', this._onResize);
      // 페이지의 나머지(이미지·폰트)가 다 들어오면 위치 재계산
      addEventListener('load', () => window.ScrollTrigger && ScrollTrigger.refresh(), { once: true });
    }

    disconnectedCallback() {
      removeEventListener('resize', this._onResize);
      if (this._mm) { this._mm.revert(); this._mm = null; }
    }

    fitNames() {
      if (!this.shadowRoot) return;
      $$('.member__name .en', this.shadowRoot).forEach((el) => {
        if (window.gsap && !REDUCE) splitChars(el);
        fitText(el, el.closest('.member__info'));
      });
    }
  }

  if (!customElements.get('kkd-crew')) customElements.define('kkd-crew', KkdCrew);
})();
