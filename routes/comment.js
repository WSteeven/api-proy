var express = require('express');
var CommentController = require('../controllers/comment');

var api = express.Router();
var md_auth = require('../middlewares/autenthicated')

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './api/uploads/comments'});

api.get('/comment/pruebas', CommentController.probando);
api.post('/comment', md_auth.ensureAuth, CommentController.saveComment);
api.get('/comment/:id', md_auth.ensureAuth, CommentController.getComment);
api.delete('/comment/:id', md_auth.ensureAuth, CommentController.deleteComment);
api.post('/upload-image-comment/:id', [md_auth.ensureAuth, md_upload], CommentController.uploadImage);
api.get('/get-image-comment/:imageFile', CommentController.getImageFile);
/*api.get('/pruebas', md_auth.ensureAuth, UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser);
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers);
api.get('/counters/:id?/', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);
*/
module.exports = api;