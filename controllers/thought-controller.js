const { trusted } = require('mongoose');
const { User, Thought } = require('../models');

const ThoughtController = {
  getAllThoughts: (req, res) => {
    Thought.find()
      .select('-__v')
      .then(data => res.json(data))
      .catch(err => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  getThoughtById: ({ params }, res) => {
    Thought.findOne({ _id: params.thoughtId })
      .select('-__v')
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

  createThought: ({ body }, res) => {
    let id;
    Thought.create(body)
      .then(data => {
        id = data._id;
        return User.findOneAndUpdate(
          {
            username: data.username,
          },
          {
            $push: { thoughts: [data._id] },
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
        if (!userData) {
          await Thought.findOneAndDelete({ _id: id });
          return res.json({ message: 'failed to add' });
        }
        const data = userData.thoughts.find(item => item._id.toString() === id.toString());
        res.json({ message: 'add successfully', data: data });
      })
      .catch(err => res.status(400).json(err));
  },

  updateThought: ({ params, body }, res) => {
    Thought.findByIdAndUpdate({ _id: params.thoughtId }, body, { new: true, runValidators: true })
      .select('thoughtText username')
      .lean()
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json(data);
      })
      .catch(err => res.status(400).json(err));
  },

  deleteThought: ({ params }, res) => {
    Thought.findOneAndDelete({ _id: params.thoughtId })
      .select('-__v')
      .then(data => {
        if (!data) {
          res.status(404).json({ message: 'No thought found with this id!' });
          return;
        }
        res.json({ message: 'deleted successfully', data: data });
      })
      .catch(err => res.status(400).json(err));
  },

  addReaction: ({ params, body }, res) => {
    Thought.findOneAndUpdate({ _id: params.thoughtId }, { $push: { reactions: body } }, { new: trusted })
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
    Thought.findOneAndUpdate({ _id: params.thoughtId }, { $pull: { reactions: { reactionId: params.reactionId } } })
      .select('-__v -reactions._id')
      .then(data => {
        // const data=
        res.json({ message: 'deleted successfully' });
      })
      .catch(err => res.json(err));
  },
};

module.exports = ThoughtController;
