import { Friend, Server, Message, User } from "@/types/models";

export function sortFriends(list: Friend[]) {
  list.sort((a, b) => a.name.localeCompare(b.name))

  const onlineFriends = list.filter(friend => friend.isOnline)
  const offlineFriends = list.filter(friend => !friend.isOnline)

  return [...onlineFriends, ...offlineFriends] as Friend[]
}

export function sortChat(list: Message[]) {
  const [first, ...rest] = list
  return [...rest, first]
}

export function sortUsers(list: User[]) {
  const owner = list.filter(member => member.role === "OWNER")
  const admins = list.filter(member => member.role === "ADMIN")
  const members = list.filter(member => member.role === "MEMBER")

  admins.sort((a, b) => a.name.localeCompare(b.name))
  members.sort((a, b) => a.name.localeCompare(b.name))

  const onlineAdmins = admins.filter(admin => admin.isOnline)
  const offlineAdmins = admins.filter(admin => !admin.isOnline)
  
  const onlineMembers = members.filter(member => member.isOnline)
  const offlineMembers = members.filter(member => !member.isOnline)

  return [...owner, ...onlineAdmins, ...offlineAdmins, ...onlineMembers, ...offlineMembers] as User[]
}

export function sortServers(list: Server[]) {
  return list.sort((a, b) => {
      const dateA = new Date(a.server.createdAt).getTime()
      const dateB = new Date(b.server.createdAt).getTime()
      return dateB - dateA
  })
}
