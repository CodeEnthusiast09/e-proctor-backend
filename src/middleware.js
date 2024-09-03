// function isAuthenticated(req, res, next) {
//   if (!req.session.userId) {
//     return res.status(401).send("Unauthorized");
//   }
//   next();
// }
// module.exports = isAuthenticated;

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

module.exports = isAuthenticated;
