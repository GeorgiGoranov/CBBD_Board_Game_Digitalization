import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../SCSS/footer.scss';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const [showPopup, setShowPopup] = useState(false);
    const { language } = useLanguage(); // Access selected language


    const openInformationTab = () => {
        setShowPopup(true);
    };

    const closeInformationTab = () => {
        setShowPopup(false);
    };

    const boxTranslation = {
        en: {
            title: "Data Collection Information / Privacy Policy",
            content: (
                <>
                    We use cookies and similar technologies to
                    enhance your experience on our website.
                    As part of our data collection process,
                    we may gather and store certain information,
                    including your <span>nationality</span> and <span>e-mail address</span>,
                    to ensure compliance with applicable regulations.
                    By continuing to use our site, you consent to the collection,
                    storage, and use of your information as outlined in our Privacy Policy.
                </>
            ),
            button: "Got It",
        },
        nl: {
            title: "Informatie over gegevensverzameling / Privacybeleid",
            content: (
                <>

                    We gebruiken cookies en vergelijkbare technologieën om uw
                    ervaring op onze website te verbeteren. Als onderdeel van ons
                    gegevensverzamelingsproces kunnen we bepaalde informatie
                    verzamelen en opslaan, waaronder uw <span>nationaliteit</span> en <span>e-mailadres</span>,
                    om te voldoen aan de toepasselijke regelgeving.
                    Door onze site te blijven gebruiken, stemt u in met het verzamelen,
                    opslaan en gebruiken van uw informatie zoals uiteengezet in ons privacybeleid.
                </>
            ),
            button: "Begrepen",
        },
        de: {
            title: "Informationen zur Datenerfassung / Datenschutzrichtlinie",
            content:
                (
                    <>
                        `Wir verwenden Cookies und ähnliche Technologien, um Ihre Erfahrung
                        auf unserer Website zu verbessern. Im Rahmen unseres
                        Datenerfassungsprozesses können wir bestimmte Informationen sammeln
                        und speichern, darunter Ihre <span>Nationalität</span> und Ihre <span>E-Mail-Adresse</span>,
                        um die Einhaltung der geltenden Vorschriften zu gewährleisten.
                        Durch die weitere Nutzung unserer Website stimmen Sie der Erfassung,
                        Speicherung und Nutzung Ihrer Informationen gemäß unserer Datenschutzrichtlinie zu.
                    </>
                    ),
            button: "Verstanden",
        },
    };

    const translation = boxTranslation[language] || boxTranslation.en;
    return (
        <footer>
            <i onClick={openInformationTab} className="bi bi-info-square"></i>

            {/* Popup */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className="popup-overlay-footer"
                        initial={{ opacity: 0, x: -200 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -200 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.div className="popup-content-footer">
                            <h3>{translation.title}</h3>
                            <p>{translation.content}</p>
                            <button className='gotIt' onClick={closeInformationTab}>{translation.button}</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
