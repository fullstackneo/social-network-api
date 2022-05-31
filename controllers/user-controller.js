const { User, Thought } = require('../models');

const UserController = {
  getAllUsers: (req, res) => {
    // get all users
    User.find()
      .populate({ path: 'thoughts', select: '-username -reactions._id -__v' })
      .select('-__v')
      .then(data => {
        res.json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  getUserById: ({ params }, res) => {
    // get a single user by id
    User.findById(params.userId)
      .populate({ path: 'thoughts', select: '-username -reactions._id -__v' })
      .select('-__v -thoughts.reactions._id')
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
    // create a new user
    User.create(body)
      .then(data => res.json(data))
      .catch(err => res.status(400).json(err));
  },

  updateUser: ({ params, body }, res) => {
    // update a user
    User.findByIdAndUpdate({ _id: params.userId }, body, { runValidators: true })
      .then(async data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        // update associated thoughts
        await Thought.updateMany({ username: data.username }, { username: body.username });
        // return updated user with its associated thoughts
        return User.findById(params.userId).populate('thoughts');
      })
      .then(data => res.json({ message: 'update successfully', data: data }))
      .catch(err => res.status(400).json(err));
  },

  deleteUser: ({ params }, res) => {
    // delete a user
    User.findOneAndDelete({ _id: params.userId })
      .select('-__v')
      .then(async data => {
        if (!data) {
          res.status(404).json({ message: 'No user found with this id!' });
          return;
        }
        // deleted associated thoughts
        await Thought.deleteMany({ _id: { $in: data.thoughts } });
        res.json({ message: 'delete successfully', data });
      })
      .catch(err => res.status(400).json(err));
  },

  addFriend: ({ params }, res) => {
    // exclude adding user himself as friend
    if (params.userId === params.friendId) {
      res.status(404).json({ message: 'cannot add self as friend' });
      return;
    }
    // add a friend
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
    // remove a friend
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
