import React, {Component} from 'react'
import request from 'superagent';
import {get,set} from './store'
import { List, ListItem,  ListItemContent, ListItemAction } from 'react-mdl/lib/List';
import { Icon } from 'react-mdl/lib/Icon'
import IconButton from 'react-mdl/lib/IconButton'
import Spinner  from 'react-mdl/lib/Spinner'

/**
 * TODO
 * 
 * News list to LocalStorage
 * Save articles when loaded
 * If (wifi) download articles
 * 
 * 
 * Fade in news list with broken icon if article fetch failed
 * ?Local news - select region
 * 
 */

export class MyNews extends Component {

  GN = location.protocol + '//news.google.no/news?cf=all&hl=no&pz=1&ned=no_no&output=rss&num=100'; // b is for cache bust appending

  YQL = location.protocol + '//query.yahooapis.com/v1/public/yql';

  ARTICLE_API = location.protocol + '//runkit.io/snapper/article/5.1.0'

  normalizeTitle = o => {
    const t = o.title.split(' - ');
    if(t.length > 1){
      o.source = t[1];
      t.pop()
    }
    o.title = t.join()
  }

  createArticle = i => {
    this.normalizeTitle(i);
    return Object.assign({}, i, { 
      id: i.link.hashCode(), 
      link: 'http' + i.link.split('http')[2]
    })
  }
  query = (...urls) => {
    const all = urls.map(u => `"${u}"`).join(',');
    console.log(all)
    return {
      q: `select title,link, pubDate from rss(0,30) where url in ( ${all} ) | sort(field="pubDate", descending="true")`,
      format: 'json',
      b: Date.now(),
      env: 'store://datatables.org/alltableswithkeys'
    };
  }

  constructor(props) {
    super(props);
    this.load = this.loadNews.bind(this)
    this.show = this.show.bind(this)
    this.back = this.back.bind(this)
    // get from cache
    this.state = { news: [], location: props.location }
    if (props.location)
      this.show(props.location)
  }

  componentWillReceiveProps(props, oldProps) {
    if (!props.location && props.refresh) { // silly, move state up
      this.loadNews();
      return;
    }
    this.show(props.location)
  }

  componentDidMount() {
    this.loadNews();
  }

  loadNews() {
    const t = this;

    if(!!get('news')){
      this.setState({dt: Date.now(), news: get('news')})
      return;
    }

    request
      .get(this.YQL)
      .query(this.query(this.GN))
      //.set('XX-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err);
        } else {
          this.setState({ dt: Date.now(), news: res.body.query.results.item.map(t.createArticle) })
          set('news', this.state.news)
        }
      });
  }

  show(id) {
    const item = this.state.news.find(x => x.id === Number(id));

    // redirect to root if not found
    if (!item) {
      window.location.hash = "";
      return
    }

    const cachedArticle = get(item.link.hashCode())
    if(!!cachedArticle){
      this.setState({selected: cachedArticle, waiting: false})
      return;
    }

    item.waiting = true;
    this.setState({ waiting: true })

    request.get(this.ARTICLE_API).query({ url: item.link, lang: 'no' }).then(res => {
      console.log("runkit", res.body.perf)
      item.waiting = false;
      this.setState({ selected: res.body, waiting: false })
      set(item.link.hashCode(), res.body)
    });
  }

  back(){
    this.setState({selected: null});
    window.location.hash = null;
  }

  render() {

    const spinner = <Spinner style={{ right: '5px', position: 'absolute' }} />;
    
    let article = null;

    if (this.state.selected) {
      setTimeout( ()=> {document.getElementById("content").scrollTop = 0}, 200)
      article = <div>
        { this.props.location && <IconButton id="backbtn" name="arrow_back" onClick={ this.back }/>}
        <h3 style={{ marginLeft: '6px' }}>{this.state.selected.title} {this.state.waiting && spinner} </h3>
        <pre style={{ whiteSpace: 'pre-wrap', marginLeft: '5px', marginRight: '10px', fontSize: '18px', paddingBottom: '40px', fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif' }}>{this.state.selected.text}</pre>
      </div>
    }

    let t = this;
    var items = this.state.news.map(function (item) {
      
      return article && item.id === t.state.selected.id ? undefined : (

    <a style={{ textDecoration: 'none' }} href={'#' + item.id} key={item.id} >
          <ListItem twoLine style={{ paddingBottom: 10, paddingTop: 0, minHeight: 40, borderBottom: '1px solid lightgray' }}>
            <ListItemContent subtitle={new Date(item.pubDate).toLocaleTimeString() + `  -  ${item.source || ''}`} style={{ padding: 0, minHeight: 0 }}>
              {item.title} {item.waiting && spinner}
            </ListItemContent>
          </ListItem>
        </a>
      );
    }).filter(exists=>exists);

    if (items.length) {
      return (
        <div>
          { article }
          <List style={{ marginLeft: '6px', marginTop: 0 }}>
            {items}
          </List>
        </div>
      );
    } else {
      return null;
    }
  }

}