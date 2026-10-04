const express = require('express');
const { generateToken, verifyToken } = require('../others/jwtUtils');
const { generateUserId, authenticateToken } = require('../others/utils');
const GameServer = require('../models/GameServer');
const User = require('../models/User');
const router = express.Router();
const config = require('../others/config');
const { USER_PUBLIC_FIELDS, USER_PROFILE_PROJECTION } = require('../others/userPublicFields');
const { isAdminRegistration, normalizeUserName } = require('../others/sanitizeOptions');

const MIN_USERNAME_LENGTH = 1;
const MAX_USERNAME_LENGTH = 32;

router.post('/registerUser', async (req, res) => {
    const { userName, userPassword, userPictureSmiley, userPictureColor } = req.body;
    try {
        const normalizedName = normalizeUserName(userName, {
            min: MIN_USERNAME_LENGTH,
            max: MAX_USERNAME_LENGTH
        });
        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
            });
        }

        const userId = generateUserId();
        const isAdmin = isAdminRegistration(userPassword, config.adminPassword);

        const user = new User({
            userId,
            userName: normalizedName,
            userRole: isAdmin ? 'admin' : 'user',
            userPicture: { smiley: userPictureSmiley, color: userPictureColor }
        });
        await user.save();

        const token = generateToken({ userId });
        res.json({ success: true, token, userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/authenticate', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided." });
    try {
        const data = verifyToken(token);
        const user = await User.findOne({ userId: data.userId }).select(USER_PUBLIC_FIELDS + ' userTheme');
        if (user) {
            res.json({
                success: true,
                userId: data.userId,
                userRole: user.userRole,
                userName: user.userName,
                userPicture: user.userPicture,
                userTheme: user.userTheme
            });
        } else {
            res.status(403).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (err) {
        res.status(403).json({ success: false, message: "Token invalide." });
    }
});

router.use(authenticateToken);

router.post('/setUserName', async (req, res) => {
    try {
        const normalizedName = normalizeUserName(req.body.userName, {
            min: MIN_USERNAME_LENGTH,
            max: MAX_USERNAME_LENGTH
        });
        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
            });
        }

        const user = await User.findOneAndUpdate(
            { userId: req.userId },
            { $set: { userName: normalizedName } },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "Username updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/user-servers', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.userId });
        if (user) {
            const servers = await GameServer.find({
                'players.user': user._id,
                status: { $ne: 'del' }
            })
                .sort({ updatedAt: -1, _id: -1 })
                .populate({ path: 'players.user', select: USER_PUBLIC_FIELDS });
            res.json(servers);
        } else {
            res.status(403).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/public-servers', async (req, res) => {
    try {
        const publicServers = await GameServer.find({
            'options.isPublic': true,
            status: { $ne: 'del' }
        })
            .sort({ updatedAt: -1, _id: -1 })
            .populate({ path: 'players.user', select: USER_PUBLIC_FIELDS });

        res.json(publicServers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/admin-servers', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.userId });
        if (user) {
            if (user.userRole === "admin") {
                const servers = await GameServer.find({
                    status: { $ne: 'del' }
                })
                    .sort({ updatedAt: -1, _id: -1 })
                    .populate({ path: 'players.user', select: USER_PUBLIC_FIELDS });
                res.json(servers);
            } else {
                res.status(403).json({ success: false, message: "Rôle administrateur requis." });
            }
        } else {
            res.status(403).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/user-profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userId }).select(USER_PROFILE_PROJECTION);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
