import React, { Component } from 'react'
import './App.css';
import logo from './logo.svg';
import { Layout, Header, Navigation, Content } from 'react-mdl/lib/Layout';
import { MyNews } from './MyNews';
import IconButton from 'react-mdl/lib/IconButton'
import { get } from './store'
import request from 'superagent'

class App extends Component {

  ARTICLE_API = location.protocol + '//runkit.io/snapper/article/5.1.0'

  constructor(props) {
    super(props)
    this.state = Object.assign({}, props)
  }

  componentWillReceiveProps(props) {
    this.setState(props)
  }

  refresh = () => {
    window.location.hash = "";
    window.localStorage.clear()
    this.setState({ refresh: true, location: "", selected: null });
  }

  refreshPage() {
    window.location.hash = "";
    window.location.reload(true);
  }

  downloadAll(event){
    // react/chrome cancels without the setTimeout
    setTimeout( ()=> window.location.hash = "/download", 10);
  }

  render() {
    return (
      <Layout fixedHeader>
        <Header title="Siste nyheter" onClick={this.refreshPage} style={{ backgroundColor: 'rgb(61, 51, 148)' }}>
          {!this.state.location && <IconButton name="replay" onClick={this.refresh} />}
          {!this.state.location && get('news') && <IconButton name="file_download" id="downloadbtn" onClick={this.downloadAll} />}
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
