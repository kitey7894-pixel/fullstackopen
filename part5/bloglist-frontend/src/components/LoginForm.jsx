import { useState } from 'react'
import { TextField, Button, Typography, Stack } from '@mui/material'

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async event => {
    event.preventDefault()
    const ok = await onLogin({ username, password })
    if (ok) {
      setUsername('')
      setPassword('')
    }
  }

  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        log in to application
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ maxWidth: 360 }}>
          <TextField
            label="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            slotProps={{ htmlInput: { 'data-testid': 'username' } }}
          />
          <TextField
            label="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            slotProps={{ htmlInput: { 'data-testid': 'password' } }}
          />
          <Button variant="contained" type="submit">
            login
          </Button>
        </Stack>
      </form>
    </div>
  )
}

export default LoginForm
