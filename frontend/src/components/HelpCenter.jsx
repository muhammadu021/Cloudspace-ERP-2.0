import React, { useState, useMemo } from 'react';
import { X, Search, Book, ArrowLeft, ExternalLink } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Modal, Button, Card } from '../design-system/components';
import { helpCategories, searchHelpArticles, getHelpArticle } from '../data/helpArticles';
import ReactMarkdown from 'react-markdown';

/**
 * HelpCenter Component
 * 
 * Searchable help center accessible from all pages.
 * Provides comprehensive documentation for all major features.
 * 
 * @example
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <button onClick={() => setIsOpen(true)}>Help</button>
 * <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
 */

const HelpCenter = ({ isOpen, onClose, initialArticleId = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(initialArticleId);

  // Search articles
  const searchResults = useMemo(() => {
    return searchHelpArticles(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Get current article
  const currentArticle = useMemo(() => {
    if (selectedArticle) {
      return getHelpArticle(selectedArticle);
    }
    return null;
  }, [selectedArticle]);

  // Reset view when modal closes
  const handleClose = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedArticle(null);
    onClose();
  };

  // Handle article selection
  const handleArticleClick = (articleId) => {
    setSelectedArticle(articleId);
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedArticle(null);
  };

  // Render category icon
  const renderCategoryIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : <Icons.HelpCircle size={20} />;
  };

  // Render article list view
  const renderArticleList = () => (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-6 border-b border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Categories</h3>
          <div className="grid grid-cols-2 gap-2">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border transition-colors
                  ${selectedCategory === category.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }
                `}
              >
                {renderCategoryIcon(category.icon)}
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Articles */}
      <div className="flex-1 overflow-y-auto p-6">
        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-neutral-600">No articles found</p>
            <p className="text-sm text-neutral-500 mt-2">
              Try a different search term or browse categories
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((article) => {
              const category = helpCategories.find(c => c.id === article.category);
              return (
                <Card
                  key={article.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-neutral-900">{article.title}</h4>
                      {category && (
                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                          {renderCategoryIcon(category.icon)}
                          {category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-600">{article.summary}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render article detail view
  const renderArticleDetail = () => {
    if (!currentArticle) return null;

    const category = helpCategories.find(c => c.id === currentArticle.category);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to articles</span>
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {currentArticle.title}
              </h2>
              {category && (
                <div className="flex items-center gap-2 text-neutral-600">
                  {renderCategoryIcon(category.icon)}
                  <span className="text-sm">{category.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-neutral max-w-none">
            <ReactMarkdown>{currentArticle.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <h4 className="text-sm font-semibold text-neutral-700 mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {currentArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
            <p className="text-sm text-neutral-700 mb-3">Was this article helpful?</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Yes
              </Button>
              <Button variant="outline" size="sm">
                No
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={selectedArticle ? '' : 'Help Center'}
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="h-[600px]">
        {selectedArticle ? renderArticleDetail() : renderArticleList()}
      </div>
    </Modal>
  );
};

/**
 * HelpButton Component
 * 
 * Button to open the help center.
 * Can be placed anywhere in the application.
 * 
 * @example
 * <HelpButton />
 */
export const HelpButton = ({ className = '', articleId = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-900
          hover:bg-neutral-100 rounded-lg transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500
          ${className}
        `}
        aria-label="Open help center"
      >
        <Book size={20} />
        <span className="text-sm font-medium">Help</span>
      </button>
      <HelpCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialArticleId={articleId}
      />
    </>
  );
};

/**
 * useHelpCenter Hook
 * 
 * Hook to control help center programmatically.
 * 
 * @example
 * const { openHelp, openArticle } = useHelpCenter();
 * 
 * <button onClick={() => openArticle('dashboard-overview')}>
 *   Learn about Dashboard
 * </button>
 */
export const useHelpCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [articleId, setArticleId] = useState(null);

  const openHelp = () => {
    setArticleId(null);
    setIsOpen(true);
  };

  const openArticle = (id) => {
    setArticleId(id);
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
    setArticleId(null);
  };

  return {
    isOpen,
    articleId,
    openHelp,
    openArticle,
    closeHelp,
    HelpCenter: () => (
      <HelpCenter
        isOpen={isOpen}
        onClose={closeHelp}
        initialArticleId={articleId}
      />
    ),
  };
};

export default HelpCenter;
