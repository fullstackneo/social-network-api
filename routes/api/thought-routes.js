const router = require('express').Router();

const getAllThoughts = (req, res) => {
  res.json(1);
};

const createThought = (req, res) => {
    
};
const getThoughtById = (req, res) => {};
const updateThought = (req, res) => {};

const deleteThought = (req, res) => {};
const createReaction = (req, res) => {};
const deleteReaction = (req, res) => {};

router.route('/').get(getAllThoughts).post(createThought);

router.route('/:thoughtId').get(getThoughtById).put(updateThought).delete(deleteThought);

router.route('/:thoughtId/reactions').post(createReaction);

router.route('/:thoughtId/reactions/:reactionId').delete(deleteReaction);

module.exports = router;
