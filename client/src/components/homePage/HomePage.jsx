import React, { useRef, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ServerView from './ServerView.jsx';
import HomeView from './HomeView.jsx';
import SettingsView from './SettingsView.jsx';
import { FaUserGroup, FaBolt, FaSliders } from "react-icons/fa6";

const TABS = [
    { id: 0, label: 'Salons', Icon: FaUserGroup, variant: 'servers' },
    { id: 1, label: 'Jouer !', Icon: FaBolt, variant: 'home' },
    { id: 2, label: 'Profil', Icon: FaSliders, variant: 'settings' },
];

function HomePage() {
    const sliderRef = useRef();
    const [currentTab, setCurrentTab] = useState(1);

    const settings = {
        initialSlide: currentTab,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        afterChange: (current) => setCurrentTab(current),
    };

    const goToSlide = (index) => {
        sliderRef.current.slickGoTo(index);
    };

    return (
        <div className="home-page">
            <div className="home-page__content">
                <Slider ref={sliderRef} {...settings}>
                    <div><ServerView /></div>
                    <div><HomeView /></div>
                    <div><SettingsView /></div>
                </Slider>
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
                                onClick={() => goToSlide(id)}
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
