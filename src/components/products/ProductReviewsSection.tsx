'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  User, 
  Calendar, 
  Sparkles, 
  ShieldCheck
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
