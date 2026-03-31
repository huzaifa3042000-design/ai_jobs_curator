export default function ScoreBadge({ score, size = 'md' }) {
  const numScore = Number(score);
  const cls = numScore >= 80 ? 'score-high' : numScore >= 60 ? 'score-medium' : 'score-low';
  const sizeClass = size === 'lg' ? 'score-badge-lg' : '';

  if (score == null) {
    return (
      <div className={`score-badge score-medium ${sizeClass}`}>
        <span className="score-value">—</span>
        <span className="score-label">N/A</span>
      </div>
    );
  }

  return (
    <div className={`score-badge ${cls} ${sizeClass}`}>
      <span className="score-value">{Math.round(numScore)}%</span>
      <span className="score-label">Match</span>
    </div>
  );
}
