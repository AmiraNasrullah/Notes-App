// Import Node package jsonweb token
var jwt = require('jsonwebtoken');
// Load settings
var settings = require('../../config/settings');

// generete api token with json web token
function generateToken(user) {
  return jwt.sign(user, settings.secret, {
    expiresIn: 100000 // in seconds
  });
}

 /**
 * @api {post} /api/auth/login Login 
 * @apiVersion 0.0.1
 * @apiName login
 * @apiGroup Authentication
 * @apiPermission none
 *
 * @apiDescription Login
 *
 * @apiParam {String} username Username of user account  Required.
 * @apiParam {String} password Password of user account   Required.

 * @apiSuccess {String} token         The new User-Token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "token": "JWT token"
 *     }
 *
 * @apiError UnAuthorized invalid authorization token.
 *
 * @apiErrorExample UnAuthorized Error-Response: 
 *     HTTP/1.1 403 Forbidden
 *     UnAuthorized

 */
exports.login = function(req, res, next) {
  res.json({ token: 'JWT ' + generateToken(req.user) });
}
