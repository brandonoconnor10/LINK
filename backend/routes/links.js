const express = require('express');
const router = express.Router();
const { saveLink, getLinks } = require('../controllers/linkController');

router.post('/', saveLink);
router.get('/', getLinks);

module.exports = router;
