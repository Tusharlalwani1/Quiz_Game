import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { autoSeedIfEmpty } from './seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const QUIZ_USERNAME = process.env.QUIZ_USERNAME || 'quiz2026';
const QUIZ_PASSWORD = process.env.QUIZ_PASSWORD || 'play123';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminSecret2026';
const JWT_SECRET = process.env.JWT_SECRET || 'super_jwt_secret_quiz_app_2026';

app.use(cors());
app.use(express.json());

// --- ADMIN JWT MIDDLEWARE ---
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

// --- PARTICIPANT QUIZ ENDPOINTS ---

// 1. Participant Login
app.post('/api/quiz/login', (req, res) => {
  const { username, password, participantName } = req.body;

  if (!username || !password || !participantName) {
    return res.status(400).json({ error: 'Username, password, and Your Name are required.' });
  }

  if (username.trim() !== QUIZ_USERNAME || password.trim() !== QUIZ_PASSWORD) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const cleanName = participantName.trim();
  if (cleanName.length < 2) {
    return res.status(400).json({ error: 'Please enter a valid display name (at least 2 characters).' });
  }

  const attemptId = uuidv4();
  const sessionId = uuidv4();
  const startedAt = new Date().toISOString();

  try {
    const stmt = db.prepare(`
      INSERT INTO attempts (id, participant_name, session_id, started_at, status, total_score, tab_switch_count)
      VALUES (?, ?, ?, ?, 'in_progress', 0, 0)
    `);
    stmt.run(attemptId, cleanName, sessionId, startedAt);

    res.json({
      success: true,
      sessionId,
      attemptId,
      participantName: cleanName,
      startedAt
    });
  } catch (err) {
    console.error('Error creating attempt:', err);
    res.status(500).json({ error: 'Failed to create quiz session.' });
  }
});

// 2. Fetch Session Progress (Resume support)
app.get('/api/quiz/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  try {
    const attempt = db.prepare('SELECT * FROM attempts WHERE session_id = ?').get(sessionId);
    if (!attempt) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    const answers = db.prepare(`
      SELECT question_id, selected_option, time_taken_seconds
      FROM answers
      WHERE attempt_id = ?
    `).all(attempt.id);

    res.json({
      attempt,
      answers
    });
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Failed to fetch session progress.' });
  }
});

// 3. Get Questions (Without correct_option to prevent client cheat)
app.get('/api/quiz/questions', (req, res) => {
  try {
    const questions = db.prepare(`
      SELECT id, text, option_a, option_b, option_c, option_d, question_order
      FROM questions
      ORDER BY question_order ASC
    `).all();

    const formatted = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: {
        A: q.option_a,
        B: q.option_b,
        C: q.option_c,
        D: q.option_d
      },
      order: q.question_order
    }));

    res.json({ questions: formatted });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to load questions.' });
  }
});

// 4. Save Answer for a Question
app.post('/api/quiz/answer', (req, res) => {
  const { sessionId, questionId, selectedOption, timeTakenSeconds } = req.body;

  if (!sessionId || !questionId) {
    return res.status(400).json({ error: 'Session ID and Question ID are required.' });
  }

  try {
    const attempt = db.prepare('SELECT * FROM attempts WHERE session_id = ?').get(sessionId);
    if (!attempt) {
      return res.status(404).json({ error: 'Quiz session not found.' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({ error: 'Quiz has already been completed.' });
    }

    const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    const isCorrect = (selectedOption && selectedOption.toUpperCase() === question.correct_option) ? 1 : 0;
    const answeredAt = new Date().toISOString();
    const safeTimeTaken = typeof timeTakenSeconds === 'number' ? timeTakenSeconds : 0;

    // Check if an answer for this question already exists for this attempt
    const existing = db.prepare('SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?').get(attempt.id, questionId);

    if (existing) {
      const updateStmt = db.prepare(`
        UPDATE answers
        SET selected_option = ?, is_correct = ?, answered_at = ?, time_taken_seconds = ?
        WHERE id = ?
      `);
      updateStmt.run(selectedOption || null, isCorrect, answeredAt, safeTimeTaken, existing.id);
    } else {
      const insertStmt = db.prepare(`
        INSERT INTO answers (attempt_id, question_id, selected_option, is_correct, answered_at, time_taken_seconds)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(attempt.id, questionId, selectedOption || null, isCorrect, answeredAt, safeTimeTaken);
    }

    // Recalculate total score
    const scoreResult = db.prepare(`
      SELECT SUM(is_correct) as totalScore FROM answers WHERE attempt_id = ?
    `).get(attempt.id);

    const newScore = scoreResult?.totalScore || 0;
    db.prepare('UPDATE attempts SET total_score = ? WHERE id = ?').run(newScore, attempt.id);

    res.json({ success: true, saved: true });
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ error: 'Failed to record answer.' });
  }
});

// 5. Track Tab Switch / Blur Warning
app.post('/api/quiz/tab-switch', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });

  try {
    const attempt = db.prepare('SELECT id, tab_switch_count FROM attempts WHERE session_id = ?').get(sessionId);
    if (attempt) {
      const newCount = attempt.tab_switch_count + 1;
      db.prepare('UPDATE attempts SET tab_switch_count = ? WHERE id = ?').run(newCount, attempt.id);
      return res.json({ success: true, tabSwitchCount: newCount });
    }
    res.status(404).json({ error: 'Session not found.' });
  } catch (err) {
    console.error('Error recording tab switch:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 6. Complete Quiz
app.post('/api/quiz/complete', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required.' });

  try {
    const attempt = db.prepare('SELECT * FROM attempts WHERE session_id = ?').get(sessionId);
    if (!attempt) return res.status(404).json({ error: 'Session not found.' });

    const completedAt = new Date().toISOString();

    // Final total score recalculation
    const scoreResult = db.prepare(`
      SELECT SUM(is_correct) as totalScore FROM answers WHERE attempt_id = ?
    `).get(attempt.id);

    const finalScore = scoreResult?.totalScore || 0;

    db.prepare(`
      UPDATE attempts
      SET status = 'completed', completed_at = ?, total_score = ?
      WHERE id = ?
    `).run(completedAt, finalScore, attempt.id);

    res.json({ success: true, completedAt });
  } catch (err) {
    console.error('Error completing quiz:', err);
    res.status(500).json({ error: 'Failed to complete quiz.' });
  }
});

// --- ADMIN ENDPOINTS ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username.trim() !== ADMIN_USERNAME || password.trim() !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = jwt.sign(
    { role: 'admin', username: ADMIN_USERNAME },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token });
});

// Admin Get All Quiz Attempts & Details
app.get('/api/admin/attempts', authenticateAdmin, (req, res) => {
  try {
    const attempts = db.prepare(`
      SELECT id, participant_name, session_id, started_at, completed_at, total_score, tab_switch_count, status
      FROM attempts
      ORDER BY started_at DESC
    `).all();

    const result = attempts.map(attempt => {
      // Calculate duration in seconds
      let durationSeconds = 0;
      if (attempt.started_at && attempt.completed_at) {
        const start = new Date(attempt.started_at).getTime();
        const end = new Date(attempt.completed_at).getTime();
        durationSeconds = Math.max(0, Math.round((end - start) / 1000));
      }

      const answers = db.prepare(`
        SELECT 
          ans.question_id,
          ans.selected_option,
          ans.is_correct,
          ans.time_taken_seconds,
          q.text as question_text,
          q.option_a, q.option_b, q.option_c, q.option_d,
          q.correct_option,
          q.question_order
        FROM answers ans
        JOIN questions q ON ans.question_id = q.id
        WHERE ans.attempt_id = ?
        ORDER BY q.question_order ASC
      `).all(attempt.id);

      return {
        ...attempt,
        durationSeconds,
        answers: answers.map(a => ({
          questionId: a.question_id,
          questionOrder: a.question_order,
          questionText: a.question_text,
          options: { A: a.option_a, B: a.option_b, C: a.option_c, D: a.option_d },
          selectedOption: a.selected_option,
          correctOption: a.correct_option,
          isCorrect: Boolean(a.is_correct),
          timeTakenSeconds: a.time_taken_seconds
        }))
      };
    });

    res.json({ attempts: result });
  } catch (err) {
    console.error('Error fetching admin attempts:', err);
    res.status(500).json({ error: 'Failed to fetch admin data.' });
  }
});

// Admin Delete Single Attempt
app.delete('/api/admin/attempts/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM attempts WHERE id = ?').run(id);
    res.json({ success: true, deletedId: id });
  } catch (err) {
    console.error('Error deleting attempt:', err);
    res.status(500).json({ error: 'Failed to delete attempt.' });
  }
});

// Admin Delete All Attempts
app.delete('/api/admin/attempts-all', authenticateAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM answers;').run();
    db.prepare('DELETE FROM attempts;').run();
    res.json({ success: true, message: 'All attempts cleared.' });
  } catch (err) {
    console.error('Error clearing attempts:', err);
    res.status(500).json({ error: 'Failed to clear attempts.' });
  }
});

// Serve frontend static files in production if dist directory exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Application build not found. Run dev server or npm run build.');
    }
  });
});

app.listen(PORT, () => {
  autoSeedIfEmpty();
  console.log(`🚀 ChronoQuiz Backend Server listening on http://localhost:${PORT}`);
});
