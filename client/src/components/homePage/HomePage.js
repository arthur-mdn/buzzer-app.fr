// HomePage.js
import React, {useRef, useState} from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import ServerView from './ServerView'; // Composant pour la vue des serveurs
import HomeView from './HomeView'; // Composant pour la vue d'accueil
import SettingsView from './SettingsView';
import {FaUserGroup} from "react-icons/fa6";
import {FaCogs, FaHome} from "react-icons/fa"; // Composant pour la vue des paramètres

function HomePage() {
    const sliderRef = useRef();
    const [currentTab, setCurrentTab] = useState(1); // Index du slider pour 'home'
    
    const settings = {
        initialSlide: currentTab,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows:false,
        afterChange: current => setCurrentTab(current),
    };

    const goToSlide = (index) => {
        sliderRef.current.slickGoTo(index);
    };

    const isActiveTab = (tabIndex) => {
        return currentTab === tabIndex;
    };

    return (
        <div>
            <Slider ref={sliderRef} {...settings}>
                <div><ServerView /></div>
                <div><HomeView /></div>
                <div><SettingsView /></div>
            </Slider>

            {/* Barre de navigation en bas */}
            <div className="modal navbar-bottom">
                <button
                    className={isActiveTab(0) ? "active" : ""}
                    onClick={() => goToSlide(0)}
                >
                    <FaUserGroup/>
                    <span>Serveurs</span>
                </button>
                <button
                    className={isActiveTab(1) ? "active" : ""}
                    onClick={() => goToSlide(1)}
                >
                    <FaHome/>
                    <span>Accueil</span>
                </button>
                <button
                    className={isActiveTab(2) ? "active" : ""}
                    onClick={() => goToSlide(2)}
                >
                    <FaCogs/>
                    <span>Paramètres</span>
                </button>
            </div>
        </div>
    );
}

export default HomePage;
