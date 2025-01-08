import { MediaConnection, DataConnection } from "peerjs";
import { useRef, useReducer, useEffect } from "react";
import { usePeerStore } from "@/store/peerStore";

type State = {
  currentCall: MediaConnection | null
  waitingForAnswer: boolean
  muted: boolean
}

type Action =
  | { type: "SET_CALL"; payload: MediaConnection | null }
  | { type: "SET_WAITING"; payload: boolean }
  | { type: "SET_MUTED"; payload: boolean }
  | { type: "RESET" }

const initialState: State = {
  waitingForAnswer: false,
  currentCall: null,
  muted: false
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_WAITING":
      return { ...state, waitingForAnswer: action.payload }
    case "SET_CALL":
      return { ...state, currentCall: action.payload }
    case "SET_MUTED":
      return { ...state, muted: action.payload }
    case "RESET":
      return initialState
    default:
      return state
  }
}

const AUDIO_CONSTRAINTS = { 
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 2
  },
  video: false
}

const CALL_TIMEOUT = (26 * 1000) + 500

export const usePeerAudio = () => {
  const dataConnectionRef = useRef<DataConnection | null>(null)
  const [state, dispatch] = useReducer(reducer, initialState)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const ringtone = useRef<HTMLAudioElement | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const localAudioRef = useRef<HTMLAudioElement>(null)
  const { peer } = usePeerStore()

  const getMediaStream = async (): Promise<MediaStream> => {
    try {
      return await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS)
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw new Error("Unable to access microphone.")
    }
  }

  const clearCallTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const sendMessage = async (message: string): Promise<void> => {
    if (dataConnectionRef.current && dataConnectionRef.current.open) {
      await dataConnectionRef.current.send(message)
    }
  }

  const playRingtone = () => {
    if (ringtone.current) {
      ringtone.current.loop = true
      ringtone.current.play().catch(() => null)
    }
  }
  
  const stopRingtone = () => {
    if (ringtone.current) {
      ringtone.current.pause()
      ringtone.current.currentTime = 0
    }
  }

  const handleEndCall = async () => {
    await sendMessage("CALL_ENDED")

    dataConnectionRef.current?.close()
    state.currentCall?.close()
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    remoteAudioRef.current?.remove()

    dispatch({ type: "RESET" })
    clearCallTimeout()
    stopRingtone()
  }

  const startCall = async (remotePeerId: string) => {
    if (!peer || !remotePeerId) return

    try {
      const dataConnection = peer.connect(remotePeerId)
      dataConnectionRef.current = dataConnection

      dataConnection.on("data", (data) => {
        if(data === "CALL_ENDED") {
          handleEndCall()
        }
      })

      const localStream = await getMediaStream()
      localStreamRef.current = localStream

      const call = peer.call(remotePeerId, localStream)
      call.on("close", handleEndCall)
      call.on("error", handleEndCall)
      playRingtone()

      timeoutRef.current = setTimeout(() => {
        handleEndCall()
      }, CALL_TIMEOUT)

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = localStream
      }

      call.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream
        }

        clearCallTimeout()
        stopRingtone()
      })

      dispatch({ type: "SET_CALL", payload: call })
    } catch (err) {
      handleEndCall()
      console.log(err)
    }
  }

  const handleAnswerCall = async () => {
    if (!state.currentCall) return

    try {
      const localStream = await getMediaStream()
      localStreamRef.current = localStream

      state.currentCall.answer(localStream)
      state.currentCall.on("close", handleEndCall)
      state.currentCall.on("error", handleEndCall)
      stopRingtone()

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = localStream
      }

      state.currentCall.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream
        }

        clearCallTimeout()
      })

      dispatch({ type: "SET_WAITING", payload: false })
    } catch (err) {
      handleEndCall()
      console.log(err)
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const remoteTrack = remoteStreamRef.current?.getAudioTracks()[0]
      const localTrack = localStreamRef.current.getAudioTracks()[0]
      if (localTrack && remoteTrack) {
        remoteTrack.enabled = !remoteTrack.enabled
        localTrack.enabled = !localTrack.enabled
        dispatch({ type: "SET_MUTED", payload: !state.muted })
      }
    }
  }
 
  useEffect(() => {
    if (!peer) return

    const handleDataConnection = (dataConnection: DataConnection) => {
      if(remoteAudioRef.current) {
        dataConnection.close()
        return
      }

      dataConnectionRef.current = dataConnection
      dataConnection.on("data", (data) => {
        if(data === "CALL_ENDED") {
          handleEndCall()
        }
      })
    }
  
    const handleIncomingCall = async (call: MediaConnection) => {
      if(remoteAudioRef.current) {
        call.close()
        return
      }

      timeoutRef.current = setTimeout(() => {
        handleEndCall()
      }, CALL_TIMEOUT)

      dispatch({ type: "SET_WAITING", payload: true })
      dispatch({ type: "SET_CALL", payload: call })
      playRingtone()
    }

    ringtone.current = new Audio("/ring.wav")
    peer.on('connection', handleDataConnection)
    peer.on("call", handleIncomingCall)
    peer.on("error", (err) => {
      if(err.type === "peer-unavailable") {
        handleEndCall()
      }
    })

    return () => {
      peer.off("connection")
      peer.off("call")
      clearCallTimeout()
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peer])

  return {
    waitingForAnswer: state.waitingForAnswer,
    call: state.currentCall,
    muted: state.muted,
    remoteAudioRef,
    localAudioRef,
    ringtone,
    handleAnswerCall,
    handleEndCall,
    toggleMute,
    startCall,
  }
}
