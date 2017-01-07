import React,{Component} from 'react'
import './App.css';
import logo from './logo.svg';
import { Layout, Header, Navigation, Content } from 'react-mdl/lib/Layout';
import { MyNews } from './MyNews';
import IconButton from 'react-mdl/lib/IconButton'

class App extends Component {

  constructor(props){
    super(props)
    this.state = Object.assign({},props)
    this.refresh = this.refresh.bind(this);
  }

  componentWillReceiveProps(props){
    this.setState(props)
  }

  refresh(){
    location.hash = "";
    localStorage.clear()
    this.setState({refresh:true, location: "", selected: null});
  }

  refreshPage(){
    window.location.hash = "";
    window.location.reload(true);
  }

  render() {
    return (
      <Layout fixedHeader>
        <Header title="Siste nyheter" onClick={this.refreshPage} style={{backgroundColor:'rgb(61, 51, 148)'}}>
          { !this.state.location && <IconButton name="replay" onClick={this.refresh}/> }
        </Header>
  {/**      <Drawer title="Meny">
          <Navigation>
            <a href={ '#settings'} >Settings</a>
          </Navigation>
        </Drawer>
  **/}
        <Content id="content">
          <MyNews {...this.state}/>   
        </Content>
      </Layout>
    );
  }
}

export default App;
