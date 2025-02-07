import { motion, AnimatePresence } from 'framer-motion';
import '../SCSS/confirmationPopup.scss';

const ConfirmationPopup = ({ message, onConfirm, onCancel }) => (
    <AnimatePresence>
        <motion.div
            className="popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
        >
            <motion.div
                className="popup-content"
                initial={{ y: "-50%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-50%", opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h3>Confirmation</h3>
                <p>{message}</p>
                <div className="popup-buttons">
                    <button className="confirm-btn" onClick={onConfirm}>Yes</button>
                    <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                </div>
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

export default ConfirmationPopup;
