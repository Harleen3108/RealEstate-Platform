import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Clock, ArrowRight } from 'lucide-react';

const FALLBACK_COVER_IMAGES = {
    lifestyle: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1600&auto=format&fit=crop',
    legal: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1600&auto=format&fit=crop',
    'market trends': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
    investment: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1600&auto=format&fit=crop',
    buying: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop',
    selling: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1600&auto=format&fit=crop',
    renting: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
    maintenance: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1600&auto=format&fit=crop',
};

const ArticleCard = ({ article, compact = false }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const categoryKey = String(article.category || '').trim().toLowerCase();
    const initialCoverImage = article.coverImage || article.image || FALLBACK_COVER_IMAGES[categoryKey] || FALLBACK_COVER_IMAGES.default;
    const [coverImage, setCoverImage] = React.useState(initialCoverImage);

    React.useEffect(() => {
        setCoverImage(initialCoverImage);
    }, [initialCoverImage]);

    return (
        <article className="glass-card animate-fade" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Cover Image */}
            <div style={{
                height: compact ? '160px' : '200px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <img
                    src={coverImage}
                    alt={article.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    onError={() => {
                        if (coverImage !== FALLBACK_COVER_IMAGES.default) {
                            setCoverImage(FALLBACK_COVER_IMAGES.default);
                        }
                    }}
                />
            </div>

            {/* Content */}
            <div style={{
                padding: compact ? '1rem' : '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                flex: 1
            }}>
                {/* Category Badge */}
                <span style={{
                    display: 'inline-block',
                    width: 'fit-content',
                    padding: '4px 10px',
                    background: 'rgba(198, 161, 91, 0.15)',
                    color: 'var(--primary)',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    borderRadius: '4px',
                    letterSpacing: '0.5px'
                }}>
                    {article.category}
                </span>

                {/* Title */}
                <h3 style={{
                    fontSize: compact ? '1rem' : '1.2rem',
                    fontWeight: '700',
                    color: 'var(--text)',
                    margin: 0,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {article.title}
                </h3>

                {/* Excerpt */}
                <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    margin: 0,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {article.excerpt}
                </p>

                {/* Meta Info */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginTop: 'auto',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border)',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} />
                        {formatDate(article.publishedAt || article.createdAt)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {typeof article.readTime === 'number' ? `${article.readTime} min read` : article.readTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} />
                        {article.viewCount || 0} views
                    </div>
                </div>

                {/* CTA */}
                <Link
                    to={`/articles/${article.slug}`}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        marginTop: '0.75rem',
                        transition: 'gap 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.gap = '12px'}
                    onMouseLeave={(e) => e.currentTarget.style.gap = '8px'}
                >
                    Read More
                    <ArrowRight size={16} />
                </Link>
            </div>
        </article>
    );
};

export default ArticleCard;
