import * as yup from "yup";

export const authSchema = yup.object().shape({
  username: yup.string().required().min(3).max(20).matches(/^[a-zA-Z0-9_]+$/),
  password: yup.string().required().min(6).max(26)
})

export const blogSchema = yup.object().shape({
  title: yup.string().required().min(1),
  content: yup.string().required().min(1),
  password: yup.string().required().min(1)
})

export const addFriendSchema = yup.object().shape({
  username: yup.string().required().min(3).max(20)
})

export const addFolderSchema = yup.object().shape({
  name: yup.string().required().min(1).max(20)
})

export const chatSchema = yup.object().shape({
  content: yup.string().required().min(1).max(256)
})

export const changeBioSchema = yup.object().shape({
  bio: yup.string().required().min(1).max(30)
})

export const addServerSchema = yup.object().shape({
  code: yup.string().required().length(5)
})

export const createServerSchema = yup.object().shape({
  name: yup.string().required().min(3).max(30),
  isPrivate: yup.boolean().required()
})
