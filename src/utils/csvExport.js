export function exportAttemptsToCSV(attempts) {
  if (!attempts || attempts.length === 0) return;

  const headers = [
    'Attempt ID',
    'Participant Name',
    'Score (out of 15)',
    'Percentage (%)',
    'Time Taken (seconds)',
    'Date Started',
    'Date Completed',
    'Tab Switch Warnings',
    'Status'
  ];

  // Append Q1 to Q15 details
  for (let i = 1; i <= 15; i++) {
    headers.push(`Q${i} Selected`, `Q${i} Result`);
  }

  const rows = attempts.map(attempt => {
    const scorePct = Math.round((attempt.total_score / 15) * 100);
    const row = [
      `"${attempt.id}"`,
      `"${attempt.participant_name.replace(/"/g, '""')}"`,
      attempt.total_score,
      `${scorePct}%`,
      attempt.durationSeconds || 0,
      `"${new Date(attempt.started_at).toLocaleString()}"`,
      attempt.completed_at ? `"${new Date(attempt.completed_at).toLocaleString()}"` : '"In Progress"',
      attempt.tab_switch_count || 0,
      `"${attempt.status}"`
    ];

    // Answers per question
    const answerMap = new Map();
    if (attempt.answers) {
      attempt.answers.forEach(ans => answerMap.set(ans.questionOrder, ans));
    }

    for (let i = 1; i <= 15; i++) {
      const ans = answerMap.get(i);
      if (ans) {
        row.push(
          `"${ans.selectedOption || 'Unanswered'}"`,
          `"${ans.isCorrect ? 'Correct' : 'Incorrect'}"`
        );
      } else {
        row.push('"N/A"', '"N/A"');
      }
    }

    return row.join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `chronoquiz_results_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
