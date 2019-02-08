import Post from './post.model';
import HTTPStatus from 'http-status';

export async function createPost(req, res){
    try {
        const post = await Post.createPost(req.body, req.user._id);
        console.log("POST nya : ", post);
        return res.status(HTTPStatus.CREATED).json(post);
    } catch (e) {
        return res.status(HTTPStatus.BAD_REQUEST).json(e);
    }
}