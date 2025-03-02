import { useState} from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useWebSocket } from "./providers/WebSocket-provider"

export default function HomePage() {
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")
  const [showDialog, setShowDialog] = useState(false);
  const navigation = useNavigate();


const { joinRoom } = useWebSocket();
  

  const handleCreateRoom = () => {
    navigate("/create-room")
  }

  const handleRoomJoin = () => {
    if (!username.trim()) {
      return
    }

    joinRoom(username, roomId);
    navigation("/room");

  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Join a Room</h1>
          <p className="text-muted-foreground">Enter a room ID to join or create a new room</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomId">Room ID</Label>
            <Input
              id="roomId"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => setShowDialog(true)}
            disabled={!roomId.trim()}
          >
            Join Room
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleCreateRoom}
          >
            Create New Room
          </Button>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter your username</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a username to join the room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoomJoin} disabled={!username.trim()}>
              Join
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}



