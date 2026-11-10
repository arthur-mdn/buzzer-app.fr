import { Link } from 'react-router-dom';
import {
    FaBolt,
    FaQrcode,
    FaLink,
    FaTrophy,
    FaUserGroup,
    FaSliders,
    FaWifi,
    FaGlobe,
    FaGithub,
    FaPaypal,
} from 'react-icons/fa6';

const STEPS = [
    {
        title: 'Crée un salon',
        text: 'Choisis un nom, un blason et les règles de score. Tu es prêt en quelques secondes.',
    },
    {
        title: 'Invite tes amis',
        text: 'Partage un code, un lien ou un QR. Chacun rejoint depuis son téléphone, où qu’il soit.',
    },
    {
        title: 'Buzz et valide',
        text: 'Lance la manche, le plus rapide apparaît en direct. Tu valides ou refuses la réponse.',
    },
];

const FEATURES = [
    {
        Icon: FaBolt,
        title: 'Buzzer temps réel',
        text: 'Le premier joueur à buzz apparaît tout de suite pour tout le monde.',
    },
    {
        Icon: FaTrophy,
        title: 'Scores sur mesure',
        text: 'Points par bonne réponse, bonus, pénalité : tu règles la compétition comme tu veux.',
    },
    {
        Icon: FaLink,
        title: 'Code, lien et QR',
        text: 'Plusieurs façons d’entrer dans le salon, sans installation.',
    },
    {
        Icon: FaUserGroup,
        title: 'Salons publics',
        text: 'Parcours les parties ouvertes ou retrouve tes salons dans l’historique.',
    },
    {
        Icon: FaSliders,
        title: 'Profil et thème',
        text: 'Avatar, couleurs et fond : chacun s’installe à sa façon.',
    },
    {
        Icon: FaWifi,
        title: 'Réseaux différents OK',
        text: 'Pas besoin du même Wi-Fi. Wi-Fi, 4G ou 5G : chacun joue dès qu’il a une connexion.',
    },
    {
        Icon: FaGlobe,
        title: 'Gratuit, dans le navigateur',
        text: 'Aucune app à installer. Ouvre le site sur téléphone, tablette ou ordinateur, et joue tout de suite.',
    },
    {
        Icon: FaQrcode,
        title: 'Idéal en soirée',
        text: 'Blind-test, quiz, culture G : un téléphone suffit pour jouer.',
    },
];

function LandingPage({ authenticated = false }) {
    const playTo = authenticated ? '/app' : '/jouer';
    const playLabel = authenticated ? 'Ouvrir l’app' : 'Jouer maintenant';
    const finalLabel = authenticated ? 'Retourner jouer' : 'Créer mon profil';
    const finalLead = authenticated
        ? 'Ton profil est prêt. Rejoins un salon ou crée-en un nouveau.'
        : 'Pas de compte à créer : choisis un pseudo, un avatar, et c’est parti.';

    const scrollToMore = (event) => {
        event.preventDefault();
        document.getElementById('en-savoir-plus')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    return (
        <div className="landing">
            <header className="landing-hero">
                <div className="landing-hero__content">
                    <img
                        className="landing-hero__logo"
                        src="/buzzer-app-logo-transparent.webp"
                        alt="Buzzer App"
                        width={220}
                        height={220}
                    />
                    <h1 className="landing-hero__title">Le buzzer de tes soirées jeux</h1>
                    <p className="landing-hero__lead">
                        Anime un blind-test ou un quiz en live : crée un salon, invite tes amis, et vois qui appuie en premier.
                    </p>
                    <div className="landing-hero__actions">
                        <Link to={playTo} className="btn-push btn-push-green landing-hero__cta">
                            {playLabel}
                        </Link>
                        <a
                            href="#en-savoir-plus"
                            className="btn-push btn-push-gray landing-hero__cta"
                            onClick={scrollToMore}
                        >
                            En savoir plus
                        </a>
                    </div>
                </div>
            </header>

            <main className="landing-main">
                <section
                    id="en-savoir-plus"
                    className="landing-section"
                    aria-labelledby="landing-how-title"
                >
                    <h2 id="landing-how-title" className="landing-section__title">Comment ça marche</h2>
                    <p className="landing-section__lead">Trois gestes, et la partie est lancée.</p>
                    <ol className="landing-steps">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="landing-steps__item">
                                <span className="landing-steps__index" aria-hidden="true">{index + 1}</span>
                                <div>
                                    <h3 className="landing-steps__title">{step.title}</h3>
                                    <p className="landing-steps__text">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section
                    id="fonctionnalites"
                    className="landing-section landing-section--features"
                    aria-labelledby="landing-features-title"
                >
                    <h2 id="landing-features-title" className="landing-section__title">Tout ce que tu peux faire</h2>
                    <p className="landing-section__lead">
                        Pensé pour les soirées entre amis, les animateurs et les parties improvisées.
                    </p>
                    <ul className="landing-features">
                        {FEATURES.map(({ Icon, title, text }) => (
                            <li key={title} className="landing-features__item">
                                <span className="landing-features__icon-wrap" aria-hidden="true">
                                    <Icon className="landing-features__icon" />
                                </span>
                                <div>
                                    <h3 className="landing-features__title">{title}</h3>
                                    <p className="landing-features__text">{text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="landing-section landing-section--cta" aria-labelledby="landing-cta-title">
                    <h2 id="landing-cta-title" className="landing-section__title">Prêt à buzz ?</h2>
                    <p className="landing-section__lead">{finalLead}</p>
                    <Link to={playTo} className="btn-push btn-push-green landing-hero__cta">
                        {finalLabel}
                    </Link>
                </section>
            </main>

            <footer className="landing-footer">
                <p className="landing-footer__credit">
                    Réalisé avec ❤️ par{' '}
                    <a href="https://mondon.pro/projet/buzzer-app" target="_blank" rel="noreferrer">
                        Arthur Mondon
                    </a>
                </p>
                <div className="landing-footer__links">
                    <a
                        className="landing-footer__link"
                        href="https://github.com/arthur-mdn/buzzer-app"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaGithub aria-hidden="true" />
                        GitHub
                    </a>
                    <a
                        className="landing-footer__link"
                        href="https://www.paypal.com/paypalme/arthurmondon"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <FaPaypal aria-hidden="true" />
                        PayPal
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
