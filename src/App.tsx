import { useState, useRef, useCallback } from 'react'
import './App.css'
import { LeftPanel } from './components/LeftPanel'
import { RightPanel } from './components/RightPanel'

function App() {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0)
  const [scrollRatio, setScrollRatio] = useState(0)
  const scrollToRef = useRef<((idx: number) => void) | null>(null)

  const handleSelectProject = useCallback((index: number) => {
    if (scrollToRef.current) {
      scrollToRef.current(index)
    }
  }, [])

  return (
    <div className="app-layout">
      <LeftPanel
        activeIdx={activeProjectIdx}
        scrollRatio={scrollRatio}
        onSelectProject={handleSelectProject}
      />
      <RightPanel
        onProjectChange={setActiveProjectIdx}
        onProgressChange={setScrollRatio}
        scrollToRef={scrollToRef}
      />
    </div>
  )
}

export default App
