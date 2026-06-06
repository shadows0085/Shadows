
  // LOADER
  const loaderBar = document.getElementById('loaderBar');
  const loader = document.getElementById('loader');
  let progress = 0;
  const loaderInterval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderInterval);
      setTimeout(() => {
        loader.classList.add('hidden');
        initAnimations();
      }, 300);
    }
    loaderBar.style.width = progress + '%';
  }, 80);

  // CURSOR
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';

    // Mouse glow in hero
    const glow = document.getElementById('mouseGlow');
    if (glow) {
      glow.style.left = mouseX + 'px';
      glow.style.top = mouseY + 'px';
    }
  });

  function animateCursorRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();

  document.querySelectorAll('a, button, .project-card, .filter-btn, .social-link, .skill-card, .stat-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });

  // SCROLL PROGRESS
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.body.scrollHeight - window.innerHeight;
    document.getElementById('scrollProgress').style.width = (scrolled / total * 100) + '%';

    // NAV
    const nav = document.getElementById('nav');
    nav.classList.toggle('scrolled', scrolled > 60);
  });

  // FILM STRIPS
  const filmStrips = document.getElementById('filmStrips');
  if (filmStrips) {
    for (let i = 0; i < 12; i++) {
      const strip = document.createElement('div');
      strip.className = 'preview-film-strip';
      strip.style.left = (i * 9 + Math.random() * 5) + '%';
      strip.style.height = (40 + Math.random() * 60) + '%';
      strip.style.animationDuration = (3 + Math.random() * 4) + 's';
      strip.style.animationDelay = (-Math.random() * 4) + 's';
      strip.style.opacity = 0.3 + Math.random() * 0.7;
      filmStrips.appendChild(strip);
    }
  }

  // FILTER BUTTONS
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.textContent.trim().toLowerCase();
      const cards = document.querySelectorAll('.project-card');

      cards.forEach(card => {
        const cat = card.dataset.category || '';
        const match = filter === 'all' || cat === filter;

        if (match) {
          // First make sure it's visible in DOM
          card.classList.remove('filter-out');
          // Force reflow so transition kicks in
          card.offsetHeight;
          // Then fade in
          requestAnimationFrame(() => {
            card.classList.remove('filter-hide');
          });
        } else {
          // Fade out first
          card.classList.add('filter-hide');
          // Then remove from layout after transition
          card.addEventListener('transitionend', function hideCard() {
            if (card.classList.contains('filter-hide')) {
              card.classList.add('filter-out');
            }
            card.removeEventListener('transitionend', hideCard);
          });
        }
      });
    });
  });

  // MODAL handled in index.html
  // REVEAL ANIMATIONS
  function initAnimations() {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Skill bars
          const bar = entry.target.querySelector('.skill-bar');
          if (bar) {
            setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 400);
          }
          // Count-up
          const counters = entry.target.querySelectorAll('.count-up');
          counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              counter.textContent = Math.floor(current);
            }, 40);
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // Also handle skill bars that are already in revealed cards
    const allBars = document.querySelectorAll('.skill-bar');
    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 300);
          barObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });
    allBars.forEach(bar => barObserver.observe(bar));
  }

  // VIDEO TOGGLE
  function toggleVideo() {
    const video = document.getElementById('heroVideo');
    const icon = document.getElementById('playIcon');
    if (video.paused) {
      video.play();
      icon.style.cssText = 'width:10px;height:14px;background:var(--gold);clip-path:polygon(0 0,40% 0,40% 100%,0 100%);margin:0 1px;display:inline-block;box-shadow:5px 0 0 var(--gold)';
    } else {
      video.pause();
      icon.style.cssText = '';
    }
  }
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    const orbs = hero.querySelectorAll('.hero-orb');
    const scrollY = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.1 + i * 0.05;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });


/* =============================================
   VIDEO.JSON DRIVEN PORTFOLIO LOADER
   Reads data/videos.json and auto-populates:
     - Portfolio grid cards
     - Hero video/iframe
   NO UI changes — purely data-driven.
   ============================================= */

(function () {
  'use strict';

  /* ---- Thumb-glow style builder ---- */
  function buildGlowStyle(g) {
    let s = `width:${g.w}px;height:${g.h}px;background:radial-gradient(circle,${g.color},transparent);`;
    if (g.top    !== undefined) s += `top:${g.top};`;
    if (g.bottom !== undefined) s += `bottom:${g.bottom};`;
    if (g.left   !== undefined) s += `left:${g.left};`;
    if (g.right  !== undefined) s += `right:${g.right};`;
    if (g.delay  !== undefined) s += `animation-delay:${g.delay};`;
    return s;
  }

  /* ---- Build a single card HTML ---- */
  function buildCard(v) {
    const glows = (v.thumb_glow || []).map(g =>
      `<div class="thumb-glow" style="${buildGlowStyle(g)}"></div>`
    ).join('');

    const thumbStyle = v.thumb
      ? ` style="background-image:url('${v.thumb}');background-size:cover;background-position:center;"`
      : '';
    const animOpacity = v.thumb ? ' style="opacity:0"' : '';

    /* Video source: local mp4 or external URL */
    const hasLocalVideo = v.file && !v.file.startsWith('http');
    const hasRemoteVideo = v.file && v.file.startsWith('http');

    let videoEl = '';
    if (hasLocalVideo) {
      videoEl = `
        <video class="card-video-bg" src="${v.file}" muted loop playsinline
               style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.4s;pointer-events:none;"></video>`;
    } else if (hasRemoteVideo) {
      /* YouTube or Drive iframe shown on hover via JS */
    }

    const modalTitle = v.title.replace(/'/g, "\\'");
    const modalMeta  = (v.cat_label || '').replace(/'/g, "\\'");

    return `
    <div class="project-card ${v.size || 'card-md'} reveal"
         data-category="${v.category}"
         data-video="${v.file || ''}"
         onclick="openModal('${modalTitle}','${modalMeta}','${v.file || ''}')">
      <div class="card-video-wrap">
        <div class="card-thumb ${v.thumb_color || 'thumb-1'}"${thumbStyle}>
          <div class="thumb-anim"${animOpacity}>${glows}</div>
        </div>
        ${videoEl}
        <div class="card-overlay"></div>
        <div class="card-play"><div class="card-play-icon"></div></div>
        <div class="card-info">
          <div class="card-cat">${v.cat_label || ''}</div>
          <div class="card-title">${v.title}</div>
          <div class="card-meta">${v.meta || ''}</div>
        </div>
      </div>
    </div>`;
  }

  /* ---- Render portfolio grid from JSON data ---- */
  function renderPortfolio(data) {
    const grid = document.querySelector('.portfolio-grid');
    if (!grid || !data.portfolio) return;

    /* Replace existing cards with JSON-driven ones */
    grid.innerHTML = data.portfolio.map(buildCard).join('');

    /* Re-bind filter buttons (they look for .project-card elements) */
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const filter = this.textContent.trim().toLowerCase();
        document.querySelectorAll('.project-card').forEach(card => {
          const cat = card.dataset.category || '';
          const match = filter === 'all' || cat === filter;
          if (match) {
            card.classList.remove('filter-out');
            card.offsetHeight;
            requestAnimationFrame(() => card.classList.remove('filter-hide'));
          } else {
            card.classList.add('filter-hide');
            card.addEventListener('transitionend', function hideCard() {
              if (card.classList.contains('filter-hide')) card.classList.add('filter-out');
              card.removeEventListener('transitionend', hideCard);
            });
          }
        });
      });
    });

    /* Hover: play local video on card if available */
    document.querySelectorAll('.project-card[data-video]').forEach(card => {
      const vid = card.querySelector('video.card-video-bg');
      if (!vid) return;
      card.addEventListener('mouseenter', () => { vid.play(); vid.style.opacity = '1'; });
      card.addEventListener('mouseleave', () => { vid.pause(); vid.style.opacity = '0'; });
    });

    /* Re-run reveal observer on new cards */
    if (window._shadowRevealObserver) {
      document.querySelectorAll('.reveal:not(.visible)').forEach(el =>
        window._shadowRevealObserver.observe(el)
      );
    }

    /* Re-bind cursor hover */
    document.querySelectorAll('.project-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.getElementById('cursor')?.classList.add('hover');
        document.getElementById('cursorRing')?.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        document.getElementById('cursor')?.classList.remove('hover');
        document.getElementById('cursorRing')?.classList.remove('hover');
      });
    });
  }

  /* ---- Update hero section from JSON ---- */
  function renderHero(hero) {
    if (!hero) return;
    const inner = document.querySelector('.hero-video-preview-inner');
    if (!inner) return;

    /* Update label and badge if provided */
    const labelEl = inner.querySelector('.preview-label');
    const badgeEl = inner.querySelector('.preview-badge');
    if (labelEl && hero.label) labelEl.textContent = hero.label;
    if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;

    if (hero.type === 'iframe' && hero.src) {
      let iframe = inner.querySelector('iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.allow = 'autoplay';
        iframe.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border:none;';
        inner.insertBefore(iframe, inner.firstChild);
      }
      if (iframe.src !== hero.src) iframe.src = hero.src;

    } else if (hero.type === 'video' && hero.src) {
      /* Replace iframe with <video> for local/direct mp4 */
      const existing = inner.querySelector('iframe');
      if (existing) existing.remove();
      let video = inner.querySelector('video.hero-bg-video');
      if (!video) {
        video = document.createElement('video');
        video.className = 'hero-bg-video';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border:none;';
        inner.insertBefore(video, inner.firstChild);
      }
      if (video.src !== hero.src) video.src = hero.src;
    }
  }

  /* ---- Patch initAnimations to expose the observer ---- */
  const _origInit = window.initAnimations;
  window.initAnimations = function () {
    if (_origInit) _origInit();
    /* Expose reveal observer for re-use after dynamic render */
    const revealEls = document.querySelectorAll('.reveal');
    window._shadowRevealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const bar = entry.target.querySelector('.skill-bar');
          if (bar) setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 400);
          entry.target.querySelectorAll('.count-up').forEach(counter => {
            const target = parseInt(counter.dataset.target);
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) { current = target; clearInterval(timer); }
              counter.textContent = Math.floor(current);
            }, 40);
          });
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => window._shadowRevealObserver.observe(el));
  };

  /* ---- Main: fetch data/videos.json and render ---- */
  function loadAndRender() {
    fetch('data/videos.json')
      .then(r => {
        if (!r.ok) throw new Error('videos.json not found (' + r.status + ')');
        return r.json();
      })
      .then(data => {
        renderHero(data.hero);
        renderPortfolio(data);
      })
      .catch(err => {
        /* Silent fallback — original hard-coded HTML stays intact */
        console.info('[Shadow] videos.json load skipped:', err.message);
      });
  }

  /* Run after DOM + existing scripts are ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRender);
  } else {
    loadAndRender();
  }

})();
