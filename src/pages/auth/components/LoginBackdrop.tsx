import { useState } from 'react'
import { Button } from '@/components/ui/button'

const tracePositions = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

export function LoginBackdrop() {
  const [allowMotion, setAllowMotion] = useState(false)

  return (
    <>
      <div aria-hidden="true" className="login-backdrop" data-allow-motion={allowMotion}>
        {tracePositions.map((position) => (
          <div key={position} className="login-trace" data-position={position}>
            <span className="login-trace-module">
              <span className="login-module-light" />
              <span className="login-module-light" data-light="red" />
              <span className="login-module-light" />
              <span className="login-module-light" data-light="red" />
            </span>
            <span className="login-trace-terminal" />
            <span className="login-trace-comet" />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="login-motion-toggle absolute right-4 bottom-4 z-10"
        onClick={() => setAllowMotion((enabled) => !enabled)}
      >
        {allowMotion ? 'Wyłącz animację tła' : 'Włącz animację tła'}
      </Button>
    </>
  )
}
