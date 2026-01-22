const supabase = require('../config/supabase');

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // No token, proceed as guest (req.user remains undefined)
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = user;
    }
    
    // Proceed whether token was valid or not
    next();
  } catch (error) {
    // If error, just proceed as guest
    next();
  }
};

module.exports = optionalAuth;
