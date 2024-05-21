import React, { useEffect, useState } from 'react'
import { opendirSync } from 'fs'

export function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c + 1)
    }, 1000)

    const dir = opendirSync("./")
    const entries = dir.readSync()
    console.log(entries)

    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Count {count}</h1>

      <div>Hello world!</div>
      <div>Fast refresh active</div>
    </div>
  )
}
