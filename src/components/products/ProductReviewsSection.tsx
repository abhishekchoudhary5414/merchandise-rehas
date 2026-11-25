'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Send
} from 'lucide-react';
import styles from './ProductReviewsSection.module.css';

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface ProductReviewsSectionProps {
  productId: string;
  initialReviews?: ReviewItem[];
  initialRating?: number;
  initialReviewCount?: number;
}

export default function ProductReviewsSection({
  productId,
  initialReviews = [],
  initialRating = 0,
  initialReviewCount = 0,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(initialRating);
  const [reviewCount, setReviewCount] = useState<number>(initialReviewCount);
  const [loading, setLoading] = useState(false);

  // Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formAuthor, setFormAuthor] = useState('');
  const [formOrderNum, setFormOrderNum] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch latest reviews on mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setReviews(data.reviews || []);
            setRating(data.averageRating || 0);
            setReviewCount(data.totalReviews || 0);
          }
        }
      } catch {
        // keep initial props
      }
    }
    fetchReviews();
  }, [productId]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formComment.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formRating,
          author: formAuthor.trim() || undefined,
          orderNumber: formOrderNum.trim() || undefined,
          comment: formComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', text: data.error || 'Failed to submit review' });
      } else {
        setFeedback({ 
          type: 'success', 
          text: data.review.verified
            ? 'Dhanyawad! Your verified purchase review has been published.'
            : 'Dhanyawad! Your patron review has been recorded.'
        });
        setReviews((prev) => [data.review, ...prev]);
        setRating(data.averageRating);
        setReviewCount(data.reviewCount);
        setFormComment('');
        setShowReviewForm(false);
      }
    } catch {
      setFeedback({ type: 'error', text: 'An unexpected error occurred while posting review.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.reviewsContainer} id="customer-reviews">
      <div className={styles.reviewsHeader}>
        <div>
          <div className={styles.eyebrow}>
            <Sparkles size={13} color="#D8B878" />
            <span>Patron Experiences &amp; Blessings</span>
          </div>
          <h2 className={styles.mainTitle}>Customer Reviews &amp; Ratings</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowReviewForm((v) => !v)}
          className={styles.writeReviewBtn}
        >
          <MessageSquare size={16} />
          <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Ratings Overview Bar */}
      <div className={styles.overviewBar}>
        <div className={styles.scoreCol}>
          <div className={styles.scoreNumber}>{rating > 0 ? rating.toFixed(1) : '0.0'}</div>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                fill={star <= Math.round(rating) ? '#E59819' : 'none'}
                color={star <= Math.round(rating) ? '#E59819' : '#D1D5DB'}
              />
            ))}
          </div>
          <span className={styles.totalText}>
            Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        <div className={styles.trustCol}>
          <div className={styles.trustItem}>
            <ShieldCheck size={18} color="#059669" />
            <span>100% Authentic Consecrated Crystals</span>
          </div>
          <div className={styles.trustItem}>
            <CheckCircle2 size={18} color="#059669" />
            <span>Verified Post-Delivery Feedback</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError}>
          {feedback.text}
        </div>
      )}

      {/* Review Submission Form */}
      {showReviewForm && (
        <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
          <h3 className={styles.formTitle}>Share Your Sacred Experience</h3>
          <p className={styles.formSub}>
            Delivered customers receive an authentic <em>&quot;Verified Patron&quot;</em> badge upon review.
          </p>

          {/* Star selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Your Rating</label>
            <div className={styles.starSelectRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setFormRating(s)}
                  className={styles.starPickBtn}
                >
                  <Star
                    size={22}
                    fill={s <= formRating ? '#E59819' : 'none'}
                    color={s <= formRating ? '#E59819' : '#9CA3AF'}
                  />
                </button>
              ))}
              <span className={styles.ratingWord}>
                {formRating === 5 && 'Outstanding & Consecrated'}
                {formRating === 4 && 'Very Good Energy'}
                {formRating === 3 && 'Average'}
                {formRating <= 2 && 'Needs Improvement'}
              </span>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Your Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Sharma"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Delivered Order Number (Optional for Verification)</label>
              <input
                type="text"
                placeholder="e.g. REHAS-IN-047829-492"
                value={formOrderNum}
                onChange={(e) => setFormOrderNum(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Your Review &amp; Spiritual Experience</label>
            <textarea
              rows={4}
              placeholder="How did wearing this energized bracelet impact your mental clarity, focus, or peace? Share details about the craftsmanship and Vedic consecration."
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              className={styles.textarea}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.submitReviewBtn}
          >
            <Send size={15} />
            <span>{submitting ? 'Publishing...' : 'Submit Review'}</span>
          </button>
        </form>
      )}

      {/* Review List */}
      <div className={styles.reviewsList}>
        {reviews.length === 0 ? (
          <div className={styles.emptyReviews}>
            <MessageSquare size={36} color="var(--primary)" style={{ opacity: 0.4 }} />
            <h4 className={styles.emptyTitle}>No reviews yet for this consecrated piece</h4>
            <p className={styles.emptyText}>
              Be the first patron to share your experience once your sanctified order is delivered!
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className={styles.reviewCard}>
              <div className={styles.reviewTopRow}>
                <div className={styles.authorGroup}>
                  <div className={styles.avatarWrap}>
                    <User size={15} />
                  </div>
                  <div>
                    <strong className={styles.authorName}>{r.author}</strong>
                    {r.verified && (
                      <span className={styles.verifiedBadge}>
                        <CheckCircle2 size={11} /> Verified Delivered Patron
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.dateMeta}>
                  <Calendar size={13} />
                  <span>
                    {new Date(r.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Stars */}
              <div className={styles.cardStars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= r.rating ? '#E59819' : 'none'}
                    color={s <= r.rating ? '#E59819' : '#D1D5DB'}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className={styles.reviewComment}>{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
