# 🔮 神秘塔罗 Mystic Tarot

> 一个基于网页的在线塔罗牌占卜应用，提供沉浸式的塔罗牌阅读体验。

[在线体验 →](#) | [English](#english)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)

## ✨ 功能特点

- 🎴 **完整78张塔罗牌** — 包含22张大阿卡纳和56张小阿卡纳
- 🌙 **四种牌阵** — 单牌占卜、时间之流（三牌）、凯尔特十字（十牌）、爱情占卜（五牌）
- 🔮 **正逆位解读** — 每张牌都有正位和逆位的详细含义
- 💫 **五大领域** — 综合、爱情、事业、健康、财运的专属解读
- 🎨 **精美界面** — 深邃神秘主题设计，流畅动画效果
- 📱 **响应式设计** — 完美支持手机、平板和电脑
- 🔒 **隐私安全** — 纯前端应用，数据不离开你的浏览器
- 🆓 **完全免费** — 无需注册，无需付费，开箱即用

## 🚀 快速开始

### 方式一：直接打开

下载项目后，双击 `index.html` 即可在浏览器中打开使用。

### 方式二：本地服务器

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/mystic-tarot.git
cd mystic-tarot

# 使用 Python 启动服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

在浏览器中访问 `http://localhost:8080`

## 📦 部署到 GitHub Pages

1. Fork 本仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 `main` 分支，路径选择 `/ (root)`
4. 保存后等待几分钟，即可通过 `https://YOUR_USERNAME.github.io/mystic-tarot/` 访问

## 🏗️ 项目结构

```
mystic-tarot/
├── index.html          # 主页面（单页应用）
├── css/
│   └── style.css       # 样式文件（主题、动画、响应式）
├── js/
│   ├── tarot-data.js   # 塔罗牌数据库（78张牌完整数据）
│   └── app.js          # 应用逻辑（导航、占卜、交互）
├── README.md           # 项目说明
└── LICENSE             # MIT 开源协议
```

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **HTML5** | 语义化页面结构 |
| **CSS3** | 动画、渐变、玻璃拟态、3D翻转效果 |
| **原生JavaScript** | 应用逻辑（零依赖，无需框架） |
| **Google Fonts** | Noto Serif SC + Ma Shan Zheng 字体 |

## 🎯 使用说明

1. **选择牌阵** — 根据你的问题选择合适的牌阵
2. **冥想问题** — 在心中默念你的问题，选择对应领域
3. **凭直觉抽牌** — 从牌堆中选择指定数量的牌
4. **查看解读** — 点击每张牌查看详细解读
5. **分享结果** — 一键复制占卜结果

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue！

---

## English

### ✨ Features

- 🎴 Full 78-card tarot deck (22 Major + 56 Minor Arcana)
- 🌙 4 spread types: Single Card, Three Card, Celtic Cross, Love Spread
- 🔮 Upright & reversed meanings for every card
- 💫 Multi-domain readings: Love, Career, Health, Wealth
- 🎨 Beautiful mystical dark theme with smooth animations
- 📱 Fully responsive design
- 🆓 Free, open source, no registration needed

### ⚠️ Disclaimer

This application is for **entertainment and self-reflection purposes only**. Tarot readings should not be used as a substitute for professional advice.

## 📄 License

[MIT License](LICENSE) — feel free to use and modify!
