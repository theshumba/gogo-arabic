import { useSelector, useDispatch } from 'react-redux';
import { SKILL_TREES } from '../../data/skillTrees.js';
import {
  unlockNode,
  selectUnlockedNodes,
  selectSkillXP,
  selectNodeAvailability,
} from '../../store/slices/skillTreeSlice.js';
import styles from './SkillTreeView.module.css';

/**
 * SkillTreeView — Renders a single skill tree as a vertical list of nodes.
 *
 * Node visual states:
 *   unlocked  — gold border, full opacity, checkmark badge
 *   available — white border, full opacity, clickable (player has XP + prereqs met)
 *   locked    — grey border, dimmed, non-interactive
 *
 * @param {Object}   props
 * @param {string}   props.treeId  - Which tree to render (e.g. 'reading')
 */
export default function SkillTreeView({ treeId }) {
  const dispatch = useDispatch();

  const tree = SKILL_TREES[treeId];
  const unlockedNodes = useSelector(selectUnlockedNodes(treeId));
  const currentXP = useSelector(selectSkillXP(treeId));
  const availability = useSelector(selectNodeAvailability(treeId));

  if (!tree) {
    return (
      <div className={styles.error}>
        Unknown skill tree: {treeId}
      </div>
    );
  }

  const handleNodeClick = (node) => {
    if (availability[node.id] === 'available') {
      dispatch(unlockNode({ treeId, nodeId: node.id }));
    }
  };

  const getNodeClass = (nodeId) => {
    const state = availability[nodeId];
    if (state === 'unlocked') return `${styles.node} ${styles.unlocked}`;
    if (state === 'available') return `${styles.node} ${styles.available}`;
    return `${styles.node} ${styles.locked}`;
  };

  const getRewardLabel = (rewards) => {
    if (!rewards) return null;
    switch (rewards.type) {
      case 'badge':        return `Badge: ${rewards.value}`;
      case 'xp_bonus':     return `+${rewards.value} XP`;
      case 'unlock_content': return 'Unlocks content';
      case 'title':        return `Title: ${rewards.value}`;
      default:             return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* XP display */}
      <div className={styles.xpBar}>
        <span className={styles.xpLabel}>Skill XP</span>
        <span className={styles.xpValue}>{currentXP}</span>
      </div>

      {/* Node list */}
      <ul className={styles.nodeList} role="list">
        {tree.nodes.map((node, index) => {
          const state = availability[node.id];
          const isClickable = state === 'available';
          const isUnlocked = state === 'unlocked';
          const rewardLabel = getRewardLabel(node.rewards);

          return (
            <li key={node.id} className={styles.nodeRow}>
              {/* Connector line (not shown for first node) */}
              {index > 0 && (
                <div
                  className={`${styles.connector} ${
                    isUnlocked ? styles.connectorUnlocked : ''
                  }`}
                  aria-hidden="true"
                />
              )}

              <button
                className={getNodeClass(node.id)}
                onClick={() => handleNodeClick(node)}
                disabled={!isClickable && !isUnlocked}
                aria-label={`${node.name} — ${state}${state === 'available' ? `, costs ${node.xpCost} XP` : ''}`}
                aria-pressed={isUnlocked}
              >
                {/* Status badge */}
                <span className={styles.statusBadge} aria-hidden="true">
                  {isUnlocked ? '✓' : state === 'available' ? '◆' : '○'}
                </span>

                {/* Main content */}
                <div className={styles.nodeContent}>
                  <div className={styles.nodeHeader}>
                    <span className={styles.nodeName}>{node.name}</span>
                    <span className={styles.nodeNameArabic} lang="ar">
                      {node.nameArabic}
                    </span>
                  </div>

                  <p className={styles.nodeDescription}>{node.description}</p>

                  <div className={styles.nodeMeta}>
                    <span className={styles.cefr}>{node.cefrLevel}</span>

                    {!isUnlocked && (
                      <span className={styles.xpCost}>
                        {node.xpCost} XP
                      </span>
                    )}

                    {rewardLabel && (
                      <span className={styles.reward}>{rewardLabel}</span>
                    )}
                  </div>

                  {/* Prerequisites indicator */}
                  {node.prerequisites.length > 0 && state === 'locked' && (
                    <div className={styles.prereqNote} aria-live="polite">
                      Requires:{' '}
                      {node.prerequisites.map((prereqId) => {
                        const prereqNode = tree.nodes.find((n) => n.id === prereqId);
                        return prereqNode ? prereqNode.name : prereqId;
                      }).join(', ')}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
