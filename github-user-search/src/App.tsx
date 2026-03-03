import './App.css'
import GithubUsersContextProvider from './components/home/GithubUsersContextProvider'
import GithubUsersContextLayout from './components/home/GithubUsersContextLayout'

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="header_title">Github Search</h1>
      </header>

      <main className="main">
        <GithubUsersContextProvider>
          <GithubUsersContextLayout />
        </GithubUsersContextProvider>
      </main>
    </div>
  )
}

export default App
