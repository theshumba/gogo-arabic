import { useState, useMemo } from 'react';
import { pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import { useFormatArabic } from '../../hooks/useFormatArabic.js';
import {
  getAllRoots,
  getRootWords,
  ROOT_CATEGORIES,
  getRootsByCategory,
  searchRoots,
  VERBS,
} from '../../data/rootsData.js';
import styles from './RootExplorer.module.css';

/**
 * RootExplorer Component
 *
 * Interactive Arabic root system explorer showing 3-letter roots
 * and their derived words in a tree visualization.
 *
 * Features:
 * - Filter by semantic category
 * - Search by Arabic or English
 * - Click root to see all derived words
 * - Pixel-art tree branch visualization
 * - Displays meanings and transliterations
 */
export default function RootExplorer({ onBack }) {
  const formatArabic = useFormatArabic();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoot, setSelectedRoot] = useState(null);
  const [expandedWords, setExpandedWords] = useState(new Set());

  // Get filtered roots
  const roots = useMemo(() => {
    if (searchQuery.trim()) {
      return searchRoots(searchQuery);
    }
    return getRootsByCategory(selectedCategory);
  }, [selectedCategory, searchQuery]);

  // Get details for selected root
  const rootDetails = useMemo(() => {
    if (!selectedRoot) return null;
    return getRootWords(selectedRoot.root);
  }, [selectedRoot]);

  const handleRootClick = (root) => {
    setSelectedRoot(root);
    setExpandedWords(new Set());
  };

  const handleBackToList = () => {
    setSelectedRoot(null);
    setExpandedWords(new Set());
  };

  const toggleWordDetails = (word) => {
    setExpandedWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  };

  // Find verb details for a word
  const getVerbDetails = (arabicWord) => {
    return VERBS.find(v => v.arabic === arabicWord);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Root Explorer</h1>
        <h2 className={styles.titleArabic}>{formatArabic('مستكشف الجذور')}</h2>
        <p className={styles.subtitle}>
          Explore the Arabic root system - 3-letter roots that form related words
        </p>
      </div>

      {!selectedRoot ? (
        <>
          {/* Controls */}
          <div className={styles.controls}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search roots (Arabic or English)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />

            {/* Category Filter */}
            <div className={styles.categoryFilter}>
              {Object.entries(ROOT_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setSearchQuery('');
                  }}
                  style={{
                    ...pixelBtnDark,
                    ...(selectedCategory === key ? { background: '#e2b659', transform: 'translateY(2px)' } : {}),
                    fontSize: '10px',
                    padding: '10px 16px',
                    margin: '4px',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Roots Grid */}
          <div className={styles.rootsGrid}>
            {roots.length === 0 ? (
              <div className={styles.noResults}>
                <p>No roots found</p>
                <p style={{ fontSize: '10px', marginTop: '8px' }}>
                  Try a different search or category
                </p>
              </div>
            ) : (
              roots.slice(0, 50).map((root) => (
                <div
                  key={root.root}
                  onClick={() => handleRootClick(root)}
                  className={styles.rootCard}
                >
                  <div className={styles.rootArabic}>{formatArabic(root.rootSpaced)}</div>
                  <div className={styles.rootMeaning}>{root.meaning}</div>
                  <div className={styles.rootWordCount}>
                    {root.wordCount} {root.wordCount === 1 ? 'word' : 'words'}
                  </div>
                </div>
              ))
            )}
          </div>

          {roots.length > 50 && (
            <p className={styles.moreIndicator}>
              Showing 50 of {roots.length} roots. Refine your search to see more.
            </p>
          )}
        </>
      ) : (
        /* Root Detail View */
        <div className={styles.detailView}>
          <button onClick={handleBackToList} style={{ ...pixelBtnDark, marginBottom: '20px' }}>
            ← Back to List
          </button>

          <div className={styles.detailHeader}>
            <div className={styles.detailRootArabic}>{formatArabic(rootDetails?.rootSpaced || selectedRoot.rootSpaced)}</div>
            <div className={styles.detailMeaning}>{rootDetails?.meaning || selectedRoot.meaning}</div>
          </div>

          {/* Tree visualization */}
          <div className={styles.tree}>
            <div className={styles.treeTrunk} />
            <div className={styles.wordsContainer}>
              {rootDetails?.words && rootDetails.words.length > 0 ? (
                rootDetails.words.map((word, index) => {
                  const verbInfo = getVerbDetails(word);
                  const isExpanded = expandedWords.has(word);

                  return (
                    <div key={index} className={styles.wordBranch}>
                      <div className={styles.branchLine} />
                      <div
                        onClick={() => toggleWordDetails(word)}
                        className={styles.wordCard}
                      >
                        <div className={styles.wordArabic}>{formatArabic(word)}</div>
                        {verbInfo && (
                          <>
                            <div className={styles.wordEnglish}>{verbInfo.english}</div>
                            {isExpanded && verbInfo.transliteration && (
                              <div className={styles.wordTranslit}>
                                {verbInfo.transliteration}
                              </div>
                            )}
                          </>
                        )}
                        <div className={styles.tapHint}>
                          {verbInfo ? (isExpanded ? '▲' : '▼') : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.noWords}>No derived words available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button onClick={onBack} style={{ ...pixelBtnGold, marginTop: '20px' }}>
        Back to Menu
      </button>
    </div>
  );
}
