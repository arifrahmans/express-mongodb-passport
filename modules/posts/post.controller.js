import Post from './post.model';
import HTTPStatus from 'http-status';
import User from '../users/user.model';

export async function createPost(req, res) {
  try {
    const post = await Post.createPost(req.body, req.user._id);
    
    return res.status(HTTPStatus.CREATED).json(post);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

export async function getPostById(req, res) {
  try {
    const promise = await Promise.all([
        User.findById(req.user._id),
        Post.findById(req.params.id).populate('user')
      ]);
  
      const favorite = promise[0]._favorites.isPostIsFavorite(req.params.id);
      const post = promise[1];
  
      if(post){
        return res.status(HTTPStatus.OK).json({
        
          ...post.toJSON(),
          favorite
        });
      } else {
        return res.status(HTTPStatus.NOT_FOUND).send();
      }
      
  } catch (e) {
    console.log(e);
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

export async function getPostsList(req, res) {
  const limit = parseInt(req.query.limit, 0);
  const skip = parseInt(req.query.skip, 0);

  try {
      
    const promise = await Promise.all([
        User.findById(req.user._id),
        Post.list({ limit, skip })
      ]);
  
      const posts = promise[1].reduce((arr, post) => {
        const favorite = promise[0]._favorites.isPostIsFavorite(post._id);
  
        arr.push({
          ...post.toJSON(),
          favorite
        });
  
        return arr;
      }, []);
  
      return res.status(HTTPStatus.OK).json(posts);
  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
    if (!post.user.equals(req.user._id)) {
      return res.sendStatus(HTTPStatus.UNAUTHORIZED);
    }

    if (req.body){
      Object.keys(req.body).forEach(key => {
        post[key] = req.body[key];
    });

    return res.status(HTTPStatus.OK).json(await post.save());
    } else {
      return res.status(HTTPStatus.BAD_REQUEST).send();
    }
    

  } catch (e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e);
  }
}

export async function deletePost(req,res){
    try {
        const post = await Post.findById(req.params.id).populate('user');
        if (post){
          if (!post.user.equals(req.user._id)) {
            return res.sendStatus(HTTPStatus.UNAUTHORIZED);
          }

          await post.remove();

          return res.sendStatus(HTTPStatus.OK);
        } else {
          return res.sendStatus(HTTPStatus.NOT_FOUND);
        }
        
      } catch (e) {
        return res.status(HTTPStatus.BAD_REQUEST).json(e);
      }
}

export async function favoritePost(req,res){
    try {
        const user = await User.findById(req.user._id);
        console.log('user', user);
        
        await user._favorites.posts(req.params.id);
        return res.sendStatus(HTTPStatus.OK);
      } catch (e) {
        return res.status(HTTPStatus.BAD_REQUEST).json(e);
      }
}