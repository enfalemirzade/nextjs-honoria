"use client";

import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import { authSchema } from "@/schema/schemas";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/')
  }, [session, router])

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: yupResolver(authSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { username: string; password: string }) => {
    setAuthError(null)
    setSuccess(null)

    const userData = {
      name: data.username,
      password: data.password
    }

    try {
      const res = await axios.post('/api/signup', userData)

      if (res.status === 200) {
        setSuccess('The member has been successfully signed up.')
        setTimeout(() => { router.push('/login') }, 1000)
      }
    } catch (error: unknown) {
      console.error(error)
      setAuthError('Something went wrong.')
    }
  }

  return (
    <form className="flex flex-col gap-8 p-10 rounded-box bg-base-300" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        <input type="text" placeholder="Username" className="input input-bordered text-sm" {...register('username')}/>
        <input type="password" placeholder="Password" autoComplete="current-password" className="input input-bordered text-sm" {...register('password')}/>
      </div>
      <div className="flex flex-col gap-6">
        <button className="btn rounded-btn flex justify-center py-3 bg-blue-700 hover:bg-blue-800 text-[#ebebeb]" disabled={isSubmitting}>{isSubmitting ? <span className="loading loading-spinner"></span> : "Sign up"}</button>
        <div className="flex gap-1 text-xs text-[#c3c3c3]">
          <div className="cursor-default">If you already have an account</div>
          <div className="cursor-pointer underline hover:text-[#ebebeb]" onClick={() => router.push('/login')}>Log in</div>
        </div>
      </div>
      {authError && <span className="text-red-500 text-xs text-left">{ authError }</span> ||
      success && <span className="text-green-500 text-xs text-left">{ success }</span>}
    </form>
  )
}
