const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// IMPORTANT: Route order matters in Express!
// Specific routes MUST come before generic ones
// ============================================

// GET /api/articles/slug/:slug - Get article by slug (PUBLIC)
router.get('/slug/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug, published: true });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // Increment view count separately to avoid save conflicts
        await Article.updateOne({ _id: article._id }, { $inc: { viewCount: 1 } });
        res.json(article);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/articles/category/:category - Get articles by category (PUBLIC)
router.get('/category/:category', async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const articles = await Article.find({ category: req.params.category, published: true })
            .sort({ publishedAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-content');
        const total = await Article.countDocuments({ category: req.params.category, published: true });
        res.json({
            articles,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error fetching category articles:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/articles/search/:keyword - Search articles (PUBLIC)
router.get('/search/:keyword', async (req, res) => {
    try {
        const keyword = req.params.keyword;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const query = {
            published: true,
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { excerpt: { $regex: keyword, $options: 'i' } },
                { tags: { $regex: keyword, $options: 'i' } },
                { keywords: { $regex: keyword, $options: 'i' } }
            ]
        };
        const articles = await Article.find(query)
            .sort({ publishedAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-content');
        const total = await Article.countDocuments(query);
        res.json({
            articles,
            keyword,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/articles - Get all published articles (PUBLIC)
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 10, page = 1 } = req.query;
        let query = { published: true };
        if (category) query.category = category;
        if (search) query.$text = { $search: search };
        const skip = (page - 1) * limit;
        const articles = await Article.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-content');
        const total = await Article.countDocuments(query);
        res.json({
            articles,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: error.message });
    }
});

// GET /api/articles/:id - Get article by ID (ADMIN)
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/articles - Create article (ADMIN)
router.post('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, keywords, author, coverImage, seoTitle, seoDescription, readTime } = req.body;
        if (!title || !content || !excerpt) {
            return res.status(400).json({ message: 'Title, content, and excerpt are required' });
        }
        const article = new Article({
            title,
            content,
            excerpt,
            category,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
            author: author || req.user.name,
            coverImage,
            seoTitle: seoTitle || title,
            seoDescription: seoDescription || excerpt,
            readTime: readTime || Math.ceil(content.split(' ').length / 200),
            publishedAt: new Date()
        });
        await article.save();
        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/articles/:id - Update article (ADMIN)
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        const { title, content, excerpt, category, tags, keywords, author, coverImage, published, seoTitle, seoDescription, readTime } = req.body;
        if (title) article.title = title;
        if (content) article.content = content;
        if (excerpt) article.excerpt = excerpt;
        if (category) article.category = category;
        if (tags) article.tags = tags.split(',').map(t => t.trim());
        if (keywords) article.keywords = keywords.split(',').map(k => k.trim());
        if (author) article.author = author;
        if (coverImage) article.coverImage = coverImage;
        if (typeof published === 'boolean') article.published = published;
        if (seoTitle) article.seoTitle = seoTitle;
        if (seoDescription) article.seoDescription = seoDescription;
        if (readTime) article.readTime = readTime;
        article.updatedAt = new Date();
        await article.save();
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/articles/:id - Delete article (ADMIN)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
