import React from 'react';
import { MapPin, Zap, Target, Gamepad2 } from 'lucide-react';

const FieldSelector = ({ selectedField, onFieldChange }) => {
  const fields = [
    {
      id: 'frc-2025-reefscape',
      name: '2025 Reefscape',
      description: 'FRC 2025 Reefscape field with coral and barge',
      dimensions: { width: 16.54, height: 8.21 },
      features: ['Coral Reef', 'Processor', 'Net', 'Barge'],
      icon: <Target className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'frc-2024-crescendo',
      name: '2024 Crescendo',
      description: 'FRC 2024 Crescendo field with stage and amp',
      dimensions: { width: 16.54, height: 8.21 },
      features: ['Stage', 'Amp', 'Speaker', 'Trap'],
      icon: <Zap className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'frc-2023-charged-up',
      name: '2023 Charged Up',
      description: 'FRC 2023 Charged Up field with charge station',
      dimensions: { width: 16.46, height: 8.23 },
      features: ['Charge Station', 'Cone Nodes', 'Cube Nodes'],
      icon: <Gamepad2 className="w-5 h-5" />,
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'custom',
      name: 'Custom Field',
      description: 'Define your own field dimensions',
      dimensions: { width: 16.0, height: 8.0 },
      features: ['Customizable'],
      icon: <MapPin className="w-5 h-5" />,
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Field Template</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <button
            key={field.id}
            onClick={() => onFieldChange(field)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedField?.id === field.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-neutral-600 hover:border-neutral-500 bg-neutral-800/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${field.color} text-white`}>
                {field.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{field.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{field.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                  <span>{field.dimensions.width}m × {field.dimensions.height}m</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {field.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-neutral-700 text-gray-300 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedField && (
        <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Selected Field: {selectedField.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Width:</span>
              <span className="text-white ml-2">{selectedField.dimensions.width}m</span>
            </div>
            <div>
              <span className="text-gray-400">Height:</span>
              <span className="text-white ml-2">{selectedField.dimensions.height}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldSelector;
