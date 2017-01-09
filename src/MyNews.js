import React, { Component } from 'react'
import request from 'superagent';
import { get, set } from './store'
import { List, ListItem, ListItemContent, ListItemAction } from 'react-mdl/lib/List';
import { Icon } from 'react-mdl/lib/Icon'
import IconButton from 'react-mdl/lib/IconButton'
import Spinner from 'react-mdl/lib/Spinner'

/**
 * Mobile offline news reader, for areas without 3g coverage
 * Research on create-react-app, hash routing, cloud functions and appcache fallback for ios safari
 * The shitty code is "as designed"
 */
export class MyNews extends Component {

  GOOGLE_NEWS = location.protocol + '//news.google.no/news?cf=all&hl=no&pz=1&ned=no_no&output=rss&num=100'; 

  YQL = 'https://query.yahooapis.com/v1/public/yql';

  ARTICLE_API = 'https://runkit.io/snapper/article/5.1.0'

  normalizeTitle = o => {
    const t = o.title.split(' - ');
    if (t.length > 1 && t[1].length < 50) {
      t.pop()
    }
    o.title = t.length > 50 ? t.substring(0, 50) + ".." : t.join()
    o.title = o.title.substring(0, 1).toUpperCase() + o.title.substring(1);
  }

  domainFromUrl(url) {
    if (url.indexOf('http') < 0) return;
    var a = document.createElement('a')
    a.setAttribute('href', url);
    return a.hostname.replace('www.', '');
  }

  createArticleItem = i => {
    this.normalizeTitle(i);
    const result = {
      ...i,
      ...{
        id: i.link.hashCode(),
        link: 'http' + i.link.split('http')[2],
      }
    }
    result.source = this.domainFromUrl(result.link) || this.domainFromUrl(i.link.split('http')[1])
    return result;
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

    this.state = { news: [], location: props.location }
    if (props.location)
      this.show(props.location)
  }

  componentWillReceiveProps(props, oldProps) {
    // ugliest abuse of react, state and routing. ever.
    if (!props.location && props.refresh) { 
      this.loadNews()
    } else if (this.state.news.length && props.location === "download") {
      console.log("downloading all..")
      Promise.all(this.state.news.map(n => this.getArticle(n)))
        .then(res => console.log("all downloaded", res))
        .then(res => this.setState({ lastSync: Date.now() }))
        .then(res => { location.hash = '/done' })
        .catch(x => { debugger; })
    } else {
      this.show(props.location)
    }
  }

  componentDidMount() {
    this.loadNews();
  }

  loadNews() {
    const t = this;

    if (!!get('news')) {
      this.setState({ dt: Date.now(), news: get('news') })
      return;
    }

    return request
      .get(this.YQL)
      .query(this.query(this.GOOGLE_NEWS))
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err || !res.ok) {
          console.log(err);
        } else {
          this.setState({ dt: Date.now(), news: res.body.query.results.item.map(t.createArticleItem), refresh:false, waiting: false })
          set('news', this.state.news)
          location.hash = '/done';
        }
      });
  }

  show(id) {
    const item = this.state.news.find(x => x.id === Number(id));

    if (!item) {
      setTimeout(() => window.location.hash = "", 10);
      return
    }

    const cachedArticle = get(item.link.hashCode())
    if (!!cachedArticle) {
      this.setState({ selected: cachedArticle, waiting: false })
      return;
    }

    item.waiting = true;
    this.setState({ waiting: true })

    this.getArticle(item).then(article => {
      this.setState({ selected: article, waiting: false })
    })
  }

  getArticle = (articleRef) => {
    const url = `${this.ARTICLE_API}?url=${encodeURIComponent(articleRef.link)}&lang=no`
    console.log("getting", decodeURIComponent(url), articleRef)

    return request(url)
      .set('Accept', 'application/json')
      .then(res => {
        if (!res.ok) {
          articleRef.unsynced = true
          console.log("error", res)
        }
        console.log("runkit", res.body.perf)
        articleRef.waiting = false;
        articleRef.unsynced = undefined;
        set(articleRef.link.hashCode(), res.body)
        return res.body;
      })
      .catch(err => {articleRef.unsynced = true });
  }

  back() {
    this.setState({ selected: null });
    window.location.hash = '';
  }

  time = (item) => new Date(item.pubDate).toLocaleTimeString("no").split(/\W/).splice(0, 2).join(':')

  render() {

    const spinner = <Spinner style={{ right: '5px', position: 'absolute' }} />;

    let article = null;

    if (!!this.state.selected) {
      setTimeout(() => { document.getElementById("content").scrollTop = 0 }, 200)
      article = <div>
        {this.props.location && <IconButton id="backbtn" name="arrow_back" onClick={this.back} />}
        <h3 style={{ marginLeft: '6px' }}>{this.state.selected.title} {this.state.waiting && spinner} </h3>
        <pre style={{ whiteSpace: 'pre-wrap', marginLeft: '5px', marginRight: '10px', fontSize: '18px', paddingBottom: '40px', fontFamily: 'Georgia,Cambria,"Times New Roman",Times,serif' }}>{this.state.selected.text}</pre>
      </div>
    }

    let t = this;
    var items = this.state.news.map(function (item) {

      return article && item.id === t.state.selected.id ? undefined : (

        <a style={{ textDecoration: 'none' }} href={'#' + item.id} key={item.id} >
          <ListItem twoLine style={{ paddingBottom: 10, paddingTop: 0, minHeight: 40, borderBottom: '1px solid lightgray' }}>
            <ListItemContent subtitle={`${t.time(item)}  -  ${item.source || ''}`} style={{ padding: 0, minHeight: 0, color: item.unsynced ? 'lightgray' : '' }}>
              {item.title} {item.waiting && spinner}
            </ListItemContent>
          </ListItem>
        </a>
      );
    }).filter(exists => exists);

    if (items.length) {
      return (
        <div>
          {article}
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