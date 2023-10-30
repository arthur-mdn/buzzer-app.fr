import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// Vous allez créer ces composants par la suite
import Host from './components/host/Host';
import Join from './components/player/Join';

function App() {
  return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/host">Host</Link>
              </li>
              <li>
                <Link to="/join">Join</Link>
              </li>
            </ul>
          </nav>

          {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/host">
              <Host />
            </Route>
            <Route path="/join">
              <Join />
            </Route>
          </Switch>
        </div>
      </Router>
  );
}

export default App;
