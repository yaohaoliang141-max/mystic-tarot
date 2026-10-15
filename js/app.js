// ===========================
// 神秘塔罗 Mystic Tarot
// Application Logic
// ===========================

(function () {
    'use strict';

    // ---- State ----
    const state = {
        currentPage: 'landing',
        selectedSpread: null,
        selectedCategory: 'general',
        question: '',
        selectedCards: [],
        readingCards: [],
        cardsNeeded: 0
    };

    // ---- Helpers ----
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ---- Initialize ----
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        createStars();
        bindNavigation();
        bindSpreadSelection();
        bindCategoryButtons();
        bindActionButtons();
        bindMeaningsFilter();
        loadMeaningsPage('major');
    }

    // ---- Stars Background ----
    function createStars() {
        const container = $('#stars-bg');
        if (!container) return;
        const count = 150;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                --duration: ${Math.random() * 3 + 2}s;
                animation-delay: ${Math.random() * 3}s;
            `;
            container.appendChild(star);
        }
    }

    // ---- Navigation ----
    function bindNavigation() {
        // Nav links
        $$('.nav-link').forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                navigateTo(link.dataset.page);
            });
        });

        // Nav brand
        var brand = $('.nav-brand');
        if (brand) {
            brand.addEventListener('click', function (e) {
                e.preventDefault();
                navigateTo('landing');
            });
        }

        // Nav toggle (mobile)
        var toggle = $('#nav-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                $('#nav-links').classList.toggle('open');
            });
        }

        // Back buttons
        $$('.btn-back').forEach(function (btn) {
            btn.addEventListener('click', function () {
                navigateTo(btn.dataset.page);
            });
        });
    }

    function navigateTo(pageId) {
        // Hide all pages
        $$('.page').forEach(function (p) { p.classList.remove('active'); });

        // Show target page
        var target = $('#' + pageId + '-page');
        if (target) {
            target.classList.add('active');
            // Re-trigger animation
            target.style.animation = 'none';
            target.offsetHeight; // force reflow
            target.style.animation = '';
        }

        // Update nav active state
        $$('.nav-link').forEach(function (link) {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Close mobile nav
        var navLinks = $('#nav-links');
        if (navLinks) navLinks.classList.remove('open');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        state.currentPage = pageId;
    }

    // ---- Spread Selection ----
    function bindSpreadSelection() {
        $$('.spread-card').forEach(function (card) {
            card.addEventListener('click', function () {
                state.selectedSpread = card.dataset.spread;
                navigateTo('question');
            });
        });
    }

    // ---- Category Buttons ----
    function bindCategoryButtons() {
        $$('.category-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                $$('.category-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                state.selectedCategory = btn.dataset.category;
            });
        });
    }

    // ---- Action Buttons ----
    function bindActionButtons() {
        // Start button on landing page
        var startBtn = $('#start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function () { navigateTo('spread'); });
        }

        // Begin reading button
        var beginBtn = $('#begin-btn');
        if (beginBtn) {
            beginBtn.addEventListener('click', function () {
                state.question = ($('#question-text') || {}).value || '';
                startReading();
            });
        }

        // Reveal button
        var revealBtn = $('#reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', revealReading);
        }

        // Share button
        var shareBtn = $('#share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareReading);
        }

        // New reading button
        var newBtn = $('#new-reading-btn');
        if (newBtn) {
            newBtn.addEventListener('click', function () {
                resetState();
                navigateTo('spread');
            });
        }
    }

    // ---- Start Reading ----
    function startReading() {
        var spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        state.cardsNeeded = spread.cardCount;
        state.selectedCards = [];
        state.readingCards = [];

        var cardsNeeded = $('#cards-needed');
        if (cardsNeeded) cardsNeeded.textContent = spread.cardCount;

        navigateTo('reading');
        generateCardDeck();
        updateSelectedArea();

        var revealBtn = $('#reveal-btn');
        if (revealBtn) revealBtn.style.display = 'none';
    }

    function generateCardDeck() {
        var deck = $('#card-deck');
        if (!deck) return;
        deck.innerHTML = '';

        // Show a good number of face-down cards for selection
        var totalCards = Math.min(22, Math.max(state.cardsNeeded * 4, 14));

        for (var i = 0; i < totalCards; i++) {
            var cardEl = document.createElement('div');
            cardEl.className = 'tarot-card deal-animation';
            cardEl.style.animationDelay = (i * 0.05) + 's';
            cardEl.dataset.index = i;
            cardEl.innerHTML =
                '<div class="tarot-card-inner">' +
                    '<div class="tarot-card-back"></div>' +
                    '<div class="tarot-card-front">' +
                        '<span class="card-emoji">?</span>' +
                        '<span class="card-name-cn">未知</span>' +
                    '</div>' +
                '</div>';

            (function (el, idx) {
                el.addEventListener('click', function () { selectCard(el, idx); });
            })(cardEl, i);

            deck.appendChild(cardEl);
        }
    }

    function selectCard(cardEl, index) {
        if (state.selectedCards.length >= state.cardsNeeded) return;
        if (cardEl.classList.contains('selected')) return;
        if (cardEl.classList.contains('disabled')) return;

        cardEl.classList.add('selected', 'flipped');

        // Assign a random card from the full deck
        var allCards = window.TarotDeck.getAllCards();
        var card;
        var attempts = 0;
        do {
            card = allCards[Math.floor(Math.random() * allCards.length)];
            attempts++;
        } while (
            state.selectedCards.some(function (sc) { return sc.card.id === card.id; }) &&
            attempts < 200
        );

        var isReversed = Math.random() < 0.35; // 35% chance reversed

        // Update card front display
        var front = cardEl.querySelector('.tarot-card-front');
        if (front) {
            front.innerHTML =
                '<span class="card-emoji"' + (isReversed ? ' style="transform: rotate(180deg)"' : '') + '>' + card.emoji + '</span>' +
                '<span class="card-name-cn">' + card.nameCN + '</span>' +
                '<span class="card-name-en">' + card.name + '</span>' +
                '<span class="card-orientation ' + (isReversed ? 'card-reversed' : 'card-upright') + '">' + (isReversed ? '逆位' : '正位') + '</span>';
        }

        var selectedCard = { card: card, isReversed: isReversed, index: index };
        state.selectedCards.push(selectedCard);
        state.readingCards.push(selectedCard);

        updateSelectedArea();

        // Disable remaining cards if enough selected
        if (state.selectedCards.length >= state.cardsNeeded) {
            $$('.tarot-card:not(.selected)').forEach(function (c) {
                c.classList.add('disabled');
            });
            var revealBtn = $('#reveal-btn');
            if (revealBtn) revealBtn.style.display = '';
        }
    }

    function updateSelectedArea() {
        var container = $('#selected-cards');
        if (!container) return;
        container.innerHTML = '';

        var spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        state.selectedCards.forEach(function (sc, i) {
            var posName = (spread.positions[i] ? spread.positions[i].name : '位置' + (i + 1));
            var div = document.createElement('div');
            div.className = 'result-card-wrapper deal-animation';
            div.style.animationDelay = (i * 0.1) + 's';
            div.innerHTML =
                '<div class="result-position">' + posName + '</div>' +
                '<div class="result-card' + (sc.isReversed ? ' reversed-card' : '') + '">' +
                    '<span class="card-emoji">' + sc.card.emoji + '</span>' +
                    '<span class="card-name-cn">' + sc.card.nameCN + '</span>' +
                    '<span class="card-orientation ' + (sc.isReversed ? 'card-reversed' : 'card-upright') + '">' + (sc.isReversed ? '逆位' : '正位') + '</span>' +
                '</div>';
            container.appendChild(div);
        });
    }

    // ---- Reveal Reading ----
    function revealReading() {
        navigateTo('result');
        displayResults();
    }

    function displayResults() {
        var spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        // Show question or spread name
        var resultQ = $('#result-question');
        if (resultQ) {
            if (state.question) {
                resultQ.textContent = '「' + state.question + '」';
            } else {
                resultQ.textContent = spread.name + ' · ' + getCategoryName(state.selectedCategory);
            }
        }

        // Display cards in spread layout
        var resultSpread = $('#result-spread');
        if (resultSpread) {
            resultSpread.innerHTML = '';

            state.readingCards.forEach(function (sc, i) {
                var pos = spread.positions[i] || { name: '位置' + (i + 1), description: '' };
                var wrapper = document.createElement('div');
                wrapper.className = 'result-card-wrapper deal-animation';
                wrapper.style.animationDelay = (i * 0.15) + 's';
                wrapper.innerHTML =
                    '<div class="result-position">' + pos.name + '</div>' +
                    '<div class="result-card">' +
                        '<span class="card-emoji"' + (sc.isReversed ? ' style="transform: rotate(180deg)"' : '') + '>' + sc.card.emoji + '</span>' +
                        '<span class="card-name-cn">' + sc.card.nameCN + '</span>' +
                        '<span class="card-name-en">' + sc.card.name + '</span>' +
                        '<span class="card-orientation ' + (sc.isReversed ? 'card-reversed' : 'card-upright') + '">' + (sc.isReversed ? '逆位' : '正位') + '</span>' +
                    '</div>';

                (function (selectedCard, position) {
                    wrapper.addEventListener('click', function () {
                        showCardDetail(selectedCard, position);
                    });
                })(sc, pos);

                resultSpread.appendChild(wrapper);
            });
        }

        // Generate overall reading
        generateOverallReading();
    }

    function showCardDetail(sc, position) {
        var modal = $('#card-detail-modal');
        var body = $('#modal-body');
        if (!modal || !body) return;

        var data = sc.isReversed ? sc.card.reversed : sc.card.upright;
        var category = state.selectedCategory;

        var categoryReading = '';
        if (category !== 'general' && data[category]) {
            categoryReading =
                '<div class="modal-section">' +
                    '<h4>🎯 ' + getCategoryName(category) + '解读</h4>' +
                    '<p>' + data[category] + '</p>' +
                '</div>';
        }

        var keywordsHtml = '';
        if (data.keywords && data.keywords.length) {
            keywordsHtml = data.keywords.map(function (k) {
                return '<span class="modal-keyword">' + k + '</span>';
            }).join('');
        }

        body.innerHTML =
            '<div class="modal-emoji">' + sc.card.emoji + '</div>' +
            '<h3>' + sc.card.nameCN + '</h3>' +
            '<p class="modal-card-en">' + sc.card.name + (sc.card.numeral ? ' · ' + sc.card.numeral : '') + '</p>' +
            '<span class="modal-orientation ' + (sc.isReversed ? 'card-reversed' : 'card-upright') + '">' + (sc.isReversed ? '🔄 逆位' : '✨ 正位') + '</span>' +
            '<div class="modal-section">' +
                '<h4>📍 位置：' + position.name + '</h4>' +
                '<p>' + (position.description || '') + '</p>' +
            '</div>' +
            '<div class="modal-section">' +
                '<h4>🔮 牌义解读</h4>' +
                '<p>' + (data.meaning || '') + '</p>' +
            '</div>' +
            categoryReading +
            '<div class="modal-section">' +
                '<h4>💡 建议</h4>' +
                '<p>' + (data.advice || '') + '</p>' +
            '</div>' +
            '<div class="modal-section">' +
                '<h4>🏷️ 关键词</h4>' +
                '<div class="modal-keywords">' + keywordsHtml + '</div>' +
            '</div>';

        modal.style.display = 'flex';

        // Close handlers
        var closeBtn = modal.querySelector('.modal-close');
        var overlay = modal.querySelector('.modal-overlay');

        function closeModal() { modal.style.display = 'none'; }

        if (closeBtn) closeBtn.onclick = closeModal;
        if (overlay) overlay.onclick = closeModal;

        // Close on Escape
        function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        }
        document.addEventListener('keydown', escHandler);
    }

    function generateOverallReading() {
        var container = $('#overall-reading');
        if (!container) return;

        var spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        var html = '<h3>✨ 综合解读 ✨</h3>';

        // Individual card readings
        state.readingCards.forEach(function (sc, i) {
            var pos = spread.positions[i] || { name: '位置' + (i + 1), description: '' };
            var data = sc.isReversed ? sc.card.reversed : sc.card.upright;
            var orientation = sc.isReversed ? '逆位' : '正位';

            html +=
                '<div class="reading-section">' +
                    '<h4>' + pos.name + '：' + sc.card.nameCN + '（' + orientation + '）</h4>' +
                    '<p>' + (pos.description ? pos.description + '——' : '') + (data.meaning || '') + '</p>' +
                '</div>';
        });

        // Overall summary
        html +=
            '<div class="reading-section">' +
                '<h4>🌟 总结</h4>' +
                '<p>' + generateSummary() + '</p>' +
            '</div>';

        container.innerHTML = html;
    }

    function generateSummary() {
        var cards = state.readingCards;
        var majorCount = cards.filter(function (sc) { return !sc.card.suit; }).length;
        var reversedCount = cards.filter(function (sc) { return sc.isReversed; }).length;

        var summary = '';

        if (majorCount > cards.length / 2) {
            summary += '此次占卜中出现了较多大阿卡纳牌，暗示你正处于人生的重要转折期，宇宙正在对你传达重大的信息。';
        } else if (majorCount > 0) {
            summary += '此次占卜中大小阿卡纳牌均有出现，显示你当前的问题既有深层的灵性含义，也涉及日常生活的具体层面。';
        } else {
            summary += '此次占卜的牌面组合显示，你当前面临的事务更多属于日常生活层面，需要在细节中寻找答案。';
        }

        if (reversedCount > cards.length / 2) {
            summary += '多张逆位牌提示你需要关注内在的阻碍和未完成的课题，也许有些事情需要你换个角度来看待。';
        } else if (reversedCount === 0 && cards.length > 1) {
            summary += '所有牌都是正位，显示当前的能量流动是顺畅的，你正走在正确的道路上。';
        } else if (reversedCount > 0) {
            summary += '正逆位牌的交织显示，事物正处于动态变化中，保持灵活与开放的态度至关重要。';
        }

        summary += '请结合每张牌的具体含义，聆听内心的声音，让塔罗的智慧指引你前行。记住，命运掌握在你自己手中，塔罗只是一面镜子，映照出你内心深处已有的答案。';

        return summary;
    }

    // ---- Share Reading ----
    function shareReading() {
        var spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        var text = '🔮 神秘塔罗占卜结果 🔮\n';
        text += '牌阵：' + spread.name + '\n';
        if (state.question) text += '问题：' + state.question + '\n';
        text += '\n';

        state.readingCards.forEach(function (sc, i) {
            var pos = spread.positions[i] || { name: '位置' + (i + 1) };
            var orientation = sc.isReversed ? '逆位' : '正位';
            text += pos.name + '：' + sc.card.nameCN + '（' + orientation + '）\n';
        });

        text += '\n✨ 来自 神秘塔罗 Mystic Tarot';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast('✅ 结果已复制到剪贴板');
            }).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('✅ 结果已复制到剪贴板');
        } catch (e) {
            showToast('❌ 复制失败，请手动复制');
        }
        document.body.removeChild(ta);
    }

    // ---- Meanings Page ----
    function bindMeaningsFilter() {
        $$('.filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                $$('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                loadMeaningsPage(btn.dataset.filter);
            });
        });
    }

    function loadMeaningsPage(filter) {
        var grid = $('#meanings-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!window.TarotDeck) return;

        var cards = [];
        if (filter === 'major') {
            cards = window.TarotDeck.majorArcana || [];
        } else {
            cards = (window.TarotDeck.minorArcana && window.TarotDeck.minorArcana[filter]) || [];
        }

        cards.forEach(function (card, i) {
            var div = document.createElement('div');
            div.className = 'meaning-card deal-animation';
            div.style.animationDelay = (i * 0.03) + 's';
            div.innerHTML =
                '<span class="card-emoji">' + card.emoji + '</span>' +
                '<span class="card-name-cn">' + card.nameCN + '</span>' +
                '<span class="card-name-en">' + card.name + '</span>';

            (function (c) {
                div.addEventListener('click', function () {
                    showCardDetail(
                        { card: c, isReversed: false },
                        { name: '牌义参考', description: '正位含义' }
                    );
                });
            })(card);

            grid.appendChild(div);
        });
    }

    // ---- Utilities ----
    function getCategoryName(cat) {
        var names = {
            general: '综合',
            love: '爱情',
            career: '事业',
            health: '健康',
            wealth: '财运'
        };
        return names[cat] || '综合';
    }

    function showToast(message) {
        var toast = $('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 2500);
    }

    function resetState() {
        state.selectedSpread = null;
        state.selectedCategory = 'general';
        state.question = '';
        state.selectedCards = [];
        state.readingCards = [];
        state.cardsNeeded = 0;

        var questionText = $('#question-text');
        if (questionText) questionText.value = '';

        $$('.category-btn').forEach(function (b) { b.classList.remove('active'); });
        var generalBtn = $('.category-btn[data-category="general"]');
        if (generalBtn) generalBtn.classList.add('active');
    }
})();
