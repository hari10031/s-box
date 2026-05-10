const scopeQuery = (req, res, next) => {
  req.storeFilter = {};
  if (req.user.role === 'super_admin') return next();
  req.storeFilter.adminRef = req.user.role === 'admin' ? req.user._id : req.user.adminRef;
  next();
};

export default scopeQuery;
