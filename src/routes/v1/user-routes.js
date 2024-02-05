const { UserController } = require('../../controllers')
const express = require('express')
const { validateRequestMiddleware, authMiddleware } = require('../../middlewares')
const router = express.Router();
const multer = require("multer");
const path = require('path');

const upload = multer({
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    }
});
// signup conditions -> user verified, user not registered already, api contains required fields
router.post(
    '/signup',
    upload.single('uploaded_id'),
    authMiddleware.checkVerifiedLawyer,
    validateRequestMiddleware.validateLawyerRegisterRequest,
    UserController.registerUser
);

router.post('/verify', validateRequestMiddleware.validateLawyerVerifyRequest, UserController.verify);
router.post('/login', validateRequestMiddleware.validateLoginRequest, UserController.signin);
router.get('/auth/me', authMiddleware.checkUserAuth, UserController.authMe);

module.exports = router;