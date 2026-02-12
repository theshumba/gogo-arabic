import { useState, useMemo, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { closeDialogue } from '../../store/slices/uiSlice.js';
import { spendDirhams, addToInventory, setOutfit, setHeadCovering } from '../../store/slices/playerSlice.js';
import { recordShopPurchase } from '../../store/slices/achievementSlice.js';
import { selectInventoryIds } from '../../store/slices/playerSlice.js';
import { useOverlayClose } from '../../hooks/useOverlayClose.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import itemsData from '../../data/items.json';
import styles from './ShopOverlay.module.css';

function ShopOverlay() {
  const dispatch = useDispatch();
  const player = useSelector((s) => s.player);
  const inventoryIds = useSelector(selectInventoryIds);
  const [tab, setTab] = useState('clothing');
  const [toast, setToast] = useState(null);

  const focusTrapRef = useFocusTrap(true, null);

  const handleClose = useCallback(() => {
    dispatch(closeDialogue());
  }, [dispatch]);

  const handleOverlayClose = useOverlayClose(handleClose);

  const handleBuy = useCallback((item) => {
    if (player.dirhams < item.price) return;
    if (inventoryIds.includes(item.id)) return;
    dispatch(spendDirhams(item.price));
    dispatch(addToInventory(item.id));
    dispatch(recordShopPurchase(item.price));
    setToast(`Purchased ${item.name}!`);
    setTimeout(() => setToast(null), 2000);
  }, [player.dirhams, inventoryIds, dispatch]);

  const handleEquip = useCallback((item) => {
    if (item.type === 'clothing') {
      dispatch(setOutfit(item.id));
    } else if (item.type === 'headwear') {
      dispatch(setHeadCovering(item.id));
    }
    setToast(`Equipped ${item.name}!`);
    setTimeout(() => setToast(null), 2000);
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    return itemsData.filter((i) => {
      if (tab === 'clothing') return i.type === 'clothing' || i.type === 'headwear';
      return i.type === 'boost';
    });
  }, [tab]);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.25, ease: 'easeOut' };

  // Dynamic background image
  const overlayStyle = {
    backgroundColor: '#16213e',
    backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(212, 168, 67, 0.1) 0%, transparent 50%), repeating-conic-gradient(rgba(212, 168, 67, 0.04) 0% 25%, transparent 0% 50%) 0 0 / 48px 48px',
  };

  return (
    <motion.div
      ref={focusTrapRef}
      className={styles.overlay}
      style={overlayStyle}
      onClick={handleOverlayClose}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={transition}
    >
      <motion.div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <div className={styles.header}>
          <div className={styles.title}>Merchant Fatima's Shop</div>
          <div className={styles.balance}>Dirhams: {player.dirhams}</div>
        </div>

        <div className={styles.tabRow}>
          <button
            className={tab === 'clothing' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setTab('clothing')}
          >
            Clothing
          </button>
          <button
            className={tab === 'boosts' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setTab('boosts')}
          >
            Boosts
          </button>
          <button className={styles.closeBtn} onClick={handleOverlayClose}>Close</button>
        </div>

        <div className={styles.grid}>
          {filteredItems.map((item) => {
            const owned = player.inventory.includes(item.id);
            const canAfford = player.dirhams >= item.price;
            const isEquipped = player.outfit === item.id || player.headCovering === item.id;
            const locked = item.unlockLevel && player.level < item.unlockLevel;

            return (
              <div key={item.id} className={`${styles.item} ${owned ? styles.itemOwned : ''}`}>
                {item.nameArabic && (
                  <div className={styles.itemNameArabic}>{item.nameArabic}</div>
                )}
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemDesc}>{item.description}</div>

                {!owned && (
                  <>
                    <div className={styles.itemPrice}>{item.price} Dirhams</div>
                    {locked ? (
                      <div className={styles.lockedText}>
                        Requires Lv.{item.unlockLevel}
                      </div>
                    ) : (
                      <button
                        className={`${styles.buyBtn} ${!canAfford ? styles.buyBtnDisabled : ''}`}
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                      >
                        Buy
                      </button>
                    )}
                  </>
                )}

                {owned && !isEquipped && (item.type === 'clothing' || item.type === 'headwear') && (
                  <button className={styles.equipBtn} onClick={() => handleEquip(item)}>
                    Equip
                  </button>
                )}

                {owned && isEquipped && (
                  <span className={styles.equippedBadge}>Equipped</span>
                )}

                {owned && item.type === 'boost' && (
                  <span className={styles.equippedBadge}>Owned</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {toast && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {toast}
        </motion.div>
      )}
    </motion.div>
  );
}

// Memoize component
export default memo(ShopOverlay);
