import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Calendar, Eye, Clock, Share2, ArrowLeft, User } from 'lucide-react';

const FALLBACK_ARTICLES = [
    {
        _id: 'fallback-1',
        slug: 'complete-guide-first-home',
        title: 'Complete Guide to Buying Your First Home',
        excerpt: 'Learn everything you need to know about the home buying process, from finding the right property to closing the deal.',
        content: 'Buying your first home is a major financial milestone. Start by setting a realistic budget, checking your credit score, and getting pre-approved for a loan. Research neighborhoods based on commute, schools, and long-term value. Always inspect legal documents and verify title records before finalizing. Work with verified agencies to compare listings and negotiate confidently. A disciplined approach helps you avoid hidden costs and secure a property that fits your goals.',
        category: 'Buying',
        author: 'Millionaire Club Editorial',
        coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1600&auto=format&fit=crop',
        readTime: 8,
        publishedAt: new Date('2026-04-10'),
        viewCount: 1250,
        tags: ['buying', 'home-loan', 'first-home']
    },
    {
        _id: 'fallback-2',
        slug: 'investment-properties-returns',
        title: 'Investment Properties: Maximizing Returns',
        excerpt: 'Strategic insights on how to identify, evaluate, and invest in properties that deliver strong returns.',
        content: 'High-performing investment properties combine rental demand, location growth, and sensible acquisition cost. Evaluate yield, vacancy rates, and maintenance expenses before purchase. Diversify across property types and track market cycles to balance risk. Use data-backed valuation models and comparable analysis to avoid overpaying. Long-term returns improve when you optimize financing, tenant quality, and periodic asset upgrades.',
        category: 'Investment',
        author: 'Millionaire Club Research Desk',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-aeb19be489c7?q=80&w=1600&auto=format&fit=crop',
        readTime: 10,
        publishedAt: new Date('2026-04-09'),
        viewCount: 2840,
        tags: ['investment', 'returns', 'portfolio']
    },
    {
        _id: 'fallback-3',
        slug: 'market-trends-2026',
        title: '2026 Real Estate Market Trends to Watch',
        excerpt: 'Expert analysis on emerging market trends, price movements, and opportunities for savvy investors.',
        content: 'In 2026, tier-1 and select tier-2 cities continue to attract premium demand, especially for well-connected micro-markets. Buyers are prioritizing trusted developers, smart-home features, and legal transparency. Investors are increasingly relying on analytics for entry timing and exit strategy. Keep an eye on infrastructure projects, policy shifts, and inventory absorption for clearer market signals.',
        category: 'Market Trends',
        author: 'Millionaire Club Insights Team',
        coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600&auto=format&fit=crop',
        readTime: 7,
        publishedAt: new Date('2026-04-08'),
        viewCount: 3150,
        tags: ['market', 'trends', 'analysis']
    },
    {
        _id: 'fallback-4',
        slug: 'selling-property-strategies',
        title: 'Selling Your Property: Strategies for Success',
        excerpt: 'Discover proven strategies to prepare your home for sale and attract qualified buyers.',
        content: 'To sell faster and better, begin with professional photography, realistic pricing, and strong listing descriptions. Highlight unique value points such as location, amenities, and upgrades. Keep documents ready to build buyer confidence and reduce friction in negotiation. Small staging improvements can significantly improve perceived value and conversion.',
        category: 'Selling',
        author: 'Millionaire Club Editorial',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop',
        readTime: 6,
        publishedAt: new Date('2026-04-07'),
        viewCount: 1890,
        tags: ['selling', 'pricing', 'staging']
    },
    {
        _id: 'fallback-5',
        slug: 'renting-vs-buying',
        title: 'Renting vs Buying: Which is Right for You?',
        excerpt: 'A comprehensive comparison to help you make the best financial decision for your lifestyle.',
        content: 'Renting offers flexibility and lower upfront costs, while buying builds equity and long-term asset value. The right choice depends on career mobility, savings, loan eligibility, and expected holding period. Compare monthly outflows, tax benefits, and opportunity cost before deciding. A structured financial model helps make this decision objective and stress-free.',
        category: 'Renting',
        author: 'Millionaire Club Finance Desk',
        coverImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1600&auto=format&fit=crop',
        readTime: 9,
        publishedAt: new Date('2026-04-06'),
        viewCount: 2560,
        tags: ['renting', 'buying', 'finance']
    },
    {
        _id: 'fallback-6',
        slug: 'legal-real-estate',
        title: 'Legal Considerations in Real Estate Transactions',
        excerpt: 'Essential legal information every buyer and seller should know to protect their interests.',
        content: 'Always verify title ownership, encumbrance status, approvals, and agreement terms before committing to a transaction. Engage qualified legal counsel for document review and registration workflow. Legal diligence prevents disputes and protects both capital and timeline. Transparency in paperwork is the foundation of safe real estate investing.',
        category: 'Legal',
        author: 'Millionaire Club Legal Team',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop',
        readTime: 12,
        publishedAt: new Date('2026-04-05'),
        viewCount: 1420,
        tags: ['legal', 'compliance', 'documents']
    },
    {
        _id: 'fallback-7',
        slug: 'home-maintenance-tips',
        title: 'Home Maintenance: Keep Your Investment Protected',
        excerpt: 'Regular maintenance tips and schedules to preserve your property value and prevent costly repairs.',
        content: 'Routine maintenance protects resale value and extends the life of key systems. Create a quarterly checklist for plumbing, electricals, waterproofing, and HVAC. Address small issues early to avoid expensive structural repairs later. Smart preventive care keeps your property efficient, safe, and market-ready.',
        category: 'Maintenance',
        author: 'Millionaire Club Operations',
        coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop',
        readTime: 8,
        publishedAt: new Date('2026-04-04'),
        viewCount: 980,
        tags: ['maintenance', 'property-care', 'value']
    },
    {
        _id: 'fallback-8',
        slug: 'luxury-design-trends',
        title: 'Luxury Living: Design Trends for Premium Homes',
        excerpt: 'Explore the latest interior design and architectural trends defining luxury real estate today.',
        content: 'Luxury homes in 2026 prioritize natural materials, open spatial flow, and wellness-focused interiors. Buyers are seeking timeless aesthetics with smart automation and energy efficiency. Outdoor living extensions, curated lighting, and bespoke finishes are major differentiators. Design-led upgrades can significantly improve premium positioning and buyer perception.',
        category: 'Lifestyle',
        author: 'Millionaire Club Design Desk',
        coverImage: 'https://images.unsplash.com/photo-1512817167891-6a7c4e2708ed?q=80&w=1600&auto=format&fit=crop',
        readTime: 6,
        publishedAt: new Date('2026-04-03'),
        viewCount: 3420,
        tags: ['luxury', 'design', 'lifestyle']
    },
    {
        _id: 'fallback-9',
        slug: 'property-valuation',
        title: 'Understanding Property Valuation Methods',
        excerpt: 'Deep dive into the various methods used to determine fair market value for residential properties.',
        content: 'Valuation combines comparable sales, income-based methods, and replacement cost analysis. Each method has strengths depending on asset type and market conditions. Accurate valuation requires local data, realistic assumptions, and transparent adjustments. Better valuation leads to better negotiation and stronger investment outcomes.',
        category: 'Market Trends',
        author: 'Millionaire Club Analytics',
        coverImage: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1600&auto=format&fit=crop',
        readTime: 11,
        publishedAt: new Date('2026-04-02'),
        viewCount: 2210,
        tags: ['valuation', 'pricing', 'analytics']
    }
];

const findFallbackBySlug = (slug) => FALLBACK_ARTICLES.find((item) => item.slug === slug);

const ArticleDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedArticles, setRelatedArticles] = useState([]);

    useEffect(() => {
        fetchArticle();
    }, [slug]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_BASE_URL}/articles/slug/${slug}`);
            setArticle(data);

            // Fetch related articles from same category
            if (data.category) {
                const { data: related } = await axios.get(
                    `${API_BASE_URL}/articles/category/${data.category}?limit=3`
                );
                setRelatedArticles(related.articles.filter(a => a._id !== data._id));
            }
        } catch (error) {
            console.error('Error fetching article:', error);
            setArticle(null);
            setRelatedArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href
            });
        } else {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            alert('Article link copied to clipboard');
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Loading article...
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                    Article not found
                </div>
            </div>
        );
    }

    return (
        <article style={{ background: 'var(--background)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: 'calc(0.75rem + 75px) 1.5rem 2rem'
            }}>
                <div className="container">
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            marginBottom: '1.5rem',
                            transition: 'gap 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.gap = '12px'}
                        onMouseLeave={(e) => e.currentTarget.style.gap = '8px'}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>

                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                        fontWeight: '800',
                        color: 'var(--text)',
                        margin: '0 0 1rem',
                        lineHeight: 1.2
                    }}>
                        {article.title}
                    </h1>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#0F172A',
                                fontWeight: '700',
                                fontSize: '0.75rem'
                            }}>
                                {article.author?.[0] || 'A'}
                            </div>
                            <span>by {article.author}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} />
                            {formatDate(article.publishedAt || article.createdAt)}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={16} />
                            {typeof article.readTime === 'number' ? `${article.readTime} min read` : article.readTime}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Eye size={16} />
                            {article.viewCount} views
                        </div>

                        <button
                            onClick={handleShare}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600'
                            }}
                        >
                            <Share2 size={16} />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {(article.coverImage || article.image) && (
                <div style={{
                    width: '100%',
                    height: 'clamp(300px, 50vh, 600px)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-light)'
                }}>
                    <img
                        src={article.coverImage || article.image}
                        alt={article.title}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop';
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Article Body */}
                    <div style={{
                        fontSize: '1.05rem',
                        lineHeight: 1.8,
                        color: 'var(--text-muted)',
                        marginBottom: '3rem',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word'
                    }}>
                        {article.content}
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            flexWrap: 'wrap',
                            marginBottom: '3rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid var(--border)'
                        }}>
                            {article.tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        display: 'inline-block',
                                        padding: '6px 14px',
                                        background: 'rgba(198, 161, 91, 0.1)',
                                        color: 'var(--primary)',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        borderRadius: '20px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
                <div style={{
                    background: 'var(--surface)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    padding: '3rem 1.5rem'
                }}>
                    <div className="container">
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            marginBottom: '2rem',
                            color: 'var(--text)'
                        }}>
                            Related Articles
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem'
                        }}>
                            {relatedArticles.map(relArticle => (
                                <Link
                                    key={relArticle._id}
                                    to={`/articles/${relArticle.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        padding: '1.5rem',
                                        background: 'var(--surface-light)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                >
                                    <h4 style={{
                                        fontSize: '1.05rem',
                                        fontWeight: '700',
                                        color: 'var(--text)',
                                        margin: '0 0 0.5rem'
                                    }}>
                                        {relArticle.title}
                                    </h4>
                                    <p style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--text-muted)',
                                        margin: 0
                                    }}>
                                        {relArticle.excerpt}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

export default ArticleDetail;
