import React, { Component } from 'react'
import './App.css';
import logo from './logo.svg';
import { Layout, Header, Navigation, Content } from 'react-mdl/lib/Layout';
import { MyNews } from './MyNews';
import IconButton from 'react-mdl/lib/IconButton'
import { get } from './store'
import request from 'superagent'
import Spinner from 'react-mdl/lib/Spinner'

class App extends Component {

  ARTICLE_API = location.protocol + '//runkit.io/snapper/article/5.1.0'

  constructor(props) {
    super(props)
    this.state = { ...props }
  }

  componentWillReceiveProps(props) {
    this.setState({ ...props, ...{ syncing: (location === "download") } })
  }

  refresh = (e) => {
    if (navigator.onLine) {
      e.stopPropagation()
      window.localStorage.clear()
      this.setState({ refresh: true, location: "", selected: null });
    }
  }

  downloadAll = (e) => {
    if (navigator.onLine) {
      e.stopPropagation()
      this.setState({ refresh: false, location: "download", selected: null, syncing: true });
    }
  }

  render() {

    const download = (
      !this.state.location &&
      navigator.onLine &&
      <IconButton name="file_download" id="downloadbtn" onClick={this.downloadAll} />)

    const refresh = (
      !this.state.location &&
      !this.state.refresh &&
      navigator.onLine && <IconButton name="replay" onClick={this.refresh} />)

    return (
      <Layout fixedHeader>
        <Header title="Siste nyheter" style={{ backgroundColor: 'rgb(61, 51, 148)' }}>
          {download}
          {refresh}
          {this.state.refresh && <Spinner />}
          {this.state.syncing && <span>Laster ned... <Spinner /> </span>}
          {!navigator.onLine && <span>(offline)</span>}
        </Header>
        {/**      <Drawer title="Meny">
          <Navigation>
            <a href={ '#settings'} >Settings</a>
          </Navigation>
        </Drawer>
  **/}
        <Content id="content">
          <MyNews {...this.state} />
        </Content>
      </Layout>
    );
  }
}

export default App;
