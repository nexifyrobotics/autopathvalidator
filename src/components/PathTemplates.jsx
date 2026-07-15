import React, { useState, useMemo } from 'react';
import { useGame } from '../contexts/GameContext.jsx';
import { BookOpen, Download, Upload, Star, Plus } from 'lucide-react';

const PathTemplates = ({ onLoadTemplate, onSaveTemplate }) => {
  const gameConfig = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get templates from game config
  const allTemplates = gameConfig?.templates || [];

  // Group templates by category
  const categories = useMemo(() => {
    const grouped = {};
    allTemplates.forEach(template => {
      const cat = template.category || 'other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(template);
    });
    return grouped;
  }, [allTemplates]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(lowerSearch) ||
        t.description.toLowerCase().includes(lowerSearch) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return filtered;
  }, [allTemplates, selectedCategory, searchTerm]);

  return (
    <div className="path-templates">
      <div className="templates-header">
        <h2 className="text-2xl font-bold">Path Templates</h2>
        <p className="templates-subtitle">
          {gameConfig.year} {gameConfig.name} - Load pre-built strategies
        </p>
      </div>

      <div className="templates-controls">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="templates-search"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="templates-category-filter"
        >
          <option value="all">All Categories</option>
          {Object.keys(categories).sort().map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')} ({categories[cat].length})
            </option>
          ))}
        </select>
      </div>

      <div className="templates-list">
        {filteredTemplates.length === 0 ? (
          <div className="templates-empty">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-400">No templates found for {gameConfig.year}</p>
          </div>
        ) : (
          <div className="templates-grid">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="template-header">
                  <h3 className="template-name">{template.name}</h3>
                  <button
                    className={`star-button ${template.starred ? 'starred' : ''}`}
                    onClick={() => {/* Toggle star - TBD in later task */}}
                    title="Star this template"
                  >
                    <Star size={16} />
                  </button>
                </div>

                <p className="template-description">{template.description}</p>

                <div className="template-meta">
                  <span className="difficulty">{template.difficulty}</span>
                  <span className="category">
                    {template.category?.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                  {template.strategy?.estimatedPoints && (
                    <span className="points">~{template.strategy.estimatedPoints} pts</span>
                  )}
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="tag">+{template.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <button
                  className="load-button"
                  onClick={() => onLoadTemplate(template)}
                >
                  <Upload size={14} /> Load Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PathTemplates;
