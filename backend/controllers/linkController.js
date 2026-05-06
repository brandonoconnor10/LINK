const Link = require('../models/Link');

// Save a new link
exports.saveLink = async (req, res) => {
  try {
    const link = new Link({ url: req.body.url });
    await link.save();
    res.json(link);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Get all links
exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find();
    res.json(links);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
