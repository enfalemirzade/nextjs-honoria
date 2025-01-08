"use client";

import axios from "axios";
import { useDialogsStore } from "@/store/dialogsStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState, useRef } from "react";
import { addFriendSchema } from "@/schema/schemas";
import { useForm } from "react-hook-form";

export default function AddFriendDialog() {
  const [error, setError] = useState<string | null>(null)
  const { dialogs, closeDialog } = useDialogsStore()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (dialogs.addFriendDialog && dialogRef.current) dialogRef.current?.showModal()
  }, [dialogs.addFriendDialog])

  const handleCloseDialog = () => {
    setError(null)
    reset()
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("addFriendDialog") }, 100)
  }

  const {
    register,
    handleSubmit,
    formState: { isSubmitting }, reset,
  } = useForm({
    resolver: yupResolver(addFriendSchema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: { username: string }) => {
    setError(null)

    const postData = {
      name: data.username,
      type: "FRIEND_REQUEST"
    }

    try {
      const res = await axios.post("/api/user/notices/request/friend", postData)

      if (res.status === 200) {
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    }
  }

  if (!dialogs.addFriendDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 bg-base-200 border-blue-500 text-[#ebebeb]">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">Add Friend</div>
        <form className="flex flex-col gap-8 p-2 pt-10" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <input className="input input-bordered text-sm h-11" type="text" placeholder="Username" {...register('username')}/>
          <div className="flex justify-between items-center">
            {error ? <span className="text-xs text-red-500">{error}</span> : <span></span>}
            <button disabled={isSubmitting} className="btn min-h-11 h-11 px-6 bg-blue-700 hover:bg-blue-800 text-[#ebebeb]">
              Send
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}
