import './App.css'
import { DashBoard } from './pages/dashboard'
import { AuthBox } from './pages/Auth'
import { BrowserRouter , Routes , Route }  from 'react-router-dom'

function App() {
  return (
    <div>
      <BrowserRouter>        
        <Routes>
            <Route path = "/auth" element = {<AuthBox/>}> </Route>           
            <Route path = "/dashboard" element = {<DashBoard share={false}/>}> </Route>           
            <Route path = "/brain/:shareLink"  element = {<DashBoard share={true}/>}> </Route>           
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
