// Preset robot constraint profiles for common FRC robot types

export const ROBOT_PROFILES = {
    kitbot: {
        name: "KitBot / Everybot",
        description: "Standard FRC KitBot configuration",
        constraints: {
            maxVelocity: 3.8,      // ~12.5 ft/s
            maxAcceleration: 2.5,  // Conservative
            maxJerk: 10.0,
            maxCentripetal: 2.5
        }
    },
    swerve: {
        name: "Swerve Drive",
        description: "High-performance swerve drive",
        constraints: {
            maxVelocity: 4.5,      // ~15 ft/s
            maxAcceleration: 3.0,
            maxJerk: 12.0,
            maxCentripetal: 3.0
        }
    },
    mecanum: {
        name: "Mecanum Drive",
        description: "Omnidirectional mecanum wheels",
        constraints: {
            maxVelocity: 3.5,      // Slightly lower due to wheel efficiency
            maxAcceleration: 2.0,  // Lower due to wheel slip
            maxJerk: 8.0,
            maxCentripetal: 1.5    // Lower friction coefficient
        }
    },
    tank: {
        name: "Tank Drive",
        description: "Standard tank drive configuration",
        constraints: {
            maxVelocity: 3.5,
            maxAcceleration: 2.2,
            maxJerk: 9.0,
            maxCentripetal: 2.2
        }
    },
    custom: {
        name: "Custom",
        description: "User-defined constraints",
        constraints: {
            maxVelocity: 3.8,
            maxAcceleration: 2.5,
            maxJerk: 10.0,
            maxCentripetal: 2.5
        }
    }
};

export function getProfileByName(name) {
    return ROBOT_PROFILES[name] || ROBOT_PROFILES.custom;
}

export function saveCustomProfile(name, constraints) {
    const profiles = JSON.parse(localStorage.getItem('customProfiles') || '{}');
    profiles[name] = {
        name: name,
        description: "Custom profile",
        constraints: constraints
    };
    localStorage.setItem('customProfiles', JSON.stringify(profiles));
}

export function loadCustomProfiles() {
    try {
        return JSON.parse(localStorage.getItem('customProfiles') || '{}');
    } catch {
        return {};
    }
}

export function deleteCustomProfile(name) {
    const profiles = loadCustomProfiles();
    delete profiles[name];
    localStorage.setItem('customProfiles', JSON.stringify(profiles));
}

