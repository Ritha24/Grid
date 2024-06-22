import { useState } from 'react'

import FullFeaturedCrudGrid from './components/sample'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <FullFeaturedCrudGrid />
    </>
  )
}

export default App
