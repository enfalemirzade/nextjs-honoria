"use client";

import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { blogSchema } from "@/schema/schemas";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function BlogForm() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset
  } = useForm({
    resolver: yupResolver(blogSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { title: string; content: string; password: string }) => {
    setAuthError(null)
    setSuccess(null)

    try {
      const res = await axios.post('/api/blog/add', data)

      if (res.status === 200) {
        reset()
        setSuccess('The blog has been successfully posted.')
        setTimeout(() => { setSuccess(null) }, 1000)
      }
    } catch (error: unknown) {
      console.error(error)
      setAuthError('Something went wrong.')
    }
  }

  return (
    <form className="flex flex-col gap-8 p-10 rounded-box bg-base-300" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        <input type="text" placeholder="Title" className="input input-bordered text-sm" {...register('title')}/>
        <input type="text" placeholder="Content" className="input input-bordered text-sm" {...register('content')}/>
        <input type="password" placeholder="Password" autoComplete="current-password" className="input input-bordered text-sm" {...register('password')}/>
      </div>
      <div className="flex flex-col gap-6">
        <button className="btn rounded-btn flex justify-center py-3 bg-blue-700 hover:bg-blue-800 text-[#ebebeb]" disabled={isSubmitting}>{isSubmitting ? <span className="loading loading-spinner"></span> : "Post"}</button>
      </div>
      {authError && <span className="text-red-500 text-xs text-left">{ authError }</span> ||
      success && <span className="text-green-500 text-xs text-left">{ success }</span>}
    </form>
  )
}
