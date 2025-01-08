"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { signIn, useSession } from "next-auth/react";
import { authSchema } from "@/schema/schemas";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const [authError, setAuthError] = useState<string | null>(null)
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

    const userData = {
      name: data.username,
      password: data.password
    }

    const res = await signIn('credentials', {
      ...userData,
      redirect: false,
    })

    if (res?.error) {
      setAuthError('Login failed. Please check your credentials.')
    }
  }

  return (
    <form className="flex flex-col gap-8 p-10 rounded-box bg-base-300" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3">
        <input type="text" placeholder="Username" className="input input-bordered text-sm" {...register('username')}/>
        <input type="password" placeholder="Password" autoComplete="current-password" className="input input-bordered text-sm" {...register('password')}/>
      </div>
      <div className="flex flex-col gap-6">
        <button className="btn rounded-btn flex justify-center py-3 text-[#ebebeb] bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>{isSubmitting ? <span className="loading loading-spinner"></span> : "Log in"}</button>
        <div className="flex text-xs gap-1 text-[#c3c3c3]">
          <div className="cursor-default">If you dont have an account</div>
          <div className="cursor-pointer underline hover:text-[#ebebeb]" onClick={() => router.push('/signup')}>Sign up</div>
        </div>
      </div>
      {authError && <span className="text-xs text-left text-red-500">{ authError }</span>}
    </form>
  )
}
