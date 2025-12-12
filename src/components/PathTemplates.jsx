import React, { useState } from 'react';
import { BookOpen, Download, Upload, Star, Plus } from 'lucide-react';

const PathTemplates = ({ onLoadTemplate, onSaveTemplate }) => {
  console.log('PathTemplates rendered', { onLoadTemplate, onSaveTemplate });
  const [templates, setTemplates] = useState([
    {
      id: 's-curve-basic',
      name: 'S-Curve Basic',
      description: 'Simple S-shaped path for basic maneuvers',
      difficulty: 'Easy',
      tags: ['basic', 's-curve', 'training'],
      waypoints: [
        { x: 2, y: 2 },
        { x: 4, y: 3 },
        { x: 6, y: 4 },
        { x: 8, y: 3 },
        { x: 10, y: 2 }
      ],
      starred: false
    },
    {
      id: 'j-turn-sharp',
      name: 'J-Turn Sharp',
      description: 'Sharp 90-degree turn followed by straight line',
      difficulty: 'Medium',
      tags: ['turn', 'sharp', 'defense'],
      waypoints: [
        { x: 2, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 3 },
        { x: 5, y: 5 },
        { x: 5, y: 7 }
      ],
      starred: true
    },
    {
      id: 'figure-eight',
      name: 'Figure Eight',
      description: 'Complex figure-eight pattern for advanced driving',
      difficulty: 'Hard',
      tags: ['complex', 'figure-eight', 'skill'],
      waypoints: [
        { x: 6, y: 4 },
        { x: 4, y: 3 },
        { x: 2, y: 4 },
        { x: 4, y: 5 },
        { x: 6, y: 4 },
        { x: 8, y: 3 },
        { x: 10, y: 4 },
        { x: 8, y: 5 },
        { x: 6, y: 4 }
      ],
      starred: false
    },
    {
      id: 'slalom-course',
      name: 'Slalom Course',
      description: 'Series of alternating turns for precision driving',
      difficulty: 'Medium',
      tags: ['slalom', 'precision', 'cones'],
      waypoints: [
        { x: 1, y: 4 },
        { x: 3, y: 3 },
        { x: 5, y: 5 },
        { x: 7, y: 3 },
        { x: 9, y: 5 },
        { x: 11, y: 3 },
        { x: 13, y: 4 }
      ],
      starred: true
    },
    {
      id: 'spiral-path',
      name: 'Spiral Path',
      description: 'Gradually tightening spiral for testing acceleration',
      difficulty: 'Hard',
      tags: ['spiral', 'acceleration', 'complex'],
      waypoints: [
        { x: 6, y: 4 },
        { x: 7, y: 3.5 },
        { x: 7.5, y: 3 },
        { x: 8, y: 3.5 },
        { x: 8.5, y: 4 },
        { x: 8, y: 4.5 },
        { x: 7.5, y: 5 },
        { x: 7, y: 4.5 },
        { x: 6.5, y: 4 }
      ],
      starred: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);

  const toggleStar = (templateId) => {
    setTemplates(templates.map(template =>
      template.id === templateId
        ? { ...template, starred: !template.starred }
        : template
    ));
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty.toLowerCase() === selectedDifficulty;
    const matchesStarred = !showOnlyStarred || template.starred;

    return matchesSearch && matchesDifficulty && matchesStarred;
  });

  const exportTemplates = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      templates: templates
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `path-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTemplates = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.templates && Array.isArray(data.templates)) {
            setTemplates([...templates, ...data.templates]);
          }
        } catch (error) {
          console.error('Error importing templates:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'hard': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Path Templates</h3>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        />

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyStarred}
            onChange={(e) => setShowOnlyStarred(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-neutral-700 border-neutral-600 rounded focus:ring-blue-500"
          />
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300 text-sm">Starred only</span>
        </label>
      </div>

      {/* Import/Export */}
      <div className="flex gap-2">
        <button
          onClick={exportTemplates}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Templates
        </button>

        <label className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Import Templates
          <input
            type="file"
            accept=".json"
            onChange={importTemplates}
            className="hidden"
          />
        </label>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-semibold">{template.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded text-white ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-neutral-700 text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => toggleStar(template.id)}
                className={`p-1 rounded transition-colors ${
                  template.starred ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                }`}
              >
                <Star className={`w-4 h-4 ${template.starred ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onLoadTemplate(template.waypoints)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
              >
                Load Template
              </button>

              <button
                onClick={() => onSaveTemplate(template)}
                className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded text-sm transition-colors"
                title="Save as new template"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No templates found</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center">
        {filteredTemplates.length} of {templates.length} templates shown
      </div>
    </div>
  );
};

export default PathTemplates;
