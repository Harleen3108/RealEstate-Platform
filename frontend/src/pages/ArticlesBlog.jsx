import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Search } from 'lucide-react';
import ArticleCard from '../components/common/ArticleCard';

const ArticlesBlog = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const CATEGORIES = ['All', 'Buying', 'Selling', 'Renting', 'Investment', 'Market Trends', 'Legal', 'Maintenance', 'Lifestyle'];

    useEffect(() => {
        fetchArticles();
    }, [category, currentPage]);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/articles?limit=9&page=${currentPage}`;

            if (category !== 'All') {
                url = `${API_BASE_URL}/articles/category/${category}?limit=9&page=${currentPage}`;
            }

            const { data } = await axios.get(url);
            setArticles(data.articles);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            const { data } = await axios.get(
                `${API_BASE_URL}/articles/search/${searchQuery}?limit=9&page=1`
            );
            setArticles(data.articles);
            setTotalPages(data.pagination.pages);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error searching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: 'var(--background)', minHeight: '100vh', paddingTop: '80px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, rgba(15,23,42,0.9) 100%)',
                color: '#F8FAFC',
                padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
                textAlign: 'center',
                borderBottom: '1px solid var(--border)'
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        letterSpacing: '-0.02em'
                    }}>
                        Real Estate Articles & Insights
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                        color: 'rgba(248,250,252,0.8)',
                        maxWidth: '600px',
                        margin: '0 auto 2rem'
                    }}>
                        Expert tips, market trends, and guides to help you make informed real estate decisions
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} style={{
                        display: 'flex',
                        gap: '8px',
                        maxWidth: '500px',
                        margin: '0 auto',
                        background: 'rgba(248,250,252,0.95)',
                        borderRadius: '8px',
                        padding: '6px'
                    }}>
                        <Search size={20} style={{
                            color: '#64748B',
                            marginLeft: '14px',
                            flexShrink: 0
                        }} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#0F172A',
                                fontSize: '0.95rem',
                                fontFamily: 'var(--font-sans)'
                            }}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.75rem 1.5rem', margin: '0' }}
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Categories */}
            <div style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                padding: '1.5rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    gap: '1rem',
                    minWidth: 'min-content'
                }}>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setCategory(cat);
                                setCurrentPage(1);
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: category === cat ? 'var(--primary)' : 'transparent',
                                color: category === cat ? '#0F172A' : 'var(--text)',
                                border: category === cat ? 'none' : '1px solid var(--border)',
                                borderRadius: '6px',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (category !== cat) {
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.color = 'var(--primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (category !== cat) {
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.color = 'var(--text)';
                                }
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                {loading ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 1.5rem',
                        color: 'var(--text-muted)'
                    }}>
                        Loading articles...
                    </div>
                ) : articles.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '4rem 1.5rem',
                        color: 'var(--text-muted)'
                    }}>
                        No articles found. Check back soon!
                    </div>
                ) : (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginBottom: '3rem'
                        }}>
                            {articles.map((article) => (
                                <ArticleCard
                                    key={article._id}
                                    article={article}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: currentPage === 1 ? 'var(--surface-light)' : 'var(--primary)',
                                        color: currentPage === 1 ? 'var(--text-muted)' : '#0F172A',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: currentPage === 1 ? 0.5 : 1
                                    }}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            background: currentPage === page ? 'var(--primary)' : 'var(--surface-light)',
                                            color: currentPage === page ? '#0F172A' : 'var(--text)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '0.75rem 1.25rem',
                                        background: currentPage === totalPages ? 'var(--surface-light)' : 'var(--primary)',
                                        color: currentPage === totalPages ? 'var(--text-muted)' : '#0F172A',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        opacity: currentPage === totalPages ? 0.5 : 1
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ArticlesBlog;
