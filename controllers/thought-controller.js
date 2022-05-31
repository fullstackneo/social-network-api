const { trusted } = require('mongoose');
const { User, Thought } = require('../models');

const ThoughtController = {
  // get all thoughts
  getAllThoughts: (req, res) => {
    Thought.find()
      .select('-__v -reactions._id')
      .then(data => res.json(data))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  getThoughtById: ({ params }, res) => {
    // get a single thought by id
    Thought.findOne({ _id: params.thoughtId })
      .select('-__v -reactions._id')
      .then(data => {
        if (!data) {
          return res.status(400).json({ message: 'No thought found with this id!' });
        }
        res.json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  createThought: async ({ body }, res) => {
    const doc = await User.findOne({ username: body.username });
    if (!doc) {
      // if username does not exist, return message
      return res.status(404).json({ message: 'failed to add, maybe username does not exist?' });
    }
    // if username exists, create a thought
    Thought.create(body)
      .then(data => {
        id = data._id;
        // add thought to user collection
        return User.findOneAndUpdate(
          {
            username: data.username,
          },
          {
            $push: { thoughts: data._id },
          },
          { new: true }
        )
          .populate({
            path: 'thoughts',
            select: 'username thoughtText',
          })
          .lean();
      })
      .then(async userData => {
        // return added thought
        const data = userData.thoughts.find(item => item._id.toString() === id.toString());
        res.json({ message: 'add successfully', added: data });
      })
      .catch(err => res.status(400).json(err));
  },

  // update a thought
  updateThought: async ({ params, body }, res) => {
    // check if the new username exists
    const doc = await User.findOne({ username: body.username });
    if (!doc) {
      // username not exist, return message
      return res.status(404).json({ message: 'this user does not exist' });
    }

    // update the thought
    Thought.findByIdAndUpdate({ _id: params.thoughtId }, body, { runValidators: true })
      .then(async data => {
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        // delete thought from old user
        await User.findOneAndUpdate({ username: data.username }, { $pull: { thoughts: data._id } });

        // add thoughts to a new user
        await User.findOneAndUpdate({ username: body.username }, { $addToSet: { thoughts: data._id } });

        return Thought.findById(params.thoughtId);
      })
      .then(data => res.json(data))
      .catch(err => res.status(400).json(err));
  },

  deleteThought: ({ params }, res) => {
    // delete thought
    Thought.findOneAndDelete({ _id: params.thoughtId })
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        // delete thought from associated user
        return User.findOneAndUpdate(
          { username: data.username },
          {
            $pull: { thoughts: data._id },
          },
          { new: true }
        )
          .select('username thoughts')
          .lean();
      })
      .then(data => res.json({ message: 'delete sucessfully', updated: data }))
      .catch(err => res.status(400).json(err));
  },

  addReaction: ({ params, body }, res) => {
    // add reaction to associated thought
    Thought.findOneAndUpdate({ _id: params.thoughtId }, { $push: { reactions: body } }, { new: true })
      .select('-__v -reactions._id -username')
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json({ message: 'add successfully' });
      })
      .catch(err => res.json(err));
  },

  removeReaction: ({ params }, res) => {
    // remove reaction from associated thought
    Thought.findOneAndUpdate({ _id: params.thoughtId }, { $pull: { reactions: { reactionId: params.reactionId } } })
      .select('-reactions._id')
      .then(data => {
        // check if the thought id exist
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        // check if the reactionid exists
        const reactionIdArr = data.reactions.map(item => item.reactionId.toString());
        if (!reactionIdArr.includes(params.reactionId)) {
          res.status(404).json({ message: 'No reaction found with this id' });
          return;
        }
        //  return the deleted reaciton
        const reactionData = data.reactions.find(item => item.reactionId.toString() === params.reactionId.toString());
        res.json({ message: 'deleted successfully', data: reactionData });
      })
      .catch(err => res.json(err));
  },
};

module.exports = ThoughtController;
