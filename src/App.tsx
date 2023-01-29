import React from 'react'
import 'ress'
import { Editor } from './component/text/Editor'
import { EditorTitle } from './component/text/EditorTitle'

function App() {
  return (
    <div className='App'>
      <EditorTitle />
      <Editor />
    </div>
  )
}

export default App
