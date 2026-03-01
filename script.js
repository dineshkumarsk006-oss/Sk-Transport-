/**
 * SK Transport — Core JavaScript v5
 * Fixed: animations, mobile drawer, active nav, ripple, counters
 */

'use strict';

// ─── Boot ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    SKT_UI.init();
    SKT_Products.init();
    SKT_Forms.init();
    SKT_Reviews.init();
    SKT_Tilt.init();
    SKT_Counter.init();
    SKT_ScrollFX.init();
    SKT_Ripple.init();
    SKT_Bento.init();
});

// ─── Magic Bento Spotlight ────────────────────────────
const SKT_Bento = {
    init() {
        const cards = document.querySelectorAll('[data-bento]');
        if (!cards.length) return;
        const isMobile = window.matchMedia('(hover: none)').matches;
        if (isMobile) return;

        cards.forEach(card => {
            let rafId = null;
            card.addEventListener('mousemove', e => {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
                    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
                    card.style.setProperty('--mx', `${x}%`);
                    card.style.setProperty('--my', `${y}%`);
                    const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
                    const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
                    card.style.transform = `translateY(-4px) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                });
            });
            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transform = '';
            });
        });
    }
};


// ─── UI & Navigation ─────────────────────────────────
const SKT_UI = {
    init() {
        this.setActiveNavLink();
        this.handleHeaderScroll();
        this.handleMobileMenu();
        this.initScrollAnimations();
        this.initFaq();
        this.initFilterButtons();
        this.initStagger();
    },

    /* ── Active link detection by current URL ── */
    setActiveNavLink() {
        const current = location.pathname.split('/').pop() || 'index.html';
        // Desktop nav
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href') || '';
            a.classList.toggle('active', href === current || (current === '' && href === 'index.html'));
        });
        // Mobile drawer nav
        document.querySelectorAll('.drawer-links a').forEach(a => {
            const href = a.getAttribute('href') || '';
            a.classList.toggle('active', href === current || (current === '' && href === 'index.html'));
        });
    },

    /* ── Header scroll effect ── */
    handleHeaderScroll() {
        const header = document.getElementById('main-header');
        if (!header) return;
        const update = () => header.classList.toggle('scrolled', window.scrollY > 50);
        window.addEventListener('scroll', update, { passive: true });
        update();
    },

    /* ── Mobile Drawer (Syncfusion style) ── */
    handleMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const drawer = document.getElementById('mobileDrawer');
        const overlay = document.getElementById('drawerOverlay');
        const closeBtn = document.getElementById('drawerClose');
        if (!btn || !drawer || !overlay) return;

        // Ensure overlay is hidden at start
        overlay.style.display = 'none';

        const open = () => {
            overlay.style.display = 'block';
            // Force reflow so transition fires
            overlay.getBoundingClientRect();
            overlay.classList.add('open');
            drawer.classList.add('open');
            btn.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
            drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            overlay.classList.remove('open');
            drawer.classList.remove('open');
            btn.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
            drawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (!overlay.classList.contains('open')) overlay.style.display = 'none';
            }, 420);
        };

        btn.addEventListener('click', e => { e.stopPropagation(); drawer.classList.contains('open') ? close() : open(); });
        overlay.addEventListener('click', close);
        if (closeBtn) closeBtn.addEventListener('click', close);
        drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    },

    /* ── Unified scroll animations (adds .in-view) ── */
    initScrollAnimations() {
        const selectors = '.reveal, .slide-left, .slide-right, .fade-up';
        const elems = document.querySelectorAll(selectors);
        if (!elems.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add both .in-view and .active for full compatibility
                    entry.target.classList.add('in-view', 'active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

        elems.forEach(el => observer.observe(el));
    },

    /* ── JS Stagger animations ── */
    initStagger() {
        document.querySelectorAll('.stagger').forEach(container => {
            const children = Array.from(container.children);
            // Set initial hidden state
            children.forEach((child, i) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(20px)';
                child.style.transition = `opacity 0.55s cubic-bezier(.22,1,.36,1) ${i * 0.07}s, transform 0.55s cubic-bezier(.22,1,.36,1) ${i * 0.07}s`;
            });

            const io = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        children.forEach(child => {
                            child.style.opacity = '1';
                            child.style.transform = 'none';
                        });
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

            io.observe(container);
        });
    },

    initFaq() {
        document.querySelectorAll('.faq-question').forEach(q => {
            q.addEventListener('click', () => {
                const item = q.closest('.faq-item');
                if (!item) return;
                const isOpen = item.classList.contains('open');
                const list = item.closest('.faq-list');
                if (list) list.querySelectorAll('.faq-item.open').forEach(o => {
                    if (o !== item) {
                        o.classList.remove('open');
                        o.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
                    }
                });
                item.classList.toggle('open', !isOpen);
                q.setAttribute('aria-expanded', String(!isOpen));
            });
            q.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
            });
        });
    },

    initFilterButtons() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        if (!filterBtns.length) return;
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-ghost'); });
                btn.classList.add('btn-primary');
                btn.classList.remove('btn-ghost');
            });
        });
    }
};


// ─── Products ─────────────────────────────────────────
const SKT_Products = {
    catalog: {
        'm-sand': { title: 'M Sand', cat: 'Sand', desc: 'IS 383 Zone II manufactured sand for structural concrete, columns and slabs. Consistent grading, guaranteed every load.', grade: 'IS 383 Zone II', minOrder: '1 Load', density: '1.6 g/cm³', usage: 'Structural Concrete' },
        'p-sand': { title: 'P Sand', cat: 'Sand', desc: 'Ultra-fine plastering sand, triple washed and screened for premium wall finishes, stucco and interior rendering.', grade: 'Ultra Fine', minOrder: '1 Load', density: '1.5 g/cm³', usage: 'Plastering / Finishing' },
        'river-sand': { title: 'River Sand', cat: 'Sand', desc: 'Natural river sand, triple-screened for purity. Essential for heritage construction and critical structural elements.', grade: 'Natural', minOrder: '1 Load', density: '1.7 g/cm³', usage: 'Premium Foundations' },
        '20mm': { title: '20 MM Aggregate', cat: 'Aggregates', desc: 'Standard 20mm crushed blue metal for slabs, beams and residential columns. The most common grade for RCC work.', grade: 'Crushed Blue Metal', minOrder: '10 Tons', density: '1.6 g/cm³', usage: 'RCC Structures' },
        '40mm': { title: '40 MM Aggregate', cat: 'Aggregates', desc: 'Coarse 40mm for heavy-duty sub-bases, drainage layers and railway ballast. Heavy duty crush grade.', grade: 'Heavy Duty', minOrder: '10 Tons', density: '1.5 g/cm³', usage: 'Road Base / Ballast' },
        '12mm': { title: '12 MM Aggregate', cat: 'Aggregates', desc: 'Fine 12mm for precast items, thin slabs and intricate concrete pours requiring precise grading.', grade: 'Standard', minOrder: '5 Tons', density: '1.55 g/cm³', usage: 'Roofing / Precast' },
        '6mm': { title: '6 MM Grit', cat: 'Aggregates', desc: 'Micro grit for hollow block manufacturing, textured concrete and paving joints.', grade: 'Micro Grit', minOrder: '5 Tons', density: '1.45 g/cm³', usage: 'Block Making' },
        'metal': { title: 'Blue Metal', cat: 'Aggregates', desc: 'High-compressive strength blue metal stone for heavy industrial floors, slabs and road surfacing.', grade: 'Blue Metal', minOrder: '10 Tons', density: '1.65 g/cm³', usage: 'Heavy Duty Floors' },
        'bolder': { title: 'Bolder', cat: 'Stones', desc: 'Large rock boulders for riverbank protection, check dams and heavy foundation work.', grade: 'Natural Stone', minOrder: '1 Load', density: 'N/A', usage: 'Retaining Walls' },
        'solling': { title: 'Solling', cat: 'Stones', desc: 'Flat heavy stones for road base sub-layers and stable house foundation paving.', grade: 'Heavy Stone', minOrder: '1 Load', density: 'N/A', usage: 'Sub-base Paving' },
        'sizestone': { title: 'Sizestone', cat: 'Stones', desc: 'Precision-dressed granite stones for high-end masonry and artistic load-bearing walls.', grade: 'Dressed Granite', minOrder: '5 Tons', density: 'N/A', usage: 'Masonry / Artistic' },
        'gravel': { title: 'Gravel', cat: 'Earth', desc: 'Natural round gravel for walkways, drainage filters and utility area filling. Screened grade.', grade: 'Screened', minOrder: '5 Tons', density: '1.4 g/cm³', usage: 'Drainage / Landscaping' },
        'kuranai': { title: 'Kuranai', cat: 'Earth', desc: 'Specialised local earth for cost-effective site leveling and low-traffic fill areas.', grade: 'Local Fill', minOrder: '1 Load', density: 'Variable', usage: 'Site Leveling' },
        'redsoil': { title: 'Red Soil', cat: 'Earth', desc: 'Premium red fertile soil for landscaping, site restoration and park development.', grade: 'Landscape Grade', minOrder: '1 Load', density: '1.45 g/cm³', usage: 'Gardening / Parks' },
        'bricks': { title: 'Wirecut Bricks', cat: 'Masonry', desc: 'A-Class wirecut red bricks with high compressive strength for load-bearing and partition walls.', grade: 'A-Class', minOrder: '2,000 Pcs', density: 'N/A', usage: 'All Wall Types' },
        'flyash': { title: 'Flyash', cat: 'Masonry', desc: 'Refined flyash for brick manufacturing, cement replacement and structural concrete enhancement.', grade: 'Refined', minOrder: '1 Load', density: 'N/A', usage: 'Cement Mix / Bricks' },
    },

    init() {
        this.populateDetail();
        this.initFilter();
        this.initQty();
    },

    populateDetail() {
        const id = new URLSearchParams(window.location.search).get('id');
        if (!id || !this.catalog[id]) return;
        const p = this.catalog[id];
        document.title = `${p.title} | SK Transport`;
        const setText = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
        setText('productTitle', p.title);
        setText('breadcrumbName', p.title);
        setText('productCategory', p.cat);
        setText('productDescription', p.desc);
        setText('mainImageLabel', p.title.toUpperCase());
        setText('specGrade', p.grade);
        setText('specMinOrder', p.minOrder);
        setText('specMinOrderImg', p.minOrder);
        setText('specDensity', p.density);
        setText('specUsage', p.usage);
        const badgeEl = document.getElementById('productCategoryBadge');
        if (badgeEl) badgeEl.textContent = p.cat;
    },

    initFilter() {
        const search = document.getElementById('productSearch');
        const grid = document.getElementById('productGrid');
        const noRes = document.getElementById('noResults');
        if (!grid) return;

        const cards = Array.from(grid.querySelectorAll('.product-card'));

        const applyFilter = () => {
            const term = (search?.value || '').toLowerCase().trim();
            const activeBtn = document.querySelector('.filter-btn.btn-primary');
            const cat = activeBtn?.dataset.filter || 'all';
            let visible = 0;
            cards.forEach(card => {
                const titleMatch = (card.querySelector('h3')?.textContent.toLowerCase() || '').includes(term);
                const descMatch = (card.querySelector('p')?.textContent.toLowerCase() || '').includes(term);
                const catMatch = cat === 'all' || (card.dataset.category || '').toLowerCase() === cat.toLowerCase();
                const show = (term === '' || titleMatch || descMatch) && catMatch;
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
        };

        if (search) search.addEventListener('input', applyFilter);
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => setTimeout(applyFilter, 10));
        });
    },

    initQty() {
        const minus = document.getElementById('minusBtn');
        const plus = document.getElementById('plusBtn');
        const input = document.getElementById('qtyInput');
        if (!minus || !plus || !input) return;
        minus.addEventListener('click', () => { const v = parseInt(input.value); if (v > 1) input.value = v - 1; });
        plus.addEventListener('click', () => { input.value = parseInt(input.value) + 1; });
        input.addEventListener('change', () => { if (parseInt(input.value) < 1 || isNaN(parseInt(input.value))) input.value = 1; });
    }
};


// ─── Reviews Slider ───────────────────────────────────
const SKT_Reviews = {
    current: 0,
    total: 0,
    track: null,
    dots: null,
    autoTimer: null,
    DELAY: 5000,

    init() {
        const track = document.getElementById('reviewsTrack');
        const dotsEl = document.getElementById('reviewDots');
        if (!track) return;

        this.track = track;
        this.dots = dotsEl;
        this.total = track.querySelectorAll('.review-slide').length;
        if (this.total < 2) return;

        if (dotsEl) {
            dotsEl.innerHTML = '';
            for (let i = 0; i < this.total; i++) {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Review ${i + 1}`);
                dot.setAttribute('aria-selected', String(i === 0));
                dot.addEventListener('click', () => { this.goTo(i); this.resetAuto(); });
                dotsEl.appendChild(dot);
            }
        }

        document.getElementById('reviewPrev')?.addEventListener('click', () => { this.prev(); this.resetAuto(); });
        document.getElementById('reviewNext')?.addEventListener('click', () => { this.next(); this.resetAuto(); });

        let startX = 0;
        const wrapper = document.getElementById('reviewsWrapper') || track.parentElement;
        if (wrapper) {
            wrapper.addEventListener('touchstart', e => { startX = e.changedTouches[0].clientX; }, { passive: true });
            wrapper.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 48) { dx < 0 ? this.next() : this.prev(); this.resetAuto(); }
            });
            wrapper.addEventListener('mouseenter', () => this.stopAuto());
            wrapper.addEventListener('mouseleave', () => this.startAuto());
        }

        this.startAuto();
    },

    goTo(n) {
        this.current = ((n % this.total) + this.total) % this.total;
        if (this.track) this.track.style.transform = `translateX(-${this.current * 100}%)`;
        this.dots?.querySelectorAll('.dot').forEach((d, i) => {
            d.classList.toggle('active', i === this.current);
            d.setAttribute('aria-selected', String(i === this.current));
        });
    },

    next() { this.goTo(this.current + 1); },
    prev() { this.goTo(this.current - 1); },
    startAuto() { this.stopAuto(); this.autoTimer = setInterval(() => this.next(), this.DELAY); },
    stopAuto() { if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null; } },
    resetAuto() { this.stopAuto(); this.startAuto(); }
};


// ─── Counting Number Animations ───────────────────────
const SKT_Counter = {
    init() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const easeOut = t => 1 - Math.pow(1 - t, 3);

        const animateCount = (el, target, suffix, duration = 1800) => {
            const start = performance.now();
            const update = now => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.round(easeOut(progress) * target);
                el.textContent = current.toLocaleString() + suffix;
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        };

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const raw = el.dataset.count || '0';
                const suffix = el.dataset.suffix || (raw.includes('+') ? '+' : raw.includes('%') ? '%' : '');
                const target = parseInt(raw.replace(/\D/g, ''), 10) || 0;
                animateCount(el, target, suffix);
                io.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(el => io.observe(el));
    }
};


// ─── Scroll FX (parallax + scroll progress bar) ───────
const SKT_ScrollFX = {
    init() {
        const heroVisual = document.getElementById('heroVisual');
        const heroBg = document.querySelector('.hero-grid');
        const glows = document.querySelectorAll('.hero-glow-1, .hero-glow-2');
        const progressBar = document.getElementById('scrollProgress');

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const sy = window.scrollY;
                const wh = window.innerHeight;

                // Hero parallax
                if (heroVisual && sy < wh) heroVisual.style.transform = `translateY(${sy * 0.12}px)`;
                if (heroBg && sy < wh) heroBg.style.transform = `translateY(${sy * 0.05}px)`;
                glows.forEach((g, i) => {
                    if (sy < wh) g.style.transform = `translateY(${sy * (i === 0 ? 0.14 : -0.06)}px)`;
                });

                // Scroll progress bar
                if (progressBar) {
                    const scrolled = (sy / (document.body.scrollHeight - wh)) * 100;
                    progressBar.style.width = `${Math.min(scrolled, 100)}%`;
                }

                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // run once on load
    }
};


// ─── Button Ripple Effect ─────────────────────────────
const SKT_Ripple = {
    init() {
        document.querySelectorAll('.btn, .btn-call, .filter-btn, .slider-btn').forEach(btn => {
            btn.style.position = 'relative';
            btn.style.overflow = 'hidden';
            btn.addEventListener('click', e => {
                const existing = btn.querySelector('.ripple-wave');
                if (existing) existing.remove();

                const rect = btn.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height) * 2;
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const wave = document.createElement('span');
                wave.className = 'ripple-wave';
                wave.style.cssText = `
                    position:absolute;
                    border-radius:50%;
                    width:${size}px;height:${size}px;
                    left:${x}px;top:${y}px;
                    background:rgba(255,255,255,0.18);
                    transform:scale(0);
                    animation:rippleAnim 0.55s cubic-bezier(.22,1,.36,1) forwards;
                    pointer-events:none;z-index:10;
                `;
                btn.appendChild(wave);
                wave.addEventListener('animationend', () => wave.remove());
            });
        });
    }
};


// ─── 3D Card Tilt ─────────────────────────────────────
const SKT_Tilt = {
    init() {
        if (window.matchMedia('(hover: none)').matches) return;

        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', e => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px) scale(1.01)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });

        const heroVisual = document.getElementById('heroVisual');
        if (heroVisual) {
            const hero = heroVisual.closest('.hero');
            if (hero) {
                hero.addEventListener('mousemove', e => {
                    const cx = hero.offsetWidth / 2;
                    const cy = hero.offsetHeight / 2;
                    const rx = ((e.offsetY - cy) / cy) * -3;
                    const ry = ((e.offsetX - cx) / cx) * 4;
                    heroVisual.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${window.scrollY * 0.12}px)`;
                });
                hero.addEventListener('mouseleave', () => {
                    heroVisual.style.transform = `translateY(${window.scrollY * 0.12}px)`;
                });
            }
        }
    }
};


// ─── Forms ────────────────────────────────────────────
const SKT_Forms = {
    init() {
        document.querySelectorAll('form').forEach(form => {
            if (form.dataset.bound) return;
            form.dataset.bound = '1';
            form.addEventListener('submit', e => this.handle(e, form));
        });
    },

    handle(e, form) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn || btn.disabled) return;
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⟳ Sending…';
        btn.style.opacity = '.75';
        setTimeout(() => {
            form.reset();
            btn.disabled = false;
            btn.innerHTML = orig;
            btn.style.opacity = '';
            SKT_Forms.toast('✓ Inquiry sent! We\'ll respond within 1 hour.', 'success');
        }, 1500);
    },

    toast(msg, type = '') {
        const existing = document.querySelector('.skt-toast');
        if (existing) existing.remove();
        const t = document.createElement('div');
        t.className = `skt-toast ${type}`;
        t.textContent = msg;
        t.setAttribute('role', 'status');
        t.setAttribute('aria-live', 'polite');
        document.body.appendChild(t);
        requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 500); }, 4500);
    }
};
