const apiUrl = process.env.REACT_APP_BACK_END_URL_HOST;
console.log(apiUrl)

export const isAuthenticated = async () => {
    try {
        const response = await fetch(`${apiUrl}/api/routes/isAuth`,{
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