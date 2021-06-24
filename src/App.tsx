import './App.css';
import { NotificationsProvider } from 'reapop';
import { setUpNotifications } from 'reapop'
import { Home } from './components/Home';

// run this function when your application starts before creating any notifications
setUpNotifications({
  defaultProps: {
    position: 'top-right',
    dismissible: true,
    dismissAfter: 5000,
  }
})

function App() {
  return (
    <NotificationsProvider>
      <Home />
    </NotificationsProvider>
  );
}

export default App;
