import { Button } from '@/components/ui/button'
import { UpdateButton } from '@/components/UpdateButton'
import { useAppStore } from '@/store/useStore'

function App(): React.JSX.Element {
  const { count, increment } = useAppStore()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background text-foreground p-6">
      <h1 className="text-4xl font-bold">Electron + Vite + shadcn + Zustand</h1>

      <div className="flex items-center gap-4">
        <Button onClick={increment} size="lg">
          Count is: {count}
        </Button>
      </div>

      <UpdateButton />
    </div>
  )
}

export default App