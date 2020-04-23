/**
 * L Hama
 */
import React, { Component } from 'react';
import marked from "marked";

/**
 * Separate the Header and the main content.
 * Up to this point we are still not using SSR
 */
import { LIDA } from './Constants';

class About extends Component {
  state = { markdown: null }
  componentDidMount() {
    const readmePath = require("./about.md");

    fetch(readmePath)
      .then(response => {
        return response.text()
      })
      .then(text => {
        this.setState({
          markdown: marked(text)
        })
      })
  }

  render() {
    const { markdown } = this.state;

    return (
      <section style={{
        color: this.props.dark ? "white" : "black",
        padding: '5%',
        textAlign: 'justfied',
      }}>
        <article
          dangerouslySetInnerHTML={{ __html: markdown }}></article>
        {/* <img src={LIDA} alt="LIDA logo" /> */}
      </section>
    )
  }
}

export default About;
