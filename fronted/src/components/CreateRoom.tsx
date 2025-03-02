import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, Copy } from 'lucide-react'
import { generateRoomId } from "@/lib/functions"
import { useWebSocket } from "./providers/WebSocket-provider"
import { useNavigate } from "react-router-dom"

export default function CreateRoom() {
  const [username, setUsername] = useState("")
  const [roomId, setRoomId] = useState("")
  const [copied, setCopied] = useState(false)

  const navigation = useNavigate();

const { joinRoom } = useWebSocket();    

  useEffect(() => {
    setRoomId(generateRoomId())
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreateRoom = () => {
    if (!username.trim()) {
      return
    }
    joinRoom(username, roomId);
    navigation("/room");

  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create a New Room</CardTitle>
          <CardDescription>
            Enter your username to create a new room
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <Button
            className="w-full"
            onClick={handleCreateRoom}
            disabled={!username.trim()}
          >
            Create Room
          </Button>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-md border p-3">
              <code className="text-2xl font-mono">{roomId}</code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this ID with others so they can join your room
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}