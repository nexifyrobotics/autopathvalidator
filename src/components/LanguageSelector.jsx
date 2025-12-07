import React from 'react';
import { Globe } from 'lucide-react';
import { getAvailableLanguages } from '../utils/i18n';

export function LanguageSelector({ currentLang, onLanguageChange }) {
    const languages = getAvailableLanguages();
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                title="Change Language"
            >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{languages.find(l => l.code === currentLang)?.flag || '🌐'}</span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 min-w-[180px]">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    onLanguageChange(lang.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 text-left transition-colors ${
                                    currentLang === lang.code ? 'bg-neutral-700' : ''
                                }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className="text-white text-sm">{lang.name}</span>
                                {currentLang === lang.code && (
                                    <span className="ml-auto text-blue-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

