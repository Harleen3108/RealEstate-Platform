const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    slug: { 
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    content: { 
        type: String, 
        required: true 
    },
    excerpt: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        enum: ['Buying', 'Selling', 'Renting', 'Investment', 'Market Trends', 'Legal', 'Maintenance', 'Lifestyle'],
        default: 'Market Trends'
    },
    tags: [{ 
        type: String 
    }],
    keywords: [{ 
        type: String,
        index: true
    }],
    author: { 
        type: String, 
        default: 'Real Estate Team' 
    },
    coverImage: { 
        type: String 
    },
    published: { 
        type: Boolean, 
        default: true 
    },
    viewCount: { 
        type: Number, 
        default: 0 
    },
    readTime: { 
        type: Number, 
        default: 5 
    },
    seoTitle: { 
        type: String 
    },
    seoDescription: { 
        type: String 
    },
    publishedAt: { 
        type: Date 
    }
}, { timestamps: true });

// Index for search optimization
articleSchema.index({ title: 'text', content: 'text', tags: 'text', keywords: 'text' });
articleSchema.index({ slug: 1, published: 1 });
articleSchema.index({ category: 1, published: 1, createdAt: -1 });
articleSchema.index({ createdAt: 1 });

// Auto-generate slug from title
articleSchema.pre('save', function() {
    if (this.isModified('title') || this.isNew) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
});

module.exports = mongoose.model('Article', articleSchema);
