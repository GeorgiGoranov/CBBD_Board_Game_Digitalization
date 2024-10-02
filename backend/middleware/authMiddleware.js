const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                return res.status(401).send('Unauthorized: Invalid token');
            } else {
                req.user = decodedToken; // Attach decoded JWT (user info) to the request object
                next();
            }
        });
    } else {
        return res.status(401).send('Unauthorized: No token provided'); 
    }
};

module.exports = { requireAuth };