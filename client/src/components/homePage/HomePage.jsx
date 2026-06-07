import { useEffect, useRef, useState } from 'react';

import ServerView from './ServerView.jsx';
import HomeView from './HomeView.jsx';
import SettingsView from './SettingsView.jsx';
import { FaUserGroup, FaBolt, FaSliders } from "react-icons/fa6";

const TABS = [
    { id: 0, label: 'Salons', Icon: FaUserGroup, variant: 'servers' },
    { id: 1, label: 'Jouer !', Icon: FaBolt, variant: 'home' },
    { id: 2, label: 'Profil', Icon: FaSliders, variant: 'settings' },
];

const AXIS_LOCK_PX = 10;
const SWIPE_RATIO = 0.22;
const VELOCITY_THRESHOLD = 0.35;

function clampDragOffset(offset, tab, width) {
    const maxIndex = TABS.length - 1;

    if (tab === 0 && offset > 0) {
        return offset * 0.35;
    }
    if (tab === maxIndex && offset < 0) {
        return offset * 0.35;
    }

    const minOffset = -((maxIndex - tab) * width);
    const maxOffset = tab * width;
    return Math.max(minOffset, Math.min(maxOffset, offset));
}

function HomePage() {
    const contentRef = useRef(null);
    const currentTabRef = useRef(1);
    const dragRef = useRef({
        startX: 0,
        startY: 0,
        startTab: 1,
        axis: null,
        lastX: 0,
        lastTime: 0,
        width: 0,
    });

    const [currentTab, setCurrentTab] = useState(1);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    currentTabRef.current = currentTab;

    const goToTab = (index) => {
        setCurrentTab(Math.max(0, Math.min(TABS.length - 1, index)));
        setDragOffset(0);
        setIsDragging(false);
        dragRef.current.axis = null;
    };

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;

        const finishDrag = (clientX) => {
            const drag = dragRef.current;
            if (drag.axis !== 'x') {
                setIsDragging(false);
                drag.axis = null;
                return;
            }

            const offset = clientX - drag.startX;
            const elapsed = Math.max(Date.now() - drag.lastTime, 1);
            const velocity = (clientX - drag.lastX) / elapsed;
            const threshold = drag.width * SWIPE_RATIO;

            let nextTab = drag.startTab;

            if (offset < -threshold || velocity < -VELOCITY_THRESHOLD) {
                nextTab = drag.startTab + 1;
            } else if (offset > threshold || velocity > VELOCITY_THRESHOLD) {
                nextTab = drag.startTab - 1;
            }

            nextTab = Math.max(0, Math.min(TABS.length - 1, nextTab));
            setCurrentTab(nextTab);
            setDragOffset(0);
            setIsDragging(false);
            drag.axis = null;
        };

        const onTouchStart = (e) => {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            dragRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                startTab: currentTabRef.current,
                axis: null,
                lastX: touch.clientX,
                lastTime: Date.now(),
                width: el.offsetWidth,
            };
            setIsDragging(true);
            setDragOffset(0);
        };

        const onTouchMove = (e) => {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            const drag = dragRef.current;
            const deltaX = touch.clientX - drag.startX;
            const deltaY = touch.clientY - drag.startY;

            if (!drag.axis) {
                if (Math.abs(deltaX) < AXIS_LOCK_PX && Math.abs(deltaY) < AXIS_LOCK_PX) {
                    return;
                }
                drag.axis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
            }

            if (drag.axis !== 'x') {
                return;
            }

            e.preventDefault();
            drag.lastX = touch.clientX;
            drag.lastTime = Date.now();
            setDragOffset(clampDragOffset(deltaX, drag.startTab, drag.width));
        };

        const onTouchEnd = (e) => {
            finishDrag(e.changedTouches[0].clientX);
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('touchcancel', onTouchEnd);
        };
    }, []);

    const trackStyle = dragOffset
        ? { transform: `translateX(calc(-${currentTab * 100}% + ${dragOffset}px))` }
        : { transform: `translateX(-${currentTab * 100}%)` };

    return (
        <div className="home-page">
            <div ref={contentRef} className="home-page__content">
                <div
                    className={`home-page__tabs-track${isDragging ? ' home-page__tabs-track--dragging' : ''}`}
                    style={trackStyle}
                >
                    <div className="home-page__tab-panel"><ServerView /></div>
                    <div className="home-page__tab-panel"><HomeView /></div>
                    <div className="home-page__tab-panel"><SettingsView /></div>
                </div>
            </div>

            <nav className="navbar-bottom" aria-label="Navigation principale">
                <div className="navbar-bottom__glow" aria-hidden="true" />
                <div className="navbar-bottom__track">
                    {TABS.map(({ id, label, Icon, variant }) => {
                        const isActive = currentTab === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                className={`navbar-bottom__item navbar-bottom__item--${variant}${isActive ? ' active' : ''}`}
                                onClick={() => goToTab(id)}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                <span className="navbar-bottom__icon-shell">
                                    <Icon className="navbar-bottom__icon" aria-hidden="true" />
                                    {variant === 'home' && (
                                        <span className="navbar-bottom__ring" aria-hidden="true" />
                                    )}
                                </span>
                                <span className="navbar-bottom__label">{label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

export default HomePage;
