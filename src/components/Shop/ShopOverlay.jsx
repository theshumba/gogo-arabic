import { useState, useMemo, useCallback, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { closeDialogue } from '../../store/slices/uiSlice.js';
import { spendDirhams, addToInventory, setOutfit, setHeadCovering } from '../../store/slices/playerSlice.js';
import { recordShopPurchase } from '../../store/slices/achievementSlice.js';
import { selectInventoryIds } from '../../store/slices/playerSlice.js';
import { EventBus } from '../../utils/eventBus.js';
import itemsData from '../../data/items.json';
import { COLORS, FONTS, pixelPanel, pixelBtnGold, pixelBtnDark } from '../../styles/theme.js';

const styles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url(/img/shop-bg2.gif)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  card: {
    ...pixelPanel,
    minWidth: '500px',
    maxWidth: '650px',
    maxHeight: '85vh',
    overflowY: 'auto',
    background: `${COLORS.beige}f0`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: `4px solid ${COLORS.dark}`,
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.brown,
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  balance: {
    fontFamily: FONTS.pixel,
    fontSize: '12px',
    color: COLORS.xpGold,
    fontWeight: 'bold',
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '14px',
    alignItems: 'center',
  },
  tabBtn: {
    ...pixelBtnDark,
    padding: '7px 15px',
    fontSize: '10px',
  },
  tabBtnActive: {
    ...pixelBtnGold,
    padding: '7px 15px',
    fontSize: '10px',
  },
  closeBtn: {
    ...pixelBtnDark,
    padding: '7px 13px',
    fontSize: '10px',
    marginLeft: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  item: {
    padding: '12px',
    border: `4px solid ${COLORS.dark}`,
    background: COLORS.white,
    textAlign: 'center',
  },
  itemOwned: {
    borderColor: COLORS.green,
    background: '#eafaf1',
  },
  itemNameArabic: {
    fontFamily: FONTS.arabic,
    fontSize: '16px',
    direction: 'rtl',
    color: COLORS.xpGold,
    marginBottom: '4px',
  },
  itemName: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.dark,
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  itemDesc: {
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    color: COLORS.brown,
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  itemPrice: {
    fontFamily: FONTS.pixel,
    fontSize: '11px',
    color: COLORS.xpGold,
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  buyBtn: {
    ...pixelBtnGold,
    padding: '6px 15px',
    fontSize: '10px',
  },
  buyBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  equipBtn: {
    fontFamily: FONTS.pixel,
    fontSize: '10px',
    padding: '6px 15px',
    border: 'none',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: COLORS.cyan,
    color: COLORS.dark,
    boxShadow: `
      inset -4px -4px 0px 0px rgba(0,0,0,0.2),
      inset 4px 4px 0px 0px rgba(255,255,255,0.2),
      0 4px 0 0 #048a9e
    `,
  },
  equippedBadge: {
    fontFamily: FONTS.pixel,
    fontSize: '8px',
    color: COLORS.green,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lockedText: {
    fontFamily: FONTS.pixel,
    fontSize: '7px',
    color: COLORS.red,
  },
  toast: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: COLORS.green,
    color: COLORS.white,
    fontFamily: FONTS.pixel,
    fontSize: '9px',
    padding: '10px 24px',
    border: `4px solid #1fa855`,
    fontWeight: 'bold',
    zIndex: 300,
    textTransform: 'uppercase',
  },
};

function ShopOverlay() {
  const dispatch = useDispatch();
  const player = useSelector((s) => s.player);
  const inventoryIds = useSelector(selectInventoryIds);
  const [tab, setTab] = useState('clothing');
  const [toast, setToast] = useState(null);

  const handleClose = useCallback(() => {
    dispatch(closeDialogue());
    EventBus.emit('unfreeze-player');
  }, [dispatch]);

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

  return (
    <motion.div
      style={styles.overlay}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={transition}
    >
      <motion.div
        style={styles.card}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={transition}
      >
        <div style={styles.header}>
          <div style={styles.title}>Merchant Fatima's Shop</div>
          <div style={styles.balance}>Dirhams: {player.dirhams}</div>
        </div>

        <div style={styles.tabRow}>
          <button
            style={tab === 'clothing' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setTab('clothing')}
          >
            Clothing
          </button>
          <button
            style={tab === 'boosts' ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setTab('boosts')}
          >
            Boosts
          </button>
          <button style={styles.closeBtn} onClick={handleClose}>Close</button>
        </div>

        <div style={styles.grid}>
          {filteredItems.map((item) => {
            const owned = player.inventory.includes(item.id);
            const canAfford = player.dirhams >= item.price;
            const isEquipped = player.outfit === item.id || player.headCovering === item.id;
            const locked = item.unlockLevel && player.level < item.unlockLevel;

            return (
              <div key={item.id} style={{ ...styles.item, ...(owned ? styles.itemOwned : {}) }}>
                {item.nameArabic && (
                  <div style={styles.itemNameArabic}>{item.nameArabic}</div>
                )}
                <div style={styles.itemName}>{item.name}</div>
                <div style={styles.itemDesc}>{item.description}</div>

                {!owned && (
                  <>
                    <div style={styles.itemPrice}>{item.price} Dirhams</div>
                    {locked ? (
                      <div style={styles.lockedText}>
                        Requires Lv.{item.unlockLevel}
                      </div>
                    ) : (
                      <button
                        style={{ ...styles.buyBtn, ...(!canAfford ? styles.buyBtnDisabled : {}) }}
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                      >
                        Buy
                      </button>
                    )}
                  </>
                )}

                {owned && !isEquipped && (item.type === 'clothing' || item.type === 'headwear') && (
                  <button style={styles.equipBtn} onClick={() => handleEquip(item)}>
                    Equip
                  </button>
                )}

                {owned && isEquipped && (
                  <span style={styles.equippedBadge}>Equipped</span>
                )}

                {owned && item.type === 'boost' && (
                  <span style={styles.equippedBadge}>Owned</span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {toast && (
        <motion.div
          style={styles.toast}
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
