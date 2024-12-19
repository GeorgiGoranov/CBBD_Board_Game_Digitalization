const API_URL = process.env.REACT_APP_BACKEND_URL;

export const isAuthenticated = async () => {
    try {
        const response = await fetch(`${API_URL}/api/routes/isAuth`,{
          method: 'GET',
          credentials: 'include', // Send cookies along with the request
        });
        const data = await response.json();
        return { isAuthenticated: response.ok && data.authenticated, user: data.user };
    } catch (error) {
        console.error("Error checking authentication:", error);
        return { isAuthenticated: false, user: null };
    }
  }