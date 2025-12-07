// FRC Field dimensions for different years

export const FIELD_DIMENSIONS = {
    '2024': {
        name: '2024 Charged Up',
        width: 16.54,
        height: 8.21,
        description: 'Standard FRC field'
    },
    '2025': {
        name: '2025 Recycle Rush',
        width: 16.54,
        height: 8.21,
        description: 'Standard FRC field'
    },
    '2023': {
        name: '2023 Charged Up',
        width: 16.54,
        height: 8.21,
        description: 'Standard FRC field'
    },
    'custom': {
        name: 'Custom',
        width: 16.54,
        height: 8.21,
        description: 'Custom field dimensions'
    }
};

export function getFieldDimensions(year = '2024') {
    return FIELD_DIMENSIONS[year] || FIELD_DIMENSIONS['2024'];
}

export function saveCustomFieldDimensions(width, height) {
    FIELD_DIMENSIONS.custom.width = width;
    FIELD_DIMENSIONS.custom.height = height;
    localStorage.setItem('customFieldDimensions', JSON.stringify({ width, height }));
}

export function loadCustomFieldDimensions() {
    try {
        const stored = localStorage.getItem('customFieldDimensions');
        if (stored) {
            const { width, height } = JSON.parse(stored);
            FIELD_DIMENSIONS.custom.width = width;
            FIELD_DIMENSIONS.custom.height = height;
        }
    } catch (error) {
        console.error('Error loading custom field dimensions:', error);
    }
}

