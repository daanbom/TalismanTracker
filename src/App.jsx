import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Setup from './pages/Setup'
import SetupUsername from './pages/SetupUsername'
import CreateGroup from './pages/CreateGroup'
import GroupSettings from './pages/GroupSettings'
import JoinGroup from './pages/JoinGroup'
import GroupDirectory from './pages/GroupDirectory'
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
import HouseRulesContent from './pages/HouseRulesContent'
import Rulebooks from './pages/Rulebooks'
import Tierlist from './pages/Tierlist'

const queryClient = new QueryClient()

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/setup" element={<Setup />} />
              <Route path="/setup-username" element={<SetupUsername />} />
              <Route path="/groups/new" element={<CreateGroup />} />
              <Route path="/groups/:id/settings" element={<GroupSettings />} />
              <Route path="/join/:code" element={<JoinGroup />} />
              <Route path="/groups" element={<GroupDirectory />} />
              <Route path="/" element={<Home />} />
              <Route path="/log" element={<LogGame />} />
              <Route path="/games/:id/edit" element={<EditGame />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/highscores" element={<HighscoresBoard />} />
              <Route path="/history" element={<GameHistory />} />
              <Route path="/games/:id" element={<GameDetail />} />
              <Route path="/players" element={<Players />} />
              <Route path="/players/:id/tierlist" element={<Tierlist />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/counters" element={<Counters />} />
              <Route path="/house-rules" element={<HouseRules />} />
              <Route path="/house-rules/rules" element={<HouseRulesContent />} />
              <Route path="/house-rules/rulebooks" element={<Rulebooks />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
