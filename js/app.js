// ===========================
// 神秘塔罗 Mystic Tarot
// Application Logic & AI Agent
// ===========================

(function () {
    'use strict';

    // ---- Constants & Config ----
    const DEFAULT_AI_CONFIG = {
        provider: 'deepseek',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: '',
        model: 'deepseek-chat',
        systemPrompt: '你是一位拥有古老智慧的神秘塔罗占卜大师与灵性导师。你精通神秘学象征主义与荣格心理学原型。在解读时，请结合求问者的问题、所抽出的牌阵位置、每张牌的正逆位深意以及多张牌之间的相互流转生克，为求问者带来富有洞察力、温暖且充满启发的深度解读与具体行动指引。'
    };

    const PROVIDER_PRESETS = {
        deepseek: {
            baseUrl: 'https://api.deepseek.com/v1',
            model: 'deepseek-chat'
        },
        siliconflow: {
            baseUrl: 'https://api.siliconflow.cn/v1',
            model: 'deepseek-ai/DeepSeek-V3'
        },
        openai: {
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-4o-mini'
        },
        moonshot: {
            baseUrl: 'https://api.moonshot.cn/v1',
            model: 'moonshot-v1-8k'
        },
        zhipu: {
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
            model: 'glm-4-flash'
        },
        custom: {
            baseUrl: '',
            model: ''
        }
    };

    // ---- State ----
    const state = {
        currentPage: 'landing',
        selectedSpread: null,
        selectedCategory: 'general',
        question: '',
        selectedCards: [],
        readingCards: [],
        cardsNeeded: 0,
        aiMode: true,
        isGenerating: false,
        chatHistory: [] // For follow-up conversation
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
        bindAiSettingsModal();
        bindAiChat();
        updateAiBadgeStatus();
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
        const brand = $('.nav-brand');
        if (brand) {
            brand.addEventListener('click', function (e) {
                e.preventDefault();
                navigateTo('landing');
            });
        }

        // Nav toggle (mobile)
        const toggle = $('#nav-toggle');
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
        $$('.page').forEach(function (p) { p.classList.remove('active'); });

        const target = $('#' + pageId + '-page');
        if (target) {
            target.classList.add('active');
            target.style.animation = 'none';
            target.offsetHeight; // force reflow
            target.style.animation = '';
        }

        $$('.nav-link').forEach(function (link) {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        const navLinks = $('#nav-links');
        if (navLinks) navLinks.classList.remove('open');

        window.scrollTo({ top: 0, behavior: 'smooth' });
        state.currentPage = pageId;
    }

    // ---- AI Config & Storage ----
    function getAiConfig() {
        try {
            const saved = localStorage.getItem('tarot_ai_config');
            if (saved) return Object.assign({}, DEFAULT_AI_CONFIG, JSON.parse(saved));
        } catch (e) {}
        return Object.assign({}, DEFAULT_AI_CONFIG);
    }

    function saveAiConfig(cfg) {
        localStorage.setItem('tarot_ai_config', JSON.stringify(cfg));
        updateAiBadgeStatus();
    }

    function updateAiBadgeStatus() {
        const cfg = getAiConfig();
        const badge = $('#ai-status-badge');
        if (!badge) return;

        if (cfg.apiKey && cfg.apiKey.trim().length > 0) {
            badge.className = 'badge badge-ready';
            badge.textContent = `🤖 AI 已就绪 (${cfg.model || '已配Key'})`;
        } else {
            badge.className = 'badge badge-warning';
            badge.textContent = '未配置密钥 (使用经典牌义)';
        }
    }

    // ---- Settings Modal ----
    function bindAiSettingsModal() {
        const modal = $('#settings-modal');
        const openNavBtn = $('#open-settings-nav-btn');
        const quickSettingsBtn = $('#quick-settings-btn');
        const closeBtn = $('#settings-close-btn');
        const overlay = $('#settings-overlay');
        const providerSelect = $('#api-provider-select');
        const baseUrlInput = $('#api-base-url');
        const apiKeyInput = $('#api-key');
        const modelInput = $('#api-model');
        const systemPromptInput = $('#api-system-prompt');
        const toggleKeyBtn = $('#toggle-key-visibility');
        const testBtn = $('#test-api-btn');
        const saveBtn = $('#save-settings-btn');
        const statusBox = $('#settings-status-box');

        function openModal() {
            const cfg = getAiConfig();
            if (providerSelect) providerSelect.value = cfg.provider || 'deepseek';
            if (baseUrlInput) baseUrlInput.value = cfg.baseUrl || '';
            if (apiKeyInput) apiKeyInput.value = cfg.apiKey || '';
            if (modelInput) modelInput.value = cfg.model || '';
            if (systemPromptInput) systemPromptInput.value = cfg.systemPrompt || DEFAULT_AI_CONFIG.systemPrompt;
            if (statusBox) statusBox.style.display = 'none';

            if (modal) modal.style.display = 'flex';
        }

        function closeModal() {
            if (modal) modal.style.display = 'none';
        }

        if (openNavBtn) openNavBtn.addEventListener('click', openModal);
        if (quickSettingsBtn) quickSettingsBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);

        // Provider dropdown change
        if (providerSelect) {
            providerSelect.addEventListener('change', function () {
                const p = providerSelect.value;
                if (PROVIDER_PRESETS[p]) {
                    if (baseUrlInput && PROVIDER_PRESETS[p].baseUrl) baseUrlInput.value = PROVIDER_PRESETS[p].baseUrl;
                    if (modelInput && PROVIDER_PRESETS[p].model) modelInput.value = PROVIDER_PRESETS[p].model;
                }
            });
        }

        // Toggle Key Visibility
        if (toggleKeyBtn && apiKeyInput) {
            toggleKeyBtn.addEventListener('click', function () {
                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    toggleKeyBtn.textContent = '🔒';
                } else {
                    apiKeyInput.type = 'password';
                    toggleKeyBtn.textContent = '👁️';
                }
            });
        }

        // Test API Connection
        if (testBtn) {
            testBtn.addEventListener('click', async function () {
                const key = apiKeyInput.value.trim();
                let url = baseUrlInput.value.trim();
                const model = modelInput.value.trim();

                if (!key) {
                    showStatus('请先输入 API 密钥 (API Key)', 'error');
                    return;
                }
                if (!url) {
                    showStatus('请填写接口地址 (Base URL)', 'error');
                    return;
                }

                showStatus('⚡ 正在测试 API 连接与模型响应...', 'info');
                testBtn.disabled = true;

                try {
                    let endpoint = url;
                    if (!endpoint.endsWith('/chat/completions')) {
                        endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
                    }

                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + key
                        },
                        body: JSON.stringify({
                            model: model || 'deepseek-chat',
                            messages: [{ role: 'user', content: '请回复一个字：好' }],
                            max_tokens: 10
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const reply = data.choices?.[0]?.message?.content || 'OK';
                        showStatus(`✅ 连接成功！模型响应: "${reply.trim()}"`, 'success');
                    } else {
                        const err = await res.text();
                        showStatus(`❌ 连接失败 (HTTP ${res.status}): ${err.slice(0, 150)}`, 'error');
                    }
                } catch (e) {
                    showStatus(`❌ 请求异常: ${e.message}。若为跨域拦截，建议使用兼容 CORS 的端点或直连官方 API。`, 'error');
                } finally {
                    testBtn.disabled = false;
                }
            });
        }

        // Save Settings
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                const newCfg = {
                    provider: providerSelect.value,
                    baseUrl: baseUrlInput.value.trim() || DEFAULT_AI_CONFIG.baseUrl,
                    apiKey: apiKeyInput.value.trim(),
                    model: modelInput.value.trim() || DEFAULT_AI_CONFIG.model,
                    systemPrompt: systemPromptInput.value.trim() || DEFAULT_AI_CONFIG.systemPrompt
                };

                saveAiConfig(newCfg);
                showToast('✅ AI 配置已成功保存！');
                closeModal();
            });
        }

        function showStatus(msg, type) {
            if (!statusBox) return;
            statusBox.style.display = 'block';
            statusBox.className = 'settings-status-box status-' + type;
            statusBox.textContent = msg;
        }
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
        const startBtn = $('#start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', function () { navigateTo('spread'); });
        }

        const beginBtn = $('#begin-btn');
        if (beginBtn) {
            beginBtn.addEventListener('click', function () {
                state.question = ($('#question-text') || {}).value || '';
                const aiToggle = $('#ai-mode-toggle');
                state.aiMode = aiToggle ? aiToggle.checked : true;
                startReading();
            });
        }

        const revealBtn = $('#reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', revealReading);
        }

        const shareBtn = $('#share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareReading);
        }

        const newBtn = $('#new-reading-btn');
        if (newBtn) {
            newBtn.addEventListener('click', function () {
                resetState();
                navigateTo('spread');
            });
        }
    }

    // ---- Start Reading ----
    function startReading() {
        const spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        state.cardsNeeded = spread.cardCount;
        state.selectedCards = [];
        state.readingCards = [];
        state.chatHistory = [];

        const cardsNeeded = $('#cards-needed');
        if (cardsNeeded) cardsNeeded.textContent = spread.cardCount;

        navigateTo('reading');
        generateCardDeck();
        updateSelectedArea();

        const revealBtn = $('#reveal-btn');
        if (revealBtn) revealBtn.style.display = 'none';
    }

    function generateCardDeck() {
        const deck = $('#card-deck');
        if (!deck) return;
        deck.innerHTML = '';

        const totalCards = Math.min(22, Math.max(state.cardsNeeded * 4, 14));

        for (let i = 0; i < totalCards; i++) {
            const cardEl = document.createElement('div');
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

        const allCards = window.TarotDeck.getAllCards();
        let card;
        let attempts = 0;
        do {
            card = allCards[Math.floor(Math.random() * allCards.length)];
            attempts++;
        } while (
            state.selectedCards.some(function (sc) { return sc.card.id === card.id; }) &&
            attempts < 200
        );

        const isReversed = Math.random() < 0.35; // 35% chance reversed

        const front = cardEl.querySelector('.tarot-card-front');
        if (front) {
            front.innerHTML =
                '<span class="card-emoji"' + (isReversed ? ' style="transform: rotate(180deg)"' : '') + '>' + card.emoji + '</span>' +
                '<span class="card-name-cn">' + card.nameCN + '</span>' +
                '<span class="card-name-en">' + card.name + '</span>' +
                '<span class="card-orientation ' + (isReversed ? 'card-reversed' : 'card-upright') + '">' + (isReversed ? '逆位' : '正位') + '</span>';
        }

        const selectedCard = { card: card, isReversed: isReversed, index: index };
        state.selectedCards.push(selectedCard);
        state.readingCards.push(selectedCard);

        updateSelectedArea();

        if (state.selectedCards.length >= state.cardsNeeded) {
            $$('.tarot-card:not(.selected)').forEach(function (c) {
                c.classList.add('disabled');
            });
            const revealBtn = $('#reveal-btn');
            if (revealBtn) revealBtn.style.display = '';
        }
    }

    function updateSelectedArea() {
        const container = $('#selected-cards');
        if (!container) return;
        container.innerHTML = '';

        const spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        state.selectedCards.forEach(function (sc, i) {
            const posName = (spread.positions[i] ? spread.positions[i].name : '位置' + (i + 1));
            const div = document.createElement('div');
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
        const spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        const resultQ = $('#result-question');
        if (resultQ) {
            if (state.question) {
                resultQ.textContent = '「' + state.question + '」 · ' + spread.name;
            } else {
                resultQ.textContent = spread.name + ' · ' + getCategoryName(state.selectedCategory);
            }
        }

        // Display cards in spread layout
        const resultSpread = $('#result-spread');
        if (resultSpread) {
            resultSpread.innerHTML = '';

            state.readingCards.forEach(function (sc, i) {
                const pos = spread.positions[i] || { name: '位置' + (i + 1), description: '' };
                const wrapper = document.createElement('div');
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

        // Determine AI or Classic Reading
        const aiContainer = $('#ai-reading-container');
        const chatSection = $('#ai-chat-section');
        const classicContainer = $('#overall-reading');
        const cfg = getAiConfig();

        if (state.aiMode) {
            if (cfg.apiKey && cfg.apiKey.trim().length > 0) {
                // Configured! Run AI Tarot Master Agent
                if (classicContainer) classicContainer.style.display = 'none';
                if (chatSection) chatSection.style.display = 'block';
                initAiReading();
            } else {
                // Not configured: Show gentle prompt banner + classic reading
                if (aiContainer) {
                    aiContainer.innerHTML =
                        '<div class="ai-agent-card" style="border-style:dashed;">' +
                            '<div class="ai-agent-header">' +
                                '<div class="ai-agent-profile">' +
                                    '<div class="ai-agent-avatar">🔮</div>' +
                                    '<div class="ai-agent-title">' +
                                        '<h3>AI 塔罗占卜大师</h3>' +
                                        '<p>大模型深度解盘模式</p>' +
                                    '</div>' +
                                '</div>' +
                                '<button type="button" class="btn btn-secondary" id="prompt-setup-key-btn">⚙️ 立即配置 API 密钥</button>' +
                            '</div>' +
                            '<p style="color:var(--text-secondary); line-height:1.7;">' +
                                '💡 您已选择 AI 模式，但尚未设置大模型 API Key（支持 DeepSeek、硅基流动、OpenAI、Kimi 等）。' +
                                '配置后即可获得大师级连贯解盘与即时追问。当前已为您呈现经典离线解盘结果：' +
                            '</p>' +
                        '</div>';

                    const promptBtn = $('#prompt-setup-key-btn');
                    if (promptBtn) {
                        promptBtn.addEventListener('click', function () {
                            const modal = $('#settings-modal');
                            if (modal) modal.style.display = 'flex';
                        });
                    }
                }
                if (classicContainer) {
                    classicContainer.style.display = 'block';
                    generateOverallReading();
                }
                if (chatSection) chatSection.style.display = 'none';
            }
        } else {
            // Offline Classic Mode
            if (aiContainer) aiContainer.innerHTML = '';
            if (classicContainer) {
                classicContainer.style.display = 'block';
                generateOverallReading();
            }
            if (chatSection) chatSection.style.display = 'none';
        }
    }

    // ---- AI Master Interpretation Execution ----
    async function initAiReading() {
        const container = $('#ai-reading-container');
        if (!container) return;

        const cfg = getAiConfig();
        const spread = window.TarotSpreads[state.selectedSpread];

        container.innerHTML =
            '<div class="ai-agent-card">' +
                '<div class="ai-agent-header">' +
                    '<div class="ai-agent-profile">' +
                        '<div class="ai-agent-avatar">🔮</div>' +
                        '<div class="ai-agent-title">' +
                            '<h3>AI 塔罗大师 · 灵性深度解盘</h3>' +
                            '<p>正在洞察宇宙能量与多牌生克流转...</p>' +
                        '</div>' +
                    '</div>' +
                    '<span class="ai-model-tag">🤖 ' + (cfg.model || 'AI') + '</span>' +
                '</div>' +
                '<div class="ai-prose" id="ai-reading-prose">' +
                    '<div class="ai-typing-indicator">' +
                        '<span>水晶球正在感应您的命盘</span>' +
                        '<span class="typing-dot"></span>' +
                        '<span class="typing-dot"></span>' +
                        '<span class="typing-dot"></span>' +
                    '</div>' +
                '</div>' +
            '</div>';

        // Prepare Prompt
        const cardsDesc = state.readingCards.map(function (sc, i) {
            const pos = spread.positions[i] || { name: '位置' + (i + 1), description: '' };
            const orientation = sc.isReversed ? '逆位' : '正位';
            const kws = (sc.isReversed ? sc.card.reversed.keywords : sc.card.upright.keywords).join('、');
            return `【位置 ${i + 1} - ${pos.name}】（代表意义：${pos.description}）\n` +
                   `抽得卡牌：${sc.card.nameCN} (${sc.card.name}) - ${orientation}\n` +
                   `核心关键词：${kws}`;
        }).join('\n\n');

        const userPrompt =
            `求问者信息如下：\n` +
            `- 求问领域：${getCategoryName(state.selectedCategory)}\n` +
            `- 疑惑/具体问题：${state.question ? state.question : '（未提供具体问题，请进行全面运势指引）'}\n` +
            `- 所选牌阵：${spread.name}（${spread.description}）\n\n` +
            `抽取的牌面排布：\n${cardsDesc}\n\n` +
            `请以塔罗导师的口吻，结构清晰、具有深度洞察力地完成本次解盘，需包含：\n` +
            `1. 牌阵核心能量与当下困局洞察\n` +
            `2. 逐牌深度解析（结合其所在牌阵位置的特殊含义与正逆位能量）\n` +
            `3. 牌与牌之间的内在呼应与生克流转\n` +
            `4. 给求问者的具体行动指引与灵性寄语\n` +
            `语言风格既要有神秘学的诗意与穿透力，也要提供切实的行动建议。`;

        const messages = [
            { role: 'system', content: cfg.systemPrompt || DEFAULT_AI_CONFIG.systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        state.chatHistory = [
            { role: 'system', content: cfg.systemPrompt || DEFAULT_AI_CONFIG.systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        const proseEl = $('#ai-reading-prose');

        await streamAiResponse(messages, function (fullText) {
            if (proseEl) {
                proseEl.innerHTML = renderMarkdown(fullText) + '<span class="typing-cursor"></span>';
            }
        }, function (finalText) {
            if (proseEl) {
                proseEl.innerHTML = renderMarkdown(finalText);
            }
            state.chatHistory.push({ role: 'assistant', content: finalText });
        }, function (err) {
            if (proseEl) {
                proseEl.innerHTML =
                    '<div class="status-error" style="padding:15px; border-radius:8px;">' +
                        '<h4>❌ AI 解盘生成中断</h4>' +
                        '<p>' + err.message + '</p>' +
                        '<p style="margin-top:10px;"><button class="btn btn-secondary btn-sm" id="retry-ai-btn">重新尝试</button></p>' +
                    '</div>';
                const retryBtn = $('#retry-ai-btn');
                if (retryBtn) retryBtn.onclick = initAiReading;
            }
        });
    }

    // ---- Generic Streaming AI Caller ----
    async function streamAiResponse(messages, onChunk, onDone, onError) {
        const cfg = getAiConfig();
        let endpoint = cfg.baseUrl.trim();
        if (!endpoint.endsWith('/chat/completions')) {
            endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + cfg.apiKey.trim()
                },
                body: JSON.stringify({
                    model: cfg.model.trim() || 'deepseek-chat',
                    messages: messages,
                    stream: true,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || line.startsWith(':')) continue;
                    if (line === 'data: [DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            const delta = parsed.choices?.[0]?.delta?.content || '';
                            if (delta) {
                                fullText += delta;
                                onChunk(fullText);
                            }
                        } catch (e) {}
                    }
                }
            }

            onDone(fullText);
        } catch (err) {
            onError(err);
        }
    }

    // ---- Interactive Follow-up Chat ----
    function bindAiChat() {
        const input = $('#chat-input');
        const sendBtn = $('#chat-send-btn');

        if (!sendBtn || !input) return;

        function submitChat() {
            const query = input.value.trim();
            if (!query) return;
            if (state.isGenerating) return;

            input.value = '';
            appendChatMessage('user', query);

            state.chatHistory.push({ role: 'user', content: query });
            state.isGenerating = true;

            const botMsgEl = appendChatMessage('bot', '正在冥想洞察...');
            const botContentEl = botMsgEl.querySelector('.msg-content');

            streamAiResponse(state.chatHistory, function (fullText) {
                if (botContentEl) {
                    botContentEl.innerHTML = renderMarkdown(fullText) + '<span class="typing-cursor"></span>';
                    scrollChatToBottom();
                }
            }, function (finalText) {
                state.isGenerating = false;
                if (botContentEl) {
                    botContentEl.innerHTML = renderMarkdown(finalText);
                    scrollChatToBottom();
                }
                state.chatHistory.push({ role: 'assistant', content: finalText });
            }, function (err) {
                state.isGenerating = false;
                if (botContentEl) {
                    botContentEl.innerHTML = `<span style="color:#e74c3c;">❌ 回复受阻: ${err.message}</span>`;
                }
            });
        }

        sendBtn.addEventListener('click', submitChat);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitChat();
            }
        });
    }

    function appendChatMessage(sender, text) {
        const container = $('#chat-messages');
        if (!container) return null;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg chat-msg-${sender}`;
        msgDiv.innerHTML = `<div class="msg-content">${renderMarkdown(text)}</div>`;
        container.appendChild(msgDiv);
        scrollChatToBottom();
        return msgDiv;
    }

    function scrollChatToBottom() {
        const container = $('#chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Simple Markdown Renderer
    function renderMarkdown(md) {
        if (!md) return '';
        let escaped = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headings
        escaped = escaped.replace(/^### (.*$)/gim, '<h4>$1</h4>');
        escaped = escaped.replace(/^## (.*$)/gim, '<h3>$1</h3>');
        escaped = escaped.replace(/^# (.*$)/gim, '<h2>$1</h2>');

        // Bold
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Unordered lists
        escaped = escaped.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');

        // Paragraphs
        const paras = escaped.split(/\n\s*\n/);
        return paras.map(function (p) {
            p = p.trim();
            if (p.startsWith('<h3>') || p.startsWith('<h4>') || p.startsWith('<h2>') || p.startsWith('<li>')) {
                if (p.includes('<li>') && !p.startsWith('<ul>')) {
                    return `<ul>${p}</ul>`;
                }
                return p;
            }
            return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
        }).join('');
    }

    // ---- Card Detail Modal ----
    function showCardDetail(sc, position) {
        const modal = $('#card-detail-modal');
        const body = $('#modal-body');
        if (!modal || !body) return;

        const data = sc.isReversed ? sc.card.reversed : sc.card.upright;
        const category = state.selectedCategory;

        let categoryReading = '';
        if (category !== 'general' && data[category]) {
            categoryReading =
                '<div class="modal-section">' +
                    '<h4>🎯 ' + getCategoryName(category) + '解读</h4>' +
                    '<p>' + data[category] + '</p>' +
                '</div>';
        }

        let keywordsHtml = '';
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

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        function closeModal() { modal.style.display = 'none'; }

        if (closeBtn) closeBtn.onclick = closeModal;
        if (overlay) overlay.onclick = closeModal;

        function escHandler(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        }
        document.addEventListener('keydown', escHandler);
    }

    // ---- Classic Offline Overall Reading ----
    function generateOverallReading() {
        const container = $('#overall-reading');
        if (!container) return;

        const spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        let html = '<h3>✨ 经典牌义综合解读 ✨</h3>';

        state.readingCards.forEach(function (sc, i) {
            const pos = spread.positions[i] || { name: '位置' + (i + 1), description: '' };
            const data = sc.isReversed ? sc.card.reversed : sc.card.upright;
            const orientation = sc.isReversed ? '逆位' : '正位';

            html +=
                '<div class="reading-section">' +
                    '<h4>' + pos.name + '：' + sc.card.nameCN + '（' + orientation + '）</h4>' +
                    '<p>' + (pos.description ? pos.description + '——' : '') + (data.meaning || '') + '</p>' +
                '</div>';
        });

        html +=
            '<div class="reading-section">' +
                '<h4>🌟 总结启示</h4>' +
                '<p>' + generateSummary() + '</p>' +
            '</div>';

        container.innerHTML = html;
    }

    function generateSummary() {
        const cards = state.readingCards;
        const majorCount = cards.filter(function (sc) { return !sc.card.suit; }).length;
        const reversedCount = cards.filter(function (sc) { return sc.isReversed; }).length;

        let summary = '';

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
        const spread = window.TarotSpreads[state.selectedSpread];
        if (!spread) return;

        let text = '🔮 神秘塔罗占卜结果 🔮\n';
        text += '牌阵：' + spread.name + '\n';
        if (state.question) text += '问题：' + state.question + '\n';
        text += '\n';

        state.readingCards.forEach(function (sc, i) {
            const pos = spread.positions[i] || { name: '位置' + (i + 1) };
            const orientation = sc.isReversed ? '逆位' : '正位';
            text += pos.name + '：' + sc.card.nameCN + '（' + orientation + '）\n';
        });

        text += '\n✨ 来自 神秘塔罗 Mystic Tarot (AI 灵性占卜)';

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
        const ta = document.createElement('textarea');
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
        const grid = $('#meanings-grid');
        if (!grid) return;
        grid.innerHTML = '';

        if (!window.TarotDeck) return;

        let cards = [];
        if (filter === 'major') {
            cards = window.TarotDeck.majorArcana || [];
        } else {
            cards = (window.TarotDeck.minorArcana && window.TarotDeck.minorArcana[filter]) || [];
        }

        cards.forEach(function (card, i) {
            const div = document.createElement('div');
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
        const names = {
            general: '综合',
            love: '爱情',
            career: '事业',
            health: '健康',
            wealth: '财运'
        };
        return names[cat] || '综合';
    }

    function showToast(message) {
        let toast = $('.toast');
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
        state.chatHistory = [];

        const questionText = $('#question-text');
        if (questionText) questionText.value = '';

        $$('.category-btn').forEach(function (b) { b.classList.remove('active'); });
        const generalBtn = $('.category-btn[data-category="general"]');
        if (generalBtn) generalBtn.classList.add('active');
    }
})();
