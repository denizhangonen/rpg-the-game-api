const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const isAuth = require('../middleware/is-auth');

const charSkillController = require('../controllers/Admin/CharSkill');

router.post('/createSkill', isAuth, charSkillController.createCharSkill);

module.exports = router;

