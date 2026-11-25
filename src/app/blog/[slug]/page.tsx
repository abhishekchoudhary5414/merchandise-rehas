import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import AnnouncementBar from '@/components/announcement-bar/AnnouncementBar';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';
import WhatsAppFloat from '@/components/whatsapp/WhatsAppFloat';
import { 
  Sparkles, 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Share2, 
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import styles from './BlogDetail.module.css';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_BLOGS: Record<string, any> = {
  'consecrated-gemstone-bracelets-balance-chakras': {
    id: 'default-1',
    title: 'How Consecrated Gemstone Bracelets Balance Your 7 Chakras',
    slug: 'consecrated-gemstone-bracelets-balance-chakras',
    summary: 'Discover how authentic energized crystals harmonize bodily prana, ground anxious energy, and align with your planetary chart.',
    content: `In ancient Vedic metaphysics, the human body is recognized as a complex bio-energetic network governed by seven principal energy vortices known as Chakras. When these vortices rotate in harmony, an individual experiences heightened vitality, mental clarity, and spiritual groundedness.

However, daily environmental stressors, planetary transits (Graha Dashas), and mental fatigue frequently cause energetic blockages. This is where authentic, consecrated gemstone bracelets play a profound harmonizing role.

### The Physics of Natural Crystalline Frequencies
Natural gemstones are not merely ornamental stones. Formed under immense tectonic heat and pressure over millions of years, crystals possess highly stable, predictable molecular lattices. When worn in direct contact with the wrist's pulse points (the radial and ulnar arteries), the vibrational frequency of the stone interacts directly with the subtle energy conduits (Nadis) of the human biofield.

- **Root Chakra (Muladhara):** Grounded by Black Tourmaline, Obsidian, and Smoky Quartz to eliminate fear and anchor stability.
- **Sacral Chakra (Swadhisthana):** Stimulated by Carnelian and Tiger Eye, awakening creative vitality and emotional resilience.
- **Solar Plexus (Manipura):** Energized by Citrine and Pyrite, igniting personal willpower, digestive fire (Agni), and prosperity consciousness.
- **Heart Chakra (Anahata):** Harmonized by Malachite, Rose Quartz, and Green Aventurine, healing past trauma and fostering universal empathy.
- **Throat Chakra (Vishuddha):** Opened by Lapis Lazuli and Sodalite, strengthening truthful speech and commanding articulation.
- **Third Eye (Ajna):** Awakened by Amethyst and Labradorite, deepening intuition and meditative stillness.
- **Crown Chakra (Sahasrara):** Connected by Clear Quartz and Selenite to divine cosmic consciousness.

### Why Consecration (Prana Pratishtha) is Vital
An unenergized stone carries dormant or neutral energy, and can sometimes absorb the lingering frequencies of handlers and miners. At REHAS, each sacred bracelet undergoes a rigorous Vedic consecration ritual:
1. **Pancha-Gavya & Ganga Jal Shuddhi:** Complete ritual purification to remove negative impressions.
2. **Beej Mantra Japa:** Chanting of planetary and deity mantras tailored to the specific crystal.
3. **Dhoop & Yajna Sanctification:** Infusing the natural beads with pure herbal smoke and Vedic fire blessings.

Wearing an energized bracelet on your dominant receiving wrist invites sustained spiritual equilibrium, shielding you from negative astral influences while elevating your daily meditation and career focus.`,
    imageUrl: 'https://images.unsplash.com/photo-1611591475847-f8eec4a022b7?auto=format&fit=crop&w=1200&q=80',
    author: 'Astro Acharya - REHAS',
    tags: 'Chakra Healing, Vedic Crystals, Prana Energy',
    createdAt: new Date('2025-01-15'),
  },
  'vedic-science-rudraksha-silver-consecration': {
    id: 'default-2',
    title: 'The Vedic Science of Rudraksha & Silver Energy Consecration',
    slug: 'vedic-science-rudraksha-silver-consecration',
    summary: 'Why metal purity and Vedic mantras awaken the hidden electromagnetic frequency of sacred seeds and natural gemstones.',
    content: `For thousands of years, the Shiva Purana and ancient Ayurvedic texts have extolled the unparalleled virtues of Rudraksha seeds. Literally translated as the "Tears of Lord Shiva," authentic Rudraksha beads (Elaeocarpus ganitrus) possess unique dielectric and electromagnetic properties that stabilize cardiac rhythm and quiet an overactive nervous system.

### The Sacred Symbiosis of Silver and Rudraksha
While Rudraksha provides an organic electrical ground, pure silver acts as an exceptional conductor of lunar (Chandra) prana. Silver is cool, reflective, and naturally antibacterial. When Rudraksha beads are capped or linked in pure silver:
- It creates an energetic conduit that accelerates the absorption of beneficial micro-currents.
- It cools excess Pitta (heat and anger) in the biological system.
- It prevents the natural bead from drying or accumulating ungrounded static charge.

### The Five Steps of Vedic Sanctification
A Rudraksha bead must never be worn casually without formal consecration. At REHAS, every Rudraksha bracelet undergoes:
1. **Abhishekam with Raw Milk and Sacred Water:** Neutralizing all prior contact.
2. **Sandalwood & Kumkum Lepam:** Cooling the seed core.
3. **Mahamrityunjaya Mantra Japa (108 recitations):** Bestowing physical protection and longevity blessings.
4. **Prana Pratishtha Nyasa:** Calling the divine consciousness into each bead's mukhi face.
5. **Silver Binding:** Securely locking the consecrated energy into an unbroken circuit.

By incorporating this sacred ornament into your daily lifestyle, you cultivate an unbreakable energetic aura that repels toxic negativity and anchors your mind in peaceful focus.`,
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80',
    author: 'Pandit Dev Sharma',
    tags: 'Rudraksha, Silver Consecration, Shiva Energy',
    createdAt: new Date('2025-02-01'),
  },
  'choosing-sacred-bracelet-by-zodiac-nakshatra': {
    id: 'default-3',
    title: 'Choosing Your Sacred Bracelet by Zodiac Sign & Nakshatra',
    slug: 'choosing-sacred-bracelet-by-zodiac-nakshatra',
    summary: 'A step-by-step astrological roadmap to wearing the exact gemstone suited for your birth moon chart and planetary dasha.',
    content: `In Vedic astrology (Jyotish), the planetary positions at the exact moment of your birth create a distinct blueprint of your karmic tendencies, mental inclinations, and physical constitution. Choosing the right sacred bracelet is not merely a matter of aesthetic preference; it is a conscious astrological intervention to strengthen beneficial Grahas (planets) and pacify afflicted ones.

### Zodiac (Rashi) & Ideal Gemstone Pairings
- **Aries (Mesha) & Scorpio (Vrishchika) - Mars (Mangal):** Red Jasper, Carnelian, and Coral energize bravery, leadership, and muscular vitality.
- **Taurus (Vrishabha) & Libra (Tula) - Venus (Shukra):** Rose Quartz, Clear Quartz, and Opal bring luxurious harmony, emotional elegance, and relational bliss.
- **Gemini (Mithuna) & Virgo (Kanya) - Mercury (Budha):** Green Aventurine, Emerald, and Malachite sharpen business intelligence, analytical prowess, and communication fluency.
- **Cancer (Karka) - Moon (Chandra):** Moonstone, Pearl, and Selenite foster deep intuition, mental peace, and emotional stabilization.
- **Leo (Simha) - Sun (Surya):** Tiger Eye, Citrine, and Sunstone awaken authoritative confidence, vitality, and societal recognition.
- **Sagittarius (Dhanu) & Pisces (Meena) - Jupiter (Guru):** Yellow Aventurine, Citrine, and Lapis Lazuli amplify spiritual wisdom, mentorship fortunes, and cosmic abundance.
- **Capricorn (Makara) & Aquarius (Kumbha) - Saturn (Shani):** Blue Tiger Eye, Amethyst, and Black Obsidian instill iron discipline, long-term perseverance, and karmic protection.

### How to Wear Your Consecrated Bracelet
- **Day of Activation:** Wear your bracelet for the first time during the auspicious planetary day of your ruling stone (e.g., Tuesday for Mars, Thursday for Jupiter, Friday for Venus).
- **Receiving Hand:** Wear on your left wrist for internal emotional healing and spiritual receptivity, or on your right wrist for active worldly achievement and boundary protection.
- **Cleansing Routine:** Cleanse with pure water and place under full moonlight or near sacred dhoop once every month to refresh the vibrational resonance.`,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80',
    author: 'Astro Acharya - REHAS',
    tags: 'Zodiac, Planetary Crystals, Jyotish Guidance',
    createdAt: new Date('2025-02-20'),
  }
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  let blog: any = null;

  try {
    blog = await prisma.blog.findUnique({
      where: { slug },
    });
  } catch (err) {
    // fallback
  }

  if (!blog && DEFAULT_BLOGS[slug]) {
    blog = DEFAULT_BLOGS[slug];
  }

  if (!blog) {
    return {
      title: 'Article Not Found | REHAS',
      description: 'The requested Vedic wisdom article could not be located.',
    };
  }

  return {
    title: `${blog.title} | REHAS Vedic Wisdom`,
    description: blog.summary,
    openGraph: {
      title: blog.title,
      description: blog.summary,
      images: [blog.imageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let blog: any = null;

  try {
    blog = await prisma.blog.findUnique({
      where: { slug },
    });
  } catch (err) {
    console.error('Error fetching blog detail:', err);
  }

  if (!blog && DEFAULT_BLOGS[slug]) {
    blog = DEFAULT_BLOGS[slug];
  }

  if (!blog) {
    notFound();
  }

  const tagsList = blog.tags ? blog.tags.split(',').map((t: string) => t.trim()) : ['Vedic Wisdom'];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar />
      <Navbar />

      <main className={styles.main}>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/blog">Vedic Articles</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{blog.title}</span>
        </nav>

        {/* Main Article Document */}
        <article className={styles.articleCard}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.tagRow}>
              {tagsList.map((tag: string, idx: number) => (
                <span key={idx} className={styles.tagBadge}>
                  <Tag size={12} />
                  <span>{tag}</span>
                </span>
              ))}
              <span className={styles.consecrationBadge}>
                <Sparkles size={12} />
                <span>Vedic Authenticated</span>
              </span>
            </div>

            <h1 className={styles.articleTitle}>{blog.title}</h1>

            <p className={styles.articleSummary}>{blog.summary}</p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <User size={15} style={{ color: 'var(--primary)' }} />
                <span>By <strong>{blog.author}</strong></span>
              </div>
              <div className={styles.metaItem}>
                <Calendar size={15} style={{ color: 'var(--primary)' }} />
                <span>
                  Published on{' '}
                  {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.metaItem}>
                <ShieldCheck size={15} style={{ color: '#059669' }} />
                <span style={{ color: '#059669', fontWeight: 600 }}>Consecrated Knowledge</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={styles.imageWrap}>
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className={styles.heroImage}
            />
          </div>

          {/* Article Full Content */}
          <div className={styles.contentBody}>
            {blog.content ? (
              blog.content.split('\n\n').map((para: string, idx: number) => {
                const trimmed = para.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 
                      key={idx} 
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        marginTop: '32px',
                        marginBottom: '14px',
                      }}
                    >
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }

                if (trimmed.startsWith('- ')) {
                  const items = trimmed.split('\n');
                  return (
                    <ul 
                      key={idx} 
                      style={{ 
                        paddingLeft: '22px', 
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {items.map((it, i) => (
                        <li key={i} style={{ color: '#333' }}>
                          {it.replace(/^- /, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (/^\d+\.\s/.test(trimmed)) {
                  const items = trimmed.split('\n');
                  return (
                    <ol 
                      key={idx} 
                      style={{ 
                        paddingLeft: '22px', 
                        marginBottom: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {items.map((it, i) => (
                        <li key={i} style={{ color: '#333' }}>
                          {it.replace(/^\d+\.\s/, '')}
                        </li>
                      ))}
                    </ol>
                  );
                }

                return (
                  <p key={idx} className={styles.paragraph}>
                    {trimmed}
                  </p>
                );
              })
            ) : (
              <p className={styles.paragraph}>{blog.summary}</p>
            )}

            {/* Vedic Consecration Callout */}
            <div className={styles.consecrationCallout}>
              <Sparkles size={24} className={styles.calloutIcon} />
              <div>
                <h4 className={styles.calloutTitle}>Vedic Sanctification Guarantee</h4>
                <p className={styles.calloutText}>
                  Every gemstone and Rudraksha bracelet created by REHAS is consecrated in our Patna Vedic sanctum
                  with sacred Ganga jal, Panchamrit, and 108 Beej Mantra recitations. Wear your sacred jewel with reverent
                  intentions to manifest peace, protection, and planetary alignment.
                </p>
              </div>
            </div>

            {/* Shop CTA Box */}
            <div className={styles.shopCtaBox}>
              <div>
                <h3 className={styles.ctaHeading}>Align Your Prana with Sacred Crystals</h3>
                <p className={styles.ctaSub}>
                  Explore authentic certified gemstones hand-strung and energized by our Acharyas for your specific zodiac and intention.
                </p>
              </div>
              <Link href="/shop" className={styles.ctaBtn}>
                <ShoppingBag size={16} />
                <span>Explore Sacred Collection</span>
              </Link>
            </div>
          </div>
        </article>

        {/* Back Link */}
        <div className={styles.backRow}>
          <Link href="/blog" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Return to All Articles</span>
          </Link>
          <Link href="/shop" className={styles.backBtn}>
            <span>View Consecrated Bracelets</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
