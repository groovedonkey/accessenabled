export default function ScoreBadge({ score }) {
  if (score === null || score === undefined) {
    return <span className="score-badge score-na">—</span>;
  }
  const cls = score >= 90 ? 'score-good' : score >= 70 ? 'score-mid' : 'score-bad';
  return <span className={`score-badge ${cls}`}>{score}%</span>;
}
