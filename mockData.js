/**
 * 資格試験のロードマップテンプレート定義
 * 各項目は初期状態（進捗0%、学習時間0、最終勉強日時なし）で定義され、
 * ユーザーが目標を新規登録した際にまっさらな状態でスタートできます。
 */
const ROADMAP_TEMPLATES = {
  statistics_pre1: {
    title: "統計検定準一級",
    description: "データ解析の基礎から発展的な統計モデリング、機械学習の基礎までを体系的に修得します。",
    roadmap: [
      {
        id: "stat-1",
        title: "1. 確率と確率分布",
        children: [
          {
            id: "stat-1-1",
            title: "確率の基礎と確率変数",
            children: [
              {
                id: "stat-1-1-1",
                title: "確率の定義と条件付き確率・ベイズの定理",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-1-1-2",
                title: "離散型・連続型確率変数と確率分布",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-1-1-3",
                title: "期待値、分散、モーメント母関数",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "stat-1-2",
            title: "多次元の確率変数",
            children: [
              {
                id: "stat-1-2-1",
                title: "同時確率分布と周辺確率分布",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-1-2-2",
                title: "共分散、相関係数、条件付き分布",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      },
      {
        id: "stat-2",
        title: "2. 統計的推測",
        children: [
          {
            id: "stat-2-1",
            title: "パラメータの推定",
            children: [
              {
                id: "stat-2-1-1",
                title: "点推定（最尤法・最小二乗法・統計量の性質）",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-2-1-2",
                title: "区間推定（母平均・母分散の信頼区間）",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "stat-2-2",
            title: "仮説検定",
            children: [
              {
                id: "stat-2-2-1",
                title: "検定の基礎（第1種・第2種の誤り、検出力）",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-2-2-2",
                title: "様々な検定（t検定、F検定、カイ二乗検定）",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      },
      {
        id: "stat-3",
        title: "3. 多変数解析・統計モデリング",
        children: [
          {
            id: "stat-3-1",
            title: "回帰分析",
            children: [
              {
                id: "stat-3-1-1",
                title: "重回帰分析とモデル評価（決定係数、AIC）",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-3-1-2",
                title: "ロジスティック回帰分析・一般化線形モデル",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "stat-3-2",
            title: "分類とクラスタリング",
            children: [
              {
                id: "stat-3-2-1",
                title: "主成分分析（PCA）と因子分析",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "stat-3-2-2",
                title: "判別分析、サポートベクトルマシン、k-means",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      },
      {
        id: "stat-4",
        title: "4. 様々な応用分野",
        children: [
          {
            id: "stat-4-1",
            title: "時系列解析",
            children: [
              {
                id: "stat-4-1-1",
                title: "AR・MA・ARIMAモデルの基礎",
                textbook: "時系列解析入門",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "stat-4-2",
            title: "マルコフ連鎖とMCMC",
            children: [
              {
                id: "stat-4-2-1",
                title: "マルコフ過程とギブスサンプリング",
                textbook: "統計学実践ワークブック",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      }
    ]
  },
  fundamental_it: {
    title: "基本情報技術者試験",
    description: "ITエンジニアとしての基本知識（アルゴリズム、プログラミング、ネットワーク、セキュリティ、データベース）を網羅的に習得します。",
    roadmap: [
      {
        id: "it-1",
        title: "1. テクノロジ系",
        children: [
          {
            id: "it-1-1",
            title: "基礎理論とコンピュータ構成要素",
            children: [
              {
                id: "it-1-1-1",
                title: "2進数、論理演算、データ構造",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "it-1-1-2",
                title: "CPU、メモリ、ストレージ of 仕組み",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "it-1-2",
            title: "技術要素",
            children: [
              {
                id: "it-1-2-1",
                title: "データベース（SQL、正規化、トランザクション）",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "it-1-2-2",
                title: "ネットワーク（TCP/IP、プロトコル、IPアドレス）",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              },
              {
                id: "it-1-2-3",
                title: "セキュリティ（暗号化、サイバー攻撃、認証）",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "it-1-3",
            title: "開発技術",
            children: [
              {
                id: "it-1-3-1",
                title: "アルゴリズムとプログラム設計（ソート、探索など）",
                textbook: "基本情報技術者 アルゴリズム学習書",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      },
      {
        id: "it-2",
        title: "2. マネジメント系 / ストラテジ系",
        children: [
          {
            id: "it-2-1",
            title: "プロジェクトマネジメント",
            children: [
              {
                id: "it-2-1-1",
                title: "開発プロセス、工数管理（アジャイル・ウォーターフォール）",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          },
          {
            id: "it-2-2",
            title: "システム戦略と経営戦略",
            children: [
              {
                id: "it-2-2-1",
                title: "関係法規、財務、システム監査",
                textbook: "基本情報技術者 合格教本",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      }
    ]
  },
  custom_goal: {
    title: "カスタム目標",
    description: "独自の勉強スケジュールとロードマップを登録して進捗を管理します。",
    roadmap: [
      {
        id: "custom-1",
        title: "第1ステップ",
        children: [
          {
            id: "custom-1-1",
            title: "基本項目",
            children: [
              {
                id: "custom-1-1-1",
                title: "具体的な勉強内容",
                textbook: "参考書名を入力してください",
                progress: 0,
                lastStudied: null,
                studyTime: 0
              }
            ]
          }
        ]
      }
    ]
  }
};

/**
 * デモ用目標データ（例として必要な場合に使用可能）
 */
const DEFAULT_GOALS = [];

// ブラウザ環境とNode環境の両方に対応できるようにする
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROADMAP_TEMPLATES, DEFAULT_GOALS };
}
