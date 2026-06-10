import { FaGithub, FaPaypal } from 'react-icons/fa6';

function AboutModalContent() {
    return (
        <>
            <div className="about-modal__text">
                <p>
                    Buzzer-App révolutionne les soirées jeux avec une expérience interactive et dynamique,
                    transformant chaque rencontre en une compétition palpitante de rapidité et d&apos;esprit.
                </p>
                <p>
                    Cette application web est conçue pour animer vos soirées blind-test, quizz et autres jeux de groupe,
                    en introduisant un élément compétitif captivant : qui appuiera sur le buzzer en premier ?
                </p>
                <p>
                    L&apos;hôte crée facilement un groupe et invite les participants via un code ou un lien d&apos;invitation.
                    Chaque joueur, muni de son buzzer virtuel, est prêt à relever le défi dès que l&apos;hôte lance la partie.
                </p>
                <p>
                    Les points en jeu, définis par l&apos;hôte, ajoutent une couche stratégique à chaque question.
                    L&apos;application affiche en temps réel le nom du joueur le plus rapide, tandis que l&apos;hôte garde le contrôle
                    pour valider ou refuser les réponses.
                </p>
                <p>
                    Buzzer-App ne se contente pas de mesurer la rapidité ; elle offre aussi un aperçu de la connexion réseau
                    de chaque participant, pour une compétition équitable.
                </p>
                <p>
                    Crédits : Arthur Mondon, 2023{' '}
                    <a href="https://mondon.pro/projet/buzzer-app" target="_blank" rel="noreferrer">
                        Voir le projet
                    </a>
                </p>
            </div>
            <div className="about-modal__links">
                <a
                    className="btn-push about-modal__link"
                    href="https://github.com/arthur-mdn/buzzer-app"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaGithub aria-hidden="true" />
                    GitHub
                </a>
                <a
                    className="btn-push btn-push-green about-modal__link"
                    href="https://www.paypal.com/paypalme/arthurmondon"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaPaypal aria-hidden="true" />
                    PayPal
                </a>
            </div>
        </>
    );
}

export default AboutModalContent;
