import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import BreadcrumbNav from '@/components/common/BreadcrumbNav';
import siteConfig from '@/data/site-config.json';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
  CheckCircle2,
  HeartHandshake,
  Compass,
  ArrowRight,
  Gem,
  MapPin,
  PhoneCall,
  Clock,
  Layers,
} from 'lucide-react';
import styles from './About.module.css';

export const metadata: Metadata = {
  title: 'About REHAS Sacred Merchandise | Consecrated Vedic Crystals & Astro Jyotish',
  description:
    'Discover the spiritual genesis of REHAS. Hand-selected, 100% natural astrological crystal bracelets and Rudrakshas energized with authentic Vedic Prana Pratishtha rites in Patna, Bihar.',
  alternates: {
    canonical: 'https://rehas.in/about',
  },
  openGraph: {
    title: 'About REHAS Sacred Merchandise | Authentic Vedic Consecration',
    description:
      'Bridging ancient Hindu temple wisdom with contemporary metaphysical life. Naturally mined gemstones, energized with Beej Mantras & holy Ganga Jal.',
    url: 'https://rehas.in/about',
    siteName: 'REHAS Sacred Merchandise',
    type: 'website',
  },
};

export default function AboutPage() {
  const pillars = [
    {
      icon: <Gem className={styles.pillarIcon} size={28} />,
      title: '100% Natural Earth Crystals',
      desc: 'Sourced strictly from certified mineral veins across India, Brazil, Peru, and Africa. Zero synthetic dyes, plastic fillers, or heat-altered glass imitations.',
    },
    {
      icon: <Flame className={styles.pillarIcon} size={28} />,
      title: 'Authentic Prana Pratishtha',
      desc: 'Purified with holy Ganga Jal and Vedic Panchamrit, then consecrated through 108 planetary Beej Mantra recitations by devout Acharyas.',
    },
    {
      icon: <Layers className={styles.pillarIcon} size={28} />,
      title: 'Three Consecration Tiers',
      desc: 'Available in Standard Devotional, Premium Consecrated, and Personalized Siddha Editions customized to your birth Rashi, Gotra, and Mulank.',
    },
    {
      icon: <ShieldCheck className={styles.pillarIcon} size={28} />,
      title: 'Ethical Direct Craftsmanship',
      desc: 'Strung on reinforced, durable Korean elastic bands by skilled Indian artisans. High-comfort everyday talismans designed for lifelong spiritual resonance.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Ethical Mineral Sourcing',
      desc: 'We inspect raw Pyrite, Sulemani Hakik, Citrine, Rose Quartz, and authentic Nepal/Java Rudraksha beads for mineral purity, clarity, and vibrational weight.',
    },
    {
      step: '02',
      title: 'Gangetic Shuddhi (Purification)',
      desc: 'Every gemstone is bathed in consecrated Gangotri Ganga Jal, raw cow milk, and cow ghee to cleanse ancestral quarry residue and reset electromagnetic memory.',
    },
    {
      step: '03',
      title: 'Vedic Beej Mantra Chanting',
      desc: 'Under auspicious planetary Horas, our Vedic pandits chant the specific deity mantras 108 times over copper yantras to awaken the inherent crystal deva.',
    },
    {
      step: '04',
      title: 'Sacred Dispatch to Your Doorstep',
      desc: 'Packed in cushioned ceremonial pouches with authentication guidance, arriving ready to be worn immediately with your personal prayer.',
    },
  ];

  const categories = [
    {
      name: 'Money Magnet Bracelets',
      tag: 'Wealth & Prosperity',
      desc: 'Peruvian Pyrite, Citrine & Green Aventurine designed to open solar plexus abundance and dissolve debt stagnation.',
      href: '/shop?category=wealth-abundance',
    },
    {
      name: 'Navgrah Planetary Kadas',
      tag: 'Astrological Equilibrium',
      desc: 'Harmonize the nine celestial grahas with nine consecrated planetary stones and certified Rudrakshas.',
      href: '/shop?category=planetary-navgrah',
    },
    {
      name: 'Sulemani Hakik Shield',
      tag: 'Nazar & Evil Eye Defense',
      desc: 'Deep black Agate providing a psychic firewall against toxic envy, black energy, and Saturnian malefic transit.',
      href: '/shop?category=evil-eye-nazar-suraksha',
    },
    {
      name: 'Venus & Heart Chakra',
      tag: 'Love, Marriage & Peace',
      desc: 'Rose Quartz & Morganite soothing emotional heartache, fostering tender romantic attraction, and calming stress.',
      href: '/shop?category=love-harmony-venus',
    },
  ];

  return (
    <div className={styles.aboutWrapper}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumbWrapper}>
          <BreadcrumbNav
            items={[
              { label: 'Home', href: '/' },
              { label: 'About REHAS', href: '/about' },
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.sacredBadge}>
              <Sparkles size={14} color="#D8B878" />
              <span>Sacred Vedic Sanctum &amp; Consecration Atelier</span>
            </div>
            <h1 className={styles.heroTitle}>
              Bridging Ancient Jyotish Wisdom <br className={styles.desktopBr} />
              With Living Vibrational Energy
            </h1>
            <p className={styles.heroSubtitle}>
              Welcome to <strong>REHAS Sacred Merchandise</strong>. We are a traditional metaphysical sanctum based in Patna, Bihar, dedicated to restoring purity, astrological efficacy, and Vedic consecration (<em>Prana Pratishtha</em>) to genuine earth crystals and sacred malas.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/shop" className={styles.primaryBtn}>
                <span>Explore Consecrated Bracelets</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/blog" className={styles.secondaryBtn}>
                <span>Read Vedic Articles</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Our Sacred Genesis & Philosophy */}
        <section className={styles.storySection}>
          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <span className={styles.storyTag}>The Spiritual Genesis</span>
              <h2 className={styles.sectionHeading}>The Purpose Behind REHAS</h2>
              <p className={styles.storyText}>
                In an era where synthetic beads and factory glass are mass-marketed as &ldquo;healing jewelry,&rdquo; <strong>REHAS</strong> was conceived to preserve the sanctity of authentic Vedic remedial science.
              </p>
              <p className={styles.storyText}>
                According to the <em>Brihat Samhita</em> and classical <em>Jyotish Shastras</em>, a mineral operates as an antenna for celestial planetary cosmic rays (<em>Kirana</em>). An untreated natural crystal interacts directly with your aura&apos;s meridian points.
              </p>
              <p className={styles.storyText}>
                Every piece leaving our atelier in Patna is treated as a sacred talisman—cleansed, attuned with Beej Mantras, and prepared to support your spiritual evolution, health, and worldly prosperity.
              </p>

              <div className={styles.heritageHighlight}>
                <Compass size={22} className={styles.highlightIcon} />
                <div>
                  <h4 className={styles.highlightTitle}>Conception in the Land of Ancient Wisdom</h4>
                  <p className={styles.highlightText}>
                    Rooted in historical Pataliputra (Patna, Bihar), along the sacred banks of the Ganges, our atelier honors millennia of continuous Vedic scholarship and temple rituals.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.storyVisual}>
              <div className={styles.statBoxGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statNum}>100%</span>
                  <span className={styles.statLabel}>Natural Untreated Crystals</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNum}>108</span>
                  <span className={styles.statLabel}>Planetary Beej Mantras</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNum}>7-Day</span>
                  <span className={styles.statLabel}>Doorstep Returns</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statNum}>PAN-India</span>
                  <span className={styles.statLabel}>Express Courier Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Pillars */}
        <section className={styles.pillarsSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>Our Spiritual Pledges</span>
            <h2 className={styles.sectionHeadingCenter}>The Four Pillars of REHAS Sanctity</h2>
            <p className={styles.sectionSubCenter}>
              What separates our consecrated talismans from ordinary fashion accessories.
            </p>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((p, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <div className={styles.pillarIconWrap}>{p.icon}</div>
                <h3 className={styles.pillarTitle}>{p.title}</h3>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Consecration Ritual Flow */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>Vedic Methodology</span>
            <h2 className={styles.sectionHeadingCenter}>The Prana Pratishtha Consecration Journey</h2>
            <p className={styles.sectionSubCenter}>
              How each mineral is awakened from dormant earth stone into an active spiritual shield.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((st, i) => (
              <div key={i} className={styles.stepCard}>
                <span className={styles.stepNumber}>{st.step}</span>
                <h3 className={styles.stepTitle}>{st.title}</h3>
                <p className={styles.stepDesc}>{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sacred Categories Overview */}
        <section className={styles.categoriesSection}>
          <div className={styles.sectionHeaderCenter}>
            <span className={styles.sectionEyebrow}>Sacred Collections</span>
            <h2 className={styles.sectionHeadingCenter}>Tailored for Your Astrological Journey</h2>
            <p className={styles.sectionSubCenter}>
              Explore our primary remedial lines aligned with your astrological chart and spiritual aspirations.
            </p>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((c, idx) => (
              <Link key={idx} href={c.href} className={styles.catCard}>
                <span className={styles.catTag}>{c.tag}</span>
                <h3 className={styles.catName}>{c.name}</h3>
                <p className={styles.catDesc}>{c.desc}</p>
                <div className={styles.catLink}>
                  <span>Explore Collection</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Atelier & Sanctum Info */}
        <section className={styles.contactSanctumSection}>
          <div className={styles.sanctumGrid}>
            <div>
              <span className={styles.storyTag}>Physical Sanctum</span>
              <h2 className={styles.sectionHeading}>Visit or Inquire With Our Atelier</h2>
              <p className={styles.storyText}>
                Our administrative center and ritual consecration atelier is located in Patna, Bihar. We welcome patrons seeking personalized astrological consultation, Gotra-based energization inquiries, and bespoke corporate energizations.
              </p>

              <div className={styles.contactDetails}>
                <div className={styles.contactDetailRow}>
                  <MapPin size={20} className={styles.contactDetailIcon} />
                  <div>
                    <strong>Sanctum Location:</strong>
                    <span>{siteConfig.contact.address.fullAddress}</span>
                  </div>
                </div>

                <div className={styles.contactDetailRow}>
                  <PhoneCall size={20} className={styles.contactDetailIcon} />
                  <div>
                    <strong>Astrological Helpline / WhatsApp:</strong>
                    <a href={`https://wa.me/919517973153`} target="_blank" rel="noreferrer" className={styles.helplineLink}>
                      {siteConfig.contact.phone}
                    </a>
                  </div>
                </div>

                <div className={styles.contactDetailRow}>
                  <Clock size={20} className={styles.contactDetailIcon} />
                  <div>
                    <strong>Sanctum Consultation Hours:</strong>
                    <span>{siteConfig.contact.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.calloutBox}>
              <HeartHandshake size={32} className={styles.calloutIcon} />
              <h3 className={styles.calloutTitle}>Personalized Siddha Energization</h3>
              <p className={styles.calloutText}>
                Have a specific astrological dosha, Shani Sade Sati transit, Rahu Mahadasha, or business obstacle? Our Acharyas can infuse your bracelet with customized Sankalpa using your birth date, time, and Gotra.
              </p>
              <Link
                href="https://wa.me/919517973153?text=Pranam%20REHAS%20Sanctum!%20I%20would%20like%20personalized%20astrological%20energization%20guidance."
                target="_blank"
                className={styles.calloutBtn}
              >
                <span>Consult Vedic Astrologer on WhatsApp</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
