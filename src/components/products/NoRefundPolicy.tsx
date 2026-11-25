import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Mail, 
  Award, 
  ShieldCheck, 
  Headphones, 
  Truck 
} from 'lucide-react';
import styles from './NoRefundPolicy.module.css';

export default function NoRefundPolicy() {
  return (
    <section className={styles.policyContainer}>
      {/* 1. WHY CHOOSE THIS PRODUCT BANNER */}
      <div className={styles.whyChooseBox}>
        <h3 className={styles.whyChooseHeading}>
          <Sparkles size={18} color="#D8B878" />
          <span>Why Choose This Product?</span>
        </h3>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <Award size={20} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>Premium Quality</h4>
              <p className={styles.featureDesc}>Sourced and tested for highest standards</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>Authentic</h4>
              <p className={styles.featureDesc}>100% genuine products with certificates</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <Headphones size={20} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>Expert Support</h4>
              <p className={styles.featureDesc}>Guidance on usage and benefits included</p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <Truck size={20} />
            </div>
            <div>
              <h4 className={styles.featureTitle}>Fast Delivery</h4>
              <p className={styles.featureDesc}>Quick shipping across the country</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SACRED NO REFUND POLICY */}
      <div className={styles.refundCard}>
        <div className={styles.policyHeader}>
          <div className={styles.policyHeaderIcon}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span className={styles.policyEyebrow}>Sacred Merchandise Terms</span>
            <h3 className={styles.policyMainTitle}>No Refund Policy</h3>
          </div>
        </div>

        <div className={styles.policyBody}>
          <div className={styles.policyStatement}>
            <h4 className={styles.blockTitle}>No Refunds</h4>
            <p className={styles.blockText}>
              We do not offer refunds for product purchases. All sales are final unless otherwise stated.
            </p>
          </div>

          <div className={styles.policyStatement}>
            <h4 className={styles.blockTitle}>Exceptions</h4>
            <p className={styles.blockText}>
              In rare cases of damage during shipping, please contact support immediately with photos for review.
            </p>
          </div>

          <div className={styles.supportBox}>
            <Mail size={16} color="var(--primary)" />
            <span>
              <strong>Support:</strong> If you have any concerns, our support team is available to help at{' '}
              <a href="mailto:support@rehas.in" className={styles.supportLink}>
                support@rehas.in
              </a>
              .
            </span>
          </div>

          {/* Special Sanctification Callout */}
          <div className={styles.consecrationCallout}>
            <div className={styles.calloutTitleRow}>
              <Sparkles size={18} color="#D8B878" />
              <h4 className={styles.calloutHeading}>
                Why No Refund for Energy-Activated Bracelets?
              </h4>
            </div>

            <p className={styles.calloutIntro}>
              When you select the <em>&quot;Energy Cleansing Ritual&quot;</em> or <em>&quot;Energy Activation Ritual&quot;</em> option, 
              a sacred puja (ritual ceremony) is performed on your bracelet with your name and intention. Once this spiritual activation is completed:
            </p>

            <ul className={styles.ritualPointsList}>
              <li>
                <CheckCircle2 size={15} className={styles.checkIcon} />
                <span>
                  <strong>Personalized Energy Work:</strong> The bracelet becomes spiritually personalized to you through ritual activation.
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className={styles.checkIcon} />
                <span>
                  <strong>Irreversible Process:</strong> The energy work performed cannot be reversed or transferred.
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className={styles.checkIcon} />
                <span>
                  <strong>Spiritual Commitment:</strong> The ritual creates a sacred bond between you and the crystal&apos;s healing energy.
                </span>
              </li>
              <li>
                <CheckCircle2 size={15} className={styles.checkIcon} />
                <span>
                  <strong>No Returns Accepted:</strong> Bracelets with completed puja ceremonies are non-refundable under any circumstances.
                </span>
              </li>
            </ul>

            <p className={styles.calloutClosing}>
              Please ensure you are ready for the spiritual commitment before selecting the energy activation ritual. 
              If you prefer to purchase without the ritual, you can choose a bracelet without this service, which is still subject to our standard no-refund policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
