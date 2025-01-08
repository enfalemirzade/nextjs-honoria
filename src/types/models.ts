export interface Profile {
  id: string
  name: string
  bio: string | null
}

export interface User {
  id: string
  role: string
  isOnline: boolean
  name: string
  bio: string | null
}

export interface Friend {
  id: string
  name: string
  bio: string | null
  isOnline: boolean
}

export interface Channel {
  id: string
  name: string
  code: string
  isPrivate: boolean
}

export interface Folder {
  id: string,
  name: string,
  files: {
    id: string,
    name: string,
    type: string
  }[]
}

export interface Server {
  role: string
  server: {
    id: string
    name: string
    code: string
    isPrivate: boolean
    createdAt: Date
  }
}

export interface Player {
  TrackIndex: number
  tracks: {
    id: string
    title: string
    url: string
  }[]
}

export interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    name: string
  }
  server: {
    code: string
  }
}

export interface Notice {
  id: string
  senderId: string
  serverCode: string | null
  type: string
  sender: {
    id: string
    name: string
  }
}

export interface Blog {
  id: string
  title: string
  content: string
  createdAt: Date
}

export interface Log {
  id: string
  content: string
  createdAt: Date
}
