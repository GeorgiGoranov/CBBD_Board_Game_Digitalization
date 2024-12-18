export const isAuthenticated = async () => {
    try {
        const response = await fetch('https://cbbd-board-game-digitalization.onrender.com/api/routes/isAuth',{
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