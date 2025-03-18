const express = require('express');
const router = express.Router();
const teamController = require('../controllers/Team');
const { authMiddleware } = require('../middlewares/Admin');
const { teamValidator, addMemberValidator } = require('../middlewares/validators');

// Create Team (protected route)
router.post('/create', authMiddleware(["user"]), teamValidator, teamController.createTeam);

// Add Member (protected route)
router.post('/add-member', authMiddleware(["user"]), addMemberValidator, teamController.addTeamMember);

// Get All Teams (admin route)
router.get('/getTeam', authMiddleware(["admin"]), teamController.getAllTeams);

module.exports = router;
