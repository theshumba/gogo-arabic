import { useState, useMemo } from 'react';
import { COLORS, FONTS, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';
import {
  getAllRoots,
  getRootWords,
  ROOT_CATEGORIES,
  getRootsByCategory,
  searchRoots,
  VERBS,
} from '../../data/rootsData.js';

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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Root Explorer</h1>
        <h2 style={styles.titleArabic}>مستكشف الجذور</h2>
        <p style={styles.subtitle}>
          Explore the Arabic root system - 3-letter roots that form related words
        </p>
      </div>

      {!selectedRoot ? (
        <>
          {/* Controls */}
          <div style={styles.controls}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search roots (Arabic or English)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />

            {/* Category Filter */}
            <div style={styles.categoryFilter}>
              {Object.entries(ROOT_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setSearchQuery('');
                  }}
                  style={{
                    ...pixelBtnDark,
                    ...(selectedCategory === key ? styles.categoryActive : {}),
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
          <div style={styles.rootsGrid}>
            {roots.length === 0 ? (
              <div style={styles.noResults}>
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
                  style={styles.rootCard}
                >
                  <div style={styles.rootArabic}>{root.rootSpaced}</div>
                  <div style={styles.rootMeaning}>{root.meaning}</div>
                  <div style={styles.rootWordCount}>
                    {root.wordCount} {root.wordCount === 1 ? 'word' : 'words'}
                  </div>
                </div>
              ))
            )}
          </div>

          {roots.length > 50 && (
            <p style={styles.moreIndicator}>
              Showing 50 of {roots.length} roots. Refine your search to see more.
            </p>
          )}
        </>
      ) : (
        /* Root Detail View */
        <div style={styles.detailView}>
          <button onClick={handleBackToList} style={{ ...pixelBtnDark, marginBottom: '20px' }}>
            ← Back to List
          </button>

          <div style={styles.detailHeader}>
            <div style={styles.detailRootArabic}>{rootDetails?.rootSpaced || selectedRoot.rootSpaced}</div>
            <div style={styles.detailMeaning}>{rootDetails?.meaning || selectedRoot.meaning}</div>
          </div>

          {/* Tree visualization */}
          <div style={styles.tree}>
            <div style={styles.treeTrunk} />
            <div style={styles.wordsContainer}>
              {rootDetails?.words && rootDetails.words.length > 0 ? (
                rootDetails.words.map((word, index) => {
                  const verbInfo = getVerbDetails(word);
                  const isExpanded = expandedWords.has(word);

                  return (
                    <div key={index} style={styles.wordBranch}>
                      <div style={styles.branchLine} />
                      <div
                        onClick={() => toggleWordDetails(word)}
                        style={styles.wordCard}
                      >
                        <div style={styles.wordArabic}>{word}</div>
                        {verbInfo && (
                          <>
                            <div style={styles.wordEnglish}>{verbInfo.english}</div>
                            {isExpanded && verbInfo.transliteration && (
                              <div style={styles.wordTranslit}>
                                {verbInfo.transliteration}
                              </div>
                            )}
                          </>
                        )}
                        <div style={styles.tapHint}>
                          {verbInfo ? (isExpanded ? '▲' : '▼') : ''}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={styles.noWords}>No derived words available</p>
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

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    background: COLORS.beige,
    overflow: 'auto',
    padding: '20px',
    boxSizing: 'border-box',
    fontFamily: FONTS.pixel,
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '20px',
    color: COLORS.brown,
    margin: '0 0 10px 0',
  },
  titleArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '28px',
    color: COLORS.darkGold,
    margin: '0 0 10px 0',
    direction: 'rtl',
  },
  subtitle: {
    fontSize: '10px',
    color: COLORS.brown,
    maxWidth: '600px',
    margin: '0 auto',
  },
  controls: {
    marginBottom: '20px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '600px',
    padding: '12px 16px',
    fontSize: '12px',
    fontFamily: FONTS.pixel,
    border: `3px solid ${COLORS.brown}`,
    background: COLORS.white,
    display: 'block',
    margin: '0 auto 16px',
    boxSizing: 'border-box',
  },
  categoryFilter: {
    textAlign: 'center',
    marginTop: '16px',
  },
  categoryActive: {
    background: COLORS.xpGold,
    transform: 'translateY(2px)',
  },
  rootsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
    marginBottom: '20px',
  },
  rootCard: {
    background: COLORS.white,
    border: `3px solid ${COLORS.brown}`,
    padding: '16px',
    cursor: 'pointer',
    transition: 'transform 0.1s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  rootArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '24px',
    color: COLORS.darkGold,
    marginBottom: '8px',
    direction: 'rtl',
    textAlign: 'center',
  },
  rootMeaning: {
    fontSize: '10px',
    color: COLORS.brown,
    marginBottom: '8px',
    textAlign: 'center',
  },
  rootWordCount: {
    fontSize: '8px',
    color: COLORS.gray,
    textAlign: 'center',
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    fontSize: '12px',
    color: COLORS.gray,
  },
  moreIndicator: {
    textAlign: 'center',
    fontSize: '10px',
    color: COLORS.gray,
    marginTop: '20px',
  },
  detailView: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  detailHeader: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '20px',
    background: COLORS.white,
    border: `4px solid ${COLORS.brown}`,
  },
  detailRootArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '36px',
    color: COLORS.darkGold,
    marginBottom: '12px',
    direction: 'rtl',
  },
  detailMeaning: {
    fontSize: '14px',
    color: COLORS.brown,
  },
  tree: {
    position: 'relative',
    paddingLeft: '40px',
  },
  treeTrunk: {
    position: 'absolute',
    left: '20px',
    top: '0',
    bottom: '0',
    width: '4px',
    background: COLORS.brown,
  },
  wordsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  wordBranch: {
    position: 'relative',
    paddingLeft: '30px',
  },
  branchLine: {
    position: 'absolute',
    left: '0',
    top: '50%',
    width: '30px',
    height: '3px',
    background: COLORS.brown,
  },
  wordCard: {
    background: COLORS.creamyBeige,
    border: `3px solid ${COLORS.brown}`,
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  wordArabic: {
    fontFamily: FONTS.arabicDisplay,
    fontSize: '20px',
    color: COLORS.brown,
    marginBottom: '4px',
    direction: 'rtl',
  },
  wordEnglish: {
    fontSize: '11px',
    color: COLORS.darkGold,
    marginBottom: '4px',
  },
  wordTranslit: {
    fontSize: '9px',
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: '4px',
  },
  tapHint: {
    fontSize: '8px',
    color: COLORS.gray,
    textAlign: 'right',
  },
  noWords: {
    fontSize: '11px',
    color: COLORS.gray,
    textAlign: 'center',
    padding: '20px',
  },
};
