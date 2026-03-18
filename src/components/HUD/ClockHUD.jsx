import React from 'react';
import { useSelector } from 'react-redux';
import { selectFormattedTime, selectTimePhase, TIME_PHASES } from '../../store/slices/timeSlice';
import styles from './ClockHUD.module.css';

const PhaseIcons = {
    [TIME_PHASES.DAWN]: '🌅',
    [TIME_PHASES.MORNING]: '☀️',
    [TIME_PHASES.NOON]: '☀️',
    [TIME_PHASES.AFTERNOON]: '🌤️',
    [TIME_PHASES.SUNSET]: '🌇',
    [TIME_PHASES.NIGHT]: '🌙',
};

const PhaseLabels = {
    [TIME_PHASES.DAWN]: 'الفجر',
    [TIME_PHASES.MORNING]: 'الصباح',
    [TIME_PHASES.NOON]: 'الظهر',
    [TIME_PHASES.AFTERNOON]: 'العصر',
    [TIME_PHASES.SUNSET]: 'المغرب',
    [TIME_PHASES.NIGHT]: 'العشاء', // Or 'الليل'
};

const ClockHUD = () => {
    const timeString = useSelector(selectFormattedTime);
    const phase = useSelector(selectTimePhase);

    return (
        <div className={styles.container}>
            <div className={styles.icon}>{PhaseIcons[phase]}</div>
            <div className={styles.time}>{timeString}</div>
            <div className={styles.phase}>{PhaseLabels[phase]}</div>
        </div>
    );
};

export default ClockHUD;
