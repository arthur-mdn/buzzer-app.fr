// AboutApp.js
import React, {useEffect, useState} from 'react';
import {FaGithub, FaPaypal} from "react-icons/fa6";


function AboutApp() {
    const [display, setDisplay] = useState('none');


    return (
        <>
        <button
            className={"btn-push"}
            style={{fontSize:'1rem', padding: '0.5rem 1rem', margin: '0 0 0.5rem 0'}}
            onClick={
            ()=>{setDisplay('contents')}
        }> À propos</button>

            <div style={{display: display, flexDirection: 'column', alignItems: 'center'}}>
                <nav className={'modal_bg'}>
                    <div className={'modal'}>
                        <div className={'modal_content_title'}>
                            <h2>À propos</h2>
                            <button className={"close btn-push"}
                                type={'button'}
                                onClick={()=>{setDisplay('none')}}
                            >
                                X
                            </button>
                        </div>
                        <div style={{textAlign:"justify", padding:'1rem', overflowY:"scroll"}}>
                            <p >
                                "Buzzer-App" révolutionne les soirées jeux avec une expérience interactive et dynamique, transformant chaque rencontre en une compétition palpitante de rapidité et d'esprit.
                                <br/>
                                <br/>
                                Cette application web innovante est conçue pour animer vos soirées blind-test, quizz et bien d'autres jeux de groupe, en introduisant un élément compétitif captivant : qui appuiera sur le buzzer en premier ?
                                <br/>
                                <br/>
                                Avec "Buzzer-App", l'hôte crée facilement un groupe et invite les participants via un code ou un lien d’invitation.
                                <br/>
                                <br/>
                                Chaque joueur, muni de son buzzer virtuel, est prêt à relever le défi dès que l'hôte lance la partie.
                                <br/>
                                <br/>
                                Les points en jeu, définis par l'hôte, ajoutent une couche stratégique à chaque question.
                                <br/>
                                <br/>
                                L'application affiche en temps réel le nom du joueur le plus rapide, tandis que l'hôte garde le contrôle pour valider ou refuser les réponses.
                                <br/>
                                <br/>
                                "Buzzer-App" ne se contente pas de mesurer la rapidité ; elle offre aussi un aperçu de la connexion réseau de chaque participant, garantissant ainsi une compétition équitable.
                                <br/>
                                <br/>
                                Rejoignez la communauté "Buzzer-App" pour transformer vos rencontres en moments inoubliables d'amusement et de compétition.
                                <br/>
                                <br/>
                                Crédits : Arthur Mondon, 2023 <a href={"https://mondon.pro/projet/buzzer-app"} target={"_blank"}>Voir le projet</a>
                                <br/>
                                <br/>
                                <div style={{display:"flex", gap:'1rem'}}>
                                    <a className={"btn-push"} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:'0.5rem'}} href={"https://github.com/arthur-mdn/buzzer-app"} target={"_blank"}>
                                        <FaGithub/>
                                        GitHub
                                    </a>
                                    <a className={"btn-push btn-push-green"} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:'0.5rem'}} href={"https://www.paypal.com/paypalme/arthurmondon"} target={"_blank"}>
                                        <FaPaypal/>
                                        PayPal
                                    </a>
                                </div>
                            </p>
                        </div>
                    </div>
                </nav>
            </div>
        </>

    );
}

export default AboutApp;
