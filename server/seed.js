import db from './db.js';

const sampleQuestions = [
  {
    order: 1,
    text: "Which HTML5 element is used to specify a header for a document or section?",
    optionA: "<top>",
    optionB: "<header>",
    optionC: "<head>",
    optionD: "<section-head>",
    correct: "B"
  },
  {
    order: 2,
    text: "In JavaScript, which of the following runs synchronously in the Event Loop execution priority?",
    optionA: "Promise callback (.then)",
    optionB: "setTimeout callback",
    optionC: "Call Stack execution of standard functions",
    optionD: "requestAnimationFrame",
    correct: "C"
  },
  {
    order: 3,
    text: "Which CSS property specifies the alignment of flexible container items along the cross axis?",
    optionA: "justify-content",
    optionB: "align-items",
    optionC: "flex-direction",
    optionD: "align-content",
    correct: "B"
  },
  {
    order: 4,
    text: "In React, what hook should be used to store a mutable reference that does not trigger re-renders?",
    optionA: "useState",
    optionB: "useMemo",
    optionC: "useRef",
    optionD: "useCallback",
    correct: "C"
  },
  {
    order: 5,
    text: "Which SQL clause is used to filter records after an aggregate function calculation like GROUP BY?",
    optionA: "WHERE",
    optionB: "HAVING",
    optionC: "ORDER BY",
    optionD: "FILTER",
    correct: "B"
  },
  {
    order: 6,
    text: "What HTTP response status code signifies '206 Partial Content', commonly used for media streaming?",
    optionA: "200 OK",
    optionB: "204 No Content",
    optionC: "206 Partial Content",
    optionD: "304 Not Modified",
    correct: "C"
  },
  {
    order: 7,
    text: "In Git, which command creates a new branch and immediately switches to it in one step?",
    optionA: "git branch -new <name>",
    optionB: "git checkout -b <name>",
    optionC: "git commit -b <name>",
    optionD: "git switch -c <name>",
    correct: "B"
  },
  {
    order: 8,
    text: "What component inside a modern CPU handles arithmetic calculations and logical decision operations?",
    optionA: "Control Unit (CU)",
    optionB: "Arithmetic Logic Unit (ALU)",
    optionC: "L3 Cache",
    optionD: "Memory Management Unit (MMU)",
    correct: "B"
  },
  {
    order: 9,
    text: "What key component in Transformer neural network architectures allows processing all sequence tokens in parallel?",
    optionA: "Recurrent Loop",
    optionB: "Self-Attention Mechanism",
    optionC: "Pooling Layer",
    optionD: "Feed-Forward Gate",
    correct: "B"
  },
  {
    order: 10,
    text: "Which cryptographic attack type works by trying all possible keys or passwords systematically until finding the match?",
    optionA: "Phishing Attack",
    optionB: "Man-in-the-Middle Attack",
    optionC: "Brute-Force Attack",
    optionD: "SQL Injection",
    correct: "C"
  },
  {
    order: 11,
    text: "What is the worst-case time complexity of standard QuickSort algorithm with an unlucky pivot choice?",
    optionA: "O(N log N)",
    optionB: "O(N)",
    optionC: "O(N²)",
    optionD: "O(2ᴺ)",
    correct: "C"
  },
  {
    order: 12,
    text: "In Python, which built-in data type is immutable and ordered?",
    optionA: "List",
    optionB: "Set",
    optionC: "Dictionary",
    optionD: "Tuple",
    correct: "D"
  },
  {
    order: 13,
    text: "What containerization concept abstracts operating system level virtualization to package apps with dependencies?",
    optionA: "Hypervisor",
    optionB: "Docker Container",
    optionC: "Virtual Machine",
    optionD: "Serverless Function",
    correct: "B"
  },
  {
    order: 14,
    text: "Which browser Web API allows web apps to send real-time bidirectional communication over a single TCP connection?",
    optionA: "Fetch API",
    optionB: "WebSocket API",
    optionC: "ServiceWorker API",
    optionD: "WebRTC API",
    correct: "B"
  },
  {
    order: 15,
    text: "Who is widely recognized in history as the world's first computer programmer for writing an algorithm for Babbage's Analytical Engine?",
    optionA: "Alan Turing",
    optionB: "Grace Hopper",
    optionC: "Ada Lovelace",
    optionD: "Margaret Hamilton",
    correct: "C"
  }
];

export function seedDatabase() {
  console.log("🌱 Seeding 15 MCQ questions into Database...");
  
  // Clear existing dependent records first to respect Foreign Key constraints
  db.exec("DELETE FROM answers;");
  db.exec("DELETE FROM attempts;");
  db.exec("DELETE FROM questions;");

  const insertStmt = db.prepare(`
    INSERT INTO questions (text, option_a, option_b, option_c, option_d, correct_option, question_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const q of sampleQuestions) {
    insertStmt.run(q.text, q.optionA, q.optionB, q.optionC, q.optionD, q.correct, q.order);
  }

  console.log("✅ Seed completed successfully! 15 questions ready.");
}

export function autoSeedIfEmpty() {
  try {
    const row = db.prepare("SELECT COUNT(*) as count FROM questions").get();
    if (!row || row.count === 0) {
      console.log("ℹ️ Questions table is empty. Auto-seeding initial 15 questions...");
      seedDatabase();
    }
  } catch (err) {
    console.error("Error auto-seeding database:", err);
  }
}

// Run direct script execution check
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
