const manager = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' )) {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied. Manager privileges required.' });
    }
}

module.exports = manager;


