import mongoose from 'mongoose'
import PostMessage from '../models/postMessage.js'

export const getPosts = async (req, res) => {
  const { page } = req.query
  try {
    const limitPostsOnEachPage = 8
    const startIndex = (Number(page) - 1) * limitPostsOnEachPage //get the starting index in the array of every page
    const total = await PostMessage.countDocuments({})

    const posts = await PostMessage.find()
      .sort({ _id: -1 }) // .sort give us the newest posts first
      .limit(limitPostsOnEachPage) // .limit give us only 8 posts, the limit of every page
      .skip(startIndex) // .skip run this function from the first index of post every page

    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / limitPostsOnEachPage),
    })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getPost = async (req, res) => {
  const { id } = req.params
  try {
    const post = await PostMessage.findById(id)
    res.status(200).json(post)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query
  try {
    const title = new RegExp(searchQuery, 'i') // help to search TEST/test/Test, the capital letters do not matter
    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(',') } }],
    }) // query in the db all the posts that have this title OR/AND this tags
    res.json({ data: posts })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const createPost = async (req, res) => {
  const post = req.body
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  })
  try {
    await newPost.save()
    res.status(201).json(newPost)
  } catch (error) {
    res.status(409).json({ message: error.message })
  }
}

export const updatePost = async (req, res) => {
  const { id } = req.params
  const { title, message, creator, selectedFile, tags } = req.body
  if (!mongoose.Types.ObjectId.isValid(id)) {
    //check if the id is valid
    return res.status(404).send(`No post with that id ${id}`)
  }
  const updatedPost = {
    creator: creator,
    title: title,
    message: message,
    tags: tags,
    selectedFile: selectedFile,
    _id: id,
  }
  await PostMessage.findByIdAndUpdate(id, updatedPost, {
    new: true,
  })
  res.json(updatedPost)
}

export const deletePost = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No post with that id ${id}`)
  }
  await PostMessage.findByIdAndDelete(id)
  res.json({ message: `Post ${id} deleted successfully` })
}

export const likePost = async (req, res) => {
  const { id } = req.params
  if (!req.userId) {
    return res.json({ message: 'UNauthenticated' })
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No post with that id ${id}`)
  }
  const post = await PostMessage.findById(id)
  console.log(post.likes)
  const index = post.likes.findIndex((id) => id === String(req.userId))
  if (index === -1) {
    post.likes.push(req.userId) // like the post
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId))
  }
  console.log(post.likes)

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  })
  res.json(updatedPost)
}

export const commentPost = async (req, res) => {
  const { id } = req.params
  const { value } = req.body
  const post = await PostMessage.findById(id)
  post.comments.push(value)
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  })
  res.json(updatedPost)
}
