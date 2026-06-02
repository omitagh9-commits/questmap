// app.js

// グローバル状態管理
let goals = [];
let currentGoalId = null;
const expandedNodes = new Set(); // 展開状態のノードIDを保存

// タイマー状態管理
let timerIntervalId = null;
let timerSecondsElapsed = 0;
let timerCurrentNodeId = null;
let timerState = "idle"; // "idle" | "running" | "paused"

// DOM要素の参照
const homeView = document.getElementById("home-view");
const roadmapView = document.getElementById("roadmap-view");
const goalsListContainer = document.getElementById("goals-list-container");
const goalsEmptyState = document.getElementById("goals-empty-state");

// ヘッダー・スタッツ要素
const headerLogo = document.getElementById("header-logo");
const addGoalBtnHeader = document.getElementById("add-goal-btn-header");
const addGoalBtnEmpty = document.getElementById("add-goal-btn-empty");
const statActiveGoals = document.getElementById("stat-active-goals");
const statTotalProgress = document.getElementById("stat-total-progress");
const statLastStudy = document.getElementById("stat-last-study");
const statTotalStudyTime = document.getElementById("stat-total-study-time");

// ロードマップ詳細画面の要素
const backToHomeBtn = document.getElementById("back-to-home-btn");
const goalBreadcrumbTitle = document.getElementById("goal-breadcrumb-title");
const detailGoalTitle = document.getElementById("detail-goal-title");
const detailGoalDesc = document.getElementById("detail-goal-desc");
const detailGoalDate = document.getElementById("detail-goal-date");
const detailGoalStatus = document.getElementById("detail-goal-status");
const detailGoalStudyTime = document.getElementById("detail-goal-study-time");
const detailProgressCircle = document.getElementById("detail-progress-circle");
const detailProgressPercent = document.getElementById("detail-progress-percent");
const roadmapTreeContainer = document.getElementById("roadmap-tree-container");
const progressBreakdownContainer = document.getElementById("progress-breakdown-container");

// ボタン要素
const editGoalBtn = document.getElementById("edit-goal-btn");
const deleteGoalBtn = document.getElementById("delete-goal-btn");
const addNodeBtn = document.getElementById("add-node-btn");

// モーダル要素 (Goal Modal)
const goalModal = document.getElementById("goal-modal");
const goalForm = document.getElementById("goal-form");
const goalModalTitle = document.getElementById("goal-modal-title");
const goalFormId = document.getElementById("goal-form-id");
const goalFormTitle = document.getElementById("goal-form-title");
const goalFormDesc = document.getElementById("goal-form-desc");
const goalFormDate = document.getElementById("goal-form-date");
const goalFormTemplate = document.getElementById("goal-form-template");
const templateSelectionGroup = document.getElementById("template-selection-group");
const goalFormCancel = document.getElementById("goal-form-cancel");
const goalModalClose = document.getElementById("goal-modal-close");
const goalFormSubmit = document.getElementById("goal-form-submit");

// モーダル要素 (Leaf Editor Modal)
const leafEditorModal = document.getElementById("leaf-editor-modal");
const leafEditorForm = document.getElementById("leaf-editor-form");
const leafEditorNodeId = document.getElementById("leaf-editor-node-id");
const leafNodePath = document.getElementById("leaf-node-path");
const leafNodeTitle = document.getElementById("leaf-node-title");
const leafEditorTextbook = document.getElementById("leaf-editor-textbook");
const leafEditorProgress = document.getElementById("leaf-editor-progress");
const leafSliderVal = document.getElementById("leaf-slider-val");
const leafEditorDate = document.getElementById("leaf-editor-date");
const leafQuickDateBtn = document.getElementById("leaf-quick-date-btn");
const leafEditorCancel = document.getElementById("leaf-editor-cancel");
const leafEditorClose = document.getElementById("leaf-editor-close");

// モーダル要素 (Node Modal)
const nodeModal = document.getElementById("node-modal");
const nodeForm = document.getElementById("node-form");
const nodeParentSelect = document.getElementById("node-parent-select");
const typeCategory = document.getElementById("type-category");
const typeLeaf = document.getElementById("type-leaf");
const nodeFormTitle = document.getElementById("node-form-title");
const nodeLeafDetailsGroup = document.getElementById("node-leaf-details-group");
const nodeFormTextbook = document.getElementById("node-form-textbook");
const nodeFormProgress = document.getElementById("node-form-progress");
const nodeModalClose = document.getElementById("node-modal-close");
const nodeFormCancel = document.getElementById("node-form-cancel");

// モーダル要素 (Rename Modal)
const renameModal = document.getElementById("rename-modal");
const renameForm = document.getElementById("rename-form");
const renameNodeId = document.getElementById("rename-node-id");
const renameFormTitle = document.getElementById("rename-form-title");
const renameFormCancel = document.getElementById("rename-form-cancel");
const renameModalClose = document.getElementById("rename-modal-close");

// モーダル要素 (Study Timer Modal)
const timerModal = document.getElementById("timer-modal");
const timerModalClose = document.getElementById("timer-modal-close");
const timerNodePath = document.getElementById("timer-node-path");
const timerNodeTitle = document.getElementById("timer-node-title");
const timerClock = document.getElementById("timer-clock");
const timerSessionTime = document.getElementById("timer-session-time");
const timerAccumulatedTime = document.getElementById("timer-accumulated-time");
const timerStartBtn = document.getElementById("timer-start-btn");
const timerPauseBtn = document.getElementById("timer-pause-btn");
const timerResumeBtn = document.getElementById("timer-resume-btn");
const timerCancelBtn = document.getElementById("timer-cancel-btn");
const timerFinishBtn = document.getElementById("timer-finish-btn");
const timerRingContainer = document.querySelector(".timer-ring-container");

/* ==========================================
   INITIALIZATION & DATA LOADING
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  renderDashboard();
});

// ローカルストレージからデータ読み込み
function loadData() {
  const storedGoals = localStorage.getItem("questmap_goals");
  if (storedGoals) {
    try {
      goals = JSON.parse(storedGoals);
    } catch (e) {
      console.error("データの読み込みに失敗しました。デフォルトデータを使用します。", e);
      goals = [...DEFAULT_GOALS];
    }
  } else {
    // 初回起動時はデフォルトモックデータを設定
    goals = [...DEFAULT_GOALS];
    saveGoals();
  }
}

// ローカルストレージへ保存
function saveGoals() {
  localStorage.setItem("questmap_goals", JSON.stringify(goals));
}

/* ==========================================
   PROGRESS & TIME & DATE RECURSIVE CALCULATIONS
   ========================================== */

// 単一ノードの進捗率を再帰的に計算 (葉ノードの平均)
function calculateNodeProgress(node) {
  if (!node.children || node.children.length === 0) {
    return node.progress || 0;
  }
  let total = 0;
  for (const child of node.children) {
    total += calculateNodeProgress(child);
  }
  return Math.round(total / node.children.length);
}

// 目標全体の進捗率を計算 (ルート階層の平均)
function calculateGoalProgress(goal) {
  if (!goal.roadmap || goal.roadmap.length === 0) return 0;
  let total = 0;
  for (const node of goal.roadmap) {
    total += calculateNodeProgress(node);
  }
  return Math.round(total / goal.roadmap.length);
}

// 単一ノードの学習時間（秒数）を再帰的に集計
function calculateNodeStudyTime(node) {
  if (!node.children || node.children.length === 0) {
    return node.studyTime || 0;
  }
  let total = 0;
  for (const child of node.children) {
    total += calculateNodeStudyTime(child);
  }
  return total;
}

// 目標全体の学習時間（秒数）を集計
function calculateGoalStudyTime(goal) {
  if (!goal.roadmap || goal.roadmap.length === 0) return 0;
  let total = 0;
  for (const node of goal.roadmap) {
    total += calculateNodeStudyTime(node);
  }
  return total;
}

// ノード配下の最終勉強日時を再帰的に取得
function getLatestStudyDate(node) {
  if (!node.children || node.children.length === 0) {
    return node.lastStudied || null;
  }
  let latest = null;
  for (const child of node.children) {
    const childDate = getLatestStudyDate(child);
    if (childDate) {
      if (!latest || new Date(childDate) > new Date(latest)) {
        latest = childDate;
      }
    }
  }
  return latest;
}

// 目標配下の最終勉強日時を取得
function getGoalLatestStudyDate(goal) {
  if (!goal.roadmap || goal.roadmap.length === 0) return null;
  let latest = null;
  for (const node of goal.roadmap) {
    const nodeDate = getLatestStudyDate(node);
    if (nodeDate) {
      if (!latest || new Date(nodeDate) > new Date(latest)) {
        latest = nodeDate;
      }
    }
  }
  return latest;
}

// 葉ノードの総数と完了数（progress=100%）をカウント
function countLeafStats(list) {
  let total = 0;
  let completed = 0;
  
  function recurse(nodes) {
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        total++;
        if (node.progress === 100) {
          completed++;
        }
      } else {
        recurse(node.children);
      }
    }
  }
  
  recurse(list);
  return { total, completed };
}

// ツリー全体の探索ヘルパー
function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/* ==========================================
   FORMATTERS
   ========================================== */

// 日付表示フォーマット (YYYY-MM-DD -> YYYY/MM/DD)
function formatDateDisplay(dateStr) {
  if (!dateStr) return "--";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// 日時表示フォーマット (ISO/String -> MM/DD HH:mm)
function formatDateTimeDisplay(dateTimeStr) {
  if (!dateTimeStr) return "未学習";
  const date = new Date(dateTimeStr);
  if (isNaN(date.getTime())) return "未学習";
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

// datetime-localインプット用のフォーマット (YYYY-MM-DDTHH:mm)
function formatToDateTimeLocal(dateVal) {
  const d = dateVal ? new Date(dateVal) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 学習時間のテキスト表示変換 (秒数 -> 〇時間〇分)
function formatStudyTime(seconds) {
  if (!seconds || seconds <= 0) return "0分";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}時間${m}分`;
  }
  return `${m}分`;
}

// ストップウォッチフォーマット (秒数 -> HH:MM:SS)
function formatStopwatch(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// セッション学習時間フォーマット (秒数 -> 〇分〇秒)
function formatSessionStudyTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}分${String(s).padStart(2, '0')}秒`;
}

// ID生成用ヘルパー
function generateUniqueId() {
  return "id-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now().toString(36);
}

/* ==========================================
   NAVIGATION
   ========================================== */

function showView(viewId) {
  homeView.classList.remove("active");
  roadmapView.classList.remove("active");
  
  if (viewId === "home") {
    homeView.classList.add("active");
    renderDashboard();
  } else if (viewId === "roadmap") {
    roadmapView.classList.add("active");
    renderRoadmapDetails();
  }
}

/* ==========================================
   RENDERERS: DASHBOARD / HOME VIEW
   ========================================== */

function renderDashboard() {
  // グローバルスタッツの更新
  statActiveGoals.textContent = goals.length;
  
  let totalProgSum = 0;
  let globalLatestStudy = null;
  let totalStudySeconds = 0;
  
  goals.forEach(goal => {
    totalProgSum += calculateGoalProgress(goal);
    totalStudySeconds += calculateGoalStudyTime(goal);
    
    const goalLatest = getGoalLatestStudyDate(goal);
    if (goalLatest) {
      if (!globalLatestStudy || new Date(goalLatest) > new Date(globalLatestStudy)) {
        globalLatestStudy = goalLatest;
      }
    }
  });
  
  const avgProgress = goals.length > 0 ? Math.round(totalProgSum / goals.length) : 0;
  statTotalProgress.textContent = `${avgProgress}%`;
  statLastStudy.textContent = globalLatestStudy ? formatDateTimeDisplay(globalLatestStudy) : "記録なし";
  statTotalStudyTime.textContent = formatStudyTime(totalStudySeconds);

  // リストの描画
  goalsListContainer.innerHTML = "";
  
  if (goals.length === 0) {
    goalsEmptyState.classList.remove("hidden");
    return;
  }
  
  goalsEmptyState.classList.add("hidden");
  
  goals.forEach(goal => {
    const progress = calculateGoalProgress(goal);
    const studySeconds = calculateGoalStudyTime(goal);
    const stats = countLeafStats(goal.roadmap);
    const latestStudy = getGoalLatestStudyDate(goal);
    
    const card = document.createElement("div");
    card.className = "goal-card glass";
    card.dataset.id = goal.id;
    
    card.innerHTML = `
      <div>
        <div class="goal-card-header">
          <span class="badge ${progress === 100 ? 'badge-blue' : 'badge-purple'}">
            ${progress === 100 ? 'クリア' : '進行中'}
          </span>
          <div class="goal-deadline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            期限: ${formatDateDisplay(goal.targetDate)}
          </div>
        </div>
        <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
        <p class="goal-desc">${escapeHtml(goal.description || "説明はありません。")}</p>
      </div>
      
      <div class="goal-card-body">
        <div class="goal-progress-bar-container">
          <div class="progress-meta">
            <span>進捗状況 (${stats.completed}/${stats.total} 項目)</span>
            <span class="progress-percentage">${progress}%</span>
          </div>
          <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
      </div>
      
      <div class="goal-card-footer">
        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
          <span class="goal-deadline" style="font-weight: 500;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            学習時間: ${formatStudyTime(studySeconds)}
          </span>
          <span class="goal-deadline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            最終勉強: ${latestStudy ? formatDateTimeDisplay(latestStudy) : "未学習"}
          </span>
        </div>
        <button class="btn btn-primary btn-sm view-roadmap-btn" data-id="${goal.id}">
          ロードマップ表示
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    `;
    
    // カード全体クリックでもロードマップへ遷移（ボタン以外をクリックした場合）
    card.addEventListener("click", (e) => {
      if (!e.target.closest("button")) {
        currentGoalId = goal.id;
        showView("roadmap");
      }
    });
    
    goalsListContainer.appendChild(card);
  });
  
  // ボタン類のイベントバインド
  document.querySelectorAll(".view-roadmap-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentGoalId = btn.dataset.id;
      showView("roadmap");
    });
  });
}

/* ==========================================
   RENDERERS: ROADMAP TREE VIEW
   ========================================== */

function renderRoadmapDetails() {
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) {
    showView("home");
    return;
  }
  
  // ヘッダー情報とパンくずの更新
  goalBreadcrumbTitle.textContent = goal.title;
  detailGoalTitle.textContent = goal.title;
  detailGoalDesc.textContent = goal.description || "説明はありません。";
  detailGoalDate.textContent = formatDateDisplay(goal.targetDate);
  
  const progress = calculateGoalProgress(goal);
  const studySeconds = calculateGoalStudyTime(goal);
  
  detailGoalStatus.textContent = progress === 100 ? "クリア" : "進行中";
  detailGoalStatus.className = `badge ${progress === 100 ? 'badge-blue' : 'badge-purple'}`;
  detailGoalStudyTime.textContent = formatStudyTime(studySeconds);
  
  // 円形プログレスバーの更新
  detailProgressPercent.textContent = `${progress}%`;
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 約 251.2
  const offset = circumference - (progress / 100) * circumference;
  detailProgressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
  detailProgressCircle.style.strokeDashoffset = offset;
  
  // ロードマップツリーの描画
  roadmapTreeContainer.innerHTML = "";
  if (!goal.roadmap || goal.roadmap.length === 0) {
    roadmapTreeContainer.innerHTML = `
      <div class="empty-state">
        <p>この目標にはまだロードマップの項目がありません。「新しい分野・教材を追加」から分野を追加してください。</p>
      </div>
    `;
  } else {
    goal.roadmap.forEach((node, idx) => {
      roadmapTreeContainer.appendChild(createTreeNodeHTML(node, 1, [idx]));
    });
  }
  
  // サイドバー学習サマリーの描画
  renderProgressBreakdown(goal);
}

// ツリーノードのDOM生成（再帰）
function createTreeNodeHTML(node, level, pathIndices) {
  const hasChildren = node.children && node.children.length > 0;
  const computedProgress = calculateNodeProgress(node);
  const nodeStudySeconds = calculateNodeStudyTime(node);
  
  if (hasChildren) {
    // ------------------------------------------
    // カテゴリノード (Level 1 または Level 2)
    // ------------------------------------------
    const container = document.createElement("div");
    container.className = `tree-level-${level}`;
    container.id = `node-container-${node.id}`;
    
    const isExpanded = expandedNodes.has(node.id);
    
    const header = document.createElement("div");
    header.className = `node-header-${level} ${isExpanded ? 'expanded' : ''}`;
    header.innerHTML = `
      <div class="node-header-title-wrapper">
        <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span class="node-title-${level}">${escapeHtml(node.title)}</span>
        <span class="helper-text" style="margin-left:0.5rem; font-size:0.75rem;">(${formatStudyTime(nodeStudySeconds)})</span>
      </div>
      <div class="node-header-meta">
        <button class="btn btn-text add-child-node-btn-small" data-id="${node.id}" title="子要素（下位項目）を追加">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button class="btn btn-text rename-node-btn-small" data-id="${node.id}" title="項目名を変更">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <span class="node-progress-badge">${computedProgress}%</span>
        <button class="btn btn-text delete-node-btn-small" data-id="${node.id}" title="この分野を削除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    
    const content = document.createElement("div");
    content.className = `node-content-${level}`;
    if (isExpanded) {
      content.style.display = "flex";
    }
    
    // 子ノードのレンダリング
    node.children.forEach((childNode, cIdx) => {
      const childHTML = createTreeNodeHTML(childNode, level + 1, [...pathIndices, cIdx]);
      content.appendChild(childHTML);
    });
    
    // アコーディオン開閉イベント
    header.addEventListener("click", (e) => {
      // 各種アクションボタンのクリック時は開閉しない
      if (e.target.closest("button")) {
        return;
      }
      
      const isCurrentlyExpanded = header.classList.toggle("expanded");
      if (isCurrentlyExpanded) {
        content.style.display = "flex";
        expandedNodes.add(node.id);
      } else {
        content.style.display = "none";
        expandedNodes.delete(node.id);
      }
    });

    // 各アクションボタンの処理
    header.querySelector(".add-child-node-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      openNodeModal(node.id);
    });

    header.querySelector(".rename-node-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      openRenameModal(node.id);
    });

    header.querySelector(".delete-node-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      confirmAndDeleteNode(node.id);
    });
    
    container.appendChild(header);
    container.appendChild(content);
    return container;
    
  } else {
    // ------------------------------------------
    // 葉ノード (末端の勉強項目)
    // ------------------------------------------
    const leaf = document.createElement("div");
    leaf.className = "tree-level-3-leaf";
    leaf.dataset.id = node.id;
    
    const isCompleted = computedProgress === 100;
    
    leaf.innerHTML = `
      <div class="node-title-3">
        ${escapeHtml(node.title)}
        <span class="helper-text" style="font-size:0.75rem; margin-left:0.35rem; font-weight:normal;">(${formatStudyTime(node.studyTime || 0)})</span>
      </div>
      <div class="node-textbook" title="${escapeHtml(node.textbook || '教材未設定')}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        ${escapeHtml(node.textbook || "教材未設定")}
      </div>
      <div class="node-study-date ${node.lastStudied ? '' : 'not-studied'}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        ${node.lastStudied ? formatDateTimeDisplay(node.lastStudied) : "未学習"}
      </div>
      <div class="leaf-progress-column">
        <button class="btn btn-text start-study-btn-small" data-id="${node.id}" title="学習タイマーを起動して勉強を始める">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <button class="btn btn-text rename-node-btn-small" data-id="${node.id}" style="padding: 0; margin-left: 0.25rem;" title="項目名を変更">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <div class="leaf-progress-indicator-bar" style="margin-left: 0.5rem;">
          <div class="leaf-progress-indicator-fill ${isCompleted ? 'completed' : ''}" style="width: ${computedProgress}%"></div>
        </div>
        <span class="leaf-progress-val ${isCompleted ? 'completed' : ''}">${computedProgress}%</span>
        <button class="btn btn-text delete-node-btn-small" data-id="${node.id}" style="padding: 0; margin-left: 0.5rem;" title="この項目を削除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    
    // クリックで学習進捗モーダル表示
    leaf.addEventListener("click", (e) => {
      // アクションボタンクリック時はモーダルを開かない
      if (e.target.closest("button")) {
        return;
      }
      openLeafEditorModal(node.id, pathIndices);
    });

    // アクションイベントハンドラ
    leaf.querySelector(".start-study-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      openTimerModal(node.id, pathIndices);
    });

    leaf.querySelector(".rename-node-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      openRenameModal(node.id);
    });

    leaf.querySelector(".delete-node-btn-small").addEventListener("click", (e) => {
      e.stopPropagation();
      confirmAndDeleteNode(node.id);
    });
    
    return leaf;
  }
}

// 右側サイドバーの大項目進捗割合の描画
function renderProgressBreakdown(goal) {
  progressBreakdownContainer.innerHTML = "";
  if (!goal.roadmap || goal.roadmap.length === 0) {
    progressBreakdownContainer.innerHTML = `<p style="color: var(--text-dim); font-size: 0.8rem;">大項目がありません</p>`;
    return;
  }
  
  goal.roadmap.forEach(node => {
    const prog = calculateNodeProgress(node);
    const studySeconds = calculateNodeStudyTime(node);
    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.innerHTML = `
      <div class="breakdown-meta">
        <span class="breakdown-label" title="${escapeHtml(node.title)}">${escapeHtml(node.title)}</span>
        <span class="breakdown-value">${prog}% <span style="font-weight:normal; font-size:0.75rem; color:var(--text-muted);">(${formatStudyTime(studySeconds)})</span></span>
      </div>
      <div class="breakdown-bar">
        <div class="breakdown-fill" style="width: ${prog}%"></div>
      </div>
    `;
    progressBreakdownContainer.appendChild(item);
  });
}

/* ==========================================
   NODE DELETION HANDLER
   ========================================== */

function confirmAndDeleteNode(nodeId) {
  if (!confirm("本当にこの項目（およびその配下すべての項目）を削除してもよろしいですか？")) {
    return;
  }
  
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  function removeNodeFromTree(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1);
        return true;
      }
      if (nodes[i].children && nodes[i].children.length > 0) {
        const deleted = removeNodeFromTree(nodes[i].children, id);
        if (deleted) return true;
      }
    }
    return false;
  }
  
  removeNodeFromTree(goal.roadmap, nodeId);
  expandedNodes.delete(nodeId);
  saveGoals();
  renderRoadmapDetails();
}

/* ==========================================
   FORM & MODAL HANDLERS
   ========================================== */

// 1. Goal Modal (目標の追加・編集)
function openGoalModal(editId = null) {
  if (editId) {
    const goal = goals.find(g => g.id === editId);
    if (!goal) return;
    
    goalModalTitle.textContent = "目標を編集";
    goalFormId.value = goal.id;
    goalFormTitle.value = goal.title;
    goalFormDesc.value = goal.description || "";
    goalFormDate.value = goal.targetDate;
    
    templateSelectionGroup.classList.add("hidden");
    goalFormSubmit.textContent = "保存する";
  } else {
    goalModalTitle.textContent = "目標を新規登録";
    goalFormId.value = "";
    goalForm.reset();
    
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    goalFormDate.value = threeMonthsLater.toISOString().split("T")[0];
    
    templateSelectionGroup.classList.remove("hidden");
    goalFormSubmit.textContent = "登録する";
  }
  goalModal.classList.add("active");
}

function closeGoalModal() {
  goalModal.classList.remove("active");
}

// 2. Leaf Editor Modal (学習情報の更新)
function openLeafEditorModal(nodeId, pathIndices) {
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  let pathText = goal.title;
  let curr = goal.roadmap;
  let targetNode = null;
  
  for (let i = 0; i < pathIndices.length; i++) {
    const idx = pathIndices[i];
    const node = curr[idx];
    if (i < pathIndices.length - 1) {
      pathText += ` > ${node.title}`;
    }
    targetNode = node;
    curr = node.children;
  }
  
  if (!targetNode) return;
  
  leafNodePath.textContent = pathText;
  leafNodeTitle.textContent = targetNode.title;
  leafEditorNodeId.value = nodeId;
  leafEditorTextbook.value = targetNode.textbook || "";
  
  const progVal = targetNode.progress || 0;
  leafEditorProgress.value = progVal;
  leafSliderVal.textContent = `${progVal}%`;
  
  if (targetNode.lastStudied) {
    leafEditorDate.value = formatToDateTimeLocal(targetNode.lastStudied);
  } else {
    leafEditorDate.value = "";
  }
  
  leafEditorModal.classList.add("active");
}

function closeLeafEditorModal() {
  leafEditorModal.classList.remove("active");
}

// 3. Node Modal (ロードマップ分野の追加)
function openNodeModal(preselectedParentId = "root") {
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  nodeForm.reset();
  nodeParentSelect.innerHTML = "";
  
  const rootOpt = document.createElement("option");
  rootOpt.value = "root";
  rootOpt.textContent = "［最上位階層に追加（大項目）］";
  nodeParentSelect.appendChild(rootOpt);
  
  function populateSelect(nodes, depth = 0) {
    nodes.forEach(node => {
      if (node.children) {
        const opt = document.createElement("option");
        opt.value = node.id;
        const indent = "&nbsp;&nbsp;".repeat(depth);
        opt.innerHTML = `${indent}↳ ${escapeHtml(node.title)}`;
        nodeParentSelect.appendChild(opt);
        
        if (node.children.length > 0) {
          populateSelect(node.children, depth + 1);
        }
      }
    });
  }
  
  populateSelect(goal.roadmap);
  
  // 親ノードのデフォルト値設定（インライン「＋」押下時はそのIDを自動指定）
  nodeParentSelect.value = preselectedParentId;
  
  typeCategory.checked = true;
  nodeLeafDetailsGroup.classList.add("hidden");
  
  nodeModal.classList.add("active");
}

function closeNodeModal() {
  nodeModal.classList.remove("active");
}

// 4. Rename Modal (項目の名前変更)
function openRenameModal(nodeId) {
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  const node = findNodeById(goal.roadmap, nodeId);
  if (!node) return;
  
  renameNodeId.value = nodeId;
  renameFormTitle.value = node.title;
  renameModal.classList.add("active");
}

function closeRenameModal() {
  renameModal.classList.remove("active");
}

// 5. Study Timer Modal (学習タイマー)
function openTimerModal(nodeId, pathIndices) {
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  let pathText = goal.title;
  let curr = goal.roadmap;
  let targetNode = null;
  
  for (let i = 0; i < pathIndices.length; i++) {
    const idx = pathIndices[i];
    const node = curr[idx];
    if (i < pathIndices.length - 1) {
      pathText += ` > ${node.title}`;
    }
    targetNode = node;
    curr = node.children;
  }
  
  if (!targetNode) return;
  
  timerCurrentNodeId = nodeId;
  timerNodePath.textContent = pathText;
  timerNodeTitle.textContent = targetNode.title;
  
  // タイマー状態初期化
  timerSecondsElapsed = 0;
  timerState = "idle";
  
  timerClock.textContent = "00:00:00";
  timerSessionTime.textContent = "0分00秒";
  timerAccumulatedTime.textContent = formatStudyTime(targetNode.studyTime || 0);
  
  // ボタン類の表示リセット
  timerStartBtn.classList.remove("hidden");
  timerPauseBtn.classList.add("hidden");
  timerResumeBtn.classList.add("hidden");
  timerFinishBtn.disabled = true;
  timerRingContainer.classList.remove("active");
  
  timerModal.classList.add("active");
}

function closeTimerModal() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  timerRingContainer.classList.remove("active");
  timerModal.classList.remove("active");
}

/* ==========================================
   TIMER OPERATION LOGICS
   ========================================== */

function startStudyTimer() {
  timerState = "running";
  timerRingContainer.classList.add("active");
  
  timerStartBtn.classList.add("hidden");
  timerPauseBtn.classList.remove("hidden");
  timerResumeBtn.classList.add("hidden");
  timerFinishBtn.disabled = false;
  
  timerIntervalId = setInterval(() => {
    timerSecondsElapsed++;
    timerClock.textContent = formatStopwatch(timerSecondsElapsed);
    timerSessionTime.textContent = formatSessionStudyTime(timerSecondsElapsed);
  }, 1000);
}

function pauseStudyTimer() {
  timerState = "paused";
  timerRingContainer.classList.remove("active");
  
  timerStartBtn.classList.add("hidden");
  timerPauseBtn.classList.add("hidden");
  timerResumeBtn.classList.remove("hidden");
  
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function resumeStudyTimer() {
  timerState = "running";
  timerRingContainer.classList.add("active");
  
  timerStartBtn.classList.add("hidden");
  timerPauseBtn.classList.remove("hidden");
  timerResumeBtn.classList.add("hidden");
  
  timerIntervalId = setInterval(() => {
    timerSecondsElapsed++;
    timerClock.textContent = formatStopwatch(timerSecondsElapsed);
    timerSessionTime.textContent = formatSessionStudyTime(timerSecondsElapsed);
  }, 1000);
}

function finishStudyTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
  
  const goal = goals.find(g => g.id === currentGoalId);
  if (!goal) return;
  
  const node = findNodeById(goal.roadmap, timerCurrentNodeId);
  if (node) {
    // 累計学習時間を加算
    node.studyTime = (node.studyTime || 0) + timerSecondsElapsed;
    // 最終勉強日時を更新
    node.lastStudied = new Date().toISOString();
    
    saveGoals();
  }
  
  closeTimerModal();
  renderRoadmapDetails();
}

function cancelStudyTimer() {
  if (timerSecondsElapsed > 0) {
    if (!confirm("計測中の学習時間は保存されません。タイマーを終了してもよろしいですか？")) {
      return;
    }
  }
  closeTimerModal();
}

/* ==========================================
   EVENT LISTENERS Setup
   ========================================== */

function setupEventListeners() {
  // ロゴクリックでホームに戻る
  headerLogo.addEventListener("click", () => showView("home"));
  
  // 戻るボタン
  backToHomeBtn.addEventListener("click", () => showView("home"));
  
  // 目標新規追加ボタン
  addGoalBtnHeader.addEventListener("click", () => openGoalModal());
  addGoalBtnEmpty.addEventListener("click", () => openGoalModal());
  
  // 目標の編集・削除
  editGoalBtn.addEventListener("click", () => {
    if (currentGoalId) openGoalModal(currentGoalId);
  });
  
  deleteGoalBtn.addEventListener("click", () => {
    if (!currentGoalId) return;
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;
    
    if (confirm(`目標「${goal.title}」を削除しますか？\n登録した学習記録もすべて消去されます。`)) {
      goals = goals.filter(g => g.id !== currentGoalId);
      saveGoals();
      showView("home");
    }
  });
  
  // ロードマップ分野追加
  addNodeBtn.addEventListener("click", () => openNodeModal());
  
  // モーダル閉じるアクション
  goalModalClose.addEventListener("click", closeGoalModal);
  goalFormCancel.addEventListener("click", closeGoalModal);
  
  leafEditorClose.addEventListener("click", closeLeafEditorModal);
  leafEditorCancel.addEventListener("click", closeLeafEditorModal);
  
  nodeModalClose.addEventListener("click", closeNodeModal);
  nodeFormCancel.addEventListener("click", closeNodeModal);

  renameModalClose.addEventListener("click", closeRenameModal);
  renameFormCancel.addEventListener("click", closeRenameModal);

  timerModalClose.addEventListener("click", cancelStudyTimer);
  
  // クリック以外でオーバーレイ部分を押したときにも閉じる
  window.addEventListener("click", (e) => {
    if (e.target === goalModal) closeGoalModal();
    if (e.target === leafEditorModal) closeLeafEditorModal();
    if (e.target === nodeModal) closeNodeModal();
    if (e.target === renameModal) closeRenameModal();
    if (e.target === timerModal) cancelStudyTimer();
  });
  
  // 葉ノード進捗スライダーの値変更追従
  leafEditorProgress.addEventListener("input", (e) => {
    leafSliderVal.textContent = `${e.target.value}%`;
  });
  
  // 葉ノードスライダープリセットボタン
  document.querySelectorAll(".btn-outline-preset").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const val = btn.dataset.val;
      leafEditorProgress.value = val;
      leafSliderVal.textContent = `${val}%`;
    });
  });
  
  // 「今勉強した！」クイック入力ボタン
  leafQuickDateBtn.addEventListener("click", () => {
    leafEditorDate.value = formatToDateTimeLocal(new Date());
  });
  
  // ノード追加時のラジオボタン制御
  document.getElementsByName("node_type").forEach(radio => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "leaf") {
        nodeLeafDetailsGroup.classList.remove("hidden");
      } else {
        nodeLeafDetailsGroup.classList.add("hidden");
      }
    });
  });

  // ストップウォッチタイマー制御ボタン
  timerStartBtn.addEventListener("click", startStudyTimer);
  timerPauseBtn.addEventListener("click", pauseStudyTimer);
  timerResumeBtn.addEventListener("click", resumeStudyTimer);
  timerFinishBtn.addEventListener("click", finishStudyTimer);
  timerCancelBtn.addEventListener("click", cancelStudyTimer);
  
  // ==========================================
  // FORM SUBMIT HANDLERS
  // ==========================================
  
  // A. Goal Form (目標追加・編集)
  goalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = goalFormId.value;
    const title = goalFormTitle.value.trim();
    const desc = goalFormDesc.value.trim();
    const date = goalFormDate.value;
    
    if (id) {
      // 更新処理
      const goal = goals.find(g => g.id === id);
      if (goal) {
        goal.title = title;
        goal.description = desc;
        goal.targetDate = date;
      }
    } else {
      // 新規登録処理
      const templateType = goalFormTemplate.value;
      const templateData = ROADMAP_TEMPLATES[templateType];
      
      const newGoal = {
        id: generateUniqueId(),
        title: title,
        description: desc,
        targetDate: date,
        createdAt: new Date().toISOString(),
        roadmap: JSON.parse(JSON.stringify(templateData.roadmap))
      };
      
      goals.push(newGoal);
    }
    
    saveGoals();
    closeGoalModal();
    
    if (id === currentGoalId) {
      renderRoadmapDetails();
    } else {
      renderDashboard();
    }
  });
  
  // B. Leaf Editor Form (学習進捗更新)
  leafEditorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nodeId = leafEditorNodeId.value;
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;
    
    function updateLeafNode(nodes) {
      for (const node of nodes) {
        if (node.id === nodeId) {
          node.textbook = leafEditorTextbook.value.trim();
          node.progress = parseInt(leafEditorProgress.value, 10);
          node.lastStudied = leafEditorDate.value ? new Date(leafEditorDate.value).toISOString() : null;
          return true;
        }
        if (node.children && node.children.length > 0) {
          const updated = updateLeafNode(node.children);
          if (updated) return true;
        }
      }
      return false;
    }
    
    updateLeafNode(goal.roadmap);
    saveGoals();
    closeLeafEditorModal();
    renderRoadmapDetails();
  });
  
  // C. Custom Node Add Form (ノード追加)
  nodeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;
    
    const parentId = nodeParentSelect.value;
    const isLeaf = typeLeaf.checked;
    const title = nodeFormTitle.value.trim();
    
    const newNode = {
      id: generateUniqueId(),
      title: title
    };
    
    if (isLeaf) {
      newNode.textbook = nodeFormTextbook.value.trim();
      newNode.progress = parseInt(nodeFormProgress.value, 10) || 0;
      newNode.studyTime = 0;
      newNode.lastStudied = null;
    } else {
      newNode.children = [];
    }
    
    if (parentId === "root") {
      goal.roadmap.push(newNode);
    } else {
      function appendToParent(nodes) {
        for (const node of nodes) {
          if (node.id === parentId) {
            if (!node.children) {
              node.children = [];
            }
            node.children.push(newNode);
            expandedNodes.add(parentId);
            return true;
          }
          if (node.children && node.children.length > 0) {
            const added = appendToParent(node.children);
            if (added) return true;
          }
        }
        return false;
      }
      appendToParent(goal.roadmap);
    }
    
    saveGoals();
    closeNodeModal();
    renderRoadmapDetails();
  });

  // D. Rename Form (ノード名編集)
  renameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nodeId = renameNodeId.value;
    const newTitle = renameFormTitle.value.trim();
    const goal = goals.find(g => g.id === currentGoalId);
    if (!goal) return;

    const node = findNodeById(goal.roadmap, nodeId);
    if (node) {
      node.title = newTitle;
      saveGoals();
    }

    closeRenameModal();
    renderRoadmapDetails();
  });
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

// HTMLエスケープ処理（セキュリティ用）
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
