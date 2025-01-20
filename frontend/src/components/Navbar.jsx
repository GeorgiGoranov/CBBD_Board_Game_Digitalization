import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { useLanguage } from '../context/LanguageContext';

const NavBar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false);
  const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (value) => {
    setLanguage(value);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;  // Prevent multiple logouts
    setIsLoggingOut(true);      // Disable the button

    try {
      const response = await fetch(`${apiUrl}/api/routes/logout`, {
        method: 'GET',
        credentials: 'include',  // Include cookies for the request
      });

      if (response.ok) {
        console.error('Logout!!');

        await logout();  // Clear user context
        navigate('/');  // Redirect to login after logout
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);  // Re-enable the button after completion
    }
  };

  return (
    <header>
      <div className="container">
        <div className="items">
          <h1>CBBD Competency Game</h1>
          <div className="right-side-container">
            <div className="dropdown-container" onClick={toggleDropdown}>
              <div className="dropdown-header">
                <i className="bi bi-globe"></i>
                <span>{language}</span>
              </div>
              {isOpen && (
                <ul className="dropdown-menu">
                  <li onClick={() => handleSelect("de")}>German (de)</li>
                  <li onClick={() => handleSelect("nl")}>Dutch (nl)</li>
                </ul>
              )}
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                style={{
                  backgroundColor: isLoggingOut ? 'red' : '', // Apply red background when logging out
                  color: isLoggingOut ? 'white' : '',         // Change text color for contrast
                }}
              >
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
