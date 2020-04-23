/**
 * geoplumber R package code.
 */
import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import Welcome from './Welcome';
import Header from './components/Header';
import About from './About';
import DynamicImport from './components/DynamicImport';

import { Provider as StyletronProvider } from 'styletron-react';
import { BaseProvider, LightTheme, DarkTheme } from 'baseui';
import { Client as Styletron } from 'styletron-engine-atomic';

import '../node_modules/react-vis/dist/style.css';

import './App.css';
import World from './components/covid/World';

const engine = new Styletron();

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
function App() {
    const [dark, setDark] = useState(true)
    
    return (
      <main style={{
        background: dark ? '#242730' : 'white'
      }}>
        <Header dark={dark}
        toggleTheme={() => setDark(!dark)}/>
        <StyletronProvider value={engine}>
          <BaseProvider theme={dark ? DarkTheme : LightTheme}>
            <Switch>
              <Route exact path="/" component={(props) => <Welcome 
              {...props}
              dark={dark}
              />} />
              <Route exact path="/world" component={(props) => <World 
              {...props}
              dark={dark}
              />} />
              <Route exact path="/about" component={(props) => 
                <About 
                {...props}
                dark={dark} />} />
            </Switch>
          </BaseProvider>
        </StyletronProvider>
        <div className="uol-wrapper">
					<p>© {new Date().getFullYear} University of Leeds, Leeds, LS2 9JT</p>
					<div class="menu-footer-menu-container"><ul id="menu-footer-menu" className="menu"><li id="menu-item-53" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-53"><a target="_blank" rel="noopener noreferrer" href="http://www.leeds.ac.uk/termsandconditions">Terms &amp; Conditions</a></li>
          <li id="menu-item-54" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-54"><a target="_blank" rel="noopener noreferrer" href="http://www.leeds.ac.uk/accessibility">Accessibility</a></li>
          <li id="menu-item-487" className="menu-item menu-item-type-post_type menu-item-object-page menu-item-487"><a href="https://lida.leeds.ac.uk/privacy/">Privacy</a></li>
          <li id="menu-item-484" className="menu-item menu-item-type-custom menu-item-object-custom menu-item-484"><a target="_blank" rel="noopener noreferrer" href="http://www.leeds.ac.uk/foi">Freedom of Information</a></li>
          </ul></div>
				</div>
      </main>
    )
}

export default App;
