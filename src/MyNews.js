import React, { Component } from 'react';
import request from 'superagent';

import { List, ListItem, Icon, ListItemContent, ListItemAction, Spinner } from 'react-mdl';

/**
 * TODO
 * 
 * News list to LocalStorage
 * Save articles when loaded
 * If (wifi) download articles
 * 
 * Loading indicator
 * 
 * Fade in news list with broken icon if article fetch failed
 * ?Local news - select region
 * 
 */

export class MyNews extends Component {

  GN = location.protocol + '//news.google.no/news?cf=all&hl=no&pz=1&ned=no_no&output=rss&num=100'; // b is for cache bust appending

  YQL = location.protocol + '//query.yahooapis.com/v1/public/yql';

  ARTICLE_API  = location.protocol + '//runkit.io/snapper/article/5.1.0'

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
    this.load = this.load.bind(this)
    this.show = this.show.bind(this)
    // get from cache
    this.state = { news: [], location: props.location }
    if (props.location)
      this.show(props.location)
  }

  componentWillReceiveProps(props, oldProps) {
    if ( !props.location && props.refresh) { // silly, move state up
      this.load();
      return;
    }
    this.show(props.location)
  }

  componentDidMount() {
    this.load();
  }

  load() {
    request
      .get(this.YQL)
      .query(this.query(this.GN))
      //.set('XX-API-Key', 'foobar')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err);
        } else {
          this.setState({ dt: Date.now(), news: res.body.query.results.item.map(i => Object.assign({}, i, { id: Math.random() * 10, link: 'http' + i.link.split('http')[2] })) })
        }
      });
  }

  show(id) {
    const item = this.state.news.find(x => x.id === Number(id));
    if (!item) {
      this.setState({ selected: null })
      return
    }
    
    item.waiting = true;
    this.setState({waiting:true})

    request.get(this.ARTICLE_API).query({ url: item.link, lang: 'no' }).then(res => {
      console.log("runkit", res.body.perf)
      document.getElementById("content").scrollTop = 0;
      item.waiting = false;
      this.setState({ selected: res.body, waiting: false })
    });
  }

  render() {

    const spinner = <Spinner style={{right:'5px', position:'fixed'}}/>;

    if (this.state.selected) {
      return <div>
        <h3 style={{ marginLeft: '6px' }}>{this.state.selected.title} {this.state.waiting && spinner} </h3>
        <pre style={{ whiteSpace: 'pre-wrap', marginLeft: '5px', marginRight: '10px', fontSize: '18px', paddingBottom: '40px', fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif' }}>{this.state.selected.text}</pre>
      </div>
    }

    let t = this;
    var items = this.state.news.map(function (item) {
      return (

        <ListItem twoLine style={{ paddingBottom: 10, paddingTop: 0, minHeight: 40, borderBottom: '1px solid lightgray' }}>
          <ListItemContent subtitle={new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} style={{ padding: 0, minHeight: 0 }}>
            <a style={{ textDecoration: 'none', cursor: 'pointer' }} href={`#${item.id}`} >
              {item.title} {item.waiting && spinner}
            </a>
          </ListItemContent>
        </ListItem>
      );
    });

    if (items.length) {
      return (
        <List style={{ marginLeft: '6px', marginTop: 0 }}>
          {items}
        </List>
      );
    } else {
      return null;
    }
  }

}