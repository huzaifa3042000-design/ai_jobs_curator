import { useFeedback } from '../hooks/useFeedback.js';

export default function FeedbackButtons({ jobId, currentFeedback }) {
  const feedback = useFeedback();

  const handleFeedback = (type) => {
    feedback.mutate({ jobId, feedback: type });
  };

  return (
    <div className="feedback-buttons">
      <button
        className={`feedback-btn ${currentFeedback === 'GOOD' ? 'active-good' : ''}`}
        onClick={() => handleFeedback('GOOD')}
        title="Good match"
        disabled={feedback.isPending}
      >
        👍
      </button>
      <button
        className={`feedback-btn ${currentFeedback === 'BAD' ? 'active-bad' : ''}`}
        onClick={() => handleFeedback('BAD')}
        title="Bad match"
        disabled={feedback.isPending}
      >
        👎
      </button>
    </div>
  );
}
