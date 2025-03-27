import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register(form);
      login(data.user, data.token);
      navigate('/');
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </Box>
    </Paper>
  );
};

export default Register;