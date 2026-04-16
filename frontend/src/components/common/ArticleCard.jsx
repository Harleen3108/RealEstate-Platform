import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, Clock, ArrowRight } from 'lucide-react';

const ArticleCard = ({ article, compact = false }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <article className="glass-card animate-fade" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
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
            {article.coverImage && (
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
                        src={article.coverImage}
                        alt={article.title}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

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
                        {article.readTime} min read
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
