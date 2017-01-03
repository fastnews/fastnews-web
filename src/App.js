import React, { Component } from 'react';
import './App.css';
import logo from './logo.svg';
import history from 'history';
import { Layout, Header, Spinner, Navigation, Content, IconButton } from 'react-mdl';
import { MyNews } from './MyNews';

class App extends Component {

  constructor(props){
    super(props)
    this.state = Object.assign({},props)
    this.refresh = this.refresh.bind(this);
  }

  componentWillReceiveProps(props){
    this.setState(props)
  }

  link = event => {
    event.preventDefault();
    history.push({
      pathname: event.currentTarget.pathname,
      search: event.currentTarget.search
    });
  };

  refresh(){
    this.setState({refresh:true, location: ""});
  }

  render() {
    return (
      <Layout fixedHeader>
        <Header title="Siste nyheter" style={{backgroundColor:'rgb(61, 51, 148)'}}>
          <IconButton name="replay" onClick={this.refresh}/>
        </Header>
  {/**      <Drawer title="Meny">
          <Navigation>
            <a href={ '#settings'} >Settings</a>
          </Navigation>
        </Drawer>
  **/}
        <Content id="content">
          {this.state.location && <IconButton name="arrow_back" onClick={window.history.back()}/>}
          <MyNews {...this.state}/>   
        </Content>
      </Layout>
    );
  }
}

export default App;
