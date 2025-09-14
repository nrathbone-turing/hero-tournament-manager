// File: frontend/src/components/EventDetail.jsx
// Purpose: Event details with 3-column layout (dashboards / entrants / matches).
// Notes:
// - Wider grid (less left-right buffer).
// - Title + back button spacing reduced.
// - Tab labels forced single line (no wrap).
// - Removed duplicate headers inside dashboards.

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_BASE_URL } from "../api";
import EntrantDashboard from "./EntrantDashboard";
import MatchDashboard from "./MatchDashboard";

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";

const PANEL_H = 420;

function TabPanel({ value, index, children }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ flex: 1, overflowY: "auto", p: 2, minHeight: 0 }}
    >
      {value === index && children}
    </Box>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);

  const [orderBy, setOrderBy] = useState("round");
  const [order, setOrder] = useState("asc");

  async function fetchEvent() {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!res.ok) throw new Error("Failed to fetch event");
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleRequestSort(col) {
    const isAsc = orderBy === col && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(col);
  }

  function descendingComparator(a, b, key) {
    if ((b?.[key] ?? "") < (a?.[key] ?? "")) return -1;
    if ((b?.[key] ?? "") > (a?.[key] ?? "")) return 1;
    return 0;
  }
  function getComparator(ord, key) {
    return ord === "desc"
      ? (a, b) => descendingComparator(a, b, key)
      : (a, b) => -descendingComparator(a, b, key);
  }
  function stableSort(arr, cmp) {
    const stabilized = (arr || []).map((el, idx) => [el, idx]);
    stabilized.sort((a, b) => {
      const order = cmp(a[0], b[0]);
      return order !== 0 ? order : a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
  }

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  const columns = [
    { key: "round", label: "ROUND" },
    { key: "entrant1_id", label: "ENTRANT 1" },
    { key: "entrant2_id", label: "ENTRANT 2" },
    { key: "scores", label: "SCORES" },
    { key: "winner_id", label: "WINNER" },
  ];

  const sortedMatches = stableSort(event.matches, getComparator(order, orderBy));

  return (
    <Container maxWidth="xl" data-testid="event-detail" sx={{ mt: 2 }}>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h4">
            {event.name} — {event.date} ({event.status})
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="outlined" component={Link} to="/">
            Back to Events
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="stretch">
        {/* Left: Tabbed dashboards */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              height: PANEL_H,
              minHeight: PANEL_H,
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Add Entrant" sx={{ whiteSpace: "nowrap" }} />
              <Tab label="Add Match" sx={{ whiteSpace: "nowrap" }} />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <EntrantDashboard eventId={id} onEntrantAdded={fetchEvent} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <MatchDashboard eventId={id} onMatchAdded={fetchEvent} />
            </TabPanel>
          </Card>
        </Grid>

        {/* Middle: Entrants */}
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              height: PANEL_H,
              minHeight: PANEL_H,
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6">Entrants</Typography>
            </CardContent>
            <Box sx={{ px: 2, pb: 2, flex: 1, overflowY: "auto", minHeight: 0 }}>
              {event.entrants?.length ? (
                <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                  {event.entrants.map((ent) => (
                    <li key={ent.id}>
                      {ent.id} — {ent.name} ({ent.alias})
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2">No entrants yet</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Right: Matches */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              display: "flex",
              flexDirection: "column",
              height: PANEL_H,
              minHeight: PANEL_H,
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6">Matches</Typography>
            </CardContent>

            <Paper sx={{ mx: 2, mb: 2, flex: 1, overflow: "auto", minHeight: 0 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map(({ key, label }) => (
                      <TableCell key={key}>
                        <TableSortLabel
                          active={orderBy === key}
                          direction={orderBy === key ? order : "asc"}
                          onClick={() => handleRequestSort(key)}
                        >
                          {label}
                        </TableSortLabel>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedMatches.map((m) => {
                    const winner = event.entrants?.find((e) => e.id === m.winner_id);
                    return (
                      <TableRow key={m.id} hover>
                        <TableCell>{m.round}</TableCell>
                        <TableCell>{m.entrant1_id}</TableCell>
                        <TableCell>{m.entrant2_id}</TableCell>
                        <TableCell>{m.scores}</TableCell>
                        <TableCell>
                          {winner ? `${winner.name} (${winner.alias})` : "TBD"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
