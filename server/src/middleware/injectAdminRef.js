const injectAdminRef = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    if (req.user.role === 'super_admin') return next();
    req.body.adminRef = req.user.role === 'admin' ? req.user._id : req.user.adminRef;
  }
  next();
};

export default injectAdminRef;
