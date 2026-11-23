import { Alert } from '@mui/material'

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  return (
    <Alert severity={notification.type} className="notification" sx={{ mt: 2 }}>
      {notification.message}
    </Alert>
  )
}

export default Notification
