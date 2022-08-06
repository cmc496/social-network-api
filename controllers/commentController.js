const res = require('express/lib/response');
const { User, Comment } = require('../models');

const commentController = {
    getAllComments(req, res) {
        Comment.find({})
            .populate({
                path: 'reactions',
                select: '-_v'
            })
            .select('-_v')
            .sort({ _id: -1 })
            .then(dbCommentData => res.json(dbCommentData))
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },

    getCommentById({ params }, res) {
        Comment.findOne({ _id: params.id })
            .populate({
                path: 'reactions',
                select: '-_v'
            })
            .select('-_v')
            .sort({ _id: -1 })
            .then(dbCommentData => {
                if (!dbCommentData) {
                    res.status(404).json({ message: 'No comments found with this id' });
                    return;
                }
                res.json(dbCommentData);
            })
            .catch(err => {
                console.log(err);
                res.sendStatus(400);
            });
    },

    createComment({ body }, res) {
        Comment.create(body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    { $push: { comments: _id } },
                    { new: true}
                );
            })
            .then(dbCommentData => {
                if (!dbCommentData) {
                    res.status(404).json({ message: 'No user found with that id' });
                    return;
                }
                res.json(dbCommentData);
            })
            .catch(err => res.json(err));
    },

    updateComment({ params, body }, res) {
        Comment.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbCommentData => {
                if (!dbCommentData) {
                    res.status(404).json({ message: 'No comments found with that id' });
                    return;
                }
                res.json(dbCommentData);
            })
            .catch(err => res.json(err));
    },

    removeComment({ params }, res) {
        Comment.findOneAndRemove({ _id: params.id })
            .then(dbCommentData => {
                if (!dbCommentData) {
                    res.status(404).json({ message: 'No comment found with that id' });
                    return;
                }
                return User.findOneAndUpdate(
                    { _id: params.userId },
                    { $pull: { thoughts: params.id } },
                    { new: true }
                )
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user found with that id' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },

    createDiscussion({ params, body }, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId },
            { $push: { reactions: body } },
            { new: true, runValidators: true }
        )
        .populate({ path: 'reactions', select: '-_v' })
        .select('-_v')
        .then(dbCommentData => {
            if (!dbCommentData) {
                res.status(404).json({ message: 'No thought with that id' });
                return;
            }
            res.json(dbCommentData);
        })
        .catch(err => res.status(400).json(err));
    },

    removeDiscussion({ params }, res) {
        Comment.findOneAndUpdate(
            { _id: params.commentId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
        )
        .then(dbCommentData => {
            if (!dbCommentData) {
                res.status(404).json({ message: 'Not able to remove' });
                return;
            }
            res.json(dbCommentData);
        })
        .catch(err => res.json(err));
    }
};

module.exports = commentController;