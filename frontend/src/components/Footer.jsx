import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../SCSS/footer.scss';

const Footer = () => {
    const [showPopup, setShowPopup] = useState(false);

    const openInformationTab = () => {
        setShowPopup(true);
    };

    const closeInformationTab = () => {
        setShowPopup(false);
    };

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
                            <h3>Data Collection Information / Privacy Policy</h3>
                            <p>
                                We use cookies and similar technologies to
                                enhance your experience on our website.
                                As part of our data collection process,
                                we may gather and store certain information,
                                including your <span>nationality</span> and <span>email address</span>,
                                to ensure compliance with applicable regulations.
                                By continuing to use our site, you consent to the collection,
                                storage, and use of your information as outlined in our Privacy Policy.
                            </p>
                            <button className='gotIt' onClick={closeInformationTab}>Got It</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </footer>
    );
};

export default Footer;
