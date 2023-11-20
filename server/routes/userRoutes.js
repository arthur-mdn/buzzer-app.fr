// userRoutes.js
const express = require('express');
const { generateToken, verifyToken } = require('../others/jwtUtils');
const { generateUserId, authenticateToken } = require('../others/utils');
const GameServer = require('../models/GameServer');
const User = require('../models/User');
const router = express.Router();
const config = require('../others/config');

router.post('/registerUser', async (req, res) => {
    const { userName, userPassword, userPictureSmiley , userPictureColor } = req.body;
    try {
        const userId = generateUserId();  // Utilisez votre fonction de génération d'userId ici
        console.log(userPassword)
        console.log(config.adminPassword)
        if(userPassword === config.adminPassword){
            const user = new User({ userId, userName, userRole: "admin", userPicture: {smiley: userPictureSmiley, color: userPictureColor} });
            await user.save();
        }else{
            const user = new User({ userId, userName , userPicture: {smiley: userPictureSmiley, color: userPictureColor} });
            await user.save();
        }

        const token = generateToken({ userId: userId });  // Générez un JWT pour cet utilisateur
        res.json({ success: true, token, userId });
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get('/authenticate', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided." });
    try {
        const data = verifyToken(token);
        const user = await User.findOne({ userId: data.userId });
        if (user) {
            res.json({ success: true, userId: data.userId, userRole: user.userRole, userName:user.userName, userPicture: user.userPicture });
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
        const { userId, userName } = req.body;

        // Essayez de trouver l'utilisateur et de mettre à jour son nom. S'il n'existe pas, créez-en un nouveau.
        const user = await User.findOneAndUpdate(
            { userId: userId },  // Critères de recherche
            { $set: { userName: userName } },  // Mise à jour
            { upsert: true, new: true, setDefaultsOnInsert: true }  // Options
        );

        if (!user) {
            return res.status(500).json({ success: false, message: "Failed to update or create user" });
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
            const servers = await GameServer.find({ 'players.user': user._id }).populate('players.user');
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
        // Recherchez tous les serveurs publics
        const publicServers = await GameServer.find({ 'options.isPublic': true });

        res.json(publicServers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


router.get('/user-profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findOne({ userId: userId });
        if (user) {
            res.json({ success: true,user:user});
        } else {
            res.status(403).json({ success: false, message: "Utilisateur introuvable." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
