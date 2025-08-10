import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import ReviewPage from './pages/ReviewPage'
import SignaturePage from './pages/SignaturePage'
import SubmitPage from './pages/SubmitPage'
// Optional test button:
// import { callApi } from './auth'

export default function App() {
  // const pingApi = async () => console.log(await callApi('/health'))

  return (
    <>
      {/* <button onClick={pingApi}>Call API</button> */}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/upload' element={<UploadPage />} />
        <Route path='/review' element={<ReviewPage />} />
        <Route path='/signature' element={<SignaturePage />} />
        <Route path='/submit' element={<SubmitPage />} />
        <Route path='*' element={<div>404 Not Found</div>} />
      </Routes>
    </>
  )
}

