// File: frontend/src/components/EventDetail.jsx
// Purpose: Displays detailed view of a single event, with entrant + match management.
// Notes:
// - Consistent column heights using Grid + Card stretch
// - Entrants list as dedicated column
// - Matches displayed in sortable table that fills full column width/height

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material"
import { API_BASE_URL } from "../api"

function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)

  // form states
  const [entrantForm, setEntrantForm] = useState({ name: "", alias: "" })
  const [matchForm, setMatchForm] = useState({
    round: "",
    entrant1_id: "",
    entrant2_id: "",
    scores: "",
    winner_id: "",
  })

  // table sort
  const [orderBy, setOrderBy] = useState("round")
  const [order, setOrder] = useState("asc")

  useEffect(() => {
    fetchEvent()
  }, [id])

  async function fetchEvent() {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`)
      if (!res.ok) throw new Error("Failed to fetch event")
      const data = await res.json()
      setEvent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddEntrant(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/entrants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entrantForm, event_id: id }),
      })
      if (!res.ok) throw new Error("Failed to add entrant")
      setEntrantForm({ name: "", alias: "" })
      await fetchEvent()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddMatch(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...matchForm, event_id: id }),
      })
      if (!res.ok) throw new Error("Failed to add match")
      setMatchForm({ round: "", entrant1_id: "", entrant2_id: "", scores: "", winner_id: "" })
      await fetchEvent()
    } catch (err) {
      console.error(err)
    }
  }

  function handleSort(property) {
    const isAsc = orderBy === property && order === "asc"
    setOrder(isAsc ? "desc" : "asc")
    setOrderBy(property)
  }

  function stableSort(array, comparator) {
    const stabilized = array.map((el, index) => [el, index])
    stabilized.sort((a, b) => {
      const cmp = comparator(a[0], b[0])
      if (cmp !== 0) return cmp
      return a[1] - b[1]
    })
    return stabilized.map((el) => el[0])
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0)
      : (a, b) => (a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0)
  }

  if (loading) return <p>Loading...</p>
  if (!event) return <p>Event not found</p>

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {event.name} — {event.date} ({event.status})
      </Typography>
      <Button
        component={Link}
        to="/events"
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={2} alignItems="stretch">
        {/* Left column: Forms */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
              <Tab label="Add Entrant" />
              <Tab label="Add Match" />
            </Tabs>
            <CardContent sx={{ minHeight: 400 }}>
              {tab === 0 && (
                <Box component="form" onSubmit={handleAddEntrant}>
                  <TextField
                    label="Name"
                    value={entrantForm.name}
                    onChange={(e) => setEntrantForm({ ...entrantForm, name: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Alias"
                    value={entrantForm.alias}
                    onChange={(e) => setEntrantForm({ ...entrantForm, alias: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Add Entrant
                  </Button>
                </Box>
              )}
              {tab === 1 && (
                <Box component="form" onSubmit={handleAddMatch}>
                  <TextField
                    label="Round"
                    value={matchForm.round}
                    onChange={(e) => setMatchForm({ ...matchForm, round: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Entrant 1 ID"
                    value={matchForm.entrant1_id}
                    onChange={(e) => setMatchForm({ ...matchForm, entrant1_id: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Entrant 2 ID"
                    value={matchForm.entrant2_id}
                    onChange={(e) => setMatchForm({ ...matchForm, entrant2_id: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Scores"
                    value={matchForm.scores}
                    onChange={(e) => setMatchForm({ ...matchForm, scores: e.target.value })}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Winner ID"
                    value={matchForm.winner_id}
                    onChange={(e) => setMatchForm({ ...matchForm, winner_id: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <Button type="submit" variant="contained" color="secondary" fullWidth>
                    Add Match
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Middle column: Entrants */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Entrants
              </Typography>
              <ul>
                {event.entrants?.map((e) => (
                  <li key={e.id}>
                    {e.id} — {e.name} ({e.alias})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column: Matches */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flexGrow: 1, minHeight: 400 }}>
              <Typography variant="h6" gutterBottom>
                Matches
              </Typography>
              <TableContainer component={Paper} sx={{ height: "100%" }}>
                <Table stickyHeader size="small" sx={{ height: "100%" }}>
                  <TableHead>
                    <TableRow>
                      {["round", "entrant1_id", "entrant2_id", "scores", "winner_id"].map((col) => (
                        <TableCell key={col}>
                          <TableSortLabel
                            active={orderBy === col}
                            direction={orderBy === col ? order : "asc"}
                            onClick={() => handleSort(col)}
                          >
                            {col.replace("_id", "").replace(/^\w/, (c) => c.toUpperCase())}
                          </TableSortLabel>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stableSort(event.matches || [], getComparator(order, orderBy)).map((m) => {
                      const winner = event.entrants?.find((e) => e.id === m.winner_id)
                      return (
                        <TableRow key={m.id}>
                          <TableCell>{m.round}</TableCell>
                          <TableCell>{m.entrant1_id}</TableCell>
                          <TableCell>{m.entrant2_id}</TableCell>
                          <TableCell>{m.scores}</TableCell>
                          <TableCell>
                            {winner ? `${winner.name} (${winner.alias})` : "TBD"}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default EventDetail
