import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setLearningPath, setTutorialPhase } from '../../store/slices/playerSlice.js';
import styles from './PathChoice.module.css';

const PATHS = [
  {
    id: 'scholar',
    nameAr: 'القارئ',
    nameEn: 'Path of the Scholar',
    icon: '📜',
    desc: 'Reading focus — Quranic vocabulary, classical texts, calligraphy. Prioritizes reading comprehension and formal Arabic.',
    mentor: 'Scholar Yusuf',
  },
  {
    id: 'traveler',
    nameAr: 'المسافر',
    nameEn: 'Path of the Traveler',
    icon: '🧭',
    desc: 'Conversational focus — greetings, directions, food, daily life. Prioritizes practical phrases and social situations.',
    mentor: 'Guide Amira',
  },
  {
    id: 'historian',
    nameAr: 'المؤرخ',
    nameEn: 'Path of the Historian',
    icon: '🏛️',
    desc: 'Cultural focus — historical terms, scientific Arabic, trade vocabulary. Prioritizes world exploration and cultural knowledge.',
    mentor: 'Elder Tariq',
  },
  {
    id: 'polymath',
    nameAr: 'المتعلم',
    nameEn: 'Path of the Polymath',
    icon: '🌟',
    desc: 'All-rounder — reading, conversation, and culture combined. No priority bias — learn everything equally. The hardest but most rewarding path.',
    mentor: 'All Mentors',
  },
];

export default function PathChoice() {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState(null);
  const [fadingOut, setFadingOut] = useState(false);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    dispatch(setLearningPath(selected));
    setFadingOut(true);
    setTimeout(() => {
      dispatch(setTutorialPhase('awaiting_mentor'));
    }, 800);
  }, [selected, dispatch]);

  return (
    <div className={`${styles.overlay} ${fadingOut ? styles.fadeOut : ''}`}>
      <div className={styles.container}>
        <p className={styles.amiraText}>
          &ldquo;What draws you to Arabic?&rdquo;
        </p>
        <p className={styles.subtitle}>Choose your focus — you can change later</p>

        <div className={styles.paths}>
          {PATHS.map((path) => (
            <button
              key={path.id}
              className={`${styles.pathCard} ${selected === path.id ? styles.selected : ''}`}
              onClick={() => setSelected(path.id)}
            >
              <span className={styles.icon}>{path.icon}</span>
              <span className={styles.nameAr}>{path.nameAr}</span>
              <span className={styles.nameEn}>{path.nameEn}</span>
              <span className={styles.desc}>{path.desc}</span>
              <span className={styles.mentor}>Mentor: {path.mentor}</span>
            </button>
          ))}
        </div>

        <button
          className={`${styles.confirmBtn} ${selected ? styles.active : ''}`}
          onClick={handleConfirm}
          disabled={!selected}
        >
          Begin Journey
        </button>
      </div>
    </div>
  );
}
