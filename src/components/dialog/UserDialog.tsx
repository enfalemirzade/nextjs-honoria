"use client";

import axios from "axios";
import useSWR from "swr";
import { useDialogsStore } from "@/store/dialogsStore";
import { useEffect, useState, useRef } from "react";
import { User, Profile } from "@/types/models";
import { useParams } from "next/navigation";

interface userRoles {
  selfRole: string
  selectedUserRole: string
}

export default function UserDialog() {
  const [userRoles, setUserRoles] = useState<userRoles | null>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isManager, setIsManager] = useState<boolean>(false)
  const { data, dialogs, closeDialog } = useDialogsStore()
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { code } = useParams()

  const { data: users, isLoading:isUsersLoading } = useSWR<User[]>(
    dialogs.userDialog ? `/api/channel/${code}/users/list` : null
  )
  const { data: profile, isLoading:isProfileLoading } = useSWR<Profile>(
    dialogs.userDialog ? `/api/user/profile/get` : null
  )

  useEffect(() => {
    if (dialogs.userDialog && dialogRef.current) setTimeout(() => {
      setUserRoles(null)
      setIsManager(false)
      dialogRef.current?.showModal() 
    }, 100)
  }, [dialogs.userDialog])

  useEffect(() => {
    if(data.selectedUser && users && profile && !userRoles) {
      if(!("role" in data.selectedUser)) return
      const selfRole = users.find((user) => user.id === profile.id)?.role || ""
      setUserRoles({selfRole, selectedUserRole: data.selectedUser.role})
    }
  }, [users, profile, userRoles, data])

  const handleCloseDialog = () => {
    setError(null)
    dialogRef.current?.close()
    setTimeout(() => { closeDialog("userDialog") }, 100)
  }

  const onSubmit = async (input: { type: string }) => {
    setIsLoading(true)
    setError(null)

    const friendPostData = {
      name: data.selectedUser.name,
      type: input.type
    }

    const managePostData = {
      id: data.selectedUser.id,
      code: code
    }

    let postUrl = ""
    let postData = {}

    if(input.type === "FRIEND_REQUEST") {
      postUrl = "/api/user/notices/request/friend"
      postData = friendPostData
    } 
    else if(input.type === "ADMIN_MANAGE") {
      postUrl = `/api/channel/${code}/users/manage/admin`
      postData = managePostData
    }
    else if(input.type === "BAN_MANAGE") {
      postUrl = `/api/channel/${code}/users/manage/ban`
      postData = managePostData
    }

    try {
      const res = await axios.post(postUrl, postData)

      if (res.status === 200) {
        handleCloseDialog()
      }
    } catch (error: unknown) {
      console.error(error)
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (!dialogs.userDialog) return null

  return (
    <dialog ref={dialogRef} className="modal">
      <div className="modal-box border-l-4 border-blue-500 text-[#ebebeb] bg-base-200">
        <button onClick={() => handleCloseDialog()} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <div className="font-bold text-lg">
          <div className="flex items-center gap-1 mb-1">
            {userRoles?.selectedUserRole === "OWNER" ?
              <svg className="text-blue-500 mr-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"/>
              </svg>
              : userRoles?.selectedUserRole === "ADMIN" ?
              <svg className="text-blue-500 mt-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 11.5 11 13l4-3.5M12 20a16.405 16.405 0 0 1-5.092-5.804A16.694 16.694 0 0 1 5 6.666L12 4l7 2.667a16.695 16.695 0 0 1-1.908 7.529A16.406 16.406 0 0 1 12 20Z"/>
              </svg> : ""
            }
            <div className="truncate max-w-[400px]">{data.selectedUser.name}</div>
          </div>
          <div className="text-xs text-[#c5c5c5]">{data.selectedUser.isOnline ? "online" : "offline"}</div>
        </div>
        {(isProfileLoading || isUsersLoading) ? <div className="flex justify-center"><span className="loading loading-spinner"></span></div> :
          <div className='flex flex-col gap-8 p-2 pt-9'>
            <div className='bg-neutral p-4 py-3 rounded-lg'>
              <div className='max-w-full truncate text-sm'>{data.selectedUser.bio || "About me"}</div>
            </div>
            {error && <span className="text-xs text-red-500">{error}</span>}
            <div className='flex justify-center items-center gap-4'>
              {isManager ?
                <>
                <button onClick={() => { setIsManager(false); setError(null) }} className="btn min-h-11 h-11 px-2.5 bg-base-100 hover:bg-neutral text-[#ebebeb]">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
                  </svg>
                </button>
                <button disabled={isLoading || userRoles?.selfRole !== "OWNER"} onClick={() => onSubmit({type: "ADMIN_MANAGE"})} className="btn min-h-11 h-11 text-[#ebebeb] bg-blue-700 hover:bg-blue-800">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7.171 12.906-2.153 6.411 2.672-.89 1.568 2.34 1.825-5.183m5.73-2.678 2.154 6.411-2.673-.89-1.568 2.34-1.825-5.183M9.165 4.3c.58.068 1.153-.17 1.515-.628a1.681 1.681 0 0 1 2.64 0 1.68 1.68 0 0 0 1.515.628 1.681 1.681 0 0 1 1.866 1.866c-.068.58.17 1.154.628 1.516a1.681 1.681 0 0 1 0 2.639 1.682 1.682 0 0 0-.628 1.515 1.681 1.681 0 0 1-1.866 1.866 1.681 1.681 0 0 0-1.516.628 1.681 1.681 0 0 1-2.639 0 1.681 1.681 0 0 0-1.515-.628 1.681 1.681 0 0 1-1.867-1.866 1.681 1.681 0 0 0-.627-1.515 1.681 1.681 0 0 1 0-2.64c.458-.361.696-.935.627-1.515A1.681 1.681 0 0 1 9.165 4.3ZM14 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
                  </svg>
                  {userRoles?.selectedUserRole === "ADMIN" ? "Dismiss Admin" : "Grant Admin"}
                </button>
                <button disabled={isLoading || userRoles?.selectedUserRole !== "MEMBER"} onClick={() => onSubmit({type: "BAN_MANAGE"})} className="btn min-h-11 h-11 text-[#ebebeb] bg-rose-700 hover:bg-rose-800">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m6 6 12 12m3-6a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                  Server Ban
                </button>
                </>
                :<>
                <button disabled={isLoading} onClick={() => onSubmit({type: "FRIEND_REQUEST"})} className="btn min-h-11 h-11 text-[#ebebeb] bg-blue-700 hover:bg-blue-800">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12h4m-2 2v-4M4 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                  </svg>
                  Friend Request
                </button>
                <button disabled={isLoading || userRoles?.selfRole === "MEMBER"} onClick={() => { setIsManager(true); setError(null) }} className="btn min-h-11 h-11 text-[#ebebeb] bg-purple-700 hover:bg-purple-800">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M3 21h18M4 18h16M6 10v8m4-8v8m4-8v8m4-8v8M4 9.5v-.955a1 1 0 0 1 .458-.84l7-4.52a1 1 0 0 1 1.084 0l7 4.52a1 1 0 0 1 .458.84V9.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5Z"/>
                  </svg>
                  Manage
                </button>
              </>
              }
            </div>
          </div>
        }
      </div>
    </dialog>
  )
}
