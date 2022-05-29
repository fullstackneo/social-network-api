const router = require('express').Router();

const getAll = (req, res) => {
  res.json(1);
};

const createUser = (req, res) => {
  res.json(2);
};

const getUserById = (req, res) => {};
const updateUser = (req, res) => {};
const deleteUser = (req, res) => {};

const addFriend = (req, res) => {};

const removeFriend = (req, res) => {};



router.route('/').get(getAll).post(createUser);

router.route('/:userId').get(getUserById).put(updateUser).delete(deleteUser);

router.route('/:userId/friends/:friendId').post(addFriend).delete(removeFriend);

module.exports = router;
