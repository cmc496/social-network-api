const router = require('express').Router();

const {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    removeComment,
    createDiscussion,
    removeDiscussion
} = require('../../controllers/commentController');

router.route('/').get(getAllComments).post(createComment);
router.route('/:id').get(getCommentById).put(updateComment).delete(removeComment);
router.route('/:commentId/reactions').post(createDiscussion);
router.route('/:commentId/reactions/:reactionId').delete(removeDiscussion);

module.exports = router;