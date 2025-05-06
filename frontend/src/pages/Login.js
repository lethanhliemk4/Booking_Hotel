import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Login form submitted with email:', email, 'password:', password); // Thêm log debug
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error) {
      console.error('Login failed in Login.js:', error.message); // Thêm log debug
      toast.error(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Đăng nhập
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Đăng nhập
          </Button>
        </form>
        <Typography sx={{ mt: 2 }}>
          Chưa có tài khoản?{' '}
          <Button onClick={() => navigate('/register')}>Đăng ký</Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;