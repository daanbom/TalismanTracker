import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Home from './pages/Home'
import LogGame from './pages/LogGame'
import EditGame from './pages/EditGame'
import Leaderboard from './pages/Leaderboard'
import HighscoresBoard from './pages/HighscoresBoard'
import GameHistory from './pages/GameHistory'
import GameDetail from './pages/GameDetail'
import Players from './pages/Players'
import Stats from './pages/Stats'
import Counters from './pages/Counters'
import HouseRules from './pages/HouseRules'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/log" element={<LogGame />} />
            <Route path="/games/:id/edit" element={<EditGame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/highscores" element={<HighscoresBoard />} />
            <Route path="/history" element={<GameHistory />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/players" element={<Players />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/counters" element={<Counters />} />
            <Route path="/house-rules" element={<HouseRules />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
