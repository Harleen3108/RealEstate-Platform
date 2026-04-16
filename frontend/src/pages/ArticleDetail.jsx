import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Calendar, Eye, Clock, Share2, ArrowLeft, User } from 'lucide-react';

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
        <article style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '100px' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: '2rem 1.5rem'
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
                            {article.readTime} min read
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
            {article.coverImage && (
                <div style={{
                    width: '100%',
                    height: 'clamp(300px, 50vh, 600px)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-light)'
                }}>
                    <img
                        src={article.coverImage}
                        alt={article.title}
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
