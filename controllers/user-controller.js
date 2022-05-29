const { User } = require('../models');

const UserController = {
  getAllUsers: (req, res) => {
    User.find()
      .select('-__v')
      .then(data => res.json(data))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  getUserById: ({ params }, res) => {
    User.findOne({ _id: params.userId })
      .select('-__v')
      .then(data => {
        if (!data) {
          return res.status(400).json({ message: 'No user found with this id!' });
        }
        res.json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  createUser: ({ body }, res) => {
    User.create(body)
      .then(data => res.json(data))
      .catch(err => res.status(400).json(err));
  },

  updateUser: ({ params, body }, res) => {
    User.findByIdAndUpdate({ _id: params.userId }, body, { new: true, runValidators: true })
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(data);
      })
      .catch(err => res.status(400).json(err));
  },

  deleteUser: ({ params }, res) => {
    User.findOneAndDelete({ _id: params.userId })
      .select('-__v')
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(data);
      })
      .catch(err => res.status(400).json(err));
  },

  addFriend: ({ params }, res) => {
    User.findOneAndUpdate(
      { _id: params.userId },
      {
        $addToSet: {
          friends: params.friendId,
        },
      },
      { new: true, runValidators: true }
    )
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(data);
      })
      .catch(err => res.json(err));
  },

  removeFriend: ({ params }, res) => {
    User.findOneAndUpdate(
      { _id: params.userId },
      {
        $pull: {
          friends: params.friendId,
        },
      },
      { new: true, runValidators: true }
    )
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        res.json(data);
      })
      .catch(err => res.json(err));
  },
};

module.exports = UserController;
