'use strict';

// ══════════════════════════════════════════════════════════════════
// Supabase 初期化 (失敗してもゲームは動く)
// ══════════════════════════════════════════════════════════════════
let _sbBoki = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    _sbBoki = supabase.createClient(
      'https://pohpqzygftltbinrtqnm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvaHBxenlnZnRsdGJpbnJ0cW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzY4NzEsImV4cCI6MjA5MTIxMjg3MX0.MQWYswSHRfRti9jdQ2KgAQ0Bh9xlSXEpx1RCM_TRy8Q'
    );
  }
} catch(e) { console.warn('Supabase init skipped:', e.message); }

// ══════════════════════════════════════════════════════════════════
// クエストデータ（全15クエスト）
// ══════════════════════════════════════════════════════════════════
const QUESTS = [
  // ──── 初級 ────
  {
    id: 1,
    title: '開業の朝',
    difficulty: 'beginner',
    timeLimit: 300,
    transactions: [
      {
        scenario: '現金 ¥5,000,000 を元手に会社を設立した',
        hint: '借方：資産の増加（現金）、貸方：純資産の発生（資本金）',
        answer: [
          { debit: '現金', debitAmount: 5000000, credit: '資本金', creditAmount: 5000000 }
        ],
        explanation: '会社設立時に現金を受け取る → 現金（資産）増加（借方）、資本金（純資産）発生（貸方）'
      },
      {
        scenario: '事務所の家賃 1ヶ月分 ¥150,000 を現金で前払いした',
        hint: '借方：前払金（資産）、貸方：現金の減少',
        answer: [
          { debit: '前払金', debitAmount: 150000, credit: '現金', creditAmount: 150000 }
        ],
        explanation: '前払いの家賃は費用ではなく「前払金（資産）」として記録する'
      },
      {
        scenario: 'パソコン ¥120,000 を現金で購入した',
        hint: '工具器具備品は固定資産（借方）、代金を現金で払った（貸方）',
        answer: [
          { debit: '工具器具備品', debitAmount: 120000, credit: '現金', creditAmount: 120000 }
        ],
        explanation: 'パソコンなどの備品は固定資産「工具器具備品」で記録する'
      },
      {
        scenario: '事務用品（消耗品） ¥8,000 を現金で購入した',
        hint: '備品・消耗品費は費用（借方）、現金で払った（貸方）',
        answer: [
          { debit: '備品・消耗品費', debitAmount: 8000, credit: '現金', creditAmount: 8000 }
        ],
        explanation: '消耗品は「備品・消耗品費（費用）」として即時費用計上する'
      },
      {
        scenario: '銀行から短期で ¥1,000,000 を借り入れ、当座預金に入金された',
        hint: '借方：当座預金（資産）増加、貸方：短期借入金（負債）発生',
        answer: [
          { debit: '当座預金', debitAmount: 1000000, credit: '短期借入金', creditAmount: 1000000 }
        ],
        explanation: '短期借入は「短期借入金（負債）」として貸方に記録する'
      }
    ]
  },
  {
    id: 2,
    title: '初めての売上高',
    difficulty: 'beginner',
    timeLimit: 300,
    transactions: [
      {
        scenario: '商品 ¥300,000 を現金で販売した',
        hint: '借方：現金（資産）増加、貸方：売上高（収益）発生',
        answer: [
          { debit: '現金', debitAmount: 300000, credit: '売上高', creditAmount: 300000 }
        ],
        explanation: '売上は「売上高（収益）」として貸方に記録する'
      },
      {
        scenario: '商品 ¥120,000 を現金で仕入れた',
        hint: '借方：仕入高（費用）発生、貸方：現金（資産）減少',
        answer: [
          { debit: '仕入高', debitAmount: 120000, credit: '現金', creditAmount: 120000 }
        ],
        explanation: '商品の仕入れは「仕入高（費用）」として借方に記録する'
      },
      {
        scenario: '交通費 ¥5,000 を現金で支払った',
        hint: '借方：雑費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '雑費', debitAmount: 5000, credit: '現金', creditAmount: 5000 }
        ],
        explanation: '交通費などの雑多な費用は「雑費」として記録する'
      },
      {
        scenario: '水道光熱費 ¥22,000 を現金で支払った',
        hint: '借方：水道光熱費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '水道光熱費', debitAmount: 22000, credit: '現金', creditAmount: 22000 }
        ],
        explanation: '電気・ガス・水道代は「水道光熱費（費用）」として記録する'
      },
      {
        scenario: '通信費 ¥8,000 を現金で支払った',
        hint: '借方：通信費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '通信費', debitAmount: 8000, credit: '現金', creditAmount: 8000 }
        ],
        explanation: '電話・インターネット代は「通信費（費用）」として記録する'
      }
    ]
  },
  {
    id: 3,
    title: '給料日',
    difficulty: 'beginner',
    timeLimit: 300,
    transactions: [
      {
        scenario: '従業員の給料 ¥250,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）発生、貸方：普通預金（資産）減少',
        answer: [
          { debit: '給料賃金', debitAmount: 250000, credit: '普通預金', creditAmount: 250000 }
        ],
        explanation: '給料は「給料賃金（費用）」として借方に、普通預金から支払うので貸方に記録する'
      },
      {
        scenario: '消耗品 ¥15,000 を現金で購入した',
        hint: '借方：備品・消耗品費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '備品・消耗品費', debitAmount: 15000, credit: '現金', creditAmount: 15000 }
        ],
        explanation: '消耗品は即時費用計上する'
      },
      {
        scenario: '商品 ¥200,000 を現金で仕入れた',
        hint: '借方：仕入高（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '仕入高', debitAmount: 200000, credit: '現金', creditAmount: 200000 }
        ],
        explanation: '商品の仕入れは「仕入高（費用）」として記録する'
      },
      {
        scenario: '商品 ¥350,000 を現金で販売した',
        hint: '借方：現金（資産）増加、貸方：売上高（収益）発生',
        answer: [
          { debit: '現金', debitAmount: 350000, credit: '売上高', creditAmount: 350000 }
        ],
        explanation: '現金売上は「売上高（収益）」として貸方に記録する'
      },
      {
        scenario: '支払利息 ¥10,000 を現金で支払った',
        hint: '借方：支払利息（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '支払利息', debitAmount: 10000, credit: '現金', creditAmount: 10000 }
        ],
        explanation: '短期借入金の利息は「支払利息（費用）」として記録する'
      }
    ]
  },
  {
    id: 4,
    title: '経費の日',
    difficulty: 'beginner',
    timeLimit: 300,
    transactions: [
      {
        scenario: '水道光熱費 ¥18,000 を当座預金から支払った',
        hint: '借方：水道光熱費（費用）、貸方：当座預金（資産）減少',
        answer: [
          { debit: '水道光熱費', debitAmount: 18000, credit: '当座預金', creditAmount: 18000 }
        ],
        explanation: '当座預金から支払った場合、貸方は「当座預金」となる'
      },
      {
        scenario: '通信費 ¥12,000 を当座預金から支払った',
        hint: '借方：通信費（費用）、貸方：当座預金（資産）減少',
        answer: [
          { debit: '通信費', debitAmount: 12000, credit: '当座預金', creditAmount: 12000 }
        ],
        explanation: '通信費は「通信費（費用）」として記録する'
      },
      {
        scenario: '雑費 ¥3,500 を現金で支払った',
        hint: '借方：雑費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '雑費', debitAmount: 3500, credit: '現金', creditAmount: 3500 }
        ],
        explanation: '細かい費用は「雑費（費用）」としてまとめて記録する'
      },
      {
        scenario: '受取利息 ¥2,000 が普通預金に入金された',
        hint: '借方：普通預金（資産）増加、貸方：受取利息（収益）発生',
        answer: [
          { debit: '普通預金', debitAmount: 2000, credit: '受取利息', creditAmount: 2000 }
        ],
        explanation: '利息収入は「受取利息（収益）」として貸方に記録する'
      },
      {
        scenario: '備品・消耗品費 ¥6,000 を現金で支払った',
        hint: '借方：備品・消耗品費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '備品・消耗品費', debitAmount: 6000, credit: '現金', creditAmount: 6000 }
        ],
        explanation: '消耗品は即時費用計上する'
      }
    ]
  },
  {
    id: 5,
    title: '月末締め',
    difficulty: 'beginner',
    timeLimit: 300,
    transactions: [
      {
        scenario: '商品 ¥500,000 を現金で販売した',
        hint: '借方：現金（資産）増加、貸方：売上高（収益）発生',
        answer: [
          { debit: '現金', debitAmount: 500000, credit: '売上高', creditAmount: 500000 }
        ],
        explanation: '現金売上は現金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '商品 ¥200,000 を現金で仕入れた',
        hint: '借方：仕入高（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '仕入高', debitAmount: 200000, credit: '現金', creditAmount: 200000 }
        ],
        explanation: '現金仕入は仕入高（借方）と現金（貸方）で記録する'
      },
      {
        scenario: '給料 ¥300,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）、貸方：普通預金（資産）減少',
        answer: [
          { debit: '給料賃金', debitAmount: 300000, credit: '普通預金', creditAmount: 300000 }
        ],
        explanation: '給料支払いは給料賃金（借方）と普通預金（貸方）で記録する'
      },
      {
        scenario: '水道光熱費 ¥20,000 を現金で支払った',
        hint: '借方：水道光熱費（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '水道光熱費', debitAmount: 20000, credit: '現金', creditAmount: 20000 }
        ],
        explanation: '水道光熱費は費用として借方に記録する'
      },
      {
        scenario: '支払利息 ¥8,000 を現金で支払った',
        hint: '借方：支払利息（費用）、貸方：現金（資産）減少',
        answer: [
          { debit: '支払利息', debitAmount: 8000, credit: '現金', creditAmount: 8000 }
        ],
        explanation: '支払利息は費用として借方に記録する'
      }
    ]
  },

  // ──── 中級 ────
  {
    id: 6,
    title: '掛け取引',
    difficulty: 'intermediate',
    timeLimit: 360,
    transactions: [
      {
        scenario: '商品 ¥400,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 400000, credit: '売上高', creditAmount: 400000 }
        ],
        explanation: '掛け販売では「売掛金（資産）」で代金を後で受け取る権利を記録する'
      },
      {
        scenario: '商品 ¥180,000 を掛けで仕入れた',
        hint: '借方：仕入高（費用）、貸方：買掛金（負債）',
        answer: [
          { debit: '仕入高', debitAmount: 180000, credit: '買掛金', creditAmount: 180000 }
        ],
        explanation: '掛け仕入では「買掛金（負債）」で代金を後で払う義務を記録する'
      },
      {
        scenario: '売掛金 ¥400,000 を現金で回収した',
        hint: '借方：現金（資産）増加、貸方：売掛金（資産）減少',
        answer: [
          { debit: '現金', debitAmount: 400000, credit: '売掛金', creditAmount: 400000 }
        ],
        explanation: '売掛金の回収は現金（借方）と売掛金（貸方）で記録する'
      },
      {
        scenario: '買掛金 ¥180,000 を当座預金で支払った',
        hint: '借方：買掛金（負債）減少、貸方：当座預金（資産）減少',
        answer: [
          { debit: '買掛金', debitAmount: 180000, credit: '当座預金', creditAmount: 180000 }
        ],
        explanation: '買掛金の支払いは買掛金（借方）と当座預金（貸方）で記録する'
      },
      {
        scenario: '商品 ¥250,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 250000, credit: '売上高', creditAmount: 250000 }
        ],
        explanation: '掛け販売では「売掛金（資産）」として記録する'
      },
      {
        scenario: '備品・消耗品費 ¥9,000 を現金で支払った',
        hint: '借方：備品・消耗品費（費用）、貸方：現金（資産）',
        answer: [
          { debit: '備品・消耗品費', debitAmount: 9000, credit: '現金', creditAmount: 9000 }
        ],
        explanation: '備品・消耗品費は即時費用計上する'
      }
    ]
  },
  {
    id: 7,
    title: '前払い・未払い',
    difficulty: 'intermediate',
    timeLimit: 360,
    transactions: [
      {
        scenario: '来月分の家賃 ¥150,000 を現金で前払いした',
        hint: '借方：前払金（資産）、貸方：現金（資産）減少',
        answer: [
          { debit: '前払金', debitAmount: 150000, credit: '現金', creditAmount: 150000 }
        ],
        explanation: '将来の費用の前払いは「前払金（資産）」として記録する'
      },
      {
        scenario: '今月の給料 ¥280,000 がまだ未払いである（計上のみ）',
        hint: '借方：給料賃金（費用）、貸方：未払費用（負債）',
        answer: [
          { debit: '給料賃金', debitAmount: 280000, credit: '未払費用', creditAmount: 280000 }
        ],
        explanation: '支払っていない費用は「未払費用（負債）」として貸方に記録する'
      },
      {
        scenario: '前払いした家賃 ¥150,000 の効果が当月に発生した（費用に振替）',
        hint: '借方：地代家賃（費用）、貸方：前払金（資産）減少',
        answer: [
          { debit: '地代家賃', debitAmount: 150000, credit: '前払金', creditAmount: 150000 }
        ],
        explanation: '前払金の効果発生時は地代家賃（借方）と前払金（貸方）で振り替える'
      },
      {
        scenario: '未払い給料 ¥280,000 を普通預金から支払った',
        hint: '借方：未払費用（負債）減少、貸方：普通預金（資産）減少',
        answer: [
          { debit: '未払費用', debitAmount: 280000, credit: '普通預金', creditAmount: 280000 }
        ],
        explanation: '未払費用の支払いは未払費用（借方）と普通預金（貸方）で記録する'
      },
      {
        scenario: '商品 ¥320,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 320000, credit: '売上高', creditAmount: 320000 }
        ],
        explanation: '掛け販売は売掛金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '通信費 ¥11,000 を現金で支払った',
        hint: '借方：通信費（費用）、貸方：現金（資産）',
        answer: [
          { debit: '通信費', debitAmount: 11000, credit: '現金', creditAmount: 11000 }
        ],
        explanation: '通信費は費用として借方に記録する'
      }
    ]
  },
  {
    id: 8,
    title: '借入と返済',
    difficulty: 'intermediate',
    timeLimit: 360,
    transactions: [
      {
        scenario: '銀行から ¥2,000,000 を借り入れ、普通預金に入金された',
        hint: '借方：普通預金（資産）増加、貸方：長期借入金（負債）発生',
        answer: [
          { debit: '普通預金', debitAmount: 2000000, credit: '長期借入金', creditAmount: 2000000 }
        ],
        explanation: '長期借入は「長期借入金（負債）」として貸方に記録する'
      },
      {
        scenario: '長期借入金 ¥500,000 を普通預金から返済した',
        hint: '借方：長期借入金（負債）減少、貸方：普通預金（資産）減少',
        answer: [
          { debit: '長期借入金', debitAmount: 500000, credit: '普通預金', creditAmount: 500000 }
        ],
        explanation: '長期借入金の返済は長期借入金（借方）と普通預金（貸方）で記録する'
      },
      {
        scenario: '支払利息 ¥15,000 を現金で支払った',
        hint: '借方：支払利息（費用）、貸方：現金（資産）',
        answer: [
          { debit: '支払利息', debitAmount: 15000, credit: '現金', creditAmount: 15000 }
        ],
        explanation: '長期借入金の利息は「支払利息（費用）」として記録する'
      },
      {
        scenario: '商品 ¥600,000 を現金で販売した',
        hint: '借方：現金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '現金', debitAmount: 600000, credit: '売上高', creditAmount: 600000 }
        ],
        explanation: '現金売上は現金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '商品 ¥250,000 を掛けで仕入れた',
        hint: '借方：仕入高（費用）、貸方：買掛金（負債）',
        answer: [
          { debit: '仕入高', debitAmount: 250000, credit: '買掛金', creditAmount: 250000 }
        ],
        explanation: '掛け仕入は仕入高（借方）と買掛金（貸方）で記録する'
      },
      {
        scenario: '買掛金 ¥250,000 を普通預金で支払った',
        hint: '借方：買掛金（負債）減少、貸方：普通預金（資産）',
        answer: [
          { debit: '買掛金', debitAmount: 250000, credit: '普通預金', creditAmount: 250000 }
        ],
        explanation: '買掛金の支払いは買掛金（借方）と普通預金（貸方）で記録する'
      }
    ]
  },
  {
    id: 9,
    title: '消費税の処理',
    difficulty: 'intermediate',
    timeLimit: 420,
    transactions: [
      {
        scenario: '商品 ¥440,000（税込10%）を現金で販売した',
        hint: '現金440,000（借方）/ 売上高400,000 + 仮受消費税40,000（貸方）の複合仕訳',
        answer: [
          { debit: '現金', debitAmount: 440000, credit: '売上高', creditAmount: 400000 },
          { debit: null, debitAmount: null, credit: '仮受消費税', creditAmount: 40000 }
        ],
        explanation: '税込売上は売上高（税抜）と仮受消費税（負債）に分けて記録する。440,000÷1.1=400,000が税抜価格'
      },
      {
        scenario: '商品 ¥220,000（税込10%）を現金で仕入れた',
        hint: '仕入高200,000 + 仮払消費税20,000（借方）/ 現金220,000（貸方）の複合仕訳',
        answer: [
          { debit: '仕入高', debitAmount: 200000, credit: '現金', creditAmount: 220000 },
          { debit: '仮払消費税', debitAmount: 20000, credit: null, creditAmount: null }
        ],
        explanation: '税込仕入は仕入高（税抜）と仮払消費税（資産）に分けて記録する'
      },
      {
        scenario: '商品 ¥330,000（税込10%）を掛けで販売した',
        hint: '売掛金330,000（借方）/ 売上高300,000 + 仮受消費税30,000（貸方）の複合仕訳',
        answer: [
          { debit: '売掛金', debitAmount: 330000, credit: '売上高', creditAmount: 300000 },
          { debit: null, debitAmount: null, credit: '仮受消費税', creditAmount: 30000 }
        ],
        explanation: '掛け売上の場合も消費税を分けて記録する'
      },
      {
        scenario: '商品 ¥110,000（税込10%）を掛けで仕入れた',
        hint: '仕入高100,000 + 仮払消費税10,000（借方）/ 買掛金110,000（貸方）の複合仕訳',
        answer: [
          { debit: '仕入高', debitAmount: 100000, credit: '買掛金', creditAmount: 110000 },
          { debit: '仮払消費税', debitAmount: 10000, credit: null, creditAmount: null }
        ],
        explanation: '掛け仕入の場合も消費税を分けて記録する'
      },
      {
        scenario: '給料 ¥250,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）、貸方：普通預金（資産）',
        answer: [
          { debit: '給料賃金', debitAmount: 250000, credit: '普通預金', creditAmount: 250000 }
        ],
        explanation: '給料は消費税の対象外（非課税）なので通常の仕訳となる'
      }
    ]
  },
  {
    id: 10,
    title: '総合演習',
    difficulty: 'intermediate',
    timeLimit: 420,
    transactions: [
      {
        scenario: '商品 ¥500,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 500000, credit: '売上高', creditAmount: 500000 }
        ],
        explanation: '掛け販売は売掛金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '商品 ¥200,000 を掛けで仕入れた',
        hint: '借方：仕入高（費用）、貸方：買掛金（負債）',
        answer: [
          { debit: '仕入高', debitAmount: 200000, credit: '買掛金', creditAmount: 200000 }
        ],
        explanation: '掛け仕入は仕入高（借方）と買掛金（貸方）で記録する'
      },
      {
        scenario: '給料 ¥300,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）、貸方：普通預金（資産）',
        answer: [
          { debit: '給料賃金', debitAmount: 300000, credit: '普通預金', creditAmount: 300000 }
        ],
        explanation: '給料支払いは給料賃金（借方）と普通預金（貸方）で記録する'
      },
      {
        scenario: '売掛金 ¥500,000 を普通預金で回収した',
        hint: '借方：普通預金（資産）増加、貸方：売掛金（資産）減少',
        answer: [
          { debit: '普通預金', debitAmount: 500000, credit: '売掛金', creditAmount: 500000 }
        ],
        explanation: '売掛金の回収は普通預金（借方）と売掛金（貸方）で記録する'
      },
      {
        scenario: '水道光熱費 ¥25,000 を現金で支払った',
        hint: '借方：水道光熱費（費用）、貸方：現金（資産）',
        answer: [
          { debit: '水道光熱費', debitAmount: 25000, credit: '現金', creditAmount: 25000 }
        ],
        explanation: '水道光熱費は費用として借方に記録する'
      },
      {
        scenario: '受取利息 ¥3,000 が普通預金に入金された',
        hint: '借方：普通預金（資産）、貸方：受取利息（収益）',
        answer: [
          { debit: '普通預金', debitAmount: 3000, credit: '受取利息', creditAmount: 3000 }
        ],
        explanation: '利息収入は受取利息（収益）として貸方に記録する'
      },
      {
        scenario: '買掛金 ¥200,000 を当座預金で支払った',
        hint: '借方：買掛金（負債）減少、貸方：当座預金（資産）',
        answer: [
          { debit: '買掛金', debitAmount: 200000, credit: '当座預金', creditAmount: 200000 }
        ],
        explanation: '買掛金の支払いは買掛金（借方）と当座預金（貸方）で記録する'
      }
    ]
  },

  // ──── 上級 ────
  {
    id: 11,
    title: '減価償却',
    difficulty: 'advanced',
    timeLimit: 480,
    transactions: [
      {
        scenario: '建物 ¥10,000,000 を現金で購入した',
        hint: '借方：建物（固定資産）、貸方：現金（資産）減少',
        answer: [
          { debit: '建物', debitAmount: 10000000, credit: '現金', creditAmount: 10000000 }
        ],
        explanation: '建物は固定資産「建物」として借方に記録する'
      },
      {
        scenario: '工具器具備品 ¥500,000 を当座預金で購入した',
        hint: '借方：工具器具備品（固定資産）、貸方：当座預金（資産）',
        answer: [
          { debit: '工具器具備品', debitAmount: 500000, credit: '当座預金', creditAmount: 500000 }
        ],
        explanation: '工具器具備品は固定資産「工具器具備品」として記録する'
      },
      {
        scenario: '建物の減価償却費を計上した（耐用年数20年、定額法）¥500,000',
        hint: '借方：減価償却費（費用）、貸方：減価償却累計額（資産の控除）',
        answer: [
          { debit: '減価償却費', debitAmount: 500000, credit: '減価償却累計額', creditAmount: 500000 }
        ],
        explanation: '間接法では減価償却累計額（貸方）を使い、資産の帳簿価額を徐々に減らす'
      },
      {
        scenario: '工具器具備品の減価償却費を計上した（耐用年数5年、定額法）¥100,000',
        hint: '借方：減価償却費（費用）、貸方：減価償却累計額（資産の控除）',
        answer: [
          { debit: '減価償却費', debitAmount: 100000, credit: '減価償却累計額', creditAmount: 100000 }
        ],
        explanation: '工具器具備品の減価償却は500,000÷5年=100,000円/年'
      },
      {
        scenario: '商品 ¥800,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 800000, credit: '売上高', creditAmount: 800000 }
        ],
        explanation: '掛け販売は売掛金（借方）と売上高（貸方）で記録する'
      }
    ]
  },
  {
    id: 12,
    title: '決算整理1',
    difficulty: 'advanced',
    timeLimit: 480,
    transactions: [
      {
        scenario: '売掛金 ¥10,000 が貸し倒れた（回収不能）',
        hint: '借方：雑費（費用）、貸方：売掛金（資産）減少 ※簡略化処理',
        answer: [
          { debit: '雑費', debitAmount: 10000, credit: '売掛金', creditAmount: 10000 }
        ],
        explanation: '貸倒れの簡略処理：雑費（借方）で損失を計上し、売掛金（貸方）を取り消す'
      },
      {
        scenario: '前払いしていた保険料 ¥120,000 を費用に振り替えた',
        hint: '借方：保険料（費用）、貸方：前払金（資産）減少',
        answer: [
          { debit: '保険料', debitAmount: 120000, credit: '前払金', creditAmount: 120000 }
        ],
        explanation: '前払金の振替：保険料（借方）と前払金（貸方）で記録する'
      },
      {
        scenario: '水道光熱費の未払い ¥80,000 を計上した',
        hint: '借方：水道光熱費（費用）、貸方：未払費用（負債）発生',
        answer: [
          { debit: '水道光熱費', debitAmount: 80000, credit: '未払費用', creditAmount: 80000 }
        ],
        explanation: '未払費用の計上：費用（借方）と未払費用（貸方）で記録する'
      },
      {
        scenario: '期末の商品棚卸高 ¥50,000 を繰り越した（簡略版）',
        hint: '借方：商品（資産）、貸方：仕入高（費用）減少',
        answer: [
          { debit: '商品', debitAmount: 50000, credit: '仕入高', creditAmount: 50000 }
        ],
        explanation: '期末棚卸：売れ残った商品を仕入高から除き、資産「商品」として繰り越す'
      },
      {
        scenario: '未収の受取利息 ¥5,000 を計上した',
        hint: '借方：未収入金（資産）、貸方：受取利息（収益）発生',
        answer: [
          { debit: '未収入金', debitAmount: 5000, credit: '受取利息', creditAmount: 5000 }
        ],
        explanation: '未収利息はまだ入金されていないので「未収入金（資産）」として借方に記録する'
      }
    ]
  },
  {
    id: 13,
    title: '資本取引',
    difficulty: 'advanced',
    timeLimit: 480,
    transactions: [
      {
        scenario: '増資により現金 ¥3,000,000 を受け取った',
        hint: '借方：現金（資産）増加、貸方：資本金（純資産）増加',
        answer: [
          { debit: '現金', debitAmount: 3000000, credit: '資本金', creditAmount: 3000000 }
        ],
        explanation: '増資は資本金（貸方）として純資産を増加させる'
      },
      {
        scenario: '商品 ¥1,200,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 1200000, credit: '売上高', creditAmount: 1200000 }
        ],
        explanation: '掛け販売は売掛金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '売掛金 ¥800,000 を普通預金で回収した',
        hint: '借方：普通預金（資産）増加、貸方：売掛金（資産）減少',
        answer: [
          { debit: '普通預金', debitAmount: 800000, credit: '売掛金', creditAmount: 800000 }
        ],
        explanation: '売掛金の回収は普通預金（借方）と売掛金（貸方）で記録する'
      },
      {
        scenario: '給料 ¥400,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）、貸方：普通預金（資産）',
        answer: [
          { debit: '給料賃金', debitAmount: 400000, credit: '普通預金', creditAmount: 400000 }
        ],
        explanation: '給料支払いは給料賃金（借方）と普通預金（貸方）で記録する'
      },
      {
        scenario: '通信費 ¥18,000 を現金で支払った',
        hint: '借方：通信費（費用）、貸方：現金（資産）',
        answer: [
          { debit: '通信費', debitAmount: 18000, credit: '現金', creditAmount: 18000 }
        ],
        explanation: '通信費は費用として借方に記録する'
      },
      {
        scenario: '備品・消耗品費 ¥12,000 を現金で支払った',
        hint: '借方：備品・消耗品費（費用）、貸方：現金（資産）',
        answer: [
          { debit: '備品・消耗品費', debitAmount: 12000, credit: '現金', creditAmount: 12000 }
        ],
        explanation: '備品・消耗品費は即時費用計上する'
      }
    ]
  },
  {
    id: 14,
    title: '複合仕訳マスター',
    difficulty: 'advanced',
    timeLimit: 540,
    transactions: [
      {
        scenario: '建物 ¥5,000,000 を購入。現金 ¥2,000,000 と長期借入金 ¥3,000,000 で支払った',
        hint: '建物5,000,000（借方）/ 現金2,000,000 + 長期借入金3,000,000（貸方）の複合仕訳',
        answer: [
          { debit: '建物', debitAmount: 5000000, credit: '現金', creditAmount: 2000000 },
          { debit: null, debitAmount: null, credit: '長期借入金', creditAmount: 3000000 }
        ],
        explanation: '支払手段が複数の場合は複合仕訳となる。借方合計=貸方合計を確認'
      },
      {
        scenario: '商品 ¥660,000（税込10%）を掛けで販売した',
        hint: '売掛金660,000（借方）/ 売上高600,000 + 仮受消費税60,000（貸方）',
        answer: [
          { debit: '売掛金', debitAmount: 660000, credit: '売上高', creditAmount: 600000 },
          { debit: null, debitAmount: null, credit: '仮受消費税', creditAmount: 60000 }
        ],
        explanation: '税込売上は売上高（税抜）と仮受消費税に分けて記録する'
      },
      {
        scenario: '給料 ¥350,000 を支払い。所得税 ¥30,000 を源泉徴収。差引 ¥320,000 を普通預金から振込',
        hint: '給料賃金350,000（借方）/ 普通預金320,000 + 未払費用30,000（貸方）',
        answer: [
          { debit: '給料賃金', debitAmount: 350000, credit: '普通預金', creditAmount: 320000 },
          { debit: null, debitAmount: null, credit: '未払費用', creditAmount: 30000 }
        ],
        explanation: '源泉徴収税は「未払費用（負債）」として後で税務署に納付する'
      },
      {
        scenario: '商品 ¥330,000（税込10%）を掛けで仕入れた',
        hint: '仕入高300,000 + 仮払消費税30,000（借方）/ 買掛金330,000（貸方）',
        answer: [
          { debit: '仕入高', debitAmount: 300000, credit: '買掛金', creditAmount: 330000 },
          { debit: '仮払消費税', debitAmount: 30000, credit: null, creditAmount: null }
        ],
        explanation: '税込仕入は仕入高（税抜）と仮払消費税に分けて記録する'
      },
      {
        scenario: '前受金 ¥100,000 を受け取っていた商品を納品し、残代金 ¥100,000 を現金で受け取った',
        hint: '前受金100,000 + 現金100,000（借方）/ 売上高200,000（貸方）',
        answer: [
          { debit: '前受金', debitAmount: 100000, credit: '売上高', creditAmount: 200000 },
          { debit: '現金', debitAmount: 100000, credit: null, creditAmount: null }
        ],
        explanation: '前受金の消込と現金受取を同時に処理する複合仕訳'
      }
    ]
  },
  {
    id: 15,
    title: '決算書への道',
    difficulty: 'advanced',
    timeLimit: 540,
    transactions: [
      {
        scenario: '商品 ¥1,000,000 を掛けで販売した',
        hint: '借方：売掛金（資産）、貸方：売上高（収益）',
        answer: [
          { debit: '売掛金', debitAmount: 1000000, credit: '売上高', creditAmount: 1000000 }
        ],
        explanation: '掛け販売は売掛金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '商品 ¥400,000 を掛けで仕入れた',
        hint: '借方：仕入高（費用）、貸方：買掛金（負債）',
        answer: [
          { debit: '仕入高', debitAmount: 400000, credit: '買掛金', creditAmount: 400000 }
        ],
        explanation: '掛け仕入は仕入高（借方）と買掛金（貸方）で記録する'
      },
      {
        scenario: '給料 ¥500,000 を普通預金から支払った',
        hint: '借方：給料賃金（費用）、貸方：普通預金（資産）',
        answer: [
          { debit: '給料賃金', debitAmount: 500000, credit: '普通預金', creditAmount: 500000 }
        ],
        explanation: '給料支払いを記録する'
      },
      {
        scenario: '減価償却費 ¥200,000 を計上した',
        hint: '借方：減価償却費（費用）、貸方：減価償却累計額（資産控除）',
        answer: [
          { debit: '減価償却費', debitAmount: 200000, credit: '減価償却累計額', creditAmount: 200000 }
        ],
        explanation: '間接法による減価償却の記録'
      },
      {
        scenario: '売掛金 ¥120,000 を普通預金で回収した',
        hint: '借方：普通預金（資産）増加、貸方：売掛金（資産）減少',
        answer: [
          { debit: '普通預金', debitAmount: 120000, credit: '売掛金', creditAmount: 120000 }
        ],
        explanation: '売掛金の回収は普通預金（借方）と売掛金（貸方）で記録する'
      },
      {
        scenario: '前受金 ¥50,000 の商品を納品した（売上計上）',
        hint: '借方：前受金（負債）減少、貸方：売上高（収益）発生',
        answer: [
          { debit: '前受金', debitAmount: 50000, credit: '売上高', creditAmount: 50000 }
        ],
        explanation: '前受金の消込は前受金（借方）と売上高（貸方）で記録する'
      },
      {
        scenario: '当期の法人税等 ¥230,000 を決算で未払計上した',
        hint: '借方：法人税等（費用）、貸方：未払法人税等（負債）発生',
        answer: [
          { debit: '法人税等', debitAmount: 230000, credit: '未払法人税等', creditAmount: 230000 }
        ],
        explanation: '決算時に未払いの法人税は、法人税等（借方）と未払法人税等（貸方）で記録する'
      }
    ]
  }
];

const STORAGE_KEY = 'bokiQuestSaveV2';

const QUEST_META = {
  1: { subtitle: '会社のスタート時点を固める導入編', focus: '資本金・前払金・工具器具備品・短期借入金の基本形を押さえる' },
  2: { subtitle: '現金売上高と日常経費の流れを覚える', focus: '売上高・仕入高・雑費・水道光熱費・通信費の定番仕訳' },
  3: { subtitle: '人件費と営業活動を同時に回す', focus: '給料賃金支払と営業取引を並行して処理する練習' },
  4: { subtitle: '現金以外の入出金にも慣れる', focus: '当座預金・普通預金を含む経費処理の切り分け' },
  5: { subtitle: '月末の基本取引をまとめて整理する', focus: '現金売上高、仕入高、給料賃金、経費をテンポよく判定する' },
  6: { subtitle: '掛け取引の入口を突破する', focus: '売掛金と買掛金の増減方向を反射で判断する' },
  7: { subtitle: '回収と支払のタイムラグを管理する', focus: '掛けの発生と決済で科目がどう動くかを整理する' },
  8: { subtitle: '資金調達と返済の流れを学ぶ', focus: '短期借入金・長期借入金と支払利息、預金口座の連動を確認する' },
  9: { subtitle: '前払・未払の経過勘定を使い分ける', focus: '費用の発生時点と支払時点のズレを捉える' },
  10: { subtitle: '消費税の処理を一段引き上げる', focus: '仮払消費税・仮受消費税を混同しないことが目標' },
  11: { subtitle: '決算整理の代表格に入る', focus: '減価償却累計額の貸方処理と費用計上の意味を理解する' },
  12: { subtitle: '複数論点をまたぐ決算整理に挑む', focus: '前受・未払・減価償却を一つの期間で整える' },
  13: { subtitle: '繰越処理まで含めた決算感覚をつくる', focus: '純資産の振替と期間損益の締めを意識する' },
  14: { subtitle: '複合仕訳を崩さず入力する', focus: '複数行の借方・貸方を合計一致で処理する応用編' },
  15: { subtitle: '総合演習で1か月を締める最終クエスト', focus: '消費税、源泉、未払計上まで含めて月次決算を走り切る' }
};

function createDefaultState() {
  return {
    nickname: '',
    difficulty: 'beginner',
    previewQuestId: 1,
    lastPlayedQuestId: null,
    unlocked: { 1: true, 6: false, 11: false },
    ranks: {},
    bestScores: {},
    bestAccuracy: {},
    totalClears: 0
  };
}

// ══════════════════════════════════════════════════════════════════
// ゲーム状態（window変数で管理）
// ══════════════════════════════════════════════════════════════════
window._bokiState = createDefaultState();

// 現在のゲームセッション
window._bokiSession = {
  quest: null,          // QUESTオブジェクト
  currentTurn: 0,       // 0-indexed
  results: [],          // {correct, hintUsed, lines, scenario}
  score: 0,
  combo: 0,
  maxCombo: 0,
  timerInterval: null,
  startTime: null,
  elapsedSeconds: 0,
  remainingSeconds: 0,
  turnStartTime: null,
  quickBonusTotal: 0,
  timedOut: false,
  hintLevel: 0,         // 0=未使用, 1=借方ヒント表示, 2=貸方ヒント表示
  phase: 'entry',       // 'entry' | 'tbCheck'
  hintUsedThisTurn: false
};

// ══════════════════════════════════════════════════════════════════
// ユーティリティ
// ══════════════════════════════════════════════════════════════════
function fmt(n) {
  if (n === null || n === undefined || n === '') return '';
  return Number(n).toLocaleString('ja-JP');
}

function fmtTime(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function parseAmount(str) {
  if (str === null || str === undefined || str === '') return null;
  const n = Number(String(str).replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
}

function normalizeAccountName(str) {
  return String(str || '').replace(/\s+/g, '').trim();
}

function switchScreen(id) {
  document.querySelectorAll('.scr').forEach(el => el.classList.remove('on'));
  const el = document.getElementById(id);
  if (el) el.classList.add('on');
}

function showElement(id) { const el = document.getElementById(id); if (el) el.style.display = ''; }
function hideElement(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }

function el(id) { return document.getElementById(id); }

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window._bokiState));
  } catch (e) {
    console.warn('進捗保存失敗:', e);
  }
}

function loadProgress() {
  const base = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window._bokiState = base;
      return;
    }
    const parsed = JSON.parse(raw);
    window._bokiState = {
      ...base,
      ...parsed,
      unlocked: { ...base.unlocked, ...(parsed.unlocked || {}) },
      ranks: { ...(parsed.ranks || {}) },
      bestScores: { ...(parsed.bestScores || {}) },
      bestAccuracy: { ...(parsed.bestAccuracy || {}) }
    };
  } catch (e) {
    console.warn('進捗読み込み失敗:', e);
    window._bokiState = base;
  }
}

function resetProgress() {
  window._bokiState = createDefaultState();
  saveProgress();
  updateTitleStatus();
  const selectedDiffBtn = document.querySelector(`.diff-btn[data-diff="${window._bokiState.difficulty}"]`);
  if (selectedDiffBtn) {
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('selected'));
    selectedDiffBtn.classList.add('selected');
  }
  showQuestPreview(window._bokiState.previewQuestId);
}

function getQuestById(questId) {
  return QUESTS.find(q => q.id === questId) || null;
}

function getDefaultPreviewQuestId() {
  const state = window._bokiState;
  const candidate = getQuestById(state.lastPlayedQuestId || state.previewQuestId);
  if (candidate) return candidate.id;

  const currentDiffQuest = QUESTS.find(q => q.difficulty === state.difficulty && state.unlocked[q.id]);
  return currentDiffQuest ? currentDiffQuest.id : 1;
}

function updateTitleStatus() {
  const state = window._bokiState;
  const cleared = Object.keys(state.ranks).length;
  const bestRankCount = Object.values(state.ranks).filter(Boolean).length;
  const lastQuest = getQuestById(state.lastPlayedQuestId);
  const status = el('title-save-status');
  const nickname = state.nickname ? `保存名: ${escHtml(state.nickname)}` : '保存名: まだ未設定';
  const lastPlayed = lastQuest ? `最後に挑戦: Quest ${lastQuest.id} ${lastQuest.title}` : '最後に挑戦: まだプレイしていません';
  status.innerHTML = `${nickname}<br>進捗: ${cleared} / ${QUESTS.length} クエストクリア, ランク記録 ${bestRankCount} 件<br>${lastPlayed}`;
  if (el('inp-nickname') && state.nickname && !el('inp-nickname').value.trim()) {
    el('inp-nickname').value = state.nickname;
  }
}

function getQuestMeta(quest) {
  return QUEST_META[quest.id] || { subtitle: '仕訳の基本を積み上げるクエスト', focus: '借方・貸方・金額の一致を確認する' };
}

function showQuestPreview(questId) {
  const quest = getQuestById(questId);
  if (!quest) return;

  const state = window._bokiState;
  state.previewQuestId = questId;

  const meta = getQuestMeta(quest);
  const diffLabel = { beginner: '初級', intermediate: '中級', advanced: '上級' };
  const rank = state.ranks[quest.id] || '未挑戦';
  const score = state.bestScores[quest.id];
  const unlocked = !!state.unlocked[quest.id];
  const diffUnlocked = quest.difficulty === state.difficulty;
  const badges = [
    `難易度 ${diffLabel[quest.difficulty]}`,
    `${quest.transactions.length}仕訳`,
    `制限 ${fmtTime(quest.timeLimit)}`,
    unlocked && diffUnlocked ? '挑戦可能' : diffUnlocked ? '未解放' : '現在の難易度外'
  ];

  el('qp-title').textContent = `Quest ${quest.id} ${quest.title}`;
  el('qp-summary').textContent = meta.subtitle;
  el('qp-time').textContent = fmtTime(quest.timeLimit);
  el('qp-transactions').textContent = `${quest.transactions.length}件`;
  el('qp-rank').textContent = rank;
  el('qp-score').textContent = score ? fmt(score) : '-';
  el('qp-focus').textContent = `学習テーマ: ${meta.focus}`;
  el('qp-badges').innerHTML = badges.map(b => `<span class="mini-badge">${escHtml(b)}</span>`).join('');

  const btn = el('btn-start-selected');
  btn.disabled = !(unlocked && diffUnlocked);
  btn.textContent = unlocked && diffUnlocked ? 'このクエストを開始' : (diffUnlocked ? '前のクエストをクリアで解放' : '難易度を合わせると挑戦可能');

  document.querySelectorAll('.quest-card').forEach(card => {
    card.classList.toggle('selected', Number(card.dataset.questId) === quest.id);
  });
}

function buildReviewText(results) {
  const wrongResults = results.filter(r => !r.correct);
  const hintCount = results.filter(r => r.hintUsed).length;
  const timeoutCount = results.filter(r => r.timedOut).length;
  if (wrongResults.length === 0 && hintCount === 0) {
    return '今回は大きな詰まりがありません。次はヒントなしで時間短縮を狙うとスコアがさらに伸びます。';
  }

  const focusAccounts = [];
  wrongResults.forEach(r => {
    (r.answer || []).forEach(line => {
      if (line.debit) focusAccounts.push(line.debit);
      if (line.credit) focusAccounts.push(line.credit);
    });
  });
  const topAccounts = [...new Set(focusAccounts)].slice(0, 4).join(' / ');
  const lines = [];
  if (timeoutCount > 0) lines.push(`時間切れで未回答になった仕訳 ${timeoutCount} 件。判断に迷う科目を先に見直すと完走しやすくなります。`);
  if (wrongResults.length > 0) lines.push(`不正解 ${wrongResults.length} 件。見直し対象: ${topAccounts || '仕訳全体の増減方向'}`);
  if (hintCount > 0) lines.push(`ヒント使用 ${hintCount} 件。借方・貸方の増減を文章から先に言語化すると安定します。`);
  const firstWrong = wrongResults[0];
  if (firstWrong) lines.push(`最初の復習ポイント: ${firstWrong.explanation}`);
  return lines.join('\n');
}

function getQuickBonus(seconds) {
  if (seconds <= 5) return 80;
  if (seconds <= 10) return 50;
  if (seconds <= 20) return 20;
  return 0;
}

function updateTimerDisplay() {
  const session = window._bokiSession;
  const timerEl = el('gh-timer');
  timerEl.textContent = fmtTime(session.remainingSeconds);
  timerEl.classList.remove('warning', 'danger');
  if (session.remainingSeconds <= 10) timerEl.classList.add('danger');
  else if (session.remainingSeconds <= 30) timerEl.classList.add('warning');
}

function showQuickFeedback(points, seconds) {
  if (points <= 0) return;
  const quick = el('popup-quick');
  quick.textContent = `QUICK +${points} (${seconds}s)`;
  quick.className = 'popup-quick show';
  setTimeout(() => quick.className = 'popup-quick', 1100);
}

function fillTimeoutResults() {
  const session = window._bokiSession;
  const quest = session.quest;
  if (!quest) return;

  for (let i = session.results.length; i < quest.transactions.length; i++) {
    const tx = quest.transactions[i];
    session.results.push({
      correct: false,
      hintUsed: false,
      lines: [],
      scenario: tx.scenario,
      answer: tx.answer,
      explanation: `時間切れ。${tx.explanation}`,
      timedOut: true,
      quickBonus: 0,
      solveSeconds: null
    });
  }
}

function handleTimeUp() {
  const session = window._bokiSession;
  if (!session.quest || session.timedOut) return;

  session.timedOut = true;
  session.remainingSeconds = 0;
  updateTimerDisplay();

  if (session.timerInterval) {
    clearInterval(session.timerInterval);
    session.timerInterval = null;
  }

  fillTimeoutResults();
  if (el('btn-confirm')) el('btn-confirm').disabled = true;
  if (el('btn-hint')) el('btn-hint').disabled = true;
  renderJournalList();
  renderTrialBalance(session.results);

  const overlay = el('timeup-overlay');
  overlay.className = 'timeup-overlay show';
  setTimeout(() => overlay.className = 'timeup-overlay', 1300);

  setTimeout(() => {
    showResult();
  }, 1200);
}

// ══════════════════════════════════════════════════════════════════
// タイトル画面
// ══════════════════════════════════════════════════════════════════
function initTitle() {
  // 難易度ボタン
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      window._bokiState.difficulty = btn.dataset.diff;
      showQuestPreview(getDefaultPreviewQuestId());
      saveProgress();
    });
  });

  el('btn-start').addEventListener('click', () => {
    const nickname = el('inp-nickname').value.trim() || '名無し';
    el('title-error').textContent = '';
    window._bokiState.nickname = nickname;
    saveProgress();
    updateTitleStatus();
    showQuestSelect();
  });

  el('btn-leaderboard').addEventListener('click', () => {
    showLeaderboard();
  });

  el('inp-nickname').addEventListener('keydown', e => {
    if (e.key === 'Enter') el('btn-start').click();
  });

  el('btn-reset-progress').addEventListener('click', () => {
    if (!window.confirm('進捗をリセットします。よろしいですか？')) return;
    resetProgress();
  });

  el('btn-start-selected').addEventListener('click', () => {
    startQuest(window._bokiState.previewQuestId);
  });
}

// ══════════════════════════════════════════════════════════════════
// クエスト選択
// ══════════════════════════════════════════════════════════════════
function showQuestSelect() {
  const state = window._bokiState;
  el('qs-player-name').textContent = state.nickname;
  const diffLabel = { beginner: '初級', intermediate: '中級', advanced: '上級' };
  el('qs-diff-label').textContent = diffLabel[state.difficulty] || '初級';

  renderQuestGrid('beginner', 'grid-beginner');
  renderQuestGrid('intermediate', 'grid-intermediate');
  renderQuestGrid('advanced', 'grid-advanced');
  showQuestPreview(getDefaultPreviewQuestId());

  switchScreen('s-quest-select');
}

function renderQuestGrid(diff, gridId) {
  const state = window._bokiState;
  const grid = el(gridId);
  grid.innerHTML = '';

  const quests = QUESTS.filter(q => q.difficulty === diff);
  quests.forEach(q => {
    const isUnlocked = !!state.unlocked[q.id];
    const rank = state.ranks[q.id] || null;
    const isDiffMatch = diff === state.difficulty;

    const card = document.createElement('div');
    card.className = 'quest-card';
    card.dataset.questId = q.id;
    card.tabIndex = 0;
    if (!isDiffMatch) {
      card.classList.add('diff-locked');
    } else if (!isUnlocked) {
      card.classList.add('locked');
    } else {
      card.classList.add(rank ? 'cleared' : 'unlocked');
    }
    if (state.previewQuestId === q.id) {
      card.classList.add('selected');
    }

    card.innerHTML = `
      <div class="quest-num">Quest ${q.id}</div>
      ${(!isDiffMatch || !isUnlocked) ? '<div class="quest-lock-icon">🔒</div>' : ''}
      <div class="quest-title">${q.title}</div>
      <div class="quest-rank ${rank || ''}">${rank || '─'}</div>
    `;

    card.addEventListener('mouseenter', () => showQuestPreview(q.id));
    card.addEventListener('focus', () => showQuestPreview(q.id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' && isDiffMatch && isUnlocked) {
        startQuest(q.id);
      }
    });

    if (isDiffMatch && isUnlocked) {
      card.addEventListener('click', () => startQuest(q.id));
    }
    grid.appendChild(card);
  });
}

el('btn-qs-back') && document.getElementById('btn-qs-back').addEventListener('click', () => {
  switchScreen('s-title');
});

// ══════════════════════════════════════════════════════════════════
// ゲーム開始
// ══════════════════════════════════════════════════════════════════
function startQuest(questId) {
  const quest = QUESTS.find(q => q.id === questId);
  if (!quest) return;
  const state = window._bokiState;
  if (!state.unlocked[quest.id] || quest.difficulty !== state.difficulty) return;

  const session = window._bokiSession;
  session.quest = quest;
  session.currentTurn = 0;
  session.results = [];
  session.score = 0;
  session.combo = 0;
  session.maxCombo = 0;
  session.startTime = Date.now();
  session.elapsedSeconds = 0;
  session.remainingSeconds = quest.timeLimit;
  session.turnStartTime = Date.now();
  session.quickBonusTotal = 0;
  session.timedOut = false;
  session.phase = 'entry';
  state.lastPlayedQuestId = quest.id;
  state.previewQuestId = quest.id;
  saveProgress();

  // タイマー
  if (session.timerInterval) clearInterval(session.timerInterval);
  session.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    session.elapsedSeconds = elapsed;
    session.remainingSeconds = Math.max(0, quest.timeLimit - elapsed);
    updateTimerDisplay();
    if (session.remainingSeconds <= 0) {
      handleTimeUp();
    }
  }, 500);

  // ヘッダー更新
  el('gh-quest-name').textContent = `◆ ${quest.title}`;
  updateTimerDisplay();
  updateGameHeader();

  // 仕訳帳初期化
  renderJournalList();

  // 試算表リセット
  renderTrialBalance([]);

  // 試算表チェックボックスを隠す
  el('tb-check-box').classList.remove('show');

  // 入力エリアの表示をリセット（前のゲームで隠されていた場合）
  const _jef = el('journal-entry-form'); if (_jef) _jef.style.display = '';
  const _sb2 = el('scenario-box'); if (_sb2) _sb2.style.display = '';
  const _bh2 = el('btn-hint'); if (_bh2) { _bh2.style.display = ''; _bh2.disabled = false; }
  const _bc2 = el('btn-confirm'); if (_bc2) { _bc2.style.display = ''; _bc2.disabled = false; }
  const _arb2 = el('add-row-btns'); if (_arb2) _arb2.style.display = '';

  switchScreen('s-game');
  loadTurn(0);
}

function updateGameHeader() {
  const s = window._bokiSession;
  const total = s.quest ? s.quest.transactions.length : 0;
  el('gh-turn').textContent = `${s.currentTurn + 1}/${total}`;
  el('gh-score').textContent = fmt(s.score);
  el('gh-combo').textContent = `x${s.combo}`;
}

// ══════════════════════════════════════════════════════════════════
// ターン読み込み
// ══════════════════════════════════════════════════════════════════
function loadTurn(turnIndex) {
  const session = window._bokiSession;
  const quest = session.quest;
  if (!quest) return;

  session.currentTurn = turnIndex;
  session.hintLevel = 0;
  session.hintUsedThisTurn = false;
  session.turnStartTime = Date.now();
  updateGameHeader();

  const tx = quest.transactions[turnIndex];
  const meta = getQuestMeta(quest);
  el('scenario-turn').textContent = `◆ TURN ${turnIndex + 1} / ${quest.transactions.length}`;
  el('scenario-text').textContent = tx.scenario;
  el('scenario-focus').textContent = `このクエストの論点: ${meta.focus}`;
  el('scenario-badges').innerHTML = [
    `残り ${quest.transactions.length - turnIndex} 件`,
    session.combo > 0 ? `現在コンボ x${session.combo}` : 'コンボ受付中',
    session.hintUsedThisTurn ? 'ヒント使用済み' : 'ヒント未使用',
    `残り時間 ${fmtTime(session.remainingSeconds)}`
  ].map(text => `<span class="mini-badge">${escHtml(text)}</span>`).join('');

  // ヒントボックスをリセット
  const hintBox = el('hint-box');
  hintBox.classList.remove('show');
  hintBox.textContent = '';

  // フィードバックをリセット
  const fb = el('feedback-box');
  fb.classList.remove('show', 'correct', 'wrong');
  fb.textContent = '';

  // 入力行を初期化（answerの行数に合わせてデフォルト行を生成）
  buildEntryRows(tx.answer);

  // ボタン有効化
  el('btn-confirm').disabled = false;
  el('btn-hint').disabled = false;

  // 仕訳帳更新
  renderJournalList();

  // オートフォーカス
  setTimeout(() => {
    const firstInput = el('entry-rows').querySelector('input');
    if (firstInput) firstInput.focus();
  }, 50);
}

// ══════════════════════════════════════════════════════════════════
// 入力行ビルド
// ══════════════════════════════════════════════════════════════════
function buildEntryRows(answerLines) {
  // answerLines を元にデフォルト行構造を推定
  // 各行: {debit, debitAmount, credit, creditAmount}
  // null のものは空欄
  const container = el('entry-rows');
  container.innerHTML = '';

  // 行数は answer と同じ
  const numRows = answerLines ? answerLines.length : 1;
  for (let i = 0; i < numRows; i++) {
    addEntryRow(container, i);
  }
}

function addEntryRow(container, index, debitOnly, creditOnly) {
  const row = document.createElement('div');
  row.className = 'entry-row';
  row.dataset.rowIndex = index;

  const debitDisabled = creditOnly ? 'disabled style="opacity:0.3"' : '';
  const creditDisabled = debitOnly ? 'disabled style="opacity:0.3"' : '';

  row.innerHTML = `
    <input type="text" class="debit-acct" list="account-list" placeholder="借方科目" autocomplete="off" ${debitDisabled}>
    <input type="number" class="debit-amt" placeholder="0" min="0" ${debitDisabled}>
    <input type="text" class="credit-acct" list="account-list" placeholder="貸方科目" autocomplete="off" ${creditDisabled}>
    <input type="number" class="credit-amt" placeholder="0" min="0" ${creditDisabled}>
    <button class="remove-row-btn" title="行を削除" onclick="removeEntryRow(this)">×</button>
  `;

  // 最初の行の削除ボタンは無効
  if (index === 0 && !container.children.length) {
    const rmBtn = row.querySelector('.remove-row-btn');
    rmBtn.style.visibility = 'hidden';
  }

  // Enter キーで確認
  row.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        el('btn-confirm').click();
      }
    });
  });

  container.appendChild(row);
  return row;
}

function removeEntryRow(btn) {
  const row = btn.closest('.entry-row');
  const container = el('entry-rows');
  if (container.children.length > 1) {
    row.remove();
    // 行番号更新
    Array.from(container.children).forEach((r, i) => {
      r.dataset.rowIndex = i;
      const rmBtn = r.querySelector('.remove-row-btn');
      if (i === 0) rmBtn.style.visibility = 'hidden';
      else rmBtn.style.visibility = 'visible';
    });
  }
}

// ══════════════════════════════════════════════════════════════════
// ヒント
// ══════════════════════════════════════════════════════════════════
el('btn-hint') && el('btn-hint').addEventListener('click', () => {
  const session = window._bokiSession;
  if (!session.quest) return;
  const tx = session.quest.transactions[session.currentTurn];
  const hintBox = el('hint-box');

  session.hintUsedThisTurn = true;
  session.hintLevel++;

  if (session.hintLevel === 1) {
    // 借方ヒント
    const debitHints = tx.answer
      .filter(a => a.debit)
      .map(a => `${a.debit} ¥${fmt(a.debitAmount)}`)
      .join('、');
    hintBox.textContent = `💡 借方ヒント: ${debitHints}`;
    hintBox.classList.add('show');
  } else if (session.hintLevel === 2) {
    // 貸方ヒント
    const creditHints = tx.answer
      .filter(a => a.credit)
      .map(a => `${a.credit} ¥${fmt(a.creditAmount)}`)
      .join('、');
    hintBox.textContent = `💡 借方+貸方ヒント: ${tx.hint}`;
    hintBox.classList.add('show');
    el('btn-hint').disabled = true;
  }

  el('scenario-badges').innerHTML = [
    `残り ${session.quest.transactions.length - session.currentTurn} 件`,
    session.combo > 0 ? `現在コンボ x${session.combo}` : 'コンボ受付中',
    `ヒント ${session.hintLevel}/2`,
    `残り時間 ${fmtTime(session.remainingSeconds)}`
  ].map(text => `<span class="mini-badge">${escHtml(text)}</span>`).join('');
});

// 行追加ボタン
el('btn-add-debit') && el('btn-add-debit').addEventListener('click', () => {
  const container = el('entry-rows');
  const idx = container.children.length;
  const row = addEntryRow(container, idx, true, false);
  // credit を無効化
  row.querySelector('.credit-acct').disabled = true;
  row.querySelector('.credit-acct').style.opacity = '0.3';
  row.querySelector('.credit-amt').disabled = true;
  row.querySelector('.credit-amt').style.opacity = '0.3';
  row.querySelector('.remove-row-btn').style.visibility = 'visible';
  row.querySelector('.debit-acct').focus();
});

el('btn-add-credit') && el('btn-add-credit').addEventListener('click', () => {
  const container = el('entry-rows');
  const idx = container.children.length;
  const row = addEntryRow(container, idx, false, true);
  row.querySelector('.debit-acct').disabled = true;
  row.querySelector('.debit-acct').style.opacity = '0.3';
  row.querySelector('.debit-amt').disabled = true;
  row.querySelector('.debit-amt').style.opacity = '0.3';
  row.querySelector('.remove-row-btn').style.visibility = 'visible';
  row.querySelector('.credit-acct').focus();
});

// ══════════════════════════════════════════════════════════════════
// 採点
// ══════════════════════════════════════════════════════════════════
el('btn-confirm') && el('btn-confirm').addEventListener('click', () => {
  confirmEntry();
});

function getEntryLines() {
  const rows = el('entry-rows').querySelectorAll('.entry-row');
  const lines = [];
  rows.forEach(row => {
    const debitAcct = row.querySelector('.debit-acct');
    const debitAmt = row.querySelector('.debit-amt');
    const creditAcct = row.querySelector('.credit-acct');
    const creditAmt = row.querySelector('.credit-amt');

    const d = debitAcct && !debitAcct.disabled ? debitAcct.value.trim() : null;
    const da = debitAmt && !debitAmt.disabled ? parseAmount(debitAmt.value) : null;
    const c = creditAcct && !creditAcct.disabled ? creditAcct.value.trim() : null;
    const ca = creditAmt && !creditAmt.disabled ? parseAmount(creditAmt.value) : null;

    lines.push({
      debit: d || null,
      debitAmount: da,
      credit: c || null,
      creditAmount: ca
    });
  });
  return lines;
}

function judgeEntry(userLines, answerLines) {
  // 借方セット照合
  const answerDebits = answerLines
    .filter(a => a.debit && a.debitAmount)
    .map(a => `${normalizeAccountName(a.debit)}:${a.debitAmount}`);
  const answerCredits = answerLines
    .filter(a => a.credit && a.creditAmount)
    .map(a => `${normalizeAccountName(a.credit)}:${a.creditAmount}`);

  const userDebits = userLines
    .filter(u => u.debit && u.debitAmount)
    .map(u => `${normalizeAccountName(u.debit)}:${u.debitAmount}`);
  const userCredits = userLines
    .filter(u => u.credit && u.creditAmount)
    .map(u => `${normalizeAccountName(u.credit)}:${u.creditAmount}`);

  // 全借方が含まれているか
  const debitOk = answerDebits.every(a => userDebits.includes(a)) &&
                  userDebits.every(u => answerDebits.includes(u));
  const creditOk = answerCredits.every(a => userCredits.includes(a)) &&
                   userCredits.every(u => answerCredits.includes(u));

  return debitOk && creditOk;
}

function confirmEntry() {
  const session = window._bokiSession;
  const quest = session.quest;
  if (!quest) return;

  const tx = quest.transactions[session.currentTurn];
  const userLines = getEntryLines();
  const solveSeconds = Math.max(1, Math.floor((Date.now() - session.turnStartTime) / 1000));

  // 基本バリデーション
  const hasDebit = userLines.some(l => l.debit && l.debitAmount);
  const hasCredit = userLines.some(l => l.credit && l.creditAmount);
  if (!hasDebit || !hasCredit) {
    showFeedback(false, '⚠ 借方と貸方を入力してください');
    doShake(el('journal-entry-form'));
    return;
  }

  const totalDebit = userLines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredit = userLines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  if (totalDebit !== totalCredit) {
    showFeedback(false, `⚠ 借方合計 ¥${fmt(totalDebit)} と貸方合計 ¥${fmt(totalCredit)} が一致していません`);
    doShake(el('journal-entry-form'));
    return;
  }

  const correct = judgeEntry(userLines, tx.answer);

  // 採点
  const hintUsed = session.hintUsedThisTurn;
  session.results.push({
    correct,
    hintUsed,
    lines: userLines,
    scenario: tx.scenario,
    answer: tx.answer,
    explanation: tx.explanation,
    quickBonus: 0,
    solveSeconds
  });

  if (correct) {
    session.combo++;
    session.maxCombo = Math.max(session.maxCombo, session.combo);
    const basePoints = 100;
    const hintPenalty = hintUsed ? 50 : 0;
    const quickBonus = getQuickBonus(solveSeconds);
    const gained = Math.max(0, basePoints + quickBonus - hintPenalty);
    session.results[session.results.length - 1].quickBonus = quickBonus;
    session.quickBonusTotal += quickBonus;
    session.score += gained;
    updateGameHeader();

    // 視覚フィードバック
    showCorrectFeedback(gained, session.combo);
    showQuickFeedback(quickBonus, solveSeconds);
    showFeedback(true, `✓ 正解！ +${gained}pts`);

    // 仕訳帳更新
    renderJournalList();
    renderTrialBalance(session.results);

    el('btn-confirm').disabled = true;
    el('btn-hint').disabled = true;

    setTimeout(() => {
      nextTurn();
    }, 900);

  } else {
    session.combo = 0;
    updateGameHeader();

    // 視覚フィードバック
    showWrongFeedback();
    const answerText = formatAnswerText(tx.answer);
    showFeedback(false, `✗ 不正解。正解: ${answerText}\n${tx.explanation}`);

    session.results.push = session.results.push; // already pushed
    // 不正解でも記録は追加済み（直前の push）
    // ここでは結果リストの最後を不正解として保持している

    renderJournalList();
    renderTrialBalance(session.results);

    el('btn-confirm').disabled = true;
    el('btn-hint').disabled = true;

    setTimeout(() => {
      nextTurn();
    }, 2500);
  }
}

function formatAnswerText(answerLines) {
  const debits = answerLines.filter(a => a.debit).map(a => `${a.debit} ¥${fmt(a.debitAmount)}`).join(' / ');
  const credits = answerLines.filter(a => a.credit).map(a => `${a.credit} ¥${fmt(a.creditAmount)}`).join(' / ');
  return `${debits} // ${credits}`;
}

function nextTurn() {
  const session = window._bokiSession;
  const quest = session.quest;
  const next = session.currentTurn + 1;

  if (next >= quest.transactions.length) {
    // 全仕訳完了 → 試算表チェックフェーズ
    enterTrialBalancePhase();
  } else {
    loadTurn(next);
  }
}

// ══════════════════════════════════════════════════════════════════
// 試算表確認フェーズ
// ══════════════════════════════════════════════════════════════════
function enterTrialBalancePhase() {
  const session = window._bokiSession;
  session.phase = 'tbCheck';

  // 入力エリアを隠す
  const _jef = el('journal-entry-form'); if (_jef) _jef.style.display = 'none';
  const _sb = el('scenario-box'); if (_sb) _sb.style.display = 'none';
  const _hb = el('hint-box'); if (_hb) _hb.classList.remove('show');
  const _fb = el('feedback-box'); if (_fb) _fb.classList.remove('show', 'correct', 'wrong');
  const _bh = el('btn-hint'); if (_bh) _bh.style.display = 'none';
  const _bc = el('btn-confirm'); if (_bc) _bc.style.display = 'none';
  const _arb = el('add-row-btns'); if (_arb) _arb.style.display = 'none';

  // 試算表チェックボックスを表示
  const tbBox = el('tb-check-box');
  tbBox.classList.add('show');

  // 残高チェック
  const tb = buildTrialBalance(session.results);
  let totalDebit = 0, totalCredit = 0;
  Object.values(tb).forEach(v => {
    totalDebit += v.debit;
    totalCredit += v.credit;
  });

  const balanced = totalDebit === totalCredit;
  const msgEl = el('tb-balance-msg');
  if (balanced) {
    msgEl.innerHTML = `<div class="tb-balance-ok">✓ 借方合計 ¥${fmt(totalDebit)} = 貸方合計 ¥${fmt(totalCredit)}<br>バランスが取れています！</div>`;
    el('btn-tb-confirm').disabled = false;
  } else {
    msgEl.innerHTML = `<div class="tb-balance-ng">⚠ 借方合計 ¥${fmt(totalDebit)} ≠ 貸方合計 ¥${fmt(totalCredit)}<br>不一致があります（不正解仕訳があった場合に発生します）</div>`;
    el('btn-tb-confirm').disabled = false; // ゲームは続行可能
  }

  // 試算表にフォーカス
  el('pane-input').scrollTop = el('pane-input').scrollHeight;
}

el('btn-tb-confirm') && el('btn-tb-confirm').addEventListener('click', () => {
  showResult();
});

// ══════════════════════════════════════════════════════════════════
// 試算表ビルド
// ══════════════════════════════════════════════════════════════════
function buildTrialBalance(results) {
  const tb = {};
  results.forEach(result => {
    if (!result) return;
    const lines = result.lines || [];
    lines.forEach(line => {
      if (line.debit && line.debitAmount) {
        if (!tb[line.debit]) tb[line.debit] = { debit: 0, credit: 0 };
        tb[line.debit].debit += line.debitAmount;
      }
      if (line.credit && line.creditAmount) {
        if (!tb[line.credit]) tb[line.credit] = { debit: 0, credit: 0 };
        tb[line.credit].credit += line.creditAmount;
      }
    });
  });
  return tb;
}

function renderTrialBalance(results) {
  const tb = buildTrialBalance(results);
  const tbody = el('trial-tbody');
  tbody.innerHTML = '';

  let totalDebit = 0, totalCredit = 0;

  Object.entries(tb).forEach(([acct, vals]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${acct}</td>
      <td class="text-right num">${vals.debit ? fmt(vals.debit) : ''}</td>
      <td class="text-right num">${vals.credit ? fmt(vals.credit) : ''}</td>
    `;
    tbody.appendChild(tr);
    totalDebit += vals.debit;
    totalCredit += vals.credit;
  });

  el('trial-total-debit').textContent = fmt(totalDebit);
  el('trial-total-credit').textContent = fmt(totalCredit);

  const statusEl = el('trial-balance-status');
  if (totalDebit === totalCredit && totalDebit > 0) {
    statusEl.innerHTML = '<span class="trial-ok">✓ 借方 = 貸方</span>';
  } else if (totalDebit > 0 || totalCredit > 0) {
    statusEl.innerHTML = `<span class="trial-ng">⚠ 不一致 差額: ¥${fmt(Math.abs(totalDebit - totalCredit))}</span>`;
  } else {
    statusEl.textContent = '';
  }
}

// ══════════════════════════════════════════════════════════════════
// 仕訳帳レンダー
// ══════════════════════════════════════════════════════════════════
function renderJournalList() {
  const session = window._bokiSession;
  const quest = session.quest;
  if (!quest) return;

  const list = el('journal-list');
  list.innerHTML = '';

  quest.transactions.forEach((tx, i) => {
    const result = session.results[i];
    const item = document.createElement('div');
    item.className = 'journal-item';

    if (result) {
      item.classList.add(result.correct ? 'correct' : 'wrong');
      const icon = result.correct ? '✓' : '✗';
      // 正解テキスト表示
      const answerLines = result.correct ? result.lines : result.answer;
      const debits = answerLines.filter(l => l.debit).map(l => `${l.debit} ${fmt(l.debitAmount)}`).join(' / ');
      const credits = answerLines.filter(l => l.credit).map(l => `${l.credit} ${fmt(l.creditAmount)}`).join(' / ');
      item.innerHTML = `
        <span class="ji-num">#${i + 1}</span>
        <span class="ji-icon ${result.correct ? 'correct' : 'wrong'}">${icon}</span>
        <span class="ji-text">${debits}<br>/ ${credits}</span>
      `;
    } else if (i === session.currentTurn) {
      item.classList.add('current');
      item.innerHTML = `<span class="ji-num">#${i + 1}</span> <span class="text-cyan">→ 入力中</span><br><span class="ji-text text-muted">${tx.scenario.substring(0, 20)}...</span>`;
    } else {
      item.classList.add('pending');
      item.innerHTML = `<span class="ji-num">#${i + 1}</span> <span class="text-muted">⬜ 未入力</span>`;
    }

    list.appendChild(item);
  });

  // スクロールを最新に
  list.scrollTop = list.scrollHeight;
}

// ══════════════════════════════════════════════════════════════════
// フィードバック表示
// ══════════════════════════════════════════════════════════════════
function showFeedback(correct, message) {
  const fb = el('feedback-box');
  fb.classList.remove('show', 'correct', 'wrong');
  fb.textContent = message;
  fb.classList.add('show', correct ? 'correct' : 'wrong');
}

function showCorrectFeedback(points, combo) {
  // 画面フラッシュ
  const flash = el('screen-flash');
  flash.className = 'screen-flash green';
  setTimeout(() => flash.className = 'screen-flash', 350);

  // ✓ オーバーレイ
  const overlay = el('feedback-overlay');
  overlay.textContent = '✓';
  overlay.className = 'feedback-overlay flash-correct';
  setTimeout(() => overlay.className = 'feedback-overlay', 700);

  // +pts ポップアップ
  const scorePopup = el('popup-score');
  scorePopup.textContent = `+${points}pts`;
  scorePopup.className = 'popup-score show';
  setTimeout(() => scorePopup.className = 'popup-score', 1100);

  // コンボ表示
  if (combo > 1) {
    const comboPopup = el('popup-combo');
    comboPopup.textContent = `コンボ x${combo}！`;
    comboPopup.className = 'popup-combo show';
    setTimeout(() => comboPopup.className = 'popup-combo', 1100);
  }

  // HOT テキスト
  if (combo >= 3) {
    const hot = el('hot-text');
    hot.textContent = combo >= 5 ? '🔥🔥 SUPER HOT!!' : '🔥 HOT!';
    hot.className = 'hot-text show';
    setTimeout(() => hot.className = 'hot-text', 1300);
  }
}

function showWrongFeedback() {
  const flash = el('screen-flash');
  flash.className = 'screen-flash red';
  setTimeout(() => flash.className = 'screen-flash', 350);

  const overlay = el('feedback-overlay');
  overlay.textContent = '✗';
  overlay.className = 'feedback-overlay flash-wrong';
  setTimeout(() => overlay.className = 'feedback-overlay', 700);
}

function doShake(element) {
  if (!element) return;
  element.classList.remove('shake');
  void element.offsetWidth; // reflow
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 500);
}

// ══════════════════════════════════════════════════════════════════
// 採点ロジック
// ══════════════════════════════════════════════════════════════════
function calcScore(results, timeElapsed, questTimeLimit) {
  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;

  const baseScore = correct * 100;

  // コンボ
  let maxCombo = 0, currentCombo = 0;
  results.forEach(r => {
    if (r.correct) { currentCombo++; maxCombo = Math.max(maxCombo, currentCombo); }
    else currentCombo = 0;
  });
  const comboBonus = maxCombo * maxCombo * 50;

  // 速度ボーナス
  const speedBonus = Math.max(0, (questTimeLimit - timeElapsed) * 3);

  // 早解きボーナス
  const quickBonus = results.reduce((sum, r) => sum + (r.quickBonus || 0), 0);

  // ヒントペナルティ（ヒントを使ったターンの数 × 50）
  const hintPenalty = results.filter(r => r.hintUsed).length * 50;

  const finalScore = Math.max(0, baseScore + comboBonus + quickBonus + speedBonus - hintPenalty);
  const maxPossible = total * 100 + (total * total * 50) + (total * 80) + (questTimeLimit * 3);

  let rank = 'C';
  if (finalScore >= maxPossible * 0.90) rank = 'S';
  else if (finalScore >= maxPossible * 0.70) rank = 'A';
  else if (finalScore >= maxPossible * 0.50) rank = 'B';

  return { finalScore, accuracy, rank, baseScore, comboBonus, quickBonus, speedBonus, hintPenalty, maxCombo };
}

// ══════════════════════════════════════════════════════════════════
// 結果画面
// ══════════════════════════════════════════════════════════════════
function showResult() {
  const session = window._bokiSession;
  const quest = session.quest;

  // タイマー停止
  if (session.timerInterval) {
    clearInterval(session.timerInterval);
    session.timerInterval = null;
  }

  const timeElapsed = session.timedOut ? quest.timeLimit : session.elapsedSeconds;
  const scoreData = calcScore(session.results, timeElapsed, quest.timeLimit);
  if (session.timedOut && (scoreData.rank === 'S' || scoreData.rank === 'A')) {
    scoreData.rank = 'B';
  }

  // アンロック処理
  const nextId = quest.id + 1;
  if (QUESTS.find(q => q.id === nextId)) {
    window._bokiState.unlocked[nextId] = true;
  }

  // ランク保存
  const prevRank = window._bokiState.ranks[quest.id];
  const rankOrder = { S: 4, A: 3, B: 2, C: 1 };
  if (!prevRank || rankOrder[scoreData.rank] > rankOrder[prevRank]) {
    window._bokiState.ranks[quest.id] = scoreData.rank;
  }
  window._bokiState.bestScores[quest.id] = Math.max(window._bokiState.bestScores[quest.id] || 0, scoreData.finalScore);
  window._bokiState.bestAccuracy[quest.id] = Math.max(window._bokiState.bestAccuracy[quest.id] || 0, scoreData.accuracy);
  window._bokiState.totalClears += 1;
  saveProgress();
  updateTitleStatus();

  // Supabase 送信
  sendScore({
    nickname: window._bokiState.nickname,
    score: scoreData.finalScore,
    quest_id: quest.id,
    quest_name: quest.title,
    difficulty: window._bokiState.difficulty,
    rank: scoreData.rank,
    accuracy: scoreData.accuracy,
    time_seconds: timeElapsed
  });

  // UI更新
  el('result-quest-name').textContent = `Quest ${quest.id}: ${quest.title}`;

  // ランクバッジ
  const rankBadge = el('result-rank-badge');
  rankBadge.textContent = scoreData.rank;
  rankBadge.className = `rank-badge ${scoreData.rank}`;
  // アニメーションリセット
  void rankBadge.offsetWidth;
  rankBadge.style.animation = 'none';
  void rankBadge.offsetWidth;
  rankBadge.style.animation = '';

  // スコアカウントアップ
  animateCount(el('result-score'), 0, scoreData.finalScore, 1000);

  el('result-accuracy').textContent = `${scoreData.accuracy}%`;
  el('result-combo').textContent = `x${scoreData.maxCombo}`;
  el('result-base').textContent = fmt(scoreData.baseScore);
  el('result-combo-bonus').textContent = `+${fmt(scoreData.comboBonus)}`;
  el('result-speed-bonus').textContent = `+${fmt(scoreData.speedBonus)}`;
  el('result-quick-bonus').textContent = `+${fmt(scoreData.quickBonus)}`;
  el('result-hint-penalty').textContent = `-${fmt(scoreData.hintPenalty)}`;
  el('result-summary').textContent = `${getQuestMeta(quest).subtitle}。正答 ${session.results.filter(r => r.correct).length}/${session.results.length} 件、${session.timedOut ? 'TIME UP で終了' : `残り時間 ${fmtTime(session.remainingSeconds)}` }、ベストスコア ${fmt(window._bokiState.bestScores[quest.id])}。`;
  el('result-review-text').textContent = buildReviewText(session.results);

  // 仕訳一覧
  const jList = el('result-journal-list');
  jList.innerHTML = '';
  session.results.forEach((r, i) => {
    const tx = quest.transactions[i];
    const div = document.createElement('div');
    div.className = `result-journal-item ${r.correct ? 'correct' : 'wrong'}`;

    const answerLines = r.correct ? r.lines : r.answer;
    const debits = answerLines.filter(l => l.debit).map(l => `${l.debit} ¥${fmt(l.debitAmount)}`).join(' / ');
    const credits = answerLines.filter(l => l.credit).map(l => `${l.credit} ¥${fmt(l.creditAmount)}`).join(' / ');

    div.innerHTML = `
      <span style="color:${r.correct ? 'var(--green)' : 'var(--red)'}; font-size:14px;">${r.correct ? '✓' : '✗'}</span>
      <div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:2px">#${i + 1} ${tx.scenario.substring(0, 30)}</div>
        <div>${debits} // ${credits}</div>
      </div>
    `;
    jList.appendChild(div);
  });

  // 次のクエストボタン
  const nextQuest = QUESTS.find(q => q.id === quest.id + 1);
  const btnNext = el('btn-next-quest');
  if (nextQuest && window._bokiState.unlocked[nextQuest.id]) {
    btnNext.style.display = '';
    btnNext.textContent = `次のクエスト: ${nextQuest.title} ▶`;
    btnNext.onclick = () => startQuest(nextQuest.id);
  } else {
    btnNext.style.display = 'none';
  }

  switchScreen('s-result');
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(from + (to - from) * eased));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════════════════════
// Supabase スコア送信
// ══════════════════════════════════════════════════════════════════
async function sendScore(data) {
  if (!_sbBoki) return;
  try {
    await _sbBoki.from('boki_scores').insert(data);
  } catch (e) {
    console.warn('スコア送信失敗:', e);
  }
}

// ══════════════════════════════════════════════════════════════════
// ランキング画面
// ══════════════════════════════════════════════════════════════════
async function showLeaderboard() {
  switchScreen('s-leaderboard');
  el('lb-content').innerHTML = '<div class="lb-loading">読み込み中...</div>';

  if (!_sbBoki) {
    el('lb-content').innerHTML = '<div class="lb-empty">ランキングは直接アクセス時に利用できます</div>';
    return;
  }
  try {
    const { data, error } = await _sbBoki
      .from('boki_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      el('lb-content').innerHTML = '<div class="lb-empty">まだスコアなし。最初のプレイヤーになろう！</div>';
      return;
    }

    const diffLabel = { beginner: '初級', intermediate: '中級', advanced: '上級' };

    let html = `
      <table class="lb-table">
        <thead>
          <tr>
            <th>順位</th>
            <th>ニックネーム</th>
            <th>スコア</th>
            <th>クエスト</th>
            <th>難易度</th>
            <th>ランク</th>
            <th>正答率</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach((row, i) => {
      const rankClass = i === 0 ? 'lb-rank-1' : i === 1 ? 'lb-rank-2' : i === 2 ? 'lb-rank-3' : '';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const diff = row.difficulty || '';
      html += `
        <tr class="${rankClass}">
          <td>${medal}</td>
          <td>${escHtml(row.nickname || '')}</td>
          <td class="lb-score">${fmt(row.score)}</td>
          <td>Q${row.quest_id}${row.quest_name ? ': ' + escHtml(row.quest_name) : ''}</td>
          <td><span class="diff-badge ${diff}">${diffLabel[diff] || diff}</span></td>
          <td><span class="rank-badge-sm ${row.rank}">${row.rank}</span></td>
          <td>${row.accuracy}%</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    el('lb-content').innerHTML = html;

  } catch (e) {
    console.warn('ランキング取得失敗:', e);
    el('lb-content').innerHTML = '<div class="lb-empty">まだスコアなし。</div>';
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ══════════════════════════════════════════════════════════════════
// ボタンイベント（結果画面）
// ══════════════════════════════════════════════════════════════════
el('btn-quest-select') && el('btn-quest-select').addEventListener('click', () => {
  showQuestSelect();
});

el('btn-result-lb') && el('btn-result-lb').addEventListener('click', () => {
  showLeaderboard();
});

el('btn-retry-quest') && el('btn-retry-quest').addEventListener('click', () => {
  if (window._bokiSession.quest) startQuest(window._bokiSession.quest.id);
});

el('btn-lb-back') && el('btn-lb-back').addEventListener('click', () => {
  switchScreen('s-title');
});

// ══════════════════════════════════════════════════════════════════
// ゲームの初期化
// ══════════════════════════════════════════════════════════════════
function init() {
  loadProgress();
  initTitle();
  updateTitleStatus();
  const selectedDiffBtn = document.querySelector(`.diff-btn[data-diff="${window._bokiState.difficulty}"]`);
  if (selectedDiffBtn) {
    document.querySelectorAll('.diff-btn').forEach(btn => btn.classList.remove('selected'));
    selectedDiffBtn.classList.add('selected');
  }

  // ゲーム画面のエントリフォームを修正して動的に管理
  // 最初の行を追加（削除不可）
  const container = el('entry-rows');
  if (container) {
    // 最初は空にしておく（loadTurn で buildEntryRows が呼ばれる）
  }
  showQuestPreview(getDefaultPreviewQuestId());
}

document.addEventListener('DOMContentLoaded', init);
