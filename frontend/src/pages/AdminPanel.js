import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getAllUsers, getAllBookings, getStats, confirmBooking, getAllRooms, addRoom, updateRoom, deleteRoom, getAllHotels, addHotel, updateHotel, deleteHotel } from '../services/api';
import { Typography, Button, Box, List, ListItem, ListItemText, Paper, Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalRevenue: 0 });
  const [tab, setTab] = useState(0);
  const [openAddRoom, setOpenAddRoom] = useState(false);
  const [openEditRoom, setOpenEditRoom] = useState(false);
  const [openAddHotel, setOpenAddHotel] = useState(false);
  const [openEditHotel, setOpenEditHotel] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', hotelId: '', price: '', capacity: '', image: null });
  const [editRoom, setEditRoom] = useState(null);
  const [newHotel, setNewHotel] = useState({ name: '', location: '', image: null });
  const [editHotel, setEditHotel] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchData = async () => {
      try {
        console.log('Fetching admin data...');
        const [usersData, bookingsData, roomsData, statsData, hotelsData] = await Promise.all([
          getAllUsers(),
          getAllBookings(),
          getAllRooms(),
          getStats(),
          getAllHotels(),
        ]);

        console.log('Users response:', usersData);
        console.log('Bookings response:', bookingsData);
        console.log('Rooms response:', roomsData);
        console.log('Stats response:', statsData);
        console.log('Hotels response:', hotelsData);

        setUsers(usersData.data || []);
        setBookings(bookingsData.data || []);
        setRooms(roomsData.data || []);
        setStats(statsData.data || { totalBookings: 0, totalRevenue: 0 });
        setHotels(hotelsData.data || []);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        console.error('Error details:', error.response ? error.response.data : error.message);
        setUsers([]);
        setBookings([]);
        setRooms([]);
        setStats({ totalBookings: 0, totalRevenue: 0 });
        setHotels([]);
      }
    };
    fetchData();
  }, [user]);

  console.log('Current state:', { users, bookings, rooms, stats, hotels });

  const handleConfirmBooking = async (id) => {
    try {
      await confirmBooking(id);
      const { data } = await getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleAddRoom = async () => {
    try {
      const { data } = await addRoom(newRoom);
      setRooms([...rooms, data]);
      setNewRoom({ name: '', hotelId: '', price: '', capacity: '', image: null });
      setOpenAddRoom(false);
    } catch (error) {
      console.error('Failed to add room:', error);
      alert(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleEditRoom = async () => {
    try {
      const { data } = await updateRoom(editRoom._id, editRoom);
      setRooms(rooms.map((r) => (r._id === data._id ? data : r)));
      setOpenEditRoom(false);
      setEditRoom(null);
    } catch (error) {
      console.error('Failed to update room:', error);
      alert(error.response?.data?.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await deleteRoom(id);
      setRooms(rooms.filter((r) => r._id !== id));
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleAddHotel = async () => {
    console.log('Sending hotel data:', newHotel);
    try {
      const { data } = await addHotel(newHotel);
      console.log('Hotel added response:', data);
      const { data: updatedHotels } = await getAllHotels();
      setHotels(updatedHotels);
      setNewHotel({ name: '', location: '', image: null });
      setOpenAddHotel(false);
    } catch (error) {
      console.error('Failed to add hotel:', error);
      alert(error.response?.data?.message || 'Failed to add hotel');
    }
  };

  const handleEditHotel = async () => {
    try {
      const { data } = await updateHotel(editHotel._id, editHotel);
      setHotels(hotels.map((h) => (h._id === data._id ? data : h)));
      setOpenEditHotel(false);
      setEditHotel(null);
    } catch (error) {
      console.error('Failed to update hotel:', error);
      alert(error.response?.data?.message || 'Failed to update hotel');
    }
  };

  const handleDeleteHotel = async (id) => {
    try {
      await deleteHotel(id);
      setHotels(hotels.filter((h) => h._id !== id));
    } catch (error) {
      console.error('Failed to delete hotel:', error);
      alert(error.response?.data?.message || 'Failed to delete hotel');
    }
  };

  if (user?.role !== 'admin') return <Typography variant="h6">Unauthorized</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="Users" />
        <Tab label="Bookings" />
        <Tab label="Rooms" />
        <Tab label="Hotels" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Users</Typography>
          <List>
            {users.map((u) => (
              <ListItem key={u._id}>
                <ListItemText primary={`${u.email} - ${u.role}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Bookings</Typography>
          <List>
            {bookings.map((b) => (
              <ListItem key={b._id}>
                <ListItemText primary={`Room: ${b.roomId?.name || 'Unknown'} - Status: ${b.status}`} />
                {b.status === 'pending' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleConfirmBooking(b._id)}
                    sx={{ ml: 2 }}
                  >
                    Confirm
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Rooms</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenAddRoom(true)}>
              Add Room
            </Button>
          </Box>
          <List>
            {rooms.length === 0 ? (
              <Typography>No rooms found.</Typography>
            ) : (
              rooms.map((r) => (
                <ListItem key={r._id}>
                  <Avatar src={`http://localhost:3001${r.image}`} sx={{ mr: 2 }} />
                  <ListItemText primary={`${r.name} - Hotel: ${r.hotelId?.name || 'Unknown'} - Price: $${r.price} - Capacity: ${r.capacity}`} />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setEditRoom(r);
                      setOpenEditRoom(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteRoom(r._id)}
                  >
                    Delete
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      )}

      {tab === 3 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Hotels</Typography>
            <Button variant="contained" color="primary" onClick={() => setOpenAddHotel(true)}>
              Add Hotel
            </Button>
          </Box>
          <List>
            {hotels.map((h) => {
              console.log('Hotel image URL:', `http://localhost:3001${h.image}`);
              return (
                <ListItem key={h._id}>
                  <Avatar src={`http://localhost:3001${h.image}`} sx={{ mr: 2 }} />
                  <ListItemText primary={`${h.name} - ${h.location}`} />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      setEditHotel(h);
                      setOpenEditHotel(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteHotel(h._id)}
                  >
                    Delete
                  </Button>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}

      {tab === 4 && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Statistics</Typography>
          <Typography>Total Bookings: {stats.totalBookings}</Typography>
          <Typography>Total Revenue: ${stats.totalRevenue}</Typography>
        </Paper>
      )}

      {/* Add Room Dialog */}
      <Dialog open={openAddRoom} onClose={() => setOpenAddRoom(false)}>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          <TextField
            label="Room Name"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Hotel</InputLabel>
            <Select
              value={newRoom.hotelId}
              onChange={(e) => setNewRoom({ ...newRoom, hotelId: e.target.value })}
              label="Hotel"
            >
              {hotels.map((hotel) => (
                <MenuItem key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Price"
            type="number"
            value={newRoom.price}
            onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Capacity"
            type="number"
            value={newRoom.capacity}
            onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
            fullWidth
            margin="normal"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewRoom({ ...newRoom, image: e.target.files[0] })}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddRoom(false)}>Cancel</Button>
          <Button onClick={handleAddRoom} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={openEditRoom} onClose={() => setOpenEditRoom(false)}>
        <DialogTitle>Edit Room</DialogTitle>
        <DialogContent>
          {editRoom && (
            <>
              <TextField
                label="Room Name"
                value={editRoom.name}
                onChange={(e) => setEditRoom({ ...editRoom, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Hotel</InputLabel>
                <Select
                  value={editRoom.hotelId}
                  onChange={(e) => setEditRoom({ ...editRoom, hotelId: e.target.value })}
                  label="Hotel"
                >
                  {hotels.map((hotel) => (
                    <MenuItem key={hotel._id} value={hotel._id}>
                      {hotel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Price"
                type="number"
                value={editRoom.price}
                onChange={(e) => setEditRoom({ ...editRoom, price: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Capacity"
                type="number"
                value={editRoom.capacity}
                onChange={(e) => setEditRoom({ ...editRoom, capacity: e.target.value })}
                fullWidth
                margin="normal"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditRoom({ ...editRoom, image: e.target.files[0] })}
                style={{ marginTop: '16px' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditRoom(false)}>Cancel</Button>
          <Button onClick={handleEditRoom} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Add Hotel Dialog */}
      <Dialog open={openAddHotel} onClose={() => setOpenAddHotel(false)}>
        <DialogTitle>Add New Hotel</DialogTitle>
        <DialogContent>
          <TextField
            label="Hotel Name"
            value={newHotel.name}
            onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Location"
            value={newHotel.location}
            onChange={(e) => setNewHotel({ ...newHotel, location: e.target.value })}
            fullWidth
            margin="normal"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewHotel({ ...newHotel, image: e.target.files[0] })}
            style={{ marginTop: '16px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddHotel(false)}>Cancel</Button>
          <Button onClick={handleAddHotel} variant="contained" color="primary">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={openEditHotel} onClose={() => setOpenEditHotel(false)}>
        <DialogTitle>Edit Hotel</DialogTitle>
        <DialogContent>
          {editHotel && (
            <>
              <TextField
                label="Hotel Name"
                value={editHotel.name}
                onChange={(e) => setEditHotel({ ...editHotel, name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Location"
                value={editHotel.location}
                onChange={(e) => setEditHotel({ ...editHotel, location: e.target.value })}
                fullWidth
                margin="normal"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditHotel({ ...editHotel, image: e.target.files[0] })}
                style={{ marginTop: '16px' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditHotel(false)}>Cancel</Button>
          <Button onClick={handleEditHotel} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;