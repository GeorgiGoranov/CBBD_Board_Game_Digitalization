import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { useLanguage } from '../context/LanguageContext';

const NavBar = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {language, setLanguage} = useLanguage()

  const handleLogout = async () => {
    if (isLoggingOut) return;  // Prevent multiple logouts
    setIsLoggingOut(true);      // Disable the button

    try {
      const response = await fetch('/api/routes/logout', {
        method: 'GET',
        credentials: 'include',  // Include cookies for the request
      });

      if (response.ok) {
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
            <select
              className="input"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Select a Nationality">
              <option value="de">de</option>
              <option value="nl">nl</option>
            </select>
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
